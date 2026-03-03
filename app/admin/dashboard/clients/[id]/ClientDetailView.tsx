'use client'

import { useState } from 'react'
import { Client, Job, Quote, Invoice } from '@/lib/types'
import { updateClient, deleteClient } from '@/app/admin/actions/clients'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Briefcase,
  FileText,
  DollarSign,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'

function StatusBadge({ status, type }: { status: string; type: 'job' | 'quote' | 'invoice' }) {
  const colors: Record<string, string> = {
    // Jobs
    Scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Active: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    // Quotes
    Draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Converted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    // Invoices
    Paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Unpaid: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

export function ClientDetailView({
  client,
  jobs,
  quotes,
  invoices,
}: {
  client: Client
  jobs: Job[]
  quotes: Quote[]
  invoices: Invoice[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    address: client.address,
    companyName: client.companyName || '',
  })

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0)
  const outstandingBalance = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Draft').reduce((sum, i) => sum + i.total, 0)

  async function handleSave() {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.set('id', client.id)
      Object.entries(form).forEach(([key, value]) => formData.set(key, value))
      await updateClient(client.id, formData)
      setEditing(false)
      router.refresh()
    } catch {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteClient(client.id)
      router.push('/admin/dashboard/clients')
    } catch {
      alert('Failed to delete')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/clients"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {client.firstName} {client.lastName}
            </h1>
            {client.companyName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Building className="h-3.5 w-3.5" /> {client.companyName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Edit className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setForm({ firstName: client.firstName, lastName: client.lastName, email: client.email, phone: client.phone, address: client.address, companyName: client.companyName || '' }) }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Client</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{client.firstName} {client.lastName}</strong>?
              This will not delete associated jobs, quotes, or invoices.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jobs</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{jobs.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quotes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{quotes.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</p>
          <p className="text-2xl font-bold text-green-600 mt-1">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Outstanding</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">${outstandingBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client Information</h2>
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'First Name', key: 'firstName' as const },
              { label: 'Last Name', key: 'lastName' as const },
              { label: 'Email', key: 'email' as const },
              { label: 'Phone', key: 'phone' as const },
              { label: 'Address', key: 'address' as const },
              { label: 'Company', key: 'companyName' as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span>{client.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span>{client.address || 'No address'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span>Client since {new Date(client.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-400" /> Jobs ({jobs.length})
          </h2>
        </div>
        {jobs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">No jobs yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3">
                      <Link href={`/admin/dashboard/jobs/${job.id}`} className="text-green-600 dark:text-green-400 hover:underline font-medium">
                        {job.title}
                      </Link>
                    </td>
                    <td className="py-3"><StatusBadge status={job.status} type="job" /></td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{new Date(job.startDate).toLocaleDateString()}</td>
                    <td className="py-3 text-right font-medium text-gray-900 dark:text-white">${job.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quotes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" /> Quotes ({quotes.length})
          </h2>
        </div>
        {quotes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">No quotes yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{quote.title}</td>
                    <td className="py-3"><StatusBadge status={quote.status} type="quote" /></td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{new Date(quote.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right font-medium text-gray-900 dark:text-white">${quote.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-400" /> Invoices ({invoices.length})
          </h2>
        </div>
        {invoices.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">No invoices yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="pb-3 font-medium">Invoice #</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Due Date</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">INV-{inv.id.slice(0, 6).toUpperCase()}</td>
                    <td className="py-3"><StatusBadge status={inv.status} type="invoice" /></td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="py-3 text-right font-medium text-gray-900 dark:text-white">${inv.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
