'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { logout } from '@/app/auth-actions'
import { Menu, LogOut, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardNavbarProps {
  onMenuClick: () => void
  profile: {
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

export function DashboardNavbar({ onMenuClick, profile }: DashboardNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  const displayName = profile.full_name || profile.email.split('@')[0]
  const avatarText = displayName.charAt(0).toUpperCase()

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 border-b border-white/5 bg-[#05070f]/80 backdrop-blur-md px-6 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden cursor-pointer"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs or Page Indicator placeholder */}
      <div className="hidden sm:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <span>Workspace</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Dashboard</span>
      </div>

      {/* User Controls */}
      <div className="relative ml-auto">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 rounded-full hover:bg-white/5 p-1 transition-colors text-left cursor-pointer"
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm border border-indigo-500/20">
              {avatarText}
            </div>
          )}
          <span className="hidden md:block text-sm font-medium text-gray-300 hover:text-white pr-2">
            {displayName}
          </span>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-white/10 bg-slate-950 p-1.5 shadow-2xl backdrop-blur-md z-20 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3.5 py-2.5 border-b border-white/5 text-left font-sans">
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm font-semibold text-white truncate mt-0.5">{profile.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-gray-400" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
