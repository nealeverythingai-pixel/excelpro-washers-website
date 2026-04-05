'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, LogOut, MapPin } from 'lucide-react'
import { logout } from '../actions'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { name: 'Home', href: '/sales/dashboard', icon: LayoutDashboard },
  { name: 'New Quote', href: '/sales/dashboard/quote', icon: PlusCircle, accent: true },
  { name: 'Door Tracker', href: '/sales/dashboard/canvassing', icon: MapPin },
]

export function SalesNav() {
  const pathname = usePathname()

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-950 text-white z-50">
        <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-green-500/20">EP</div>
          <div>
            <p className="font-bold text-sm leading-none">ExcelPro Washers</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Sales Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 pt-6 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}
                className={cn('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-green-500/15 text-green-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )}>
                <item.icon className={cn('w-5 h-5', isActive && 'text-green-400')} />
                {item.name}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-3 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2 px-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500">Connected</span>
          </div>
          <form action={logout}>
            <button type="submit"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* ─── Mobile / Tablet Bottom Tab Bar (glassmorphism) ─── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-200/80"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 w-20 h-14 rounded-2xl transition-all active:scale-95',
                  item.accent && !isActive && 'text-green-600',
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : !item.accent ? 'text-gray-400' : ''
                )}>
                <item.icon className={cn('w-6 h-6', item.accent && !isActive && 'w-7 h-7')} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn('text-[10px] font-semibold', isActive && 'text-green-700')}>
                  {item.name}
                </span>
              </Link>
            )
          })}

          {/* Logout tab */}
          <form action={logout}>
            <button type="submit"
              className="flex flex-col items-center justify-center gap-0.5 w-20 h-14 rounded-2xl text-gray-400 active:scale-95 transition-all">
              <LogOut className="w-6 h-6" strokeWidth={2} />
              <span className="text-[10px] font-semibold">Logout</span>
            </button>
          </form>
        </div>
      </nav>
    </>
  )
}
