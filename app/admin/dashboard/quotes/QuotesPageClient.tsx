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
  XCircle,
  Trash2
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

  // Delete quote
  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote? This cannot be undone.')) return
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, { method: 'DELETE' })
      if (response.ok) {
        setQuotes(quotes.filter(q => q.id !== quoteId))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete quote')
      }
    } catch (error) {
      console.error('Failed to delete quote:', error)
      alert('Failed to delete quote')
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
      bg: 'bg-zinc-800',
      text: 'text-zinc-400',
      icon: FileText
    },
    'Sent': {
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      icon: Send
    },
    'Approved': {
      bg: 'bg-green-500/15',
      text: 'text-green-400',
      icon: CheckCircle
    },
    'Converted': {
      bg: 'bg-purple-500/15',
      text: 'text-purple-400',
      icon: CheckCircle
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Quotes</h1>
          <p className="text-zinc-400 mt-1">Create and manage your service quotes</p>
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
        <div className="bg-zinc-900 rounded-lg shadow-sm p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">This Month</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.thisMonth}</p>
            </div>
            <div className="p-3 bg-zinc-800 rounded-lg">
              <Calendar className="text-zinc-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg shadow-sm p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Draft</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.draft}</p>
            </div>
            <div className="p-3 bg-zinc-800 rounded-lg">
              <FileText className="text-zinc-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg shadow-sm p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Pending</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{stats.sent}</p>
            </div>
            <div className="p-3 bg-blue-500/15 rounded-lg">
              <Clock className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg shadow-sm p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Acceptance Rate</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.acceptanceRate}%</p>
            </div>
            <div className="p-3 bg-green-500/15 rounded-lg">
              <CheckCircle className="text-green-400" size={24} />
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
      <div className="bg-zinc-900 rounded-lg shadow-sm p-6 border border-zinc-800 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input
            type="text"
            placeholder="Search by quote title, client name, or quote ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-zinc-800 text-zinc-100 placeholder:text-zinc-600"
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
                  : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              All ({quotes.length})
            </button>
            <button
              onClick={() => setFilterStatus('Draft')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Draft'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              Draft ({stats.draft})
            </button>
            <button
              onClick={() => setFilterStatus('Sent')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Sent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              Sent ({stats.sent})
            </button>
            <button
              onClick={() => setFilterStatus('Approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Approved'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              Approved ({stats.approved})
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'client' | 'value')}
            className="px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="client">Sort by Client</option>
            <option value="value">Sort by Value</option>
          </select>
        </div>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-zinc-900 rounded-lg shadow-sm p-12 text-center border border-zinc-800">
          <FileText className="mx-auto text-zinc-500 mb-4" size={48} />
          <p className="text-zinc-400">
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
                className="bg-zinc-900 rounded-lg shadow-sm p-6 border border-zinc-800 hover:border-blue-500 hover:shadow-md transition-all"
              >
                {/* Quote Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/admin/dashboard/quotes/${quote.id}`}
                      className="text-lg font-semibold text-zinc-100 hover:text-blue-500 transition-colors"
                    >
                      {quote.title}
                    </Link>
                    <p className="text-xs text-zinc-500 mt-1">
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
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <User size={16} />
                    <span className="font-medium">{getClientName(quote.clientId)}</span>
                    {client?.companyName && (
                      <span className="text-zinc-500">• {client.companyName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar size={16} />
                    <span>{formatDate(quote.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                    <DollarSign size={16} />
                    <span>${(quote.total || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Line Items Preview */}
                {quote.items && quote.items.length > 0 && (
                  <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
                    <p className="text-xs font-medium text-zinc-500 uppercase mb-2">Items</p>
                    <div className="space-y-1">
                      {quote.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-zinc-200">
                          <span>{item.description}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
                          <span className="text-zinc-400">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {quote.items.length > 2 && (
                        <p className="text-xs text-zinc-500">
                          +{quote.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <Link
                    href={`/admin/dashboard/quotes/${quote.id}`}
                    className="flex-1 px-4 py-2 text-center border border-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
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
                    <>
                      <button
                        onClick={() => handleSendQuote(quote.id)}
                        className="px-3 py-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors text-sm font-medium"
                        title="Resend email to client"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => handleApproveQuote(quote.id)}
                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Approve
                      </button>
                    </>
                  )}
                  {quote.status === 'Approved' && (
                    <button
                      onClick={() => handleConvertToJob(quote.id)}
                      className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Convert to Job
                    </button>
                  )}
                  {quote.status !== 'Converted' && (
                    <button
                      onClick={() => handleDeleteQuote(quote.id)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete quote"
                    >
                      <Trash2 size={16} />
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
