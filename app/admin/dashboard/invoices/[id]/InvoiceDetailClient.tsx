'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Download, 
  Edit, 
  User, 
  Phone, 
  MapPin, 
  Briefcase,
  Clock,
  ArrowLeft
} from 'lucide-react'
import type { Invoice, Client, Job } from '@/lib/types'

interface InvoiceDetailClientProps {
  invoice: Invoice
  client: Client
  job: Job | null
}

export default function InvoiceDetailClient({ invoice, client, job }: InvoiceDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isOverdue = () => {
    if (invoice.status === 'Paid') return false
    return new Date(invoice.dueDate) < new Date()
  }

  const getDaysOverdue = () => {
    if (!isOverdue()) return 0
    const diff = new Date().getTime() - new Date(invoice.dueDate).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const getStatusBadgeColor = () => {
    if (isOverdue() && invoice.status !== 'Paid') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
    switch (invoice.status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'Sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const handleMarkPaid = async () => {
    if (invoice.status === 'Paid') return
    
    const confirmPaid = confirm('Mark this invoice as paid?')
    if (!confirmPaid) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/invoices/${invoice.id}/mark-paid`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to mark invoice as paid')
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      alert('Failed to mark invoice as paid')
    } finally {
      setLoading(false)
    }
  }

  const handleSendReminder = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/invoices/${invoice.id}/remind`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Payment reminder sent successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to send reminder')
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Failed to send reminder')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)
      if (!response.ok) throw new Error('Failed to generate PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const invoiceNum = invoice.id.split('_')[1]?.slice(0, 8) || invoice.id.slice(0, 8)
      a.download = `invoice-${invoiceNum}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download PDF. Please try again.')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/dashboard/invoices')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-sky-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Invoice #{invoice.id.split('_')[1]?.slice(0, 8) || invoice.id.slice(0, 8)}
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Created {formatDate(invoice.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeColor()}`}>
                {invoice.status === 'Paid' && <CheckCircle2 className="w-4 h-4" />}
                {isOverdue() && invoice.status !== 'Paid' && <AlertCircle className="w-4 h-4" />}
                {isOverdue() && invoice.status !== 'Paid' ? `Overdue (${getDaysOverdue()} days)` : invoice.status}
              </span>
              <div className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                ${invoice.total.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Due Date Warning */}
          {isOverdue() && invoice.status !== 'Paid' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-300">
                  Payment Overdue
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  This invoice was due on {formatDate(invoice.dueDate)} ({getDaysOverdue()} days ago).
                  Consider sending a payment reminder.
                </p>
              </div>
            </div>
          )}

          {invoice.status === 'Paid' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-300">
                  Payment Received
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  This invoice has been marked as paid.
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            {invoice.status !== 'Paid' && (
              <button
                onClick={handleMarkPaid}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Paid
              </button>
            )}
            {invoice.status !== 'Paid' && invoice.status !== 'Draft' && (
              <button
                onClick={handleSendReminder}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                Send Reminder
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={() => router.push(`/admin/dashboard/invoices/${invoice.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Client Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {client.firstName} {client.lastName}
                </p>
                {client.companyName && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{client.companyName}</p>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <a 
                      href={`mailto:${client.email}`}
                      className="text-gray-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    >
                      {client.email}
                    </a>
                  </div>
                </div>

                {client.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <a 
                        href={`tel:${client.phone}`}
                        className="text-gray-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                )}

                {client.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                      <p className="text-gray-900 dark:text-white">{client.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Details</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Invoice Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${invoice.total.toLocaleString()}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                  <p className={`font-medium ${isOverdue() && invoice.status !== 'Paid' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Date</p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>
              </div>

              {invoice.status === 'Paid' && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Payment Received</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    This invoice has been paid in full.
                  </p>
                </div>
              )}

              {invoice.status !== 'Paid' && !isOverdue() && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Payment Pending</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    Due in {Math.ceil((new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Linked Job Details */}
        {job && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Linked Job</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</p>
                {job.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{job.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    job.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    job.status === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {formatDate(job.startDate)}
                  </p>
                </div>

                {job.endDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {formatDate(job.endDate)}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => router.push(`/admin/dashboard/jobs/${job.id}`)}
                  className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-medium text-sm transition-colors"
                >
                  View Job Details →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
