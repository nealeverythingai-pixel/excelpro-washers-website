'use client'

import { useState } from 'react'
import { Job } from '@/lib/types'
import { acceptJob, completeJob } from './actions'
import { CheckCircle, Clock, MapPin, User, Upload, FileText, Briefcase } from 'lucide-react'

type JobWithClient = Job & {
  clientName: string
  clientAddress: string
}

export default function ContractorView({ jobs }: { jobs: JobWithClient[] }) {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available')

  // Available jobs: No assignedContractorId yet (unassigned)
  const availableJobs = jobs.filter(j => !j.assignedContractorId && j.availableToContractors)
  
  // Active jobs: Assigned to this contractor and not completed
  const activeJobs = jobs.filter(j => j.assignedContractorId && j.status !== 'Completed')
  
  // Completed jobs: Assigned to this contractor and completed
  const completedJobs = jobs.filter(j => j.assignedContractorId && j.status === 'Completed')

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('available')}
            className={`${
              activeTab === 'available'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
          >
            <Clock className="w-4 h-4" />
            Available Jobs ({availableJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`${
              activeTab === 'active'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
          >
            <Briefcase className="w-4 h-4" />
            My Active Jobs ({activeJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`${
              activeTab === 'completed'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
          >
            <CheckCircle className="w-4 h-4" />
            History ({completedJobs.length})
          </button>
        </nav>
      </div>

      {activeTab === 'active' && activeJobs.length > 0 && (
        <div className="flex justify-end">
          <a
            href={`https://www.google.com/maps/dir/${activeJobs.map(j => encodeURIComponent(j.clientAddress)).join('/')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <MapPin className="h-4 w-4" />
            Optimize Route (Google Maps)
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeTab === 'available' && availableJobs.map(job => (
            <JobCard key={job.id} job={job} type="available" />
        ))}
        {activeTab === 'active' && activeJobs.map(job => (
            <JobCard key={job.id} job={job} type="active" />
        ))}
        {activeTab === 'completed' && completedJobs.map(job => (
            <JobCard key={job.id} job={job} type="completed" />
        ))}
        
        {activeTab === 'available' && availableJobs.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">No scheduled jobs available at the moment.</div>
        )}
        {activeTab === 'active' && activeJobs.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">You have no active jobs. Accept a scheduled job to get started.</div>
        )}
      </div>
    </div>
  )
}

function JobCard({ job, type }: { job: JobWithClient, type: 'available' | 'active' | 'completed' }) {
    const [uploading, setUploading] = useState(false)
    const [filePreview, setFilePreview] = useState<string | null>(job.proofOfWork || null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFilePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow border border-gray-200">
            <div className="p-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">{job.title}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                        ${job.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                        ${job.status === 'Active' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${job.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                        {job.status}
                    </span>
                </div>
                <div className="mt-4 space-y-3">
                    <p className="text-sm text-gray-500 line-clamp-2">{job.description || 'No description provided.'}</p>
                    <div className="flex items-center text-sm text-gray-500">
                        <User className="mr-2 h-4 w-4 text-gray-400" />
                        {job.clientName}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                        {job.clientAddress}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                        {new Date(job.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
                {type === 'available' && (
                    <form action={acceptJob}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <button
                            type="submit"
                            className="flex w-full justify-center items-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                            Accept Job
                        </button>
                    </form>
                )}
                
                {type === 'active' && (
                    <form action={completeJob} className="space-y-3">
                        <input type="hidden" name="jobId" value={job.id} />
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Proof of Work (Photo)</label>
                            <label className="flex w-full cursor-pointer appearance-none items-center justify-center rounded-md border border-dashed border-gray-300 bg-white px-3 py-2 text-sm leading-4 text-gray-600 hover:bg-gray-50 focus:outline-none">
                                <Upload className="mr-2 h-4 w-4" />
                                {filePreview ? 'Photo Selected' : 'Upload Photo'}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} required />
                            </label>
                            <input type="hidden" name="proofOfWork" value={filePreview || ''} />
                            {filePreview && (
                                <div className="mt-2">
                                    <img src={filePreview} alt="Proof" className="h-24 w-auto rounded object-cover border" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                name="notes"
                                rows={2}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                placeholder="Any details about the job..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!filePreview}
                            className="flex w-full justify-center items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Complete Job
                        </button>
                    </form>
                )}

                {type === 'completed' && (
                    <div className="text-sm text-gray-500 space-y-2">
                        {job.proofOfWork && (
                             <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                Proof Submitted
                             </div>
                        )}
                        {job.contractorNotes && (
                            <p className="italic">"{job.contractorNotes}"</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
