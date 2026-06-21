'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchUsernameAction(usernameQuery: string) {
  if (!usernameQuery.trim()) {
    return { results: [] }
  }

  const supabase = await createClient()

  // Verify auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized.' }
  }

  // Fetch occurrences of the queried username within snapshots belonging to the logged-in user
  const { data, error } = await supabase
    .from('followers')
    .select(`
      username,
      created_at,
      snapshots!inner(id, name, created_at, user_id)
    `)
    .ilike('username', `%${usernameQuery.trim().toLowerCase()}%`)
    .eq('snapshots.user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Group snapshot appearances by username
  const groups: Record<
    string,
    {
      username: string
      snapshots: string[]
      dates: Date[]
    }
  > = {}

  for (const item of data || []) {
    const username = item.username
    const snapshotName = (item.snapshots as any)?.name || 'Purged Snapshot'
    const date = new Date((item.snapshots as any)?.created_at || item.created_at)

    if (!groups[username]) {
      groups[username] = {
        username,
        snapshots: [],
        dates: [],
      }
    }

    groups[username].snapshots.push(snapshotName)
    groups[username].dates.push(date)
  }

  // Format groups to return first seen and last seen dates
  const results = Object.values(groups).map((g) => {
    // Sort chronological dates oldest first
    const sortedDates = g.dates.sort((a, b) => a.getTime() - b.getTime())
    return {
      username: g.username,
      appears_in: Array.from(new Set(g.snapshots)),
      first_seen: sortedDates[0].toISOString(),
      last_seen: sortedDates[sortedDates.length - 1].toISOString(),
    }
  })

  return { results }
}
