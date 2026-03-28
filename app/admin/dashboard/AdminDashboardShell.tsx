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
    <div className="flex h-screen bg-slate-50 overflow-hidden text-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
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
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Brand mark visible on mobile only */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-green-400 to-green-600 shadow">
                <span className="text-[10px] font-black text-white">EP</span>
              </div>
              <span className="text-sm font-bold text-gray-800">Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>

            <Link
              href="/sales/login"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-green-400 hover:text-green-700 transition-all"
            >
              <ExternalLink className="h-3 w-3" />
              Sales Portal
            </Link>

            <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-3 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-sm text-white font-bold text-xs">
                {adminInitials}
              </div>
              <span className="hidden sm:block text-xs font-medium text-gray-600 max-w-[150px] truncate">
                {adminEmail}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>

        <footer className="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <p className="text-xs text-gray-400">ExcelPro Washers &middot; Admin OS</p>
          <Link
            href="/sales/login"
            target="_blank"
            className="sm:hidden inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Sales Portal
          </Link>
        </footer>
      </div>
    </div>
  )
}
