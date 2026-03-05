import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus, DollarSign, TrendingUp, FileText, Clock, ChevronRight } from 'lucide-react'

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
  const totalOwnerCut = quotes.reduce((sum, q) => {
    const meta = parseMeta(q.notes)
    return sum + (meta?.ownerCut || q.total * 0.30)
  }, 0)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* ─── Hero Card: Today's Summary ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 text-white p-5 shadow-lg">
        <div className="relative z-10">
          <p className="text-green-100 text-sm font-medium">Today&apos;s Revenue</p>
          <p className="text-4xl font-extrabold mt-1 tracking-tight">
            ${todayQuotes.reduce((s, q) => s + q.total, 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-green-100">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" /> {todayQuotes.length} quote{todayQuotes.length !== 1 ? 's' : ''} today
            </span>
            <span>·</span>
            <span>{quotes.length} total</span>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -right-2 w-20 h-20 rounded-full bg-white/5" />
      </div>

      {/* ─── Quick Action: New Quote ─── */}
      <Link href="/sales/dashboard/quote"
        className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-all">
        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
          <Plus className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">Create New Quote</p>
          <p className="text-sm text-gray-500">Start a property assessment</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
      </Link>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 gap-3">
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
          <div className="space-y-2">
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
                    {/* Left: avatar + info */}
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

                    {/* Right: price */}
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
        )}
      </div>
    </div>
  )
}
