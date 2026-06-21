import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/DashboardShell'
import { Providers } from '@/components/providers'

export const runtime = 'edge'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const activeProfile = {
    email: user.email || '',
    full_name: profile?.full_name || user.user_metadata?.full_name || null,
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
  }

  return (
    <Providers>
      <DashboardShell profile={activeProfile}>
        {children}
      </DashboardShell>
    </Providers>
  )
}
