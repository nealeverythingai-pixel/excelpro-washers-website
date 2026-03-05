import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus, DollarSign, TrendingUp, FileText, Clock, ChevronRight, Users, Calendar } from 'lucide-react'

const TIER_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  basic: { label: 'Basic', bg: 'bg-blue-100', text: 'text-blue-700' },
  mid: { label: 'Mid', bg: 'bg-green-100', text: 'text-green-700' },
  full: { label: 'Full', bg: 'bg-purple-100', text: 'text-purple-700' },
}

export default async function SalesDashboard() {
  const quotes = await db.quotes.getAll()
  const clients = await db.clients.getAll()

  const recentQuotes = [...quotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const getClient = (id: string) => clients.find(c => c.id === id)
  const parseMeta = (notes?: string) => {
    if (!notes) return null
    try { return JSON.parse(notes) } catch { return null }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const todayQuotes = quotes.filter(q => q.createdAt.startsWith(todayStr))
  const totalRevenue = quotes.reduce((sum, q) => sum + q.total, 0)
  const todayRevenue = todayQuotes.reduce((s, q) => s + q.total, 0)
  const totalOwnerCut = quotes.reduce((sum, q) => {
    const meta = parseMeta(q.notes)
    return sum + (meta?.ownerCut || q.total * 0.30)
  }, 0)
  const avgQuoteValue = quotes.length > 0 ? Math.round(totalRevenue / quotes.length) : 0

  return (
    <div className="space-y-6 max-w-2xl lg:max-w-none mx-auto">

      {/* ─── Hero Card: Today's Summary (compact on mobile, wide banner on desktop) ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 text-white p-5 lg:p-8 shadow-lg">
        <div className="relative z-10 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Today&apos;s Revenue</p>
            <p className="text-4xl lg:text-5xl font-extrabold mt-1 tracking-tight">
              ${todayRevenue.toLocaleString()}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-green-100">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" /> {todayQuotes.length} quote{todayQuotes.length !== 1 ? 's' : ''} today
              </span>
              <span>·</span>
              <span>{quotes.length} total</span>
            </div>
          </div>
          {/* Desktop: CTA button right-aligned inside the hero */}
          <Link href="/sales/dashboard/quote"
            className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 text-sm font-bold text-white transition-all">
            <Plus className="w-5 h-5" /> New Quote
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -right-2 w-20 h-20 rounded-full bg-white/5" />
        <div className="hidden lg:block absolute -top-10 right-40 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* ─── Quick Action: New Quote (mobile only — desktop has it in hero) ─── */}
      <Link href="/sales/dashboard/quote"
        className="lg:hidden flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-all">
        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
          <Plus className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">Create New Quote</p>
          <p className="text-sm text-gray-500">Start a property assessment</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
      </Link>

      {/* ─── Stats Grid — 2-col mobile, 4-col desktop ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Total Revenue</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">${Math.round(totalOwnerCut).toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Owner Cut (30%)</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Total Quotes</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">${avgQuoteValue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Avg Quote Value</p>
        </div>
      </div>

      {/* ─── Recent Quotes ─── */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3 px-1">Recent Quotes</h3>

        {recentQuotes.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No quotes yet</p>
            <p className="text-sm text-gray-400 mt-1">Tap New Quote to get started</p>
          </div>
        ) : (
          <>
            {/* ── Mobile: Card List ── */}
            <div className="lg:hidden space-y-2">
              {recentQuotes.slice(0, 20).map((quote) => {
                const client = getClient(quote.clientId)
                const meta = parseMeta(quote.notes)
                const tierKey = meta?.tier || ''
                const tierBadge = TIER_BADGES[tierKey]
                const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown'

                return (
                  <div key={quote.id}
                    className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm active:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-green-700">
                            {clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{clientName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {tierBadge && (
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ${tierBadge.bg} ${tierBadge.text}`}>
                                {tierBadge.label}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(quote.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-gray-900">${quote.total.toLocaleString()}</p>
                        {meta?.contractorPay && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Sub ${meta.contractorPay.toLocaleString()} · You ${meta.ownerCut.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Desktop: Table View ── */}
            <div className="hidden lg:block rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Client</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Package</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Total</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Contractor</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentQuotes.slice(0, 30).map((quote) => {
                    const client = getClient(quote.clientId)
                    const meta = parseMeta(quote.notes)
                    const tierKey = meta?.tier || ''
                    const tierBadge = TIER_BADGES[tierKey]
                    const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown'
                    const contractorPay = meta?.contractorPay || Math.round(quote.total * 0.70)
                    const ownerCut = meta?.ownerCut || Math.round(quote.total * 0.30)

                    return (
                      <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-green-700">
                                {clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{clientName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {tierBadge ? (
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${tierBadge.bg} ${tierBadge.text}`}>
                              {tierBadge.label}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {new Date(quote.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-gray-900">${quote.total.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-right text-gray-500">${contractorPay.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-green-700">${ownerCut.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
