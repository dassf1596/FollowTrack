'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Camera, GitCompare, Search, Settings, FileText, X, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function DashboardSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: Activity },
    { name: 'Snapshots', href: '/dashboard/snapshots', icon: Camera },
    { name: 'Compare', href: '/dashboard/compare', icon: GitCompare },
    { name: 'Search', href: '/dashboard/search', icon: Search },
    { name: 'Activity Log', href: '/dashboard/activity', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-[#070913]/90 backdrop-blur-md transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-md">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Follow<span className="text-indigo-400">Track</span>
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 h-11 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-white" : "text-gray-400 group-hover:text-white")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Small privacy badge */}
        <div className="p-4 border-t border-white/5">
          <div className="rounded-xl bg-slate-950/40 border border-white/5 p-3 text-center">
            <span className="text-2xs font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Secure Mode</span>
            <span className="text-[10px] text-gray-500 leading-normal block font-sans">No external scraping. Direct uploads only.</span>
          </div>
        </div>
      </aside>
    </>
  )
}
