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
  X
} from 'lucide-react'
import { logout } from '../actions'

const navigation = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Leads', href: '/admin/dashboard/leads', icon: Inbox },
  { name: 'Clients', href: '/admin/dashboard/clients', icon: Users },
  { name: 'Jobs', href: '/admin/dashboard/jobs', icon: Briefcase },
  { name: 'Quotes', href: '/admin/dashboard/quotes', icon: FileText },
  { name: 'Invoices', href: '/admin/dashboard/invoices', icon: DollarSign },
  { name: 'Contractors', href: '/admin/dashboard/contractors', icon: HardHat },
  { name: 'Schedule', href: '/admin/dashboard/schedule', icon: Calendar },
  { name: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
  { name: 'Calls', href: '/admin/dashboard/calls', icon: Phone },
  { name: 'Email Marketing', href: '/admin/dashboard/email-marketing', icon: Mail },
  { name: 'Users', href: '/admin/dashboard/users', icon: UserCog },
  { name: 'AI Advisor', href: '/admin/dashboard/ai-advisor', icon: Sparkles },
  { name: 'AI Performance', href: '/admin/dashboard/ai-performance', icon: Activity },
]

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
        <h1 className="text-xl font-bold tracking-wider text-green-500">ExcelProCRM</h1>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-slate-300 hover:bg-red-900/50 hover:text-red-400"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-red-400" />
            Logout
          </button>
        </form>
      </div>
    </div>
  )
}
