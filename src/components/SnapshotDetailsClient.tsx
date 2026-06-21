'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { fetchFollowersAction } from '@/app/dashboard/snapshots/actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { Camera, Calendar, ArrowLeft, Search, Download, Info } from 'lucide-react'

interface Snapshot {
  id: string
  name: string
  description: string | null
  follower_count: number
  created_at: string
}

interface SnapshotDetailsClientProps {
  snapshot: Snapshot
}

export function SnapshotDetailsClient({ snapshot }: SnapshotDetailsClientProps) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [usernames, setUsernames] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  // Load followers when page or search term changes
  const loadFollowers = useCallback(
    async (pageNum: number, searchTerm: string, append: boolean = false) => {
      setIsLoading(true)
      const res = await fetchFollowersAction(snapshot.id, pageNum, searchTerm, 80)
      setIsLoading(false)

      if (res.error) {
        toast({ title: 'Error loading lists', description: res.error, variant: 'destructive' })
        return
      }

      if (res.usernames) {
        setUsernames((prev) => (append ? [...prev, ...res.usernames!] : res.usernames!))
        setHasMore(res.hasMore)
      }
    },
    [snapshot.id, toast]
  )

  // Trigger load on search reset
  useEffect(() => {
    setPage(1)
    loadFollowers(1, debouncedSearch, false)
  }, [debouncedSearch, loadFollowers])

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    loadFollowers(next, debouncedSearch, true)
  }

  // Export full list
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    toast({ description: 'Compiling follower snapshot records. Please wait...' })

    try {
      let fullList: string[] = []
      let currentPage = 1
      let moreData = true

      while (moreData) {
        const res = await fetchFollowersAction(snapshot.id, currentPage, '', 1000)
        if (res.error || !res.usernames) {
          throw new Error(res.error || 'Failed to download data.')
        }
        fullList = [...fullList, ...res.usernames]
        moreData = res.hasMore
        currentPage++
      }

      let dataString = ''
      let fileType = ''
      let fileExtension = ''

      if (format === 'json') {
        dataString = JSON.stringify({
          snapshot_name: snapshot.name,
          description: snapshot.description,
          created_at: snapshot.created_at,
          follower_count: fullList.length,
          followers: fullList,
        }, null, 2)
        fileType = 'application/json'
        fileExtension = 'json'
      } else {
        // CSV Format
        dataString = 'username\n' + fullList.join('\n')
        fileType = 'text/csv'
        fileExtension = 'csv'
      }

      const blob = new Blob([dataString], { type: fileType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${snapshot.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_followers.${fileExtension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export Complete',
        description: `Successfully exported ${fullList.length} followers.`,
        variant: 'success',
      })
    } catch (err: any) {
      toast({
        title: 'Export Failed',
        description: err?.message || 'Error occurred compilation.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const date = new Date(snapshot.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6 font-sans text-gray-200">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/snapshots">
          <Button variant="ghost" size="sm" className="pl-2.5">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Snapshots
          </Button>
        </Link>
      </div>

      {/* Snapshot Metadata Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{snapshot.name}</h1>
                  <span className="text-2xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {date}
                  </span>
                </div>
              </div>
              {snapshot.description && (
                <p className="text-sm text-gray-400 pl-13 max-w-2xl leading-relaxed font-sans">
                  {snapshot.description}
                </p>
              )}
            </div>

            {/* Export and Info Badge */}
            <div className="flex flex-wrap items-center gap-3 pl-13 md:pl-0">
              <div className="text-right mr-3 hidden sm:block">
                <span className="text-2xs text-gray-500 block">Follower Count</span>
                <span className="text-xl font-extrabold text-indigo-400 font-mono">
                  {snapshot.follower_count.toLocaleString()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="font-medium"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="font-medium"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Followers Table section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div>
            <CardTitle>Followers List</CardTitle>
            <CardDescription>Browse through the list of followers in this snapshot.</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9.5 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">#</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usernames.map((username, index) => (
                <TableRow key={`${username}-${index}`}>
                  <TableCell className="text-center font-mono text-2xs text-gray-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-white font-mono">
                    @{username}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/search?q=${username}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-2xs font-medium cursor-pointer">
                        History
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}

              {/* Loader Row */}
              {isLoading && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell className="text-center">
                        <Skeleton className="h-4 w-6 mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-36" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-7 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {/* Empty state */}
              {!isLoading && usernames.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-sm text-gray-400">
                    <Info className="h-5 w-5 mx-auto text-gray-500 mb-2" />
                    No usernames found matching your query.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Load More Trigger */}
          {hasMore && !isLoading && usernames.length > 0 && (
            <div className="flex justify-center py-6 border-t border-white/5">
              <Button variant="secondary" size="sm" onClick={handleLoadMore}>
                Load More Followers
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
