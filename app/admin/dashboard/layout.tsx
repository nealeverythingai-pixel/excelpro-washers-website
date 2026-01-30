import { AdminSidebar } from './AdminSidebar'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between bg-white dark:bg-gray-800 px-6 shadow-sm border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Dashboard</h2>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
             {/* Placeholder for user profile or notifications */}
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}
