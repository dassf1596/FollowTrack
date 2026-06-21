import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { SnapshotsClient } from '@/components/SnapshotsClient'

export const runtime = 'edge'

export default async function SnapshotsPage() {
  const supabase = await createClient()

  // Fetch all snapshots for the logged-in user
  const { data: snapshots = [] } = await supabase
    .from('snapshots')
    .select('id, name, description, follower_count, created_at')
    .order('created_at', { ascending: false })

  return (
    <SnapshotsClient initialSnapshots={snapshots || []} />
  )
}
