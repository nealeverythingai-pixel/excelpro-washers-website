'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  FileText,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  Send,
  Copy,
  Eye,
  XCircle
} from 'lucide-react'
import { Quote, Client } from '@/lib/types'

interface QuotesPageClientProps {
  initialQuotes: Quote[]
  initialClients: Client[]
}

export default function QuotesPageClient({ initialQuotes, initialClients }: QuotesPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'Draft' | 'Sent' | 'Approved' | 'Converted'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'value'>('date')
  const [quotes, setQuotes] = useState(initialQuotes)

  // Helper to get client info
  const getClient = (clientId: string) => {
    return initialClients.find(c => c.id === clientId)
  }

  const getClientName = (clientId: string) => {
    const client = getClient(clientId)
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'
  }

  // Filter and sort quotes
  const filteredQuotes = useMemo(() => {
    let filtered = quotes

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(quote => {
        const clientName = getClientName(quote.clientId).toLowerCase()
        return (
          quote.title?.toLowerCase().includes(term) ||
          clientName.includes(term) ||
          quote.id.toLowerCase().includes(term)
        )
      })
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(quote => quote.status === filterStatus)
    }

    // Sort quotes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'client':
          return getClientName(a.clientId).localeCompare(getClientName(b.clientId))
        case 'value':
          return b.total - a.total
        default:
          return 0
      }
    })

    return filtered
  }, [quotes, searchTerm, filterStatus, sortBy])

  // Calculate stats
  const stats = useMemo(() => {
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const thisMonthQuotes = quotes.filter(q => new Date(q.createdAt) >= thisMonth)
    const draft = quotes.filter(q => q.status === 'Draft').length
    const sent = quotes.filter(q => q.status === 'Sent').length
    const approved = quotes.filter(q => q.status === 'Approved').length
    const converted = quotes.filter(q => q.status === 'Converted').length
    
    const acceptanceRate = sent > 0 ? Math.round(((approved + converted) / sent) * 100) : 0
    const pendingValue = quotes
      .filter(q => q.status === 'Sent' || q.status === 'Approved')
      .reduce((acc, q) => acc + q.total, 0)

    return { 
      thisMonth: thisMonthQuotes.length,
      draft, 
      sent,
      approved,
      converted,
      acceptanceRate,
      pendingValue
    }
  }, [quotes])

  // Send quote
  const handleSendQuote = async (quoteId: string) => {
    if (!confirm('Send this quote to the client via email?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}/send`, {
        method: 'POST'
      })

      if (response.ok) {
        setQuotes(quotes.map(q => 
          q.id === quoteId ? { ...q, status: 'Sent' as const } : q
        ))
        alert('Quote sent successfully!')
      }
    } catch (error) {
      console.error('Failed to send quote:', error)
      alert('Failed to send quote')
    }
  }

  // Approve quote
  const handleApproveQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      })

      if (response.ok) {
        setQuotes(quotes.map(q => 
          q.id === quoteId ? { ...q, status: 'Approved' as const } : q
        ))
      }
    } catch (error) {
      console.error('Failed to approve quote:', error)
    }
  }

  // Convert to job
  const handleConvertToJob = async (quoteId: string) => {
    if (!confirm('Convert this quote to a scheduled job?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}/convert`, {
        method: 'POST'
      })

      if (response.ok) {
        setQuotes(quotes.map(q => 
          q.id === quoteId ? { ...q, status: 'Converted' as const } : q
        ))
        alert('Quote converted to job successfully!')
      }
    } catch (error) {
      console.error('Failed to convert quote:', error)
      alert('Failed to convert quote')
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Status config
  const statusConfig = {
    'Draft': { 
      bg: 'bg-gray-100 dark:bg-gray-700', 
      text: 'text-gray-800 dark:text-gray-200',
      icon: FileText
    },
    'Sent': { 
      bg: 'bg-blue-100 dark:bg-blue-950', 
      text: 'text-blue-800 dark:text-blue-200',
      icon: Send
    },
    'Approved': { 
      bg: 'bg-green-100 dark:bg-green-950', 
      text: 'text-green-800 dark:text-green-200',
      icon: CheckCircle
    },
    'Converted': { 
      bg: 'bg-purple-100 dark:bg-purple-950', 
      text: 'text-purple-800 dark:text-purple-200',
      icon: CheckCircle
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quotes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage your service quotes</p>
        </div>
        <Link
          href="/admin/dashboard/quotes/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          New Quote
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.thisMonth}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Calendar className="text-gray-600 dark:text-gray-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Draft</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.draft}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileText className="text-gray-600 dark:text-gray-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.sent}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
              <Clock className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Acceptance Rate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.acceptanceRate}%</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
              <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Pending Value</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${stats.pendingValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by quote title, client name, or quote ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filter Buttons and Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All ({quotes.length})
            </button>
            <button
              onClick={() => setFilterStatus('Draft')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Draft'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Draft ({stats.draft})
            </button>
            <button
              onClick={() => setFilterStatus('Sent')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Sent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Sent ({stats.sent})
            </button>
            <button
              onClick={() => setFilterStatus('Approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Approved'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Approved ({stats.approved})
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'client' | 'value')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="client">Sort by Client</option>
            <option value="value">Sort by Value</option>
          </select>
        </div>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'No quotes match your filters.' 
              : 'No quotes yet. Create your first quote to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQuotes.map((quote) => {
            const client = getClient(quote.clientId)
            const config = statusConfig[quote.status as keyof typeof statusConfig] || statusConfig['Draft']
            const StatusIcon = config.icon
            
            return (
              <div
                key={quote.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
              >
                {/* Quote Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link 
                      href={`/admin/dashboard/quotes/${quote.id}`}
                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-500 transition-colors"
                    >
                      {quote.title}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Quote #{quote.id.slice(0, 8)}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                    <StatusIcon size={14} />
                    {quote.status}
                  </span>
                </div>

                {/* Quote Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User size={16} />
                    <span className="font-medium">{getClientName(quote.clientId)}</span>
                    {client?.companyName && (
                      <span className="text-gray-400">• {client.companyName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} />
                    <span>{formatDate(quote.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <DollarSign size={16} />
                    <span>${(quote.total || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Line Items Preview */}
                {quote.items && quote.items.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Items</p>
                    <div className="space-y-1">
                      {quote.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                          {item.description} - ${item.unitPrice.toFixed(2)}
                        </div>
                      ))}
                      {quote.items.length > 2 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          +{quote.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/admin/dashboard/quotes/${quote.id}`}
                    className="flex-1 px-4 py-2 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                  {quote.status === 'Draft' && (
                    <button
                      onClick={() => handleSendQuote(quote.id)}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Send Quote
                    </button>
                  )}
                  {quote.status === 'Sent' && (
                    <button
                      onClick={() => handleApproveQuote(quote.id)}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Approve
                    </button>
                  )}
                  {quote.status === 'Approved' && (
                    <button
                      onClick={() => handleConvertToJob(quote.id)}
                      className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Convert to Job
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
