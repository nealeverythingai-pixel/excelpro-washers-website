import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus, FileText, Clock, DollarSign, TrendingUp, Users } from 'lucide-react'

const TIER_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  basic: { label: 'Basic', bg: 'bg-blue-100', text: 'text-blue-800' },
  mid: { label: 'Mid', bg: 'bg-green-100', text: 'text-green-800' },
  full: { label: 'Full', bg: 'bg-purple-100', text: 'text-purple-800' },
}

export default async function SalesDashboard() {
  const quotes = await db.quotes.getAll()
  const clients = await db.clients.getAll()
  
  // Sort by newest
  const recentQuotes = [...quotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getClient = (id: string) => clients.find(c => c.id === id)

  // Parse notes metadata safely
  const parseMeta = (notes?: string) => {
    if (!notes) return null
    try { return JSON.parse(notes) } catch { return null }
  }

  // Stats
  const todayStr = new Date().toISOString().split('T')[0]
  const todayQuotes = quotes.filter(q => q.createdAt.startsWith(todayStr))
  const totalRevenue = quotes.reduce((sum, q) => sum + q.total, 0)
  const totalOwnerCut = quotes.reduce((sum, q) => {
    const meta = parseMeta(q.notes)
    return sum + (meta?.ownerCut || q.total * 0.30)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
         </h2>
         <Link
            href="/sales/dashboard/quote"
            className="md:hidden inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
         >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
            New
         </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
         <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Total Quotes</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{quotes.length}</dd>
         </div>
         <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Today</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{todayQuotes.length}</dd>
         </div>
         <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-700">${totalRevenue.toLocaleString()}</dd>
         </div>
         <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500 flex items-center gap-1"><Users className="w-4 h-4" /> Owner Cut</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-blue-700">${Math.round(totalOwnerCut).toLocaleString()}</dd>
         </div>
      </div>

      {/* Recent Activity List */}
      <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8">Recent Quotes</h3>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
            {recentQuotes.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-500 italic">No quotes generated yet.</li>
            ) : (
                recentQuotes.map((quote) => {
                    const client = getClient(quote.clientId)
                    const meta = parseMeta(quote.notes)
                    const tierKey = meta?.tier || ''
                    const tierBadge = TIER_BADGES[tierKey]
                    return (
                        <li key={quote.id}>
                            <div className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate text-sm font-medium text-green-600">
                                                {client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}
                                            </span>
                                            {tierBadge && (
                                                <span className={`inline-flex rounded-full px-2 text-[10px] font-bold leading-5 ${tierBadge.bg} ${tierBadge.text}`}>
                                                    {tierBadge.label}
                                                </span>
                                            )}
                                        </div>
                                        <div className="ml-2 flex flex-shrink-0">
                                            <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                {quote.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                <DollarSign className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                ${quote.total.toLocaleString()}
                                            </p>
                                            {meta?.contractorPay && (
                                                <p className="mt-2 flex items-center text-sm text-gray-400 sm:mt-0 sm:ml-4">
                                                    Sub: ${meta.contractorPay.toLocaleString()} · You: ${meta.ownerCut.toLocaleString()}
                                                </p>
                                            )}
                                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                <FileText className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                {quote.items.length} {quote.items.length === 1 ? 'Item' : 'Items'}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <Clock className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                            <p>
                                                {new Date(quote.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    )
                })
            )}
        </ul>
      </div>
    </div>
  )
}
