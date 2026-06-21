'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/app/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Lock, Mail, Activity } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await login(formData)

    if (result?.error) {
      toast({
        title: 'Authentication Failed',
        description: result.error,
        variant: 'destructive',
      })
      setIsLoading(false)
    } else {
      toast({
        title: 'Welcome Back!',
        description: 'Logging into your dashboard.',
        variant: 'success',
      })
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#05070f] px-4 font-sans antialiased overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-[250px] w-[500px] rounded-full bg-violet-500/10 blur-[80px]" />

      <div className="w-full max-w-[420px] rounded-2xl glass-panel p-8 shadow-2xl border border-white/10 bg-slate-950/40 backdrop-blur-md">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 mb-3 shadow-lg shadow-indigo-500/5">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Follow<span className="text-indigo-400">Track</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-sans">
            Sign in to manage your snapshots
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="pl-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="pl-11"
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-2 font-semibold" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm font-sans text-gray-400">
          New to FollowTrack?{' '}
          <Link
            href="/register"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}
