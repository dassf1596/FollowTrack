'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSnapshotAction(name: string, description: string | null, usernames: string[]) {
  if (!name.trim()) {
    return { error: 'Snapshot name is required.' }
  }
  if (usernames.length === 0) {
    return { error: 'Username list cannot be empty.' }
  }

  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized user. Please sign in again.' }
  }

  // 1. Insert snapshot row
  const { data: snapshot, error: snapshotError } = await supabase
    .from('snapshots')
    .insert({
      name,
      description,
      follower_count: usernames.length,
      user_id: user.id
    })
    .select()
    .single()

  if (snapshotError || !snapshot) {
    return { error: snapshotError?.message || 'Failed to create snapshot metadata.' }
  }

  // 2. Bulk insert followers in chunks to avoid parameter list limits
  const followersToInsert = usernames.map((username) => ({
    snapshot_id: snapshot.id,
    username,
  }))

  const chunkSize = 1500
  try {
    for (let i = 0; i < followersToInsert.length; i += chunkSize) {
      const chunk = followersToInsert.slice(i, i + chunkSize)
      const { error: followersError } = await supabase
        .from('followers')
        .insert(chunk)

      if (followersError) {
        // Rollback snapshot metadata if bulk insertion fails
        await supabase.from('snapshots').delete().eq('id', snapshot.id)
        return { error: `Failed inserting followers batch: ${followersError.message}` }
      }
    }

    // 3. Log the activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'Snapshot Created',
      details: `Created snapshot "${name}" with ${usernames.length} followers.`,
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/snapshots')
    return { success: true, snapshotId: snapshot.id }
  } catch (err: any) {
    // Safety cleanup
    await supabase.from('snapshots').delete().eq('id', snapshot.id)
    return { error: err?.message || 'Failed to populate snapshot database.' }
  }
}

export async function renameSnapshotAction(id: string, newName: string) {
  if (!newName.trim()) {
    return { error: 'New snapshot name is required.' }
  }

  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized.' }
  }

  // Fetch current snapshot details to log change
  const { data: currentSnapshot } = await supabase
    .from('snapshots')
    .select('name')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('snapshots')
    .update({ name: newName })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'Snapshot Renamed',
    details: `Renamed snapshot from "${currentSnapshot?.name || ''}" to "${newName}".`,
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/snapshots')
  return { success: true }
}

export async function deleteSnapshotAction(id: string) {
  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized.' }
  }

  // Fetch snapshot name before deleting it
  const { data: snapshot } = await supabase
    .from('snapshots')
    .select('name, follower_count')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('snapshots')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'Snapshot Deleted',
    details: `Deleted snapshot "${snapshot?.name || ''}" which had ${snapshot?.follower_count || 0} followers.`,
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/snapshots')
  return { success: true }
}

export async function fetchFollowersAction(snapshotId: string, page: number = 1, search: string = '', pageSize: number = 100) {
  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized.' }
  }

  // Verify that the user owns this snapshot
  const { data: snapshot } = await supabase
    .from('snapshots')
    .select('id')
    .eq('id', snapshotId)
    .eq('user_id', user.id)
    .single()

  if (!snapshot) {
    return { error: 'Snapshot not found.' }
  }

  let query = supabase
    .from('followers')
    .select('username')
    .eq('snapshot_id', snapshotId)
    .order('username', { ascending: true })

  if (search.trim()) {
    query = query.ilike('username', `%${search.trim().toLowerCase()}%`)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: followers, error } = await query.range(from, to)

  if (error) {
    return { error: error.message }
  }

  return {
    usernames: followers.map((f) => f.username),
    hasMore: followers.length === pageSize,
  }
}

