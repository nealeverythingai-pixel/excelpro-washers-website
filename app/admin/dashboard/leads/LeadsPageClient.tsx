'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Flame, 
  Thermometer, 
  Snowflake,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  UserPlus,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react'
import { Request } from '@/lib/types'

interface LeadsPageClientProps {
  initialRequests: Request[]
}

export default function LeadsPageClient({ initialRequests }: LeadsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | 'hot' | 'warm' | 'cold'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'New' | 'Contacted' | 'Converted' | 'Lost'>('all')
  const [requests, setRequests] = useState(initialRequests)

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let filtered = requests

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(req => {
        const name = req.name || `${req.firstName} ${req.lastName}`
        return (
          name?.toLowerCase().includes(term) ||
          req.email?.toLowerCase().includes(term) ||
          req.phone?.includes(term)
        )
      })
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(req => req.aiCategory === filterCategory)
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus)
    }

    // Sort by score (hot first), then by date
    filtered.sort((a, b) => {
      const scoreA = a.aiScore || 0
      const scoreB = b.aiScore || 0
      if (scoreA !== scoreB) return scoreB - scoreA
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return filtered
  }, [requests, searchTerm, filterCategory, filterStatus])

  // Calculate stats
  const stats = useMemo(() => {
    const allLeads = requests.filter(r => r.status !== 'Converted')
    const hot = allLeads.filter(r => r.aiCategory === 'hot').length
    const warm = allLeads.filter(r => r.aiCategory === 'warm').length
    const cold = allLeads.filter(r => r.aiCategory === 'cold').length
    const converted = requests.filter(r => r.status === 'Converted').length
    const conversionRate = requests.length > 0 ? (converted / requests.length) * 100 : 0
    const pipelineValue = allLeads.reduce((acc, r) => acc + (r.estimatedValue || 0), 0)

    return { 
      total: allLeads.length, 
      hot, 
      warm, 
      cold, 
      conversionRate: Math.round(conversionRate),
      pipelineValue 
    }
  }, [requests])

  // Convert lead to client
  const handleConvertToClient = async (requestId: string) => {
    if (!confirm('Convert this lead to a client? This will create a client record.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/leads/${requestId}/convert`, {
        method: 'POST'
      })

      if (response.ok) {
        setRequests(requests.map(r => 
          r.id === requestId ? { ...r, status: 'Converted' } : r
        ))
        alert('Lead converted to client successfully!')
      }
    } catch (error) {
      console.error('Failed to convert lead:', error)
      alert('Failed to convert lead')
    }
  }

  // Update lead status
  const handleUpdateStatus = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/leads/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setRequests(requests.map(r => 
          r.id === requestId ? { ...r, status: status as Request['status'] } : r
        ))
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Category config
  const categoryConfig = {
    hot: {
      icon: Flame,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800'
    },
    warm: {
      icon: Thermometer,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800'
    },
    cold: {
      icon: Snowflake,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">AI-qualified leads from your contact form</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <TrendingUp className="text-gray-600 dark:text-gray-400" size={24} />
            </div>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterCategory(filterCategory === 'hot' ? 'all' : 'hot')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hot Leads</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.hot}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-950 rounded-lg">
              <Flame className="text-red-600 dark:text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterCategory(filterCategory === 'warm' ? 'all' : 'warm')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Warm Leads</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.warm}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-950 rounded-lg">
              <Thermometer className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setFilterCategory(filterCategory === 'cold' ? 'all' : 'cold')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cold Leads</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.cold}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
              <Snowflake className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Pipeline Value</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${stats.pipelineValue.toLocaleString()}
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
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setFilterCategory('hot')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'hot'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Hot ({stats.hot})
          </button>
          <button
            onClick={() => setFilterCategory('warm')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'warm'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Warm ({stats.warm})
          </button>
          <button
            onClick={() => setFilterCategory('cold')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'cold'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Cold ({stats.cold})
          </button>

          <div className="w-px bg-gray-300 dark:bg-gray-600 mx-2" />

          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setFilterStatus('New')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'New'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            New
          </button>
          <button
            onClick={() => setFilterStatus('Contacted')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'Contacted'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Contacted
          </button>
        </div>
      </div>

      {/* Conversion Rate Info */}
      {stats.conversionRate > 0 && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">
            <strong>Conversion Rate:</strong> {stats.conversionRate}% of leads have been converted to clients
          </p>
        </div>
      )}

      {/* Leads List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
          <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'No leads match your filters.'
              : 'No leads yet. They will appear here when someone fills out your contact form.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const name = request.name || `${request.firstName} ${request.lastName}`
            const CategoryIcon = categoryConfig[request.aiCategory as keyof typeof categoryConfig]?.icon || TrendingUp
            const config = categoryConfig[request.aiCategory as keyof typeof categoryConfig] || {
              color: 'text-gray-500',
              bg: 'bg-gray-50 dark:bg-gray-800',
              border: 'border-gray-200 dark:border-gray-700'
            }

            return (
              <div
                key={request.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-2 ${config.border} hover:shadow-md transition-all`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${config.bg} rounded-lg`}>
                      <CategoryIcon className={config.color} size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {request.aiScore && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold text-gray-700 dark:text-gray-300">
                            Score: {request.aiScore}/100
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          request.status === 'Converted' ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200' :
                          request.status === 'Contacted' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200' :
                          request.status === 'Lost' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {request.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {request.estimatedValue && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Est. Value</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ${request.estimatedValue.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail size={16} />
                    <a href={`mailto:${request.email}`} className="hover:text-blue-500 transition-colors">
                      {request.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone size={16} />
                    <a href={`tel:${request.phone}`} className="hover:text-blue-500 transition-colors">
                      {request.phone}
                    </a>
                  </div>
                </div>

                {/* Service */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Service Requested</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">
                    {request.service?.replace(/-/g, ' ') || 'N/A'}
                  </p>
                </div>

                {/* Message */}
                {request.message && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Message</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {request.message}
                    </p>
                  </div>
                )}

                {/* AI Analysis */}
                {request.aiReasoning && (
                  <div className={`mb-4 p-3 ${config.bg} rounded-lg border ${config.border}`}>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase mb-1">AI Analysis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {request.aiReasoning}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={`tel:${request.phone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Phone size={16} />
                    Call
                  </a>
                  <a
                    href={`mailto:${request.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Mail size={16} />
                    Email
                  </a>
                  {request.status !== 'Converted' && request.status !== 'Lost' && (
                    <>
                      {request.status !== 'Contacted' && (
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'Contacted')}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                        >
                          <CheckCircle size={16} />
                          Mark Contacted
                        </button>
                      )}
                      <button
                        onClick={() => handleConvertToClient(request.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <UserPlus size={16} />
                        Convert to Client
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(request.id, 'Lost')}
                        className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-sm font-medium"
                      >
                        <XCircle size={16} />
                        Mark Lost
                      </button>
                    </>
                  )}
                  {request.status === 'Converted' && (
                    <Link
                      href="/admin/dashboard/clients"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      View in Clients
                    </Link>
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
