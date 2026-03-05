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
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/60"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex h-14 lg:h-16 items-center justify-between px-4 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center font-black text-xs text-white">EP</div>
            <span className="text-base font-bold text-gray-900">Sales Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-500">Online</span>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 px-4 pt-4 pb-8 lg:px-8 lg:pt-6">
        {children}
      </main>
    </div>
  )
}
