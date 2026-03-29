'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, DollarSign, Calendar, FileText } from 'lucide-react'
import type { Invoice, Client, Job } from '@/lib/types'

interface EditInvoiceFormProps {
  invoice: Invoice
  clients: Client[]
  completedJobs: Job[]
}

export default function EditInvoiceForm({ invoice, clients, completedJobs }: EditInvoiceFormProps) {
  const router = useRouter()
  const [clientId, setClientId] = useState(invoice.clientId)
  const [jobId, setJobId] = useState(invoice.jobId || '')
  const [total, setTotal] = useState(invoice.total.toString())
  const [dueDate, setDueDate] = useState(invoice.dueDate.split('T')[0])
  const [status, setStatus] = useState(invoice.status)
  const [paymentTerms, setPaymentTerms] = useState('')
  const [loading, setLoading] = useState(false)

  // Filter jobs by selected client
  const clientJobs = completedJobs.filter(job => job.clientId === clientId)

  // Auto-fill total when job is selected
  useEffect(() => {
    if (jobId) {
      const selectedJob = completedJobs.find(j => j.id === jobId)
      if (selectedJob?.total) {
        setTotal(selectedJob.total.toString())
      }
    }
  }, [jobId, completedJobs])

  // Auto-calculate due date based on payment terms
  useEffect(() => {
    if (paymentTerms && paymentTerms !== 'custom') {
      const today = new Date()
      const daysToAdd = parseInt(paymentTerms)
      const dueDate = new Date(today.setDate(today.getDate() + daysToAdd))
      setDueDate(dueDate.toISOString().split('T')[0])
    }
  }, [paymentTerms])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientId || !total || !dueDate) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          jobId: jobId || undefined,
          total: parseFloat(total),
          dueDate: new Date(dueDate).toISOString(),
          status,
        }),
      })

      if (response.ok) {
        router.push(`/admin/dashboard/invoices/${invoice.id}`)
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update invoice')
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      alert('Failed to update invoice')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/admin/dashboard/invoices/${invoice.id}`)}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoice
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Edit Invoice
          </h1>
          <p className="text-zinc-400">
            Update invoice #{invoice.id.split('_')[1]?.slice(0, 8) || invoice.id.slice(0, 8)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client & Job Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Client & Job Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Client *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value)
                    setJobId('') // Reset job when client changes
                  }}
                  required
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                >
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                      {client.companyName ? ` - ${client.companyName}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Link to Job (Optional)
                </label>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                >
                  <option value="">No job linked</option>
                  {clientJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} - ${job.total.toLocaleString()}
                    </option>
                  ))}
                </select>
                {clientJobs.length === 0 && clientId && (
                  <p className="text-sm text-zinc-500 mt-1">
                    No completed jobs available for this client
                  </p>
                )}
                {jobId && (
                  <p className="text-sm text-green-400 mt-1">
                    ✓ Amount will auto-fill from selected job
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Amount & Payment Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Amount & Payment Terms</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Invoice Total *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    required
                    min="0"
                    className="w-full pl-8 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100 placeholder:text-zinc-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                >
                  <option value="">Select terms...</option>
                  <option value="0">Due on Receipt</option>
                  <option value="7">Net 7 Days</option>
                  <option value="15">Net 15 Days</option>
                  <option value="30">Net 30 Days</option>
                  <option value="60">Net 60 Days</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                />
                {dueDate && (
                  <p className="text-sm text-zinc-500 mt-1">
                    {formatDate(dueDate)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Invoice Status</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Invoice['status'])}
                required
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
              </select>
              <p className="text-sm text-zinc-500 mt-1">
                {status === 'Draft' && 'Invoice is not visible to client'}
                {status === 'Sent' && 'Invoice has been sent to client'}
                {status === 'Paid' && 'Payment has been received'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Updating...' : 'Update Invoice'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/admin/dashboard/invoices/${invoice.id}`)}
              className="px-6 py-3 border border-zinc-700 text-zinc-200 hover:bg-zinc-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
