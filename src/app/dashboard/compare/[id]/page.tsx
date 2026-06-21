import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ComparisonDetailsClient } from '@/components/ComparisonDetailsClient'

export const runtime = 'edge'

interface ComparisonDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ComparisonDetailPage({ params }: ComparisonDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch comparison and join snapshot names
  const { data: comparison } = await supabase
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
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!comparison) {
    redirect('/dashboard/compare')
  }

  const formattedComparison = {
    id: comparison.id,
    added_count: comparison.added_count,
    removed_count: comparison.removed_count,
    growth_rate: Number(comparison.growth_rate),
    created_at: comparison.created_at,
    snapshot_a_name: (comparison.snapshot_a as any)?.name || 'Purged Snapshot',
    snapshot_b_name: (comparison.snapshot_b as any)?.name || 'Purged Snapshot',
  }

  return (
    <ComparisonDetailsClient comparison={formattedComparison} />
  )
}
