'use client'

import { useState } from 'react'
import { Menu, ExternalLink } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'
import { ThemeToggle } from '@/components/ThemeToggle'
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, fixed on desktop */}
      <div className="hidden lg:block">
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
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between bg-white dark:bg-gray-800 px-4 sm:px-6 shadow-sm border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Dashboard</h2>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              {adminEmail}
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm">
              {adminInitials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>

        <footer className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 flex items-center justify-end gap-4">
          <Link
            href="/sales/login"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Sales Portal
          </Link>
        </footer>
      </div>
    </div>
  )
}
