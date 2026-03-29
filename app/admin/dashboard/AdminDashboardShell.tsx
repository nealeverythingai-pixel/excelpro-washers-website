'use client'

import { useState } from 'react'
import { Menu, ExternalLink, Bell } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'
import Link from 'next/link'

export function AdminDashboardShell({
  children,
  adminEmail,
  adminInitials,
}: {
  children: React.ReactNode
  adminEmail: string
  adminInitials: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, fixed on desktop */}
      <div className="hidden lg:block flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-xl px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Brand mark — mobile only */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-green-400 to-green-600 shadow">
                <span className="text-[10px] font-black text-white">EP</span>
              </div>
              <span className="text-sm font-bold text-zinc-100">Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>

            <Link
              href="/sales/login"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-green-500/50 hover:text-green-400 transition-all"
            >
              <ExternalLink className="h-3 w-3" />
              Sales Portal
            </Link>

            <div className="flex items-center gap-2.5 rounded-lg border border-zinc-700 bg-zinc-800 py-1.5 pl-2 pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow text-white font-bold text-xs">
                {adminInitials}
              </div>
              <span className="hidden sm:block text-xs font-medium text-zinc-300 max-w-[150px] truncate">
                {adminEmail}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-zinc-950">
          {children}
        </main>

        <footer className="flex-shrink-0 border-t border-zinc-800 bg-zinc-900 px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <p className="text-xs text-zinc-600">ExcelPro Washers &middot; Admin OS</p>
          <Link
            href="/sales/login"
            target="_blank"
            className="sm:hidden inline-flex items-center gap-1.5 text-xs font-medium text-green-500 hover:text-green-400 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Sales Portal
          </Link>
        </footer>
      </div>
    </div>
  )
}
