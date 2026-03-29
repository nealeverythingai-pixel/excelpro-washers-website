'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, DollarSign, Calendar, AlertCircle, CheckCircle, Clock, Send, FileText, Search } from 'lucide-react'
import type { Invoice, Client, Job } from '@/lib/types'

interface InvoicesPageClientProps {
  initialInvoices: Invoice[]
  initialClients: Client[]
  initialJobs: Job[]
}

export default function InvoicesPageClient({ initialInvoices, initialClients, initialJobs }: InvoicesPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'Unpaid' | 'Paid' | 'Overdue'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'amount' | 'duedate'>('date')

  // Helper to check if invoice is overdue
  const isOverdue = (invoice: Invoice) => {
    return new Date(invoice.dueDate) < new Date() && invoice.status !== 'Paid'
  }

  // Get client name
  const getClientName = (clientId: string) => {
    const client = initialClients.find(c => c.id === clientId)
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'
  }

  // Get job title if linked
  const getJobTitle = (jobId?: string) => {
    if (!jobId) return null
    const job = initialJobs.find(j => j.id === jobId)
    return job?.title || null
  }

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const outstanding = initialInvoices
      .filter(inv => inv.status !== 'Paid')
      .reduce((sum, inv) => sum + inv.total, 0)

    const paidThisMonth = initialInvoices
      .filter(inv => {
        if (inv.status !== 'Paid') return false
        const createdDate = new Date(inv.createdAt)
        return createdDate >= firstDayOfMonth
      })
      .reduce((sum, inv) => sum + inv.total, 0)

    const overdueCount = initialInvoices.filter(inv => isOverdue(inv)).length

    // Calculate average payment time for paid invoices
    const paidInvoices = initialInvoices.filter(inv => inv.status === 'Paid')
    let avgPaymentTime = 0
    if (paidInvoices.length > 0) {
      const totalDays = paidInvoices.reduce((sum, inv) => {
        const created = new Date(inv.createdAt).getTime()
        const paid = new Date(inv.dueDate).getTime() // Using dueDate as proxy for paid date
        const days = Math.max(0, Math.floor((paid - created) / (1000 * 60 * 60 * 24)))
        return sum + days
      }, 0)
      avgPaymentTime = Math.round(totalDays / paidInvoices.length)
    }

    return {
      outstanding,
      paidThisMonth,
      overdueCount,
      avgPaymentTime
    }
  }, [initialInvoices])

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...initialInvoices]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(inv => {
        const invoiceNum = `INV-${inv.id.toUpperCase().slice(0, 6)}`
        const clientName = getClientName(inv.clientId).toLowerCase()
        return invoiceNum.toLowerCase().includes(term) || clientName.includes(term)
      })
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'Overdue') {
        filtered = filtered.filter(inv => isOverdue(inv))
      } else {
        filtered = filtered.filter(inv => inv.status === filterStatus)
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'client':
          return getClientName(a.clientId).localeCompare(getClientName(b.clientId))
        case 'amount':
          return b.total - a.total
        case 'duedate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [initialInvoices, searchTerm, filterStatus, sortBy])

  // Handle mark as paid
  const handleMarkPaid = async (invoiceId: string) => {
    if (!confirm('Mark this invoice as paid?')) return

    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentDate: new Date().toISOString() })
      })

      if (res.ok) {
        window.location.reload()
      } else {
        alert('Failed to mark invoice as paid')
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      alert('An error occurred')
    }
  }

  // Handle send reminder
  const handleSendReminder = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/remind`, {
        method: 'POST'
      })

      if (res.ok) {
        alert('Payment reminder sent successfully')
      } else {
        alert('Failed to send reminder')
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('An error occurred')
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (invoice: Invoice) => {
    if (isOverdue(invoice)) return 'bg-red-500/15 text-red-400'
    if (invoice.status === 'Paid') return 'bg-green-500/15 text-green-400'
    return 'bg-blue-500/15 text-blue-400'
  }

  // Get status display text
  const getStatusText = (invoice: Invoice) => {
    if (isOverdue(invoice)) return 'Overdue'
    return invoice.status
  }

  // Calculate days overdue
  const getDaysOverdue = (invoice: Invoice) => {
    if (!isOverdue(invoice)) return 0
    const now = new Date().getTime()
    const due = new Date(invoice.dueDate).getTime()
    return Math.floor((now - due) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Invoices</h1>
          <p className="mt-1 text-sm text-zinc-500">Track payments and accounts receivable</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/dashboard/invoices/new"
            className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Outstanding</p>
              <p className="text-2xl font-bold text-zinc-100 mt-2">${stats.outstanding.toLocaleString()}</p>
            </div>
            <div className="rounded-full bg-red-500/15 p-3">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Paid This Month</p>
              <p className="text-2xl font-bold text-zinc-100 mt-2">${stats.paidThisMonth.toLocaleString()}</p>
            </div>
            <div className="rounded-full bg-green-500/15 p-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Overdue</p>
              <p className="text-2xl font-bold text-zinc-100 mt-2">{stats.overdueCount}</p>
            </div>
            <div className="rounded-full bg-red-500/15 p-3">
              <Clock className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Avg Payment Time</p>
              <p className="text-2xl font-bold text-zinc-100 mt-2">{stats.avgPaymentTime} days</p>
            </div>
            <div className="rounded-full bg-sky-500/15 p-3">
              <Calendar className="h-6 w-6 text-sky-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by invoice # or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-sky-500 text-white'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('Unpaid')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'Unpaid'
                ? 'bg-sky-500 text-white'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            Unpaid
          </button>
          <button
            onClick={() => setFilterStatus('Paid')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'Paid'
                ? 'bg-sky-500 text-white'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilterStatus('Overdue')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === 'Overdue'
                ? 'bg-sky-500 text-white'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            Overdue
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="date">Sort by Date</option>
          <option value="client">Sort by Client</option>
          <option value="amount">Sort by Amount</option>
          <option value="duedate">Sort by Due Date</option>
        </select>
      </div>

      {/* Invoice Cards */}
      {filteredInvoices.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-zinc-700 p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-zinc-500" />
          <h3 className="mt-2 text-sm font-semibold text-zinc-100">No invoices found</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Get started by creating a new invoice'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <div className="mt-6">
              <Link
                href="/admin/dashboard/invoices/new"
                className="inline-flex items-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInvoices.map((invoice) => {
            const clientName = getClientName(invoice.clientId)
            const jobTitle = getJobTitle(invoice.jobId)
            const daysOverdue = getDaysOverdue(invoice)

            return (
              <div
                key={invoice.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Invoice Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-lg font-semibold text-zinc-100">
                      INV-{invoice.id.toUpperCase().slice(0, 6)}
                    </p>
                    <p className="text-sm text-zinc-400 mt-1">{clientName}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(invoice)}`}>
                    {getStatusText(invoice)}
                  </span>
                </div>

                {/* Invoice Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Amount</span>
                    <span className="font-semibold text-zinc-100">${invoice.total.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Issued</span>
                    <span className="text-zinc-100">{new Date(invoice.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Due Date</span>
                    <span className={`${isOverdue(invoice) ? 'text-red-400 font-semibold' : 'text-zinc-100'}`}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  {jobTitle && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Job</span>
                      <span className="text-zinc-100 truncate ml-2">{jobTitle}</span>
                    </div>
                  )}
                  {daysOverdue > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-400 font-semibold">
                      <Clock className="h-3 w-3" />
                      {daysOverdue} days overdue
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  {invoice.status !== 'Paid' && (
                    <button
                      onClick={() => handleMarkPaid(invoice.id)}
                      className="flex-1 rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="inline h-3 w-3 mr-1" />
                      Mark Paid
                    </button>
                  )}
                  {isOverdue(invoice) && (
                    <button
                      onClick={() => handleSendReminder(invoice.id)}
                      className="flex-1 rounded-md bg-orange-600 px-3 py-2 text-xs font-medium text-white hover:bg-orange-700 transition-colors"
                    >
                      <Send className="inline h-3 w-3 mr-1" />
                      Remind
                    </button>
                  )}
                  <Link
                    href={`/admin/dashboard/invoices/${invoice.id}`}
                    className="flex-1 text-center rounded-md bg-sky-600 px-3 py-2 text-xs font-medium text-white hover:bg-sky-700 transition-colors"
                  >
                    <FileText className="inline h-3 w-3 mr-1" />
                    Details
                  </Link>
                  <Link
                    href={`/invoice/${invoice.id}`}
                    target="_blank"
                    className="flex-1 text-center rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                  >
                    Customer View
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
