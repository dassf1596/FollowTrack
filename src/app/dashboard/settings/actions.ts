'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfileAction(fullName: string, avatarUrl: string | null) {
  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized.' }
  }

  const updates: any = {
    full_name: fullName,
    updated_at: new Date().toISOString(),
  }

  if (avatarUrl !== undefined) {
    updates.avatar_url = avatarUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'Profile Updated',
    details: 'Updated name or avatar photo details.',
  })

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function updatePasswordAction(password: string) {
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized.' }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password updated successfully.' }
}

export async function deleteAccountAction() {
  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized.' }
  }

  // Create admin client using service role key
  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Delete user in auth schema (Cascade delete removes profiles, snapshots, and logs)
  const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  // 2. Terminate session
  await supabase.auth.signOut()

  return { success: true }
}
