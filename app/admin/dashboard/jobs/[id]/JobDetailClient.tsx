'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  FileText,
  Edit,
  ArrowLeft,
  AlertCircle,
  Building2,
  ClipboardCheck
} from 'lucide-react'
import type { Job, Client, User as UserType, Invoice } from '@/lib/types'

interface JobDetailClientProps {
  job: Job
  client: Client
  contractor: UserType | null
  invoice: Invoice | null
}

export default function JobDetailClient({ job, client, contractor, invoice }: JobDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/15 text-green-400'
      case 'Active':
        return 'bg-blue-500/15 text-blue-400'
      case 'Scheduled':
        return 'bg-purple-500/15 text-purple-400'
      case 'Cancelled':
        return 'bg-red-500/15 text-red-400'
      default:
        return 'bg-zinc-800 text-zinc-400'
    }
  }

  const handleMarkComplete = async () => {
    if (job.status === 'Completed') return
    
    const confirmComplete = confirm('Mark this job as completed?')
    if (!confirmComplete) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/jobs/${job.id}/complete`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to mark job as complete')
      }
    } catch (error) {
      console.error('Error marking job as complete:', error)
      alert('Failed to mark job as complete')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInvoice = () => {
    if (invoice) {
      router.push(`/admin/dashboard/invoices/${invoice.id}`)
    } else {
      router.push(`/admin/dashboard/invoices/new?jobId=${job.id}&clientId=${job.clientId}`)
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const isUpcoming = () => {
    return new Date(job.startDate) > new Date() && job.status === 'Scheduled'
  }

  const isInProgress = () => {
    const now = new Date()
    const start = new Date(job.startDate)
    const end = job.endDate ? new Date(job.endDate) : null
    return job.status === 'Active' || (start <= now && (!end || end >= now))
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/dashboard/jobs')}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </button>

        {/* Header */}
        <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-8 h-8 text-sky-500" />
                <h1 className="text-3xl font-bold text-zinc-100">
                  {job.title}
                </h1>
              </div>
              {job.description && (
                <p className="text-zinc-400 mt-2">{job.description}</p>
              )}
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                {job.status === 'Completed' && <CheckCircle2 className="w-4 h-4" />}
                {job.status === 'Active' && <Clock className="w-4 h-4" />}
                {job.status}
              </span>
              <div className="mt-4 text-3xl font-bold text-zinc-100">
                ${job.total.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Status Alerts */}
          {isUpcoming() && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex items-start gap-3 mb-6">
              <Clock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-purple-300">
                  Upcoming Job
                </p>
                <p className="text-sm text-purple-400 mt-1">
                  Scheduled to start on {formatDateTime(job.startDate)}
                </p>
              </div>
            </div>
          )}

          {isInProgress() && job.status === 'Active' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3 mb-6">
              <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-300">
                  Job In Progress
                </p>
                <p className="text-sm text-blue-400 mt-1">
                  This job is currently active.
                </p>
              </div>
            </div>
          )}

          {job.status === 'Completed' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3 mb-6">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-300">
                  Job Completed
                </p>
                <p className="text-sm text-green-400 mt-1">
                  {invoice ? 'Invoice has been generated for this job.' : 'Ready to generate invoice.'}
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            {job.status !== 'Completed' && job.status !== 'Cancelled' && (
              <button
                onClick={handleMarkComplete}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Complete
              </button>
            )}
            {job.status === 'Completed' && (
              <button
                onClick={handleGenerateInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                {invoice ? 'View Invoice' : 'Generate Invoice'}
              </button>
            )}
            <button
              onClick={() => router.push(`/admin/dashboard/jobs/${job.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Job
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

          {/* Schedule & Timeline */}
          <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Schedule</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-400">Start Date & Time</p>
                  <p className="font-medium text-zinc-100">
                    {formatDateTime(job.startDate)}
                  </p>
                </div>
              </div>

              {job.endDate && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-zinc-400">End Date & Time</p>
                    <p className="font-medium text-zinc-100">
                      {formatDateTime(job.endDate)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-400">Estimated Total</p>
                  <p className="text-2xl font-bold text-zinc-100">
                    ${job.total.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-400">Created</p>
                  <p className="text-zinc-100">
                    {formatDate(job.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contractor Assignment */}
        {contractor && (
          <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Assigned Contractor</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-zinc-100">{contractor.name}</p>
                <p className="text-zinc-400">{contractor.email}</p>
                {!contractor.active && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    Inactive
                  </span>
                )}
              </div>
              <span className="px-3 py-1 bg-blue-500/15 text-blue-400 rounded-full text-sm font-medium">
                {contractor.role}
              </span>
            </div>
          </div>
        )}

        {/* Proof of Work & Notes */}
        {(job.proofOfWork || job.contractorNotes) && (
          <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Work Details</h2>
            </div>

            <div className="space-y-4">
              {job.proofOfWork && (
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Proof of Work</p>
                  <p className="text-zinc-100 bg-zinc-800 p-4 rounded-lg">
                    {job.proofOfWork}
                  </p>
                </div>
              )}

              {job.contractorNotes && (
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Contractor Notes</p>
                  <p className="text-zinc-100 bg-zinc-800 p-4 rounded-lg">
                    {job.contractorNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Linked Invoice */}
        {invoice && (
          <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Linked Invoice</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-zinc-100">
                  Invoice #{invoice.id.split('_')[1]?.slice(0, 8) || invoice.id.slice(0, 8)}
                </p>
                <p className="text-zinc-400">
                  ${invoice.total.toLocaleString()} • {invoice.status}
                </p>
              </div>
              <button
                onClick={() => router.push(`/admin/dashboard/invoices/${invoice.id}`)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                View Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
