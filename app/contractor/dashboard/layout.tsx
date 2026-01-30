import { logout } from '../actions'
import Link from 'next/link'
import { HardHat, LogOut } from 'lucide-react'

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center gap-2">
                <HardHat className="h-8 w-8 text-orange-600" />
                <span className="font-bold text-gray-900">Contractor Portal</span>
              </div>
            </div>
            <div className="flex items-center">
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
