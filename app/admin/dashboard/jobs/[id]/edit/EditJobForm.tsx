'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Briefcase, Calendar, DollarSign, User } from 'lucide-react'
import type { Job, Client, User as UserType } from '@/lib/types'

interface EditJobFormProps {
  job: Job
  clients: Client[]
  contractors: UserType[]
}

export default function EditJobForm({ job, clients, contractors }: EditJobFormProps) {
  const router = useRouter()
  const [clientId, setClientId] = useState(job.clientId)
  const [title, setTitle] = useState(job.title)
  const [description, setDescription] = useState(job.description || '')
  const [startDate, setStartDate] = useState(job.startDate.slice(0, 16))
  const [endDate, setEndDate] = useState(job.endDate ? job.endDate.slice(0, 16) : '')
  const [status, setStatus] = useState(job.status)
  const [contractorId, setContractorId] = useState(job.contractorId || '')
  const [total, setTotal] = useState(job.total.toString())
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientId || !title || !startDate || !total) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          title,
          description: description || undefined,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          status,
          contractorId: contractorId || undefined,
          total: parseFloat(total),
        }),
      })

      if (response.ok) {
        router.push(`/admin/dashboard/jobs/${job.id}`)
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update job')
      }
    } catch (error) {
      console.error('Error updating job:', error)
      alert('Failed to update job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/admin/dashboard/jobs/${job.id}`)}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Job
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Edit Job
          </h1>
          <p className="text-zinc-400">
            Update job details and schedule
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Details Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Job Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Client *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
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
                  Job Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100 placeholder:text-zinc-600"
                  placeholder="e.g., Residential Pressure Washing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100 placeholder:text-zinc-600 resize-none"
                  placeholder="Additional job details..."
                />
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Schedule</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                />
                <p className="text-sm text-zinc-500 mt-1">
                  Optional - Set if job duration is known
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Job['status'])}
                  required
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assignment & Cost Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Assignment & Cost</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Assign Contractor
                </label>
                <select
                  value={contractorId}
                  onChange={(e) => setContractorId(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                >
                  <option value="">No contractor assigned</option>
                  {contractors.map(contractor => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-zinc-500 mt-1">
                  Optional - Assign a team member to this job
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Estimated Total *
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
                <p className="text-sm text-zinc-500 mt-1">
                  Estimated cost for this job
                </p>
              </div>
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
              {loading ? 'Updating...' : 'Update Job'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/admin/dashboard/jobs/${job.id}`)}
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
