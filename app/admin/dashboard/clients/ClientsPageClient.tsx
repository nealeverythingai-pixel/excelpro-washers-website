'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Mail, Phone, MapPin, DollarSign, Briefcase, Star, Calendar, ArrowUpDown } from 'lucide-react'

interface Client {
  id: string
  firstName: string
  lastName: string
  companyName?: string
  email: string
  phone: string
  address: string
  createdAt: string
}

interface Job {
  id: string
  clientId: string
  title: string
  status: string
  total: number
  createdAt: string
}

interface Props {
  initialClients: Client[]
  initialJobs: Job[]
}

export default function ClientsPageClient({ initialClients, initialJobs }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'revenue' | 'date'>('name')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'vip'>('all')

  // Calculate client stats
  const getClientStats = (clientId: string) => {
    const clientJobs = initialJobs.filter(j => j.clientId === clientId)
    const completedJobs = clientJobs.filter(j => j.status === 'Completed')
    const totalRevenue = completedJobs.reduce((acc, job) => acc + (job.total || 0), 0)
    const lastJobDate = clientJobs.length > 0 
      ? new Date(Math.max(...clientJobs.map(j => new Date(j.createdAt).getTime())))
      : null

    return {
      totalJobs: clientJobs.length,
      completedJobs: completedJobs.length,
      totalRevenue,
      lastJobDate,
      isVIP: totalRevenue > 1000 || completedJobs.length > 5
    }
  }

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let filtered = initialClients.filter(client => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        client.firstName.toLowerCase().includes(searchLower) ||
        client.lastName.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.includes(searchTerm) ||
        (client.companyName?.toLowerCase().includes(searchLower))

      if (!matchesSearch) return false

      const stats = getClientStats(client.id)
      
      if (filterStatus === 'vip') return stats.isVIP
      if (filterStatus === 'active') {
        const daysSinceLastJob = stats.lastJobDate 
          ? (Date.now() - stats.lastJobDate.getTime()) / (1000 * 60 * 60 * 24)
          : Infinity
        return daysSinceLastJob < 90 // Active = job in last 90 days
      }
      
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      } else if (sortBy === 'revenue') {
        const revenueA = getClientStats(a.id).totalRevenue
        const revenueB = getClientStats(b.id).totalRevenue
        return revenueB - revenueA
      } else if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return 0
    })

    return filtered
  }, [initialClients, searchTerm, sortBy, filterStatus])

  // Calculate overview stats
  const totalClients = initialClients.length
  const vipClients = initialClients.filter(c => getClientStats(c.id).isVIP).length
  const activeClients = initialClients.filter(c => {
    const stats = getClientStats(c.id)
    const daysSinceLastJob = stats.lastJobDate 
      ? (Date.now() - stats.lastJobDate.getTime()) / (1000 * 60 * 60 * 24)
      : Infinity
    return daysSinceLastJob < 90
  }).length
  const totalRevenue = initialJobs.filter(j => j.status === 'Completed').reduce((acc, j) => acc + j.total, 0)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your customer database</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/dashboard/clients/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">VIP Clients</p>
              <p className="text-2xl font-bold text-gray-900">{vipClients}</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col space-y-4 rounded-lg bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            placeholder="Search by name, email, or phone..."
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filterStatus === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('vip')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filterStatus === 'vip'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            VIP
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="name">Name</option>
            <option value="revenue">Revenue</option>
            <option value="date">Date Added</option>
          </select>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClients.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'No clients match your filters.' 
                : 'No clients yet. Add your first one!'}
            </p>
          </div>
        ) : (
          filteredClients.map((client) => {
            const stats = getClientStats(client.id)
            const daysSinceLastJob = stats.lastJobDate 
              ? Math.floor((Date.now() - stats.lastJobDate.getTime()) / (1000 * 60 * 60 * 24))
              : null

            return (
              <Link
                key={client.id}
                href={`/admin/dashboard/clients/${client.id}`}
                className="relative flex flex-col space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition-all"
              >
                {/* VIP Badge */}
                {stats.isVIP && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      <Star className="h-3 w-3" />
                      <span>VIP</span>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {client.firstName} {client.lastName}
                  </h3>
                  {client.companyName && (
                    <p className="text-sm text-gray-500">{client.companyName}</p>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    <span>{client.phone}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-start">
                      <MapPin className="mr-2 h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Client Stats */}
                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Jobs</p>
                    <p className="text-lg font-semibold text-gray-900">{stats.completedJobs}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${stats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Last Contact */}
                {daysSinceLastJob !== null && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>
                      Last service: {daysSinceLastJob === 0 ? 'Today' : `${daysSinceLastJob}d ago`}
                    </span>
                  </div>
                )}
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
