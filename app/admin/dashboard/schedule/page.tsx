import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { db } from '@/lib/db'
import ScheduleClient from './ScheduleClient'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const [jobs, clients] = await Promise.all([db.jobs.getAll(), db.clients.getAll()])

  const sorted = [...jobs]
    .filter(j => j.status !== 'Cancelled' && j.status !== 'Completed')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  const getClient = (id: string) => clients.find(c => c.id === id)

  // Group by date string, enrich with client info
  const jobsByDate: Record<string, any[]> = {}
  sorted.forEach(job => {
    const date = new Date(job.startDate).toDateString()
    if (!jobsByDate[date]) jobsByDate[date] = []
    const client = getClient(job.clientId)
    jobsByDate[date].push({
      id: job.id,
      title: job.title,
      startDate: job.startDate,
      status: job.status,
      total: job.total,
      assignedContractorId: job.assignedContractorId,
      assignedContractorName: job.assignedContractorName,
      clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
      clientAddress: client?.address ?? '',
    })
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">Assign contractors to upcoming jobs</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/admin/dashboard/jobs/new"
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Job
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> No schedule set</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Blocked (own job)</span>
      </div>

      <ScheduleClient jobsByDate={jobsByDate} />
    </div>
  )
}
