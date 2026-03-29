import { logout } from '../actions'
import { LogOut } from 'lucide-react'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover' as const,
}

export default function SalesDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex flex-col text-zinc-100">
      {/* Header */}
      <header
        className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex h-14 lg:h-16 items-center justify-between px-4 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-md shadow-green-900/50">
              <span className="text-[11px] font-black text-white">EP</span>
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold text-zinc-100">Sales Portal</p>
              <p className="text-[10px] text-zinc-500 font-medium">ExcelPro Washers</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/30 px-2.5 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-green-400">Online</span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 px-4 pt-4 pb-8 lg:px-8 lg:pt-6 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-zinc-800 bg-zinc-900 px-4 py-3 text-center"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
      >
        <p className="text-xs text-zinc-600">ExcelPro Washers &middot; Sales Portal</p>
      </footer>
    </div>
  )
}
