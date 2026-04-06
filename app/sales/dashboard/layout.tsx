import { SalesNav } from './SalesNav'

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
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <SalesNav />

      {/* Desktop: offset for fixed sidebar; Mobile: offset for fixed bottom tab bar */}
      <main className="lg:pl-72 pb-24 lg:pb-8 px-4 pt-6 lg:px-8 lg:pt-8 max-w-7xl lg:max-w-none mx-auto">
        {children}
      </main>
    </div>
  )
}
