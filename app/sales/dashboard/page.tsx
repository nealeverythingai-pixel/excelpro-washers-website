import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus, FileText, User, Clock, DollarSign } from 'lucide-react'

export default async function SalesDashboard() {
  const quotes = await db.quotes.getAll()
  const clients = await db.clients.getAll()
  
  // Sort by newest
  const recentQuotes = [...quotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getClient = (id: string) => clients.find(c => c.id === id)

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
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {quotes.filter(q => q.createdAt.startsWith(new Date().toISOString().split('T')[0])).length}
            </dd>
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
                    return (
                        <li key={quote.id}>
                            <div className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="truncate text-sm font-medium text-green-600">
                                            {client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}
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
                                                ${quote.total.toFixed(2)}
                                            </p>
                                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                <FileText className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                {quote.items.length} Services
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
