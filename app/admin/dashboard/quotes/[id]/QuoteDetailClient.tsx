'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  Edit,
  ArrowLeft,
  Send,
  Building2,
  Package
} from 'lucide-react'
import type { Quote, Client, Job } from '@/lib/types'

interface QuoteDetailClientProps {
  quote: Quote
  client: Client
  job: Job | null
}

export default function QuoteDetailClient({ quote, client, job }: QuoteDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500/15 text-green-400'
      case 'Sent':
        return 'bg-blue-500/15 text-blue-400'
      case 'Draft':
        return 'bg-zinc-800 text-zinc-400'
      case 'Converted':
        return 'bg-purple-500/15 text-purple-400'
      default:
        return 'bg-zinc-800 text-zinc-400'
    }
  }

  const handleSend = async () => {
    if (quote.status === 'Sent' || quote.status === 'Approved' || quote.status === 'Converted') {
      alert('This quote has already been sent.')
      return
    }

    const confirmSend = confirm('Send this quote to the client?')
    if (!confirmSend) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/quotes/${quote.id}/send`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
        alert('Quote sent successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to send quote')
      }
    } catch (error) {
      console.error('Error sending quote:', error)
      alert('Failed to send quote')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (quote.status === 'Approved' || quote.status === 'Converted') {
      alert('This quote has already been approved.')
      return
    }

    const confirmApprove = confirm('Mark this quote as approved by client?')
    if (!confirmApprove) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/quotes/${quote.id}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
        alert('Quote approved successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to approve quote')
      }
    } catch (error) {
      console.error('Error approving quote:', error)
      alert('Failed to approve quote')
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async () => {
    if (quote.status === 'Converted') {
      alert('This quote has already been converted to a job.')
      return
    }

    const confirmConvert = confirm('Convert this quote to a job?')
    if (!confirmConvert) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/quotes/${quote.id}/convert`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/dashboard/jobs/${data.jobId}`)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to convert quote')
      }
    } catch (error) {
      console.error('Error converting quote:', error)
      alert('Failed to convert quote')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateSubtotal = () => {
    return quote.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const getTaxAmount = () => {
    const subtotal = calculateSubtotal()
    return quote.total - subtotal
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/dashboard/quotes')}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotes
        </button>

        {/* Header */}
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-sky-500" />
                <h1 className="text-3xl font-bold text-zinc-100">
                  {quote.title}
                </h1>
              </div>
              <p className="text-zinc-400">
                Quote #{quote.id.split('_')[1]?.slice(0, 8) || quote.id.slice(0, 8)}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                Created {formatDate(quote.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                {quote.status === 'Approved' && <CheckCircle2 className="w-4 h-4" />}
                {quote.status === 'Converted' && <Briefcase className="w-4 h-4" />}
                {quote.status}
              </span>
              <div className="mt-4 text-3xl font-bold text-zinc-100">
                ${quote.total.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Status Alerts */}
          {quote.status === 'Draft' && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 flex items-start gap-3 mb-6">
              <Clock className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-zinc-300">
                  Draft Quote
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  This quote has not been sent to the client yet. Review and send when ready.
                </p>
              </div>
            </div>
          )}

          {quote.status === 'Sent' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3 mb-6">
              <Send className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-300">
                  Quote Sent
                </p>
                <p className="text-sm text-blue-400 mt-1">
                  Waiting for client approval. Mark as approved once confirmed.
                </p>
              </div>
            </div>
          )}

          {quote.status === 'Approved' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3 mb-6">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-300">
                  Quote Approved
                </p>
                <p className="text-sm text-green-400 mt-1">
                  Client has approved this quote. Ready to convert to a job.
                </p>
              </div>
            </div>
          )}

          {quote.status === 'Converted' && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex items-start gap-3 mb-6">
              <Briefcase className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-purple-300">
                  Converted to Job
                </p>
                <p className="text-sm text-purple-400 mt-1">
                  This quote has been converted to a job and is now in progress.
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            {quote.status === 'Draft' && (
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send Quote
              </button>
            )}
            {(quote.status === 'Sent' || quote.status === 'Draft') && (
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Approved
              </button>
            )}
            {quote.status === 'Approved' && (
              <button
                onClick={handleConvert}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Briefcase className="w-4 h-4" />
                Convert to Job
              </button>
            )}
            <button
              onClick={() => router.push(`/admin/dashboard/quotes/${quote.id}/edit`)}
              disabled={quote.status === 'Converted'}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <Edit className="w-4 h-4" />
              Edit Quote
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Details */}
          <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Client Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-zinc-100">
                  {client.firstName} {client.lastName}
                </p>
                {client.companyName && (
                  <p className="text-zinc-400 mt-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {client.companyName}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-zinc-400">Email</p>
                    <a
                      href={`mailto:${client.email}`}
                      className="text-zinc-100 hover:text-sky-400 transition-colors"
                    >
                      {client.email}
                    </a>
                  </div>
                </div>

                {client.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-zinc-400">Phone</p>
                      <a
                        href={`tel:${client.phone}`}
                        className="text-zinc-100 hover:text-sky-400 transition-colors"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                )}

                {client.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-zinc-400">Address</p>
                      <p className="text-zinc-100">{client.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <button
                  onClick={() => router.push(`/admin/dashboard/clients?id=${client.id}`)}
                  className="text-sky-400 hover:text-sky-300 font-medium text-sm transition-colors"
                >
                  View Client Profile →
                </button>
              </div>
            </div>
          </div>

          {/* Quote Summary */}
          <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Quote Summary</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Subtotal</span>
                <span className="font-medium text-zinc-100">
                  ${calculateSubtotal().toLocaleString()}
                </span>
              </div>

              {getTaxAmount() > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Tax</span>
                  <span className="font-medium text-zinc-100">
                    ${getTaxAmount().toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                <span className="text-lg font-semibold text-zinc-100">Total</span>
                <span className="text-2xl font-bold text-zinc-100">
                  ${quote.total.toLocaleString()}
                </span>
              </div>

              <div className="flex items-start gap-3 pt-4 border-t border-zinc-800">
                <Calendar className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-400">Created Date</p>
                  <p className="text-zinc-100">
                    {formatDate(quote.createdAt)}
                  </p>
                </div>
              </div>

              {quote.salesRepId && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-zinc-400">Sales Rep</p>
                    <p className="text-zinc-100">
                      ID: {quote.salesRepId}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-100">Line Items</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-100">Description</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-100">Quantity</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-100">Unit Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-100">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, index) => (
                  <tr key={index} className="border-b border-zinc-800/50 last:border-0">
                    <td className="py-4 px-4 text-zinc-100">{item.description}</td>
                    <td className="py-4 px-4 text-right text-zinc-100">{item.quantity}</td>
                    <td className="py-4 px-4 text-right text-zinc-100">${item.unitPrice.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-medium text-zinc-100">
                      ${(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-zinc-700">
                  <td colSpan={3} className="py-4 px-4 text-right font-semibold text-zinc-100">
                    Subtotal
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-zinc-100">
                    ${calculateSubtotal().toLocaleString()}
                  </td>
                </tr>
                {getTaxAmount() > 0 && (
                  <tr>
                    <td colSpan={3} className="py-2 px-4 text-right text-zinc-400">
                      Tax
                    </td>
                    <td className="py-2 px-4 text-right text-zinc-100">
                      ${getTaxAmount().toLocaleString()}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-zinc-700">
                  <td colSpan={3} className="py-4 px-4 text-right text-lg font-bold text-zinc-100">
                    Total
                  </td>
                  <td className="py-4 px-4 text-right text-lg font-bold text-zinc-100">
                    ${quote.total.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Linked Job */}
        {job && quote.status === 'Converted' && (
          <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Converted Job</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-zinc-100">{job.title}</p>
                <p className="text-zinc-400">
                  Status: {job.status} • ${job.total.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => router.push(`/admin/dashboard/jobs/${job.id}`)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                View Job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
