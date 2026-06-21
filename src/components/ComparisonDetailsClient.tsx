'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchComparisonDetailsAction } from '@/app/dashboard/compare/actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { GitCompare, Calendar, ArrowLeft, Search, Download, ArrowUpRight, ArrowDownRight, UserPlus, UserMinus } from 'lucide-react'

interface Comparison {
  id: string
  added_count: number
  removed_count: number
  growth_rate: number
  created_at: string
  snapshot_a_name: string
  snapshot_b_name: string
}

interface ComparisonDetailsClientProps {
  comparison: Comparison
}

export function ComparisonDetailsClient({ comparison }: ComparisonDetailsClientProps) {
  const { toast } = useToast()
  
  // Lists state
  const [addedList, setAddedList] = useState<string[]>([])
  const [removedList, setRemovedList] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter and tab states
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'added' | 'removed'>('added')

  useEffect(() => {
    async function loadDetails() {
      setIsLoading(true)
      const res = await fetchComparisonDetailsAction(comparison.id)
      setIsLoading(false)

      if (res.error) {
        toast({ title: 'Failed to load details', description: res.error, variant: 'destructive' })
      } else {
        setAddedList(res.added || [])
        setRemovedList(res.removed || [])
      }
    }
    loadDetails()
  }, [comparison.id, toast])

  const filteredAdded = addedList.filter((username) =>
    username.toLowerCase().includes(search.toLowerCase())
  )

  const filteredRemoved = removedList.filter((username) =>
    username.toLowerCase().includes(search.toLowerCase())
  )

  const handleExport = (listType: 'added' | 'removed' | 'full', format: 'csv' | 'json') => {
    let exportData: any = null
    let filename = ''
    let fileType = ''
    let fileExtension = ''

    if (listType === 'added') {
      exportData = addedList
      filename = `added_followers_report`
    } else if (listType === 'removed') {
      exportData = removedList
      filename = `removed_followers_report`
    } else {
      exportData = {
        comparison_id: comparison.id,
        baseline_snapshot: comparison.snapshot_a_name,
        target_snapshot: comparison.snapshot_b_name,
        growth_rate: `${comparison.growth_rate}%`,
        added: addedList,
        removed: removedList,
      }
      filename = `comparison_report_summary`
    }

    let fileContent = ''
    if (format === 'json') {
      fileContent = JSON.stringify(exportData, null, 2)
      fileType = 'application/json'
      fileExtension = 'json'
    } else {
      // CSV Export
      if (Array.isArray(exportData)) {
        fileContent = 'username\n' + exportData.join('\n')
      } else {
        // Full Summary CSV
        const rows = [
          ['Section', 'Username'],
          ...addedList.map((u) => ['added', u]),
          ...removedList.map((u) => ['removed', u]),
        ]
        fileContent = rows.map((r) => r.join(',')).join('\n')
      }
      fileType = 'text/csv'
      fileExtension = 'csv'
    }

    const blob = new Blob([fileContent], { type: fileType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${comparison.id.substring(0, 8)}.${fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Export Success',
      description: 'Report downloaded successfully.',
      variant: 'success',
    })
  }

  const date = new Date(comparison.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const netGrowth = comparison.added_count - comparison.removed_count

  return (
    <div className="space-y-6 font-sans text-gray-200">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/compare">
          <Button variant="ghost" size="sm" className="pl-2.5">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Comparisons
          </Button>
        </Link>
      </div>

      {/* Comparison Metadata Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                <GitCompare className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Comparison Report</h1>
                <div className="flex flex-wrap items-center gap-1.5 text-2xs text-gray-400 mt-1.5 font-sans">
                  <span className="font-bold text-white">{comparison.snapshot_a_name}</span>
                  <span className="text-gray-600">vs</span>
                  <span className="font-bold text-white">{comparison.snapshot_b_name}</span>
                  <span className="text-gray-600">•</span>
                  <Calendar className="h-3 w-3" />
                  {date}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pl-13 md:pl-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('full', 'csv')}
                disabled={isLoading}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export Full CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('full', 'json')}
                disabled={isLoading}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export Full JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Deck */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-slate-900/30 p-4 font-sans text-center">
          <div className="text-2xs text-gray-500 font-medium uppercase tracking-wider">Followers Added</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">
            +{comparison.added_count.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-900/30 p-4 font-sans text-center">
          <div className="text-2xs text-gray-500 font-medium uppercase tracking-wider">Followers Lost</div>
          <div className="text-2xl font-extrabold text-rose-400 mt-2 font-mono">
            -{comparison.removed_count.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-900/30 p-4 font-sans text-center">
          <div className="text-2xs text-gray-500 font-medium uppercase tracking-wider">Net Growth</div>
          <div className={`text-2xl font-extrabold mt-2 font-mono ${netGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netGrowth >= 0 ? `+${netGrowth.toLocaleString()}` : netGrowth.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-900/30 p-4 font-sans text-center">
          <div className="text-2xs text-gray-500 font-medium uppercase tracking-wider">Growth Percentage</div>
          <div className={`text-2xl font-extrabold mt-2 font-mono flex items-center justify-center gap-0.5 ${
            comparison.growth_rate >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {comparison.growth_rate >= 0 ? (
              <ArrowUpRight className="h-4.5 w-4.5" />
            ) : (
              <ArrowDownRight className="h-4.5 w-4.5" />
            )}
            {comparison.growth_rate >= 0 ? `+${comparison.growth_rate}%` : `${comparison.growth_rate}%`}
          </div>
        </div>
      </div>

      {/* Main List Box */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div className="flex border-b border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('added')}
              className={`flex items-center gap-2 pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                activeTab === 'added'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Added ({addedList.length})
            </button>
            <button
              onClick={() => setActiveTab('removed')}
              className={`flex items-center gap-2 pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                activeTab === 'removed'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <UserMinus className="h-4 w-4" />
              Removed ({removedList.length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9.5 text-xs"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport(activeTab, 'csv')}
              disabled={isLoading}
              title={`Download filtered list as CSV`}
              className="shrink-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">#</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-right">Badge Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell className="text-center">
                        <div className="h-4 w-4 bg-white/10 rounded animate-pulse mx-auto" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-5 w-16 bg-white/10 rounded animate-pulse ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : activeTab === 'added' ? (
                filteredAdded.map((username, index) => (
                  <TableRow key={`${username}-${index}`}>
                    <TableCell className="text-center font-mono text-2xs text-gray-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-white font-mono">
                      @{username}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-2xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-sans uppercase">
                        + Added
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                filteredRemoved.map((username, index) => (
                  <TableRow key={`${username}-${index}`}>
                    <TableCell className="text-center font-mono text-2xs text-gray-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-white font-mono">
                      @{username}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-2xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/15 font-sans uppercase">
                        - Removed
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}

              {/* Empty state */}
              {!isLoading && activeTab === 'added' && filteredAdded.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-sm text-gray-400">
                    No usernames added in this comparison report.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && activeTab === 'removed' && filteredRemoved.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-sm text-gray-400">
                    No usernames removed in this comparison report.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
