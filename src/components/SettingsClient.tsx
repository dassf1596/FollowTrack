'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfileAction, updatePasswordAction, deleteAccountAction } from '@/app/dashboard/settings/actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { Settings, User, Lock, Trash2, Upload, AlertTriangle, CheckCircle } from 'lucide-react'

interface UserProfile {
  email: string
  full_name: string | null
  avatar_url: string | null
}

interface SettingsClientProps {
  profile: UserProfile
}

export function SettingsClient({ profile }: SettingsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Profile forms states
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Password forms states
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)

  // Account deletion states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleteSaving, setIsDeleteSaving] = useState(false)

  // File upload directly to Supabase storage bucket
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    toast({ description: 'Uploading avatar image...' })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload file to 'avatars' storage bucket
      const filePath = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}. Make sure your 'avatars' storage bucket exists in Supabase.`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      
      // Update database profile record immediately
      const res = await updateProfileAction(fullName, publicUrl)
      if (res.error) {
        throw new Error(res.error)
      }

      toast({
        title: 'Avatar Updated',
        description: 'Profile photo has been updated successfully.',
        variant: 'success',
      })
      router.refresh()
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err?.message || 'Failed to upload photo.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  // General profile update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProfileSaving(true)

    const res = await updateProfileAction(fullName, null)
    setIsProfileSaving(false)

    if (res.error) {
      toast({ title: 'Profile Save Failed', description: res.error, variant: 'destructive' })
    } else {
      toast({ title: 'Profile Saved', description: 'Name details updated successfully.', variant: 'success' })
      router.refresh()
    }
  }

  // Password update
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ description: 'Passwords do not match.', variant: 'destructive' })
      return
    }

    setIsPasswordSaving(true)
    const res = await updatePasswordAction(password)
    setIsPasswordSaving(false)

    if (res.error) {
      toast({ title: 'Password Update Failed', description: res.error, variant: 'destructive' })
    } else {
      toast({ title: 'Password Saved', description: 'Your password has been changed.', variant: 'success' })
      setPassword('')
      setConfirmPassword('')
    }
  }

  // Account deletion
  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (confirmText !== 'DELETE') return

    setIsDeleteSaving(true)
    const res = await deleteAccountAction()
    setIsDeleteSaving(false)

    if (res.error) {
      toast({ title: 'Failed to purge account', description: res.error, variant: 'destructive' })
    } else {
      toast({ title: 'Account Wiped', description: 'All stored information has been deleted.', variant: 'success' })
      router.push('/')
      router.refresh()
    }
  }

  const avatarText = (fullName || profile.email).charAt(0).toUpperCase()

  return (
    <div className="space-y-8 font-sans text-gray-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your user profile details, credentials, and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your avatar image and full name.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5 mb-6">
                {/* Avatar Preview */}
                <div className="relative group">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-20 w-20 rounded-full object-cover border-2 border-indigo-500/20"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-2xl border-2 border-indigo-500/20">
                      {avatarText}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white text-xs">
                      ...
                    </div>
                  )}
                </div>

                {/* Avatar Upload controls */}
                <div className="space-y-1 text-center sm:text-left">
                  <div className="relative inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 text-xs font-semibold text-gray-300 hover:text-white px-3.5 py-2 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      disabled={isUploading}
                    />
                    <Upload className="h-3.5 w-3.5 mr-2" />
                    Upload Profile Picture
                  </div>
                  <p className="text-2xs text-gray-500 mt-1 font-sans">
                    Supports JPG, PNG, WEBP. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Name Details Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={profile.email} disabled className="opacity-60" />
                  <span className="text-2xs text-gray-500 block">
                    Email address cannot be changed (primary unique identifier).
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-white/5">
                  <Button type="submit" isLoading={isProfileSaving} className="font-semibold">
                    Save General Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your secret login credentials.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="pass">New Password</Label>
                    <Input
                      id="pass"
                      type="password"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confPass">Confirm Password</Label>
                    <Input
                      id="confPass"
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-white/5">
                  <Button type="submit" isLoading={isPasswordSaving} className="font-semibold">
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Box & Danger Zone */}
        <div className="space-y-6">
          <Card className="border-indigo-500/10 bg-indigo-950/15">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-1.5 text-indigo-400">
                <CheckCircle className="h-4 w-4" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-400 leading-relaxed font-sans space-y-2">
              <p>
                All uploaded usernames lists are parsed directly in the web browser before database sync.
              </p>
              <p>
                Database schemas are protected using Row Level Security (RLS). Other accounts cannot read your files.
              </p>
            </CardContent>
          </Card>

          <Card className="border-rose-500/10 bg-rose-950/5">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Deleting your account will permanently wipe your profile, all uploaded follower snapshots, usernames lists, comparison logs, and credentials. This cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="w-full font-semibold"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DELETE ACCOUNT DIALOG */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setConfirmText('')
        }}
        title="Confirm Account Deletion"
        description="Are you absolutely sure you want to delete your account? All follower snapshot details, logs, comparisons, and profile credentials will be permanently erased."
      >
        <form onSubmit={handleDeleteSubmit} className="space-y-4 text-left font-sans">
          <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-4 flex gap-3 text-xs text-rose-300">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-bold">This is a permanent action.</p>
              <p className="mt-0.5 leading-normal opacity-90">
                Once confirmed, all snapshots data and comparisons are cleared from PostgreSQL databases immediately.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deleteConfirm">
              Type <span className="font-bold text-white font-mono select-none">DELETE</span> to confirm
            </Label>
            <Input
              id="deleteConfirm"
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsDeleteOpen(false)
                setConfirmText('')
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={confirmText !== 'DELETE'}
              isLoading={isDeleteSaving}
            >
              Confirm Account Deletion
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
