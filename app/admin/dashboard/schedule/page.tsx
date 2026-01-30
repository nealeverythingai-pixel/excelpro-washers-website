import Link from 'next/link'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { db } from '@/lib/db'

export default async function SchedulePage() {
  const jobs = await db.jobs.getAll()
  const clients = await db.clients.getAll()

  // Sort jobs by start date
  const sortedJobs = [...jobs].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  const getClient = (id: string) => clients.find(c => c.id === id)

  // Group by date
  const jobsByDate: Record<string, typeof jobs> = {}
  sortedJobs.forEach(job => {
      const date = new Date(job.startDate).toDateString()
      if(!jobsByDate[date]) jobsByDate[date] = []
      jobsByDate[date].push(job)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">Upcoming appointments</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/admin/dashboard/jobs/new" className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Job
          </Link>
        </div>
      </div>

        {Object.keys(jobsByDate).length === 0 ? (
            <div className="text-center py-12 text-gray-500">No jobs scheduled.</div>
        ) : (
             <div className="space-y-8">
                {Object.keys(jobsByDate).map(date => (
                    <div key={date}>
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4 sticky top-0 bg-gray-50 pt-2">{date}</h3>
                        <div className="space-y-3">
                            {jobsByDate[date].map(job => {
                                const client = getClient(job.clientId)
                                return (
                                <div key={job.id} className="relative flex items-center space-x-3 rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-green-500 hover:border-gray-300">
                                    <div className="flex min-w-0 flex-1 justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center bg-gray-100 rounded p-2 min-w-[60px]">
                                                <span className="text-xs font-semibold text-gray-500">{new Date(job.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{job.title}</p>
                                                <p className="truncate text-sm text-gray-500">{client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}</p>
                                            </div>
                                        </div>
                                        {client?.address && (
                                            <div className="hidden md:flex items-center text-sm text-gray-500">
                                                <MapPin className="mr-1.5 h-4 w-4 text-gray-400" />
                                                {client.address}
                                            </div>
                                        )}
                                        <div>
                                             <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                 job.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 
                                                 job.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                             }`}>
                                                {job.status}
                                            </span>
                                        </div>
                                    </div>
                                    <Link href={`/admin/dashboard/jobs/${job.id}`} className="focus:outline-none">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                    </Link>
                                </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
             </div>
        )}
    </div>
  )
}
