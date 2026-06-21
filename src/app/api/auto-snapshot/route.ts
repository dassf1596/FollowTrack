import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseUsernames } from '@/lib/parser'

// Handle CORS OPTIONS preflight request
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || 'https://www.instagram.com'
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Handle automatic snapshot creation and appending from intercepted data
export async function POST(request: Request) {
  const origin = request.headers.get('origin') || 'https://www.instagram.com'
  
  // CORS Response headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
  }

  try {
    const body = await request.json()
    const { url, type, payload } = body

    if (!payload) {
      return NextResponse.json(
        { error: 'Payload data is missing.' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = await createClient()

    // 1. Get authenticated user using Bearer token or cookies fallback
    const authHeader = request.headers.get('Authorization')
    let user = null
    let authError = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log('[API Route] Received token length:', token.length)
      console.log('[API Route] Token snippet:', token.substring(0, 30))
      const { data: { user: jwtUser }, error: jwtError } = await supabase.auth.getUser(token)
      console.log('[API Route] getUser result - User:', jwtUser ? jwtUser.id : null, 'Error:', jwtError)
      if (jwtError || !jwtUser) {
        authError = jwtError || new Error('Invalid token.')
      } else {
        user = jwtUser
      }
    } else {
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser()
      console.log('[API Route] cookie getUser result - User:', cookieUser ? cookieUser.id : null, 'Error:', cookieError)
      if (cookieError || !cookieUser) {
        authError = cookieError || new Error('Unauthorized.')
      } else {
        user = cookieUser
      }
    }

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to FollowTrack dashboard first.' },
        { status: 401, headers: corsHeaders }
      )
    }

    // 2. Parse usernames from payload
    const rawText = typeof payload === 'object' ? JSON.stringify(payload) : String(payload)
    const usernames = parseUsernames(rawText)

    if (usernames.length === 0) {
      return NextResponse.json(
        { error: 'No valid usernames found in the Instagram response.' },
        { status: 400, headers: corsHeaders }
      )
    }

    // 3. Name snapshot by type (Followers or Following) and current date
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    const isFollowers = type === 'followers'
    const snapshotName = `Auto ${isFollowers ? 'Followers' : 'Following'} (${dateStr})`

    // 4. Find if a snapshot with this auto-name already exists for this user today
    const { data: existingSnapshot } = await supabase
      .from('snapshots')
      .select('id, follower_count')
      .eq('user_id', user.id)
      .eq('name', snapshotName)
      .maybeSingle()

    let snapshotId = ''
    let newImportCount = usernames.length

    if (existingSnapshot) {
      snapshotId = existingSnapshot.id

      // Fetch currently stored follower usernames to find duplicates
      const { data: currentFollowers } = await supabase
        .from('followers')
        .select('username')
        .eq('snapshot_id', snapshotId)

      const currentSet = new Set((currentFollowers || []).map((f) => f.username))
      const uniqueNewUsernames = usernames.filter((username) => !currentSet.has(username))
      newImportCount = uniqueNewUsernames.length

      if (uniqueNewUsernames.length > 0) {
        // Bulk insert only the new usernames
        const followersToInsert = uniqueNewUsernames.map((username) => ({
          snapshot_id: snapshotId,
          username,
        }))

        const chunkSize = 1500
        for (let i = 0; i < followersToInsert.length; i += chunkSize) {
          const chunk = followersToInsert.slice(i, i + chunkSize)
          const { error: insErr } = await supabase.from('followers').insert(chunk)
          if (insErr) throw insErr
        }

        // Update the follower count in the snapshot table
        const newTotalCount = currentSet.size + uniqueNewUsernames.length
        await supabase
          .from('snapshots')
          .update({ follower_count: newTotalCount })
          .eq('id', snapshotId)

        // Log to activity log
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: 'Snapshot Updated',
          details: `Automatically appended ${uniqueNewUsernames.length} new users to snapshot "${snapshotName}". Total: ${newTotalCount}.`,
        })
      }
    } else {
      // Create a brand new snapshot
      const { data: snapshot, error: snapshotError } = await supabase
        .from('snapshots')
        .insert({
          name: snapshotName,
          description: 'Automatically imported via FollowTrack Chrome Extension helper.',
          follower_count: usernames.length,
          user_id: user.id,
        })
        .select()
        .single()

      if (snapshotError || !snapshot) {
        throw new Error(snapshotError?.message || 'Failed to create snapshot record.')
      }

      snapshotId = snapshot.id

      // Bulk insert all usernames
      const followersToInsert = usernames.map((username) => ({
        snapshot_id: snapshotId,
        username,
      }))

      const chunkSize = 1500
      for (let i = 0; i < followersToInsert.length; i += chunkSize) {
        const chunk = followersToInsert.slice(i, i + chunkSize)
        const { error: insErr } = await supabase.from('followers').insert(chunk)
        if (insErr) {
          // Cleanup
          await supabase.from('snapshots').delete().eq('id', snapshotId)
          throw insErr
        }
      }

      // Log to activity log
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'Snapshot Created',
        details: `Automatically created snapshot "${snapshotName}" with ${usernames.length} users.`,
      })
    }

    return NextResponse.json(
      {
        success: true,
        snapshotName,
        followerCount: newImportCount,
        message: `Synced ${newImportCount} usernames successfully.`,
      },
      {
        headers: corsHeaders,
      }
    )

  } catch (err: any) {
    console.error('[CORS API Error]', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error occurred.' },
      { status: 500, headers: corsHeaders }
    )
  }
}
