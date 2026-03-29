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
    Scheduled: 'bg-blue-500/15 text-blue-400',
    Active: 'bg-amber-500/15 text-amber-400',
    Completed: 'bg-green-500/15 text-green-400',
    Cancelled: 'bg-red-500/15 text-red-400',
    // Quotes
    Draft: 'bg-zinc-800 text-zinc-400',
    Sent: 'bg-blue-500/15 text-blue-400',
    Approved: 'bg-green-500/15 text-green-400',
    Accepted: 'bg-green-500/15 text-green-400',
    Converted: 'bg-purple-500/15 text-purple-400',
    // Invoices
    Paid: 'bg-green-500/15 text-green-400',
    Unpaid: 'bg-amber-500/15 text-amber-400',
    Overdue: 'bg-red-500/15 text-red-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-zinc-800 text-zinc-400'}`}>
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
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              {client.firstName} {client.lastName}
            </h1>
            {client.companyName && (
              <p className="text-sm text-zinc-500 flex items-center gap-1">
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
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 text-zinc-300"
              >
                <Edit className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 text-red-400"
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
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 text-zinc-300"
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
          <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/15 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Delete Client</h3>
            </div>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to delete <strong>{client.firstName} {client.lastName}</strong>?
              This will not delete associated jobs, quotes, or invoices.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm border border-zinc-700 rounded-lg hover:bg-zinc-800 text-zinc-300"
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
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Jobs</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{jobs.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Quotes</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{quotes.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Revenue</p>
          <p className="text-2xl font-bold text-green-400 mt-1">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Outstanding</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">${outstandingBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Client Information</h2>
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
                <label className="block text-sm font-medium text-zinc-200 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex items-center gap-3 text-zinc-400">
              <Mail className="h-4 w-4 flex-shrink-0 text-zinc-500" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <Phone className="h-4 w-4 flex-shrink-0 text-zinc-500" />
              <span>{client.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <MapPin className="h-4 w-4 flex-shrink-0 text-zinc-500" />
              <span>{client.address || 'No address'}</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <Calendar className="h-4 w-4 flex-shrink-0 text-zinc-500" />
              <span>Client since {new Date(client.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Jobs */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-zinc-500" /> Jobs ({jobs.length})
          </h2>
        </div>
        {jobs.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4 text-center">No jobs yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-800">
                    <td className="py-3">
                      <Link href={`/admin/dashboard/jobs/${job.id}`} className="text-green-400 hover:underline font-medium">
                        {job.title}
                      </Link>
                    </td>
                    <td className="py-3"><StatusBadge status={job.status} type="job" /></td>
                    <td className="py-3 text-zinc-500">{new Date(job.startDate).toLocaleDateString()}</td>
                    <td className="py-3 text-right font-medium text-zinc-100">${job.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quotes */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-zinc-500" /> Quotes ({quotes.length})
          </h2>
        </div>
        {quotes.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4 text-center">No quotes yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-zinc-800">
                    <td className="py-3 font-medium text-zinc-100">{quote.title}</td>
                    <td className="py-3"><StatusBadge status={quote.status} type="quote" /></td>
                    <td className="py-3 text-zinc-500">{new Date(quote.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right font-medium text-zinc-100">${quote.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-zinc-500" /> Invoices ({invoices.length})
          </h2>
        </div>
        {invoices.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4 text-center">No invoices yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="pb-3 font-medium">Invoice #</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Due Date</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-800">
                    <td className="py-3 font-medium text-zinc-100">INV-{inv.id.slice(0, 6).toUpperCase()}</td>
                    <td className="py-3"><StatusBadge status={inv.status} type="invoice" /></td>
                    <td className="py-3 text-zinc-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="py-3 text-right font-medium text-zinc-100">${inv.total.toLocaleString()}</td>
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
