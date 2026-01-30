'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  DollarSign, 
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  LayoutGrid,
  List,
  Filter
} from 'lucide-react'
import { Job, Client } from '@/lib/types'

interface JobsPageClientProps {
  initialJobs: Job[]
  initialClients: Client[]
}

export default function JobsPageClient({ initialJobs, initialClients }: JobsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'Scheduled' | 'Active' | 'Completed' | 'Cancelled'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'value'>('date')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [jobs, setJobs] = useState(initialJobs)

  // Helper to get client info
  const getClient = (clientId: string) => {
    return initialClients.find(c => c.id === clientId)
  }

  const getClientName = (clientId: string) => {
    const client = getClient(clientId)
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'
  }

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(job => {
        const clientName = getClientName(job.clientId).toLowerCase()
        return (
          job.title?.toLowerCase().includes(term) ||
          clientName.includes(term) ||
          job.description?.toLowerCase().includes(term)
        )
      })
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus)
    }

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        case 'client':
          return getClientName(a.clientId).localeCompare(getClientName(b.clientId))
        case 'value':
          return b.total - a.total
        default:
          return 0
      }
    })

    return filtered
  }, [jobs, searchTerm, filterStatus, sortBy])

  // Calculate stats
  const stats = useMemo(() => {
    const scheduled = jobs.filter(j => j.status === 'Scheduled').length
    const active = jobs.filter(j => j.status === 'Active').length
    const completed = jobs.filter(j => j.status === 'Completed').length
    const totalRevenue = jobs
      .filter(j => j.status === 'Completed')
      .reduce((acc, j) => acc + j.total, 0)

    return { scheduled, active, completed, totalRevenue }
  }, [jobs])

  // Mark job as complete
  const handleMarkComplete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' })
      })

      if (response.ok) {
        setJobs(jobs.map(j => 
          j.id === jobId ? { ...j, status: 'Completed' as const } : j
        ))
      }
    } catch (error) {
      console.error('Failed to mark job complete:', error)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  // Status colors
  const statusConfig = {
    'Scheduled': { 
      bg: 'bg-blue-100 dark:bg-blue-950', 
      text: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-200 dark:border-blue-800',
      icon: CalendarDays
    },
    'Active': { 
      bg: 'bg-green-100 dark:bg-green-950', 
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800',
      icon: Clock
    },
    'Completed': { 
      bg: 'bg-gray-100 dark:bg-gray-800', 
      text: 'text-gray-800 dark:text-gray-200',
      border: 'border-gray-200 dark:border-gray-700',
      icon: CheckCircle2
    },
    'Cancelled': { 
      bg: 'bg-red-100 dark:bg-red-950', 
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-800',
      icon: XCircle
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jobs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your scheduled and completed jobs</p>
        </div>
        <Link
          href="/admin/dashboard/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.scheduled}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
              <CalendarDays className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
              <Clock className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <CheckCircle2 className="text-gray-600 dark:text-gray-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${stats.totalRevenue.toLocaleString()}
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
            placeholder="Search by job title, client name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filter Buttons and View Toggle */}
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
              All ({jobs.length})
            </button>
            <button
              onClick={() => setFilterStatus('Scheduled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Scheduled'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Scheduled ({stats.scheduled})
            </button>
            <button
              onClick={() => setFilterStatus('Active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Active'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setFilterStatus('Completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Completed'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Completed ({stats.completed})
            </button>
          </div>

          <div className="flex items-center gap-3">
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

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-blue-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-blue-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'No jobs match your filters.' 
              : 'No jobs found. Create one to get started.'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
          {filteredJobs.map((job) => {
            const client = getClient(job.clientId)
            const StatusIcon = statusConfig[job.status].icon
            
            return (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
              >
                {/* Job Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link 
                      href={`/admin/dashboard/jobs/${job.id}`}
                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-500 transition-colors"
                    >
                      {job.title}
                    </Link>
                    {job.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[job.status].bg} ${statusConfig[job.status].text}`}>
                    <StatusIcon size={14} />
                    {job.status}
                  </span>
                </div>

                {/* Job Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User size={16} />
                    <span className="font-medium">{getClientName(job.clientId)}</span>
                    {client?.companyName && (
                      <span className="text-gray-400">• {client.companyName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} />
                    <span>{formatDate(job.startDate)}</span>
                    {job.endDate && (
                      <span className="text-gray-400">
                        → {formatDate(job.endDate)}
                      </span>
                    )}
                  </div>
                  {client?.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin size={16} />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <DollarSign size={16} />
                    <span>${job.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/admin/dashboard/jobs/${job.id}`}
                    className="flex-1 px-4 py-2 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    View Details
                  </Link>
                  {job.status === 'Active' && (
                    <button
                      onClick={() => handleMarkComplete(job.id)}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                  {job.status === 'Completed' && (
                    <Link
                      href={`/admin/dashboard/invoices/new?jobId=${job.id}`}
                      className="flex-1 px-4 py-2 text-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Generate Invoice
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
