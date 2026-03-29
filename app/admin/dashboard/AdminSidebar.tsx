'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Inbox,
  FileText,
  Briefcase,
  DollarSign,
  LogOut,
  Sparkles,
  BarChart3,
  Phone,
  Mail,
  HardHat,
  Calendar,
  UserCog,
  Activity,
  X,
  ChevronRight
} from 'lucide-react'
import { logout } from '../actions'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, exact: true },
      { name: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Sales',
    items: [
      { name: 'Leads', href: '/admin/dashboard/leads', icon: Inbox },
      { name: 'Clients', href: '/admin/dashboard/clients', icon: Users },
      { name: 'Quotes', href: '/admin/dashboard/quotes', icon: FileText },
      { name: 'Invoices', href: '/admin/dashboard/invoices', icon: DollarSign },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Jobs', href: '/admin/dashboard/jobs', icon: Briefcase },
      { name: 'Contractors', href: '/admin/dashboard/contractors', icon: HardHat },
      { name: 'Schedule', href: '/admin/dashboard/schedule', icon: Calendar },
    ],
  },
  {
    label: 'Communication',
    items: [
      { name: 'Calls', href: '/admin/dashboard/calls', icon: Phone },
      { name: 'Email Marketing', href: '/admin/dashboard/email-marketing', icon: Mail },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { name: 'AI Advisor', href: '/admin/dashboard/ai-advisor', icon: Sparkles },
      { name: 'AI Performance', href: '/admin/dashboard/ai-performance', icon: Activity },
      { name: 'Users', href: '/admin/dashboard/users', icon: UserCog },
    ],
  },
]

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-zinc-950">
      {/* Brand header */}
      <div className="relative flex h-16 items-center justify-between overflow-hidden border-b border-zinc-800 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-900/40">
            <span className="text-xs font-black text-white">EP</span>
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-zinc-100">ExcelPro</p>
            <p className="text-[10px] font-medium leading-none text-zinc-500 mt-0.5">Admin OS</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="relative rounded-md p-1 text-zinc-500 hover:text-zinc-100 transition-colors lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-green-600/15 text-green-400'
                        : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
                        isActive ? 'bg-green-500/20' : 'bg-transparent group-hover:bg-zinc-700'
                      )}>
                        <item.icon className={cn('h-3.5 w-3.5', isActive ? 'text-green-400' : 'text-zinc-600 group-hover:text-zinc-300')} />
                      </div>
                      {item.name}
                    </div>
                    {isActive && <ChevronRight className="h-3 w-3 text-green-500 opacity-70" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-zinc-800 p-3">
        <form action={logout}>
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 transition-all duration-150 hover:bg-red-500/10 hover:text-red-400"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-transparent transition-colors group-hover:bg-red-500/15">
              <LogOut className="h-3.5 w-3.5" />
            </div>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
