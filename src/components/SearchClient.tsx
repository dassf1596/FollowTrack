'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { searchUsernameAction } from '@/app/dashboard/search/actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { Search, Calendar, Info, CornerDownRight } from 'lucide-react'

interface SearchResult {
  username: string
  appears_in: string[]
  first_seen: string
  last_seen: string
}

export function SearchClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const executeSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return

      setIsLoading(true)
      const res = await searchUsernameAction(searchQuery)
      setIsLoading(false)
      setHasSearched(true)

      if (res.error) {
        toast({ title: 'Search failed', description: res.error, variant: 'destructive' })
      } else if (res.results) {
        setResults(res.results)
      }
    },
    [toast]
  )

  // Trigger search if query param is set in URL (?q=username)
  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam) {
      setQuery(qParam)
      executeSearch(qParam)
    }
  }, [searchParams, executeSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    // Update URL query parameters to allow back-navigation / copying links
    const params = new URLSearchParams()
    params.set('q', query.trim())
    router.push(`/dashboard/search?${params.toString()}`)
    executeSearch(query)
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6 font-sans text-gray-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Search History</h1>
        <p className="text-sm text-gray-400 mt-1">
          Query follower usernames across all historical snapshots to track visibility.
        </p>
      </div>

      {/* Search Bar Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Type username (e.g. john, alex)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-11 h-11"
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="font-semibold">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Box */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            {hasSearched
              ? `Found ${results.length} username record(s) matching "${query}".`
              : 'Search username to view results.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!hasSearched ? (
            <div className="text-center py-12 text-sm text-gray-400 font-sans">
              <CornerDownRight className="h-6 w-6 mx-auto mb-2 text-gray-500" />
              Enter a username search query above to begin querying historical occurrences.
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400 font-sans">
              <Info className="h-5 w-5 mx-auto text-gray-500 mb-2" />
              No historical matches found for "{query}".
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Snapshots Appears In</TableHead>
                  <TableHead>First Seen Date</TableHead>
                  <TableHead>Last Seen Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, index) => (
                  <TableRow key={`${r.username}-${index}`}>
                    <TableCell className="font-bold text-white font-mono">
                      @{r.username}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 max-w-xs sm:max-w-md">
                        {r.appears_in.map((sName) => (
                          <span
                            key={sName}
                            className="inline-flex items-center rounded bg-indigo-500/10 px-2 py-0.5 text-2xs font-semibold text-indigo-300 border border-indigo-500/15"
                          >
                            {sName}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(r.first_seen)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(r.last_seen)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
