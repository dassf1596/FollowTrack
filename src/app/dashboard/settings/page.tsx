import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from '@/components/SettingsClient'

export const runtime = 'edge'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const activeProfile = {
    email: user.email || '',
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
  }

  return (
    <SettingsClient profile={activeProfile} />
  )
}
