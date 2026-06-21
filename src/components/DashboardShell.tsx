'use client'

import React, { useState } from 'react'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { DashboardNavbar } from '@/components/DashboardNavbar'

interface DashboardShellProps {
  children: React.ReactNode
  profile: {
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

export function DashboardShell({ children, profile }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#05070f]">
      {/* Sidebar navigation */}
      <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Layout Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <DashboardNavbar onMenuClick={() => setSidebarOpen(true)} profile={profile} />

        {/* Dashboard Main Content */}
        <main className="flex-1 pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
