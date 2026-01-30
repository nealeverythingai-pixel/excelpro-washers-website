import { SalesNav } from './SalesNav'

export default function SalesDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <SalesNav />
      
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top Header for Mobile Title or Desktop Info */}
        <header className="bg-white shadow-sm md:hidden sticky top-0 z-40">
           <div className="flex h-16 items-center justify-between px-4">
              <h1 className="text-lg font-bold text-gray-900">ExcelPro Sales</h1>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                 SR
              </div>
           </div>
        </header>

        <main className="flex-1 py-6 px-4 sm:px-6 md:py-8 mb-16 md:mb-0">
          {children}
        </main>
      </div>
    </div>
  )
}
