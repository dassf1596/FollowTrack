import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SnapshotDetailsClient } from '@/components/SnapshotDetailsClient'

export const runtime = 'edge'

interface SnapshotDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SnapshotDetailPage({ params }: SnapshotDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch the snapshot details and verify user ownership
  const { data: snapshot } = await supabase
    .from('snapshots')
    .select('id, name, description, follower_count, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!snapshot) {
    redirect('/dashboard/snapshots')
  }

  return (
    <SnapshotDetailsClient snapshot={snapshot} />
  )
}
