import { logout } from '../actions'
import { HardHat, LogOut, Wrench } from 'lucide-react'

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-md shadow-orange-500/25">
                <HardHat className="h-4 w-4 text-white" />
              </div>
              <div className="leading-none">
                <p className="text-sm font-bold text-gray-900">Contractor Portal</p>
                <p className="text-[10px] text-gray-400 font-medium">ExcelPro Washers</p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-1">
                <Wrench className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-semibold text-orange-700">Field Crew</span>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 py-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-4 py-3 text-center">
        <p className="text-xs text-gray-400">ExcelPro Washers &middot; Contractor Portal</p>
      </footer>
    </div>
  )
}
