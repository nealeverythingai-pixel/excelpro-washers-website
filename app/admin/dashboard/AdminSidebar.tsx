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
  BarChart3
} from 'lucide-react'
import { logout } from '../actions'

const navigation = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/admin/dashboard/leads', icon: Inbox },
  { name: 'Clients', href: '/admin/dashboard/clients', icon: Users },
  { name: 'Jobs', href: '/admin/dashboard/jobs', icon: Briefcase },
  { name: 'Quotes', href: '/admin/dashboard/quotes', icon: FileText },
  { name: 'Invoices', href: '/admin/dashboard/invoices', icon: DollarSign },
  { name: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
  { name: 'AI Advisor', href: '/admin/dashboard/ai-advisor', icon: Sparkles },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-800 bg-slate-950 px-4">
        <h1 className="text-xl font-bold tracking-wider text-green-500">ExcelProCRM</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
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
