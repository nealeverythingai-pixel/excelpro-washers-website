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
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: CalendarDays
    },
    'Active': {
      bg: 'bg-green-500/15',
      text: 'text-green-400',
      border: 'border-green-500/30',
      icon: Clock
    },
    'Completed': {
      bg: 'bg-zinc-800',
      text: 'text-zinc-400',
      border: 'border-zinc-700',
      icon: CheckCircle2
    },
    'Cancelled': {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: XCircle
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Jobs</h1>
          <p className="text-zinc-400 mt-1">Manage your scheduled and completed jobs</p>
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
        <div className="bg-zinc-900 rounded-lg shadow-sm p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Scheduled</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.scheduled}</p>
            </div>
            <div className="p-3 bg-blue-500/15 rounded-lg">
              <CalendarDays className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg shadow-sm p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-500/15 rounded-lg">
              <Clock className="text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg shadow-sm p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Completed</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-zinc-800 rounded-lg">
              <CheckCircle2 className="text-zinc-400" size={24} />
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
      <div className="bg-zinc-900 rounded-lg shadow-sm p-6 border border-zinc-800 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input
            type="text"
            placeholder="Search by job title, client name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-zinc-800 text-zinc-100 placeholder:text-zinc-600"
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
                  : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              All ({jobs.length})
            </button>
            <button
              onClick={() => setFilterStatus('Scheduled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Scheduled'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              Scheduled ({stats.scheduled})
            </button>
            <button
              onClick={() => setFilterStatus('Active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Active'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setFilterStatus('Completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'Completed'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
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
              className="px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="client">Sort by Client</option>
              <option value="value">Sort by Value</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-zinc-700 text-blue-500'
                    : 'text-zinc-400'
                }`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-zinc-700 text-blue-500'
                    : 'text-zinc-400'
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
        <div className="bg-zinc-900 rounded-lg shadow-sm p-12 text-center border border-zinc-800">
          <Calendar className="mx-auto text-zinc-500 mb-4" size={48} />
          <p className="text-zinc-400">
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
                className="bg-zinc-900 rounded-lg shadow-sm p-6 border border-zinc-800 hover:border-blue-500 hover:shadow-md transition-all"
              >
                {/* Job Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/admin/dashboard/jobs/${job.id}`}
                      className="text-lg font-semibold text-zinc-100 hover:text-blue-500 transition-colors"
                    >
                      {job.title}
                    </Link>
                    {job.description && (
                      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
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
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <User size={16} />
                    <span className="font-medium">{getClientName(job.clientId)}</span>
                    {client?.companyName && (
                      <span className="text-zinc-500">• {client.companyName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar size={16} />
                    <span>{formatDate(job.startDate)}</span>
                    {job.endDate && (
                      <span className="text-zinc-500">
                        → {formatDate(job.endDate)}
                      </span>
                    )}
                  </div>
                  {client?.address && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <MapPin size={16} />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                    <DollarSign size={16} />
                    <span>${job.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <Link
                    href={`/admin/dashboard/jobs/${job.id}`}
                    className="flex-1 px-4 py-2 text-center border border-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
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
