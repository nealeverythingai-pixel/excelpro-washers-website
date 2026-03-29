import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus, DollarSign, TrendingUp, FileText, ChevronRight, Users, Calendar } from 'lucide-react'

const TIER_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  basic: { label: 'Basic', bg: 'bg-blue-500/15',   text: 'text-blue-400' },
  mid:   { label: 'Mid',   bg: 'bg-green-500/15',  text: 'text-green-400' },
  full:  { label: 'Full',  bg: 'bg-purple-500/15', text: 'text-purple-400' },
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
  const totalRepCommission = quotes.reduce((sum, q) => {
    const meta = parseMeta(q.notes)
    return sum + (meta?.repCommission || q.total * 0.10)
  }, 0)
  const avgQuoteValue = quotes.length > 0 ? Math.round(totalRevenue / quotes.length) : 0

  return (
    <div className="space-y-6 max-w-2xl lg:max-w-none mx-auto">

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 text-white p-5 lg:p-8 shadow-lg shadow-green-900/40">
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
          <Link href="/sales/dashboard/quote"
            className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 text-sm font-bold text-white transition-all">
            <Plus className="w-5 h-5" /> New Quote
          </Link>
        </div>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -right-2 w-20 h-20 rounded-full bg-white/5" />
        <div className="hidden lg:block absolute -top-10 right-40 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* Mobile: New Quote CTA */}
      <Link href="/sales/dashboard/quote"
        className="lg:hidden flex items-center gap-4 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 active:scale-[0.98] transition-all hover:border-zinc-700">
        <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
          <Plus className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-100">Create New Quote</p>
          <p className="text-sm text-zinc-500">Start a property assessment</p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-600 flex-shrink-0" />
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { icon: TrendingUp, label: 'Total Revenue',    value: `$${totalRevenue.toLocaleString()}`,              iconBg: 'bg-green-500/15',  iconColor: 'text-green-400' },
          { icon: DollarSign, label: 'Your Commission',  value: `$${Math.round(totalRepCommission).toLocaleString()}`, iconBg: 'bg-blue-500/15',   iconColor: 'text-blue-400' },
          { icon: Users,      label: 'Total Quotes',     value: quotes.length.toString(),                         iconBg: 'bg-purple-500/15', iconColor: 'text-purple-400' },
          { icon: Calendar,   label: 'Avg Quote Value',  value: `$${avgQuoteValue.toLocaleString()}`,             iconBg: 'bg-amber-500/15',  iconColor: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
            <div className="mb-3">
              <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{s.value}</p>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Quotes */}
      <div>
        <h3 className="text-base font-semibold text-zinc-100 mb-3 px-1">Recent Quotes</h3>

        {recentQuotes.length === 0 ? (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7 text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium">No quotes yet</p>
            <p className="text-sm text-zinc-600 mt-1">Tap New Quote to get started</p>
          </div>
        ) : (
          <>
            {/* Mobile: Card List */}
            <div className="lg:hidden space-y-2">
              {recentQuotes.slice(0, 20).map((quote) => {
                const client = getClient(quote.clientId)
                const meta = parseMeta(quote.notes)
                const tierBadge = TIER_BADGES[meta?.tier || '']
                const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown'
                return (
                  <div key={quote.id} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 active:bg-zinc-800 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-green-400">
                            {clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-100 text-sm truncate">{clientName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {tierBadge && (
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ${tierBadge.bg} ${tierBadge.text}`}>
                                {tierBadge.label}
                              </span>
                            )}
                            <span className="text-xs text-zinc-600">
                              {new Date(quote.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-zinc-100">${quote.total.toLocaleString()}</p>
                        {meta?.contractorPay && (
                          <p className="text-[10px] text-zinc-600 mt-0.5">
                            Your {meta.leadSource === 'produced' ? '15' : '10'}%: ${(meta.repCommission || Math.round(quote.total * 0.10)).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop: Table */}
            <div className="hidden lg:block rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/60">
                    <th className="text-left px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Client</th>
                    <th className="text-left px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Package</th>
                    <th className="text-left px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-right px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Total</th>
                    <th className="text-right px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Contractor</th>
                    <th className="text-right px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {recentQuotes.slice(0, 30).map((quote) => {
                    const client = getClient(quote.clientId)
                    const meta = parseMeta(quote.notes)
                    const tierBadge = TIER_BADGES[meta?.tier || '']
                    const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown'
                    const contractorPay = meta?.contractorPay || Math.round(quote.total * 0.70)
                    const repCommission = meta?.repCommission || Math.round(quote.total * 0.10)
                    const leadSource = meta?.leadSource || 'given'
                    return (
                      <tr key={quote.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-green-400">
                                {clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <span className="font-medium text-zinc-200">{clientName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {tierBadge ? (
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${tierBadge.bg} ${tierBadge.text}`}>
                              {tierBadge.label}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-500">
                          {new Date(quote.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-zinc-100">${quote.total.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-right text-zinc-500">${contractorPay.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-green-400">
                          ${repCommission.toLocaleString()} <span className="text-xs font-normal text-zinc-600">({leadSource === 'produced' ? '15' : '10'}%)</span>
                        </td>
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
