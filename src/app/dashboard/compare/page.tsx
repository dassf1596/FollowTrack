import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { CompareClient } from '@/components/CompareClient'

export const runtime = 'edge'

export default async function ComparePage() {
  const supabase = await createClient()

  // 1. Fetch user snapshots for selection dropdowns
  const { data: snapshots = [] } = await supabase
    .from('snapshots')
    .select('id, name, follower_count, created_at')
    .order('created_at', { ascending: false })

  // 2. Fetch user comparison logs and join relation tables
  const { data: comparisons = [] } = await supabase
    .from('comparisons')
    .select(`
      id,
      added_count,
      removed_count,
      growth_rate,
      created_at,
      snapshot_a: snapshots!snapshot_a(name),
      snapshot_b: snapshots!snapshot_b(name)
    `)
    .order('created_at', { ascending: false })

  // Format the logs to bypass TypeScript type conflicts
  const formattedComparisons = (comparisons || []).map((c) => ({
    id: c.id,
    added_count: c.added_count,
    removed_count: c.removed_count,
    growth_rate: Number(c.growth_rate),
    created_at: c.created_at,
    snapshot_a_name: (c.snapshot_a as any)?.name || 'Purged Snapshot',
    snapshot_b_name: (c.snapshot_b as any)?.name || 'Purged Snapshot',
  }))

  return (
    <CompareClient snapshots={snapshots || []} comparisons={formattedComparisons} />
  )
}
