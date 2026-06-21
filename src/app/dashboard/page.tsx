import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Camera, GitCompare, Search, PlusCircle, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import { DashboardCharts } from '@/components/DashboardCharts'
import { ActivityTimeline } from '@/components/ActivityTimeline'

export const runtime = 'edge'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Fetch snapshots
  const { data: snapshots = [] } = await supabase
    .from('snapshots')
    .select('id, name, follower_count, created_at')
    .order('created_at', { ascending: false })

  // 2. Fetch comparisons
  const { data: comparisons = [] } = await supabase
    .from('comparisons')
    .select('id, added_count, removed_count, growth_rate, created_at')
    .order('created_at', { ascending: false })

  // 3. Fetch activity logs
  const { data: logs = [] } = await supabase
    .from('activity_logs')
    .select('id, action, details, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate metrics
  const totalSnapshots = snapshots?.length || 0
  const latestSnapshotCount = snapshots && snapshots.length > 0 ? snapshots[0].follower_count : 0
  const latestComparison = comparisons && comparisons.length > 0 ? comparisons[0] : null
  const addedCount = latestComparison ? latestComparison.added_count : 0
  const removedCount = latestComparison ? latestComparison.removed_count : 0
  const netGrowth = addedCount - removedCount
  const growthRate = latestComparison ? parseFloat(latestComparison.growth_rate as unknown as string) : 0

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Overview</h1>
          <p className="text-sm text-gray-400 mt-1">
            An overview of your follower snapshots, history trends, and audits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/snapshots"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Snapshot
          </Link>
          <Link
            href="/dashboard/compare"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <GitCompare className="h-4 w-4 mr-2" />
            Compare
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Snapshots */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Snapshots</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                <Camera className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white">{totalSnapshots}</h3>
              <p className="text-2xs text-gray-500 mt-1 font-sans">Stored in database</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Latest Followers Count */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Followers</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/15">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white">{latestSnapshotCount.toLocaleString()}</h3>
              <p className="text-2xs text-gray-500 mt-1 font-sans">
                From latest snapshot {snapshots && snapshots.length > 0 ? `(${snapshots[0].name})` : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Latest Additions/Losses */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net Growth</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                {netGrowth >= 0 ? <ArrowUpRight className="h-4.5 w-4.5" /> : <ArrowDownRight className="h-4.5 w-4.5" />}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white">
                {netGrowth > 0 ? `+${netGrowth}` : netGrowth}
              </h3>
              <p className="text-2xs text-gray-500 mt-1 font-sans">
                {addedCount} added, {removedCount} removed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Latest Growth Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Growth Rate</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white">
                {growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`}
              </h3>
              <p className="text-2xs text-gray-500 mt-1 font-sans">Rate since previous snapshot</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Chart & Activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Follower Growth Trend</CardTitle>
            <CardDescription>Visual trend of follower counts across snapshot history.</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardCharts snapshots={snapshots || []} />
          </CardContent>
        </Card>

        {/* Recent Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Audit timeline of platform actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityTimeline logs={logs || []} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Portal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/snapshots"
          className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-900/30 p-5 hover:border-indigo-500/25 hover:bg-slate-900/50 transition-all cursor-pointer"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Create Snapshot</h4>
            <p className="text-xs text-gray-400 font-sans mt-0.5">Upload or paste follower username lists</p>
          </div>
        </Link>
        <Link
          href="/dashboard/compare"
          className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-900/30 p-5 hover:border-indigo-500/25 hover:bg-slate-900/50 transition-all cursor-pointer"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
            <GitCompare className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Compare Snapshots</h4>
            <p className="text-xs text-gray-400 font-sans mt-0.5">Generate comparison reports side-by-side</p>
          </div>
        </Link>
        <Link
          href="/dashboard/search"
          className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-900/30 p-5 hover:border-indigo-500/25 hover:bg-slate-900/50 transition-all cursor-pointer"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Search History</h4>
            <p className="text-xs text-gray-400 font-sans mt-0.5">Find usernames across all history files</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
