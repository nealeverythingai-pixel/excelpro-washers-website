'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Calendar, Clock, MapPin, UserCheck, UserX, ChevronDown, ChevronUp, HardHat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { assignContractor, unassignContractor, getContractorsWithAvailability } from './actions'

type Job = {
  id: string
  title: string
  startDate: string
  status: string
  total: number
  assignedContractorId?: string
  assignedContractorName?: string
  clientName: string
  clientAddress: string
}

type ContractorOption = {
  id: string
  name: string
  phone?: string
  skills: string[]
  isAvailable: boolean
  hours: string | null
  isBlocked: boolean
  noScheduleSet: boolean
}

function JobCard({ job, onAssign }: { job: Job; onAssign: (jobId: string, date: string) => void }) {
  const [isPending, startTransition] = useTransition()

  const handleUnassign = () => {
    startTransition(async () => {
      await unassignContractor(job.id)
    })
  }

  return (
    <div className="relative bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-zinc-100 text-sm truncate">{job.title}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{job.clientName}</p>
          {job.clientAddress && (
            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{job.clientAddress}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
            job.status === 'Scheduled' ? 'bg-blue-500/15 text-blue-400' :
            job.status === 'Active'    ? 'bg-green-500/15 text-green-400' :
            job.status === 'Completed' ? 'bg-zinc-800 text-zinc-400' :
            'bg-red-500/15 text-red-400'
          )}>{job.status}</span>
          <p className="text-xs text-zinc-500 mt-1">${job.total.toLocaleString()}</p>
        </div>
      </div>

      {/* Contractor assignment */}
      {job.assignedContractorId ? (
        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-green-400">{job.assignedContractorName}</span>
          </div>
          <button
            onClick={handleUnassign}
            disabled={isPending}
            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          onClick={() => onAssign(job.id, job.startDate.slice(0, 10))}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed border-zinc-700 text-sm text-zinc-500 hover:border-green-500/50 hover:text-green-400 transition-colors"
        >
          <HardHat className="w-4 h-4" /> Assign Contractor
        </button>
      )}
    </div>
  )
}

function AssignModal({
  jobId,
  date,
  onClose,
}: {
  jobId: string
  date: string
  onClose: () => void
}) {
  const [contractors, setContractors] = useState<ContractorOption[] | null>(null)
  const [isPending, startTransition] = useTransition()
  const [assigning, setAssigning] = useState<string | null>(null)

  // Load contractors when modal opens
  useState(() => {
    getContractorsWithAvailability(date).then(setContractors)
  })

  // Trigger load on mount
  if (contractors === null) {
    getContractorsWithAvailability(date).then(setContractors)
  }

  const handleAssign = (contractorId: string, contractorName: string) => {
    setAssigning(contractorId)
    startTransition(async () => {
      await assignContractor(jobId, contractorId, contractorName)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4 border border-zinc-800" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-zinc-100">Assign Contractor</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">&times;</button>
        </div>
        <p className="text-xs text-zinc-500">
          Availability for <strong>{new Date(date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'short', day: 'numeric' })}</strong>
        </p>

        {contractors === null ? (
          <p className="text-sm text-zinc-500 text-center py-4">Loading contractors…</p>
        ) : contractors.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">No active contractors found.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {contractors.map(c => {
              const statusColor = c.isBlocked
                ? 'border-red-500/30 bg-red-500/10'
                : c.isAvailable
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-zinc-700 bg-zinc-800'
              const badge = c.isBlocked
                ? <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full">Blocked</span>
                : c.isAvailable
                ? <span className="text-[10px] font-bold bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full">{c.hours}</span>
                : <span className="text-[10px] font-bold bg-zinc-700 text-zinc-500 px-1.5 py-0.5 rounded-full">No schedule</span>

              return (
                <div key={c.id} className={cn('rounded-xl border-2 p-3 flex items-center justify-between gap-3', statusColor)}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-100">{c.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {badge}
                      {c.skills.slice(0, 2).map(s => (
                        <span key={s} className="text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssign(c.id, c.name)}
                    disabled={isPending || assigning === c.id}
                    className={cn(
                      'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                      c.isAvailable
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    )}
                  >
                    {assigning === c.id ? '…' : 'Assign'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ScheduleClient({
  jobsByDate,
}: {
  jobsByDate: Record<string, Job[]>
}) {
  const [assignModal, setAssignModal] = useState<{ jobId: string; date: string } | null>(null)

  const dates = Object.keys(jobsByDate)

  return (
    <>
      {assignModal && (
        <AssignModal
          jobId={assignModal.jobId}
          date={assignModal.date}
          onClose={() => setAssignModal(null)}
        />
      )}

      {dates.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">No jobs scheduled.</div>
      ) : (
        <div className="space-y-8">
          {dates.map(date => (
            <div key={date}>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-2 mb-3 sticky top-0 bg-zinc-900 pt-2">
                {date}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {jobsByDate[date].map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onAssign={(jobId, d) => setAssignModal({ jobId, date: d })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
