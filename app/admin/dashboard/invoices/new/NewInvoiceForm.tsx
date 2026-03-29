'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, FileText, Calendar, Link as LinkIcon } from 'lucide-react'
import type { Client, Job } from '@/lib/types'

interface NewInvoiceFormProps {
  clients: Client[]
  completedJobs: Job[]
}

export default function NewInvoiceForm({ clients, completedJobs }: NewInvoiceFormProps) {
  const router = useRouter()
  const [clientId, setClientId] = useState('')
  const [jobId, setJobId] = useState('')
  const [total, setTotal] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('30')
  const [status, setStatus] = useState<'Draft' | 'Sent'>('Draft')
  const [loading, setLoading] = useState(false)

  // Filter jobs by selected client
  const clientJobs = completedJobs.filter(job => job.clientId === clientId)

  // Auto-fill total when job is selected
  useEffect(() => {
    if (jobId) {
      const selectedJob = completedJobs.find(j => j.id === jobId)
      if (selectedJob && selectedJob.total) {
        setTotal(selectedJob.total.toString())
      }
    }
  }, [jobId, completedJobs])

  // Auto-calculate due date based on payment terms
  useEffect(() => {
    if (paymentTerms) {
      const today = new Date()
      const due = new Date(today.setDate(today.getDate() + parseInt(paymentTerms)))
      setDueDate(due.toISOString().split('T')[0])
    }
  }, [paymentTerms])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          jobId: jobId || undefined,
          total: parseFloat(total),
          dueDate: new Date(dueDate).toISOString(),
          status
        })
      })

      if (response.ok) {
        const data = await response.json()

        // If sending immediately, trigger email
        if (status === 'Sent') {
          await fetch(`/api/admin/invoices/${data.invoice.id}/send`, {
            method: 'POST'
          })
        }

        router.push('/admin/dashboard/invoices')
        router.refresh()
      } else {
        alert('Failed to create invoice')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Create Invoice</h1>
          <p className="mt-1 text-sm text-zinc-500">Generate an invoice for completed work</p>
        </div>
        <Link
          href="/admin/dashboard/invoices"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-100"
        >
          Cancel
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-zinc-500" />
          <h3 className="mt-2 text-sm font-semibold text-zinc-100">No clients found</h3>
          <p className="mt-1 text-sm text-zinc-500">
            You need to create a client before creating an invoice
          </p>
          <div className="mt-6">
            <Link
              href="/admin/dashboard/clients"
              className="inline-flex items-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600 transition-colors"
            >
              Go to Clients
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client and Job Selection */}
          <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center">
              <LinkIcon className="h-5 w-5 mr-2" />
              Client & Job
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Client *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value)
                    setJobId('') // Reset job selection when client changes
                  }}
                  required
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                      {client.companyName && ` - ${client.companyName}`}
                    </option>
                  ))}
                </select>
              </div>

              {clientId && (
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Link to Completed Job
                    <span className="text-xs text-zinc-500 ml-1">(Optional)</span>
                  </label>
                  <select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="">No job (manual invoice)</option>
                    {clientJobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title} - ${job.total.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  {clientJobs.length === 0 && (
                    <p className="mt-1 text-xs text-zinc-500">
                      No completed jobs found for this client
                    </p>
                  )}
                  {jobId && (
                    <p className="mt-2 text-xs text-green-400">
                      ✓ Invoice will be linked to this job
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Amount
            </h2>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Invoice Total *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  required
                  placeholder="0.00"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 pl-8 pr-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              {jobId && (
                <p className="mt-1 text-xs text-zinc-500">
                  Auto-filled from selected job (can be adjusted)
                </p>
              )}
            </div>
          </div>

          {/* Payment Terms */}
          <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Payment Terms
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="0">Due on Receipt</option>
                  <option value="7">Net 7 (7 days)</option>
                  <option value="15">Net 15 (15 days)</option>
                  <option value="30">Net 30 (30 days)</option>
                  <option value="60">Net 60 (60 days)</option>
                  <option value="custom">Custom</option>
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
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {paymentTerms !== '0' && dueDate && (
              <p className="mt-2 text-xs text-zinc-500">
                Payment due: {new Date(dueDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Status
            </h2>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Draft' | 'Sent')}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="Draft">Draft (Save for later)</option>
                <option value="Sent">Sent (Email to client)</option>
              </select>
              <p className="mt-1 text-xs text-zinc-500">
                {status === 'Draft'
                  ? 'Save as draft and send later from the invoices list'
                  : 'Invoice will be emailed to client immediately'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6">
            <Link
              href="/admin/dashboard/invoices"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !clientId || !total || !dueDate}
              className="rounded-md bg-sky-600 px-6 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:bg-sky-400 disabled:cursor-not-allowed transition-colors inline-flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : status === 'Draft' ? 'Save Invoice' : 'Create & Send Invoice'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
