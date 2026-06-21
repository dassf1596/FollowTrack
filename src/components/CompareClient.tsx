'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { generateComparisonAction, deleteComparisonAction } from '@/app/dashboard/compare/actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { GitCompare, Calendar, Eye, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Snapshot {
  id: string
  name: string
  follower_count: number
  created_at: string
}

interface ComparisonHistory {
  id: string
  added_count: number
  removed_count: number
  growth_rate: number
  created_at: string
  snapshot_a_name: string
  snapshot_b_name: string
}

interface CompareClientProps {
  snapshots: Snapshot[]
  comparisons: ComparisonHistory[]
}

export function CompareClient({ snapshots, comparisons }: CompareClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [snapshotA, setSnapshotA] = useState('')
  const [snapshotB, setSnapshotB] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-select Snapshot A if passed via URL queries (?a=ID)
  useEffect(() => {
    const aParam = searchParams.get('a')
    if (aParam) {
      const exists = snapshots.some((s) => s.id === aParam)
      if (exists) setSnapshotA(aParam)
    }
  }, [searchParams, snapshots])

  const handleCompareSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!snapshotA || !snapshotB) {
      toast({ description: 'Please select both snapshots to compare.', variant: 'destructive' })
      return
    }
    if (snapshotA === snapshotB) {
      toast({ description: 'Please select two different snapshots.', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    const res = await generateComparisonAction(snapshotA, snapshotB)
    setIsSubmitting(false)

    if (res.error) {
      toast({ title: 'Comparison Failed', description: res.error, variant: 'destructive' })
    } else if (res.success && res.comparisonId) {
      toast({ title: 'Comparison Complete!', description: 'Report generated successfully.', variant: 'success' })
      router.push(`/dashboard/compare/${res.comparisonId}`)
    }
  }

  const handleDeleteComparison = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comparison report?')) return

    const res = await deleteComparisonAction(id)
    if (res.error) {
      toast({ title: 'Failed to delete', description: res.error, variant: 'destructive' })
    } else {
      toast({ title: 'Report Deleted', description: 'Comparison report removed.', variant: 'success' })
      router.refresh()
    }
  }

  return (
    <div className="space-y-6 font-sans text-gray-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Compare Snapshots</h1>
        <p className="text-sm text-gray-400 mt-1">
          Select two historical snapshots to map new and lost followers.
        </p>
      </div>

      {/* Selector Card */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>Select a baseline snapshot and a comparison target.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCompareSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Snapshot A Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="snapshotA">Baseline Snapshot (Before)</Label>
                <Select
                  id="snapshotA"
                  value={snapshotA}
                  onChange={(e) => setSnapshotA(e.target.value)}
                >
                  <option value="" disabled className="text-gray-500 bg-slate-950">
                    -- Select Baseline Snapshot --
                  </option>
                  {snapshots.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                      {s.name} ({s.follower_count.toLocaleString()} followers)
                    </option>
                  ))}
                </Select>
              </div>

              {/* Snapshot B Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="snapshotB">Target Snapshot (After)</Label>
                <Select
                  id="snapshotB"
                  value={snapshotB}
                  onChange={(e) => setSnapshotB(e.target.value)}
                >
                  <option value="" disabled className="text-gray-500 bg-slate-950">
                    -- Select Target Snapshot --
                  </option>
                  {snapshots.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                      {s.name} ({s.follower_count.toLocaleString()} followers)
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <Button type="submit" isLoading={isSubmitting} className="font-semibold">
                <GitCompare className="h-4.5 w-4.5 mr-2" />
                Compare Snapshots
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comparisons History */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison History</CardTitle>
          <CardDescription>Previous snapshot comparison records.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {comparisons.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400 font-sans">
              No comparisons generated yet. Select two snapshots above to create your first report.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Baseline (Before)</TableHead>
                  <TableHead>Target (After)</TableHead>
                  <TableHead>Date Generated</TableHead>
                  <TableHead>Deltas</TableHead>
                  <TableHead>Growth Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisons.map((c) => {
                  const date = new Date(c.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold text-white">{c.snapshot_a_name}</TableCell>
                      <TableCell className="font-semibold text-white">{c.snapshot_b_name}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {date}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded bg-emerald-500/10 px-2 py-0.5 text-2xs font-bold text-emerald-400">
                            +{c.added_count}
                          </span>
                          <span className="inline-flex items-center rounded bg-rose-500/10 px-2 py-0.5 text-2xs font-bold text-rose-400">
                            -{c.removed_count}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                            c.growth_rate >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {c.growth_rate >= 0 ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                          {c.growth_rate >= 0 ? `+${c.growth_rate}%` : `${c.growth_rate}%`}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/dashboard/compare/${c.id}`} title="View Report">
                            <Button size="icon" variant="ghost" className="h-8 w-8 cursor-pointer">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteComparison(c.id)}
                            title="Delete Report"
                            className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
