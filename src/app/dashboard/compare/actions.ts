'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateComparisonAction(snapshotAId: string, snapshotBId: string) {
  if (snapshotAId === snapshotBId) {
    return { error: 'Please select two different snapshots to compare.' }
  }

  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized.' }
  }

  // 1. Fetch metadata for both snapshots to verify ownership
  const { data: snapshotA, error: errA } = await supabase
    .from('snapshots')
    .select('id, name, follower_count')
    .eq('id', snapshotAId)
    .eq('user_id', user.id)
    .single()

  const { data: snapshotB, error: errB } = await supabase
    .from('snapshots')
    .select('id, name, follower_count')
    .eq('id', snapshotBId)
    .eq('user_id', user.id)
    .single()

  if (errA || errB || !snapshotA || !snapshotB) {
    return { error: 'One or both snapshots could not be found.' }
  }

  // Check if comparison between these two already exists
  const { data: existingComparison } = await supabase
    .from('comparisons')
    .select('id')
    .eq('user_id', user.id)
    .eq('snapshot_a', snapshotAId)
    .eq('snapshot_b', snapshotBId)
    .maybeSingle()

  if (existingComparison) {
    return { success: true, comparisonId: existingComparison.id }
  }

  // 2. Fetch all followers for Snapshot A
  const { data: followersA, error: followersAError } = await supabase
    .from('followers')
    .select('username')
    .eq('snapshot_id', snapshotAId)

  // Fetch all followers for Snapshot B
  const { data: followersB, error: followersBError } = await supabase
    .from('followers')
    .select('username')
    .eq('snapshot_id', snapshotBId)

  if (followersAError || followersBError || !followersA || !followersB) {
    return { error: 'Failed to retrieve snapshot follower lists.' }
  }

  const usernamesA = new Set(followersA.map((f) => f.username))
  const usernamesB = new Set(followersB.map((f) => f.username))

  const addedUsernames = [...usernamesB].filter((username) => !usernamesA.has(username))
  const removedUsernames = [...usernamesA].filter((username) => !usernamesB.has(username))

  const addedCount = addedUsernames.length
  const removedCount = removedUsernames.length

  // Growth Rate = ((Count B - Count A) / Count A) * 100
  const countA = snapshotA.follower_count
  const countB = snapshotB.follower_count
  const growthRate = countA === 0 ? 0 : Math.round(((countB - countA) / countA) * 100 * 100) / 100

  // 3. Insert Comparison row
  const { data: comparison, error: comparisonError } = await supabase
    .from('comparisons')
    .insert({
      user_id: user.id,
      snapshot_a: snapshotAId,
      snapshot_b: snapshotBId,
      added_count: addedCount,
      removed_count: removedCount,
      growth_rate: growthRate,
    })
    .select()
    .single()

  if (comparisonError || !comparison) {
    return { error: comparisonError?.message || 'Failed to save comparison results.' }
  }

  // 4. Bulk insert additions/removals in chunks
  const addedToInsert = addedUsernames.map((username) => ({
    comparison_id: comparison.id,
    username,
  }))

  const removedToInsert = removedUsernames.map((username) => ({
    comparison_id: comparison.id,
    username,
  }))

  const chunkSize = 1500
  try {
    // Insert added
    for (let i = 0; i < addedToInsert.length; i += chunkSize) {
      const chunk = addedToInsert.slice(i, i + chunkSize)
      const { error: insErr } = await supabase.from('comparison_added').insert(chunk)
      if (insErr) throw insErr
    }

    // Insert removed
    for (let i = 0; i < removedToInsert.length; i += chunkSize) {
      const chunk = removedToInsert.slice(i, i + chunkSize)
      const { error: insErr } = await supabase.from('comparison_removed').insert(chunk)
      if (insErr) throw insErr
    }

    // 5. Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'Comparison Generated',
      details: `Compared "${snapshotA.name}" and "${snapshotB.name}". Result: +${addedCount} added, -${removedCount} removed.`,
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/compare')

    return { success: true, comparisonId: comparison.id }
  } catch (err: any) {
    // Cleanup parent record if list loading failed
    await supabase.from('comparisons').delete().eq('id', comparison.id)
    return { error: err?.message || 'Error occurred saving comparison records.' }
  }
}

export async function deleteComparisonAction(id: string) {
  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized.' }
  }

  // Fetch comparison details before deleting
  const { data: comparison } = await supabase
    .from('comparisons')
    .select('created_at')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('comparisons')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'Snapshot Deleted', // or Comparison Deleted
    details: `Deleted comparison created at ${new Date(comparison?.created_at || '').toLocaleDateString()}.`,
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/compare')
  return { success: true }
}

export async function fetchComparisonDetailsAction(comparisonId: string) {
  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized.' }
  }

  // Verify ownership
  const { data: comparison } = await supabase
    .from('comparisons')
    .select('id')
    .eq('id', comparisonId)
    .eq('user_id', user.id)
    .single()

  if (!comparison) {
    return { error: 'Comparison report not found.' }
  }

  // Fetch added records
  const { data: added, error: addedError } = await supabase
    .from('comparison_added')
    .select('username')
    .eq('comparison_id', comparisonId)
    .order('username', { ascending: true })

  // Fetch removed records
  const { data: removed, error: removedError } = await supabase
    .from('comparison_removed')
    .select('username')
    .eq('comparison_id', comparisonId)
    .order('username', { ascending: true })

  if (addedError || removedError) {
    return { error: 'Failed to retrieve comparison details.' }
  }

  return {
    added: (added || []).map((a) => a.username),
    removed: (removed || []).map((r) => r.username),
  }
}

