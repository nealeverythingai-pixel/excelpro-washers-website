'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, LogOut, FileText, User } from 'lucide-react'
import { logout } from '../actions'

export function SalesNav() {
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard', href: '/sales/dashboard', icon: Home },
    { name: 'New Quote', href: '/sales/dashboard/quote', icon: PlusCircle },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gray-900 text-white">
        <div className="flex h-16 items-center justify-center border-b border-gray-800 bg-gray-900 px-4">
            <h1 className="text-xl font-bold tracking-wider text-green-500">ExcelPro Sales</h1>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 space-y-1 px-2">
                {links.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <item.icon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-800 p-4">
             <form action={logout} className="w-full">
                <button type="submit" className="flex-shrink-0 w-full group block">
                    <div className="flex items-center">
                        <div>
                           <LogOut className="inline-block h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white group-hover:text-gray-300">Sign Out</p>
                        </div>
                    </div>
                </button>
            </form>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
             <Link 
                href="/sales/dashboard"
                className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/sales/dashboard' ? 'text-green-600' : 'text-gray-500'}`}
             >
                <Home className="h-6 w-6" />
                <span className="text-xs mt-1">Home</span>
             </Link>
             <Link 
                href="/sales/dashboard/quote"
                 className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/sales/dashboard/quote' ? 'text-green-600' : 'text-gray-500'}`}
             >
                <PlusCircle className="h-8 w-8 text-green-600" />
                <span className="text-xs mt-1 font-bold">New Quote</span>
             </Link>
              <form action={logout} className="flex flex-col items-center justify-center w-full h-full">
                <button type="submit" className="flex flex-col items-center justify-center text-gray-500">
                    <LogOut className="h-6 w-6" />
                    <span className="text-xs mt-1">Logout</span>
                </button>
             </form>
        </div>
      </div>
    </>
  )
}
