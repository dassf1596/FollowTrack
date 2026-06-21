import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar } from 'lucide-react'

export const runtime = 'edge'

export default async function ActivityPage() {
  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch all activity logs for the logged-in user
  const { data: logs = [] } = await supabase
    .from('activity_logs')
    .select('id, action, details, created_at')
    .order('created_at', { ascending: false })

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6 font-sans text-gray-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Activity Log</h1>
        <p className="text-sm text-gray-400 mt-1">
          Historical record of actions taken on your account.
        </p>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Chronological records of snapshot operations, comparisons, and export logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {logs && logs.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              No actions logged yet. Create a snapshot to trigger activity entries.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs && logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-bold text-white">
                      {log.action}
                    </TableCell>
                    <TableCell className="text-gray-400 text-xs font-sans">
                      {log.details || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateTime(log.created_at)}
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
