'use client'

import { useState, useTransition } from 'react'
import { Job, ContractorAvailability, ContractorBlock } from '@/lib/types'
import { acceptJob, completeJob, uploadBeforePhotos, uploadAfterPhotos, submitClientSignoff, setAvailabilityDay, addBlock, removeBlock } from './actions'
import { CheckCircle, Clock, MapPin, User, Upload, Camera, FileText, Briefcase, AlertTriangle, Shield, ChevronDown, ChevronUp, CalendarDays, Ban, Plus, Trash2 } from 'lucide-react'

type JobWithClient = Job & {
  clientName: string
  clientAddress: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function AvailabilityTab({
  availability,
  blocks,
}: {
  availability: ContractorAvailability[]
  blocks: ContractorBlock[]
}) {
  const [isPending, startTransition] = useTransition()
  const [localAvail, setLocalAvail] = useState<ContractorAvailability[]>(availability)
  const [localBlocks, setLocalBlocks] = useState<ContractorBlock[]>(blocks)

  const getDay = (dow: number) => localAvail.find(a => a.dayOfWeek === dow)

  const toggleDay = (dow: number) => {
    const existing = getDay(dow)
    const fd = new FormData()
    fd.set('dayOfWeek', String(dow))
    if (existing) {
      fd.set('enabled', 'false')
      setLocalAvail(p => p.filter(a => a.dayOfWeek !== dow))
    } else {
      fd.set('enabled', 'true')
      fd.set('startTime', '08:00')
      fd.set('endTime', '17:00')
      setLocalAvail(p => [...p, { id: 'temp', contractorId: '', dayOfWeek: dow, startTime: '08:00', endTime: '17:00' }])
    }
    startTransition(() => setAvailabilityDay(fd))
  }

  const updateTime = (dow: number, field: 'startTime' | 'endTime', value: string) => {
    setLocalAvail(p => p.map(a => a.dayOfWeek === dow ? { ...a, [field]: value } : a))
    const day = localAvail.find(a => a.dayOfWeek === dow)
    if (!day) return
    const fd = new FormData()
    fd.set('dayOfWeek', String(dow))
    fd.set('enabled', 'true')
    fd.set('startTime', field === 'startTime' ? value : day.startTime)
    fd.set('endTime', field === 'endTime' ? value : day.endTime)
    startTransition(() => setAvailabilityDay(fd))
  }

  const handleAddBlock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const date = fd.get('blockDate') as string
    const reason = fd.get('reason') as string
    if (!date) return
    setLocalBlocks(p => [...p, { id: 'temp-' + date, contractorId: '', blockDate: date, reason: reason || undefined, createdAt: new Date().toISOString() }])
    ;(e.currentTarget as HTMLFormElement).reset()
    startTransition(() => addBlock(fd))
  }

  const handleRemoveBlock = (blockId: string) => {
    setLocalBlocks(p => p.filter(b => b.id !== blockId))
    const fd = new FormData()
    fd.set('blockId', blockId)
    startTransition(() => removeBlock(fd))
  }

  return (
    <div className="space-y-6">
      {/* Weekly schedule */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-orange-500" /> Weekly Availability
        </h3>
        <p className="text-xs text-gray-500">Set the days and hours you're available for ExcelPro jobs each week.</p>
        <div className="space-y-2">
          {DAYS.map((label, dow) => {
            const slot = getDay(dow)
            return (
              <div key={dow} className={`rounded-xl border-2 p-3 transition-all ${slot ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleDay(dow)}
                    disabled={isPending}
                    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${slot ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${slot ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                  <span className={`text-sm font-bold w-8 ${slot ? 'text-green-800' : 'text-gray-400'}`}>{label}</span>
                  {slot && (
                    <div className="flex items-center gap-2 ml-1">
                      <input type="time" value={slot.startTime} onChange={e => updateTime(dow, 'startTime', e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-green-500 bg-white" />
                      <span className="text-xs text-gray-400">to</span>
                      <input type="time" value={slot.endTime} onChange={e => updateTime(dow, 'endTime', e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-green-500 bg-white" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Block dates */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Ban className="w-4 h-4 text-red-500" /> Block a Date
        </h3>
        <p className="text-xs text-gray-500">Mark a specific date as unavailable — e.g. you have your own job or personal time.</p>
        <form onSubmit={handleAddBlock} className="flex flex-col sm:flex-row gap-2">
          <input type="date" name="blockDate" required min={new Date().toISOString().slice(0, 10)}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gray-50" />
          <input type="text" name="reason" placeholder="Reason (optional)"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gray-50" />
          <button type="submit" disabled={isPending}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500 text-white px-4 py-2.5 text-sm font-bold hover:bg-red-600 transition-colors">
            <Plus className="w-4 h-4" /> Block
          </button>
        </form>

        {localBlocks.length > 0 && (
          <div className="space-y-2 mt-1">
            {localBlocks
              .slice()
              .sort((a, b) => a.blockDate.localeCompare(b.blockDate))
              .map(block => (
                <div key={block.id} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <div>
                    <span className="text-sm font-semibold text-red-800">
                      {new Date(block.blockDate + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {block.reason && <span className="text-xs text-red-500 ml-2">— {block.reason}</span>}
                  </div>
                  {!block.id.startsWith('temp') && (
                    <button onClick={() => handleRemoveBlock(block.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}
        {localBlocks.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">No blocked dates.</p>
        )}
      </div>
    </div>
  )
}

export default function ContractorView({
  jobs,
  availability,
  blocks,
}: {
  jobs: JobWithClient[]
  availability: ContractorAvailability[]
  blocks: ContractorBlock[]
}) {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed' | 'availability'>('available')

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
          <button
            onClick={() => setActiveTab('availability')}
            className={`${
              activeTab === 'availability'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
          >
            <CalendarDays className="w-4 h-4" />
            My Availability
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

      {activeTab === 'availability' && (
        <AvailabilityTab availability={availability} blocks={blocks} />
      )}
    </div>
  )
}

// ── Helper: determine which step the active job is on ────────────
function getJobStep(job: JobWithClient): 'before-photos' | 'work-in-progress' | 'after-photos' | 'client-signoff' | 'ready-to-complete' {
  const hasBeforePhotos = (job.beforePhotos?.length || 0) >= 3;
  const hasAfterPhotos = (job.afterPhotos?.length || 0) >= 3;
  const hasClientSignoff = !!job.clientSignoff;

  if (!hasBeforePhotos) return 'before-photos';
  if (!hasAfterPhotos) return 'work-in-progress'; // They can work, then upload after photos
  if (!hasClientSignoff) return 'client-signoff';
  return 'ready-to-complete';
}

// ── Step Progress Bar ────────────────────────────────────────────
function StepProgress({ job }: { job: JobWithClient }) {
  const current = getJobStep(job);
  const steps = [
    { id: 'before-photos', label: 'Before Photos', done: (job.beforePhotos?.length || 0) >= 3 },
    { id: 'work-in-progress', label: 'Do the Work', done: (job.afterPhotos?.length || 0) >= 3 },
    { id: 'after-photos', label: 'After Photos', done: (job.afterPhotos?.length || 0) >= 3 },
    { id: 'client-signoff', label: 'Client Sign-off', done: !!job.clientSignoff },
  ];

  return (
    <div className="flex items-center gap-1 mb-3">
      {steps.map((s, i) => {
        const isActive = s.id === current || (s.id === 'after-photos' && current === 'work-in-progress');
        return (
          <div key={s.id} className="flex items-center gap-1 flex-1">
            <div className={`h-1.5 flex-1 rounded-full ${s.done ? 'bg-green-500' : isActive ? 'bg-orange-400' : 'bg-gray-200'}`} />
          </div>
        );
      })}
    </div>
  );
}

// ── Photo Upload Component ───────────────────────────────────────
function PhotoUploader({
  label,
  description,
  minCount,
  existingPhotos,
  onUpload,
}: {
  label: string;
  description: string;
  minCount: number;
  existingPhotos: string[];
  onUpload: (photos: string[]) => void;
}) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newPhotos = [...photos];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          newPhotos.push(reader.result as string);
          resolve();
        };
        reader.readAsDataURL(files[i]);
      });
    }
    setPhotos(newPhotos);
    setUploading(false);
  };

  const remaining = Math.max(0, minCount - photos.length);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <Camera className="h-4 w-4 text-orange-500" />
            {label}
          </h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          photos.length >= minCount ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {photos.length}/{minCount} required
        </span>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative h-16 w-16 rounded-md overflow-hidden border border-gray-200">
              <img src={p} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-bl"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
        <Upload className="h-4 w-4" />
        {uploading ? 'Processing...' : `Add Photos${remaining > 0 ? ` (${remaining} more needed)` : ''}`}
        <input type="file" className="hidden" accept="image/*" multiple onChange={handleFiles} />
      </label>

      {photos.length >= minCount && (
        <button
          type="button"
          onClick={() => onUpload(photos)}
          className="w-full rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          Submit {label}
        </button>
      )}
    </div>
  );
}

// ── Client Signoff Component ─────────────────────────────────────
function ClientSignoffForm({ jobId }: { jobId: string }) {
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!clientName.trim()) { alert('Client must type their name to sign off'); return; }
    setSubmitting(true);
    const formData = new FormData();
    formData.set('jobId', jobId);
    formData.set('clientName', clientName);
    formData.set('notes', notes);
    await submitClientSignoff(formData);
    setSubmitting(false);
  };

  return (
    <div className="space-y-3 rounded-md border border-blue-200 bg-blue-50 p-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
          <Shield className="h-4 w-4" />
          Client Walkthrough & Sign-off
        </h4>
        {expanded ? <ChevronUp className="h-4 w-4 text-blue-500" /> : <ChevronDown className="h-4 w-4 text-blue-500" />}
      </button>

      {expanded && (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-blue-700">
            Walk the client through the completed work. The client must type their name below to confirm they are satisfied with the job.
          </p>

          <div>
            <label className="block text-xs font-medium text-blue-800 mb-1">Client&apos;s Full Name *</label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Client types their name here"
              className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-blue-800 mb-1">Client Feedback (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any notes from the client..."
              className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !clientName.trim()}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Client Confirms & Signs Off'}
          </button>
        </div>
      )}
    </div>
  );
}


function JobCard({ job, type }: { job: JobWithClient, type: 'available' | 'active' | 'completed' }) {
    const [completing, setCompleting] = useState(false);

    const currentStep = type === 'active' ? getJobStep(job) : null;

    const handleBeforePhotos = async (photos: string[]) => {
      const formData = new FormData();
      formData.set('jobId', job.id);
      formData.set('photos', JSON.stringify(photos));
      await uploadBeforePhotos(formData);
    };

    const handleAfterPhotos = async (photos: string[]) => {
      const formData = new FormData();
      formData.set('jobId', job.id);
      formData.set('photos', JSON.stringify(photos));
      await uploadAfterPhotos(formData);
    };

    const handleComplete = async () => {
      setCompleting(true);
      const formData = new FormData();
      formData.set('jobId', job.id);
      formData.set('proofOfWork', job.afterPhotos?.[0] || '');
      formData.set('notes', '');
      await completeJob(formData);
      setCompleting(false);
    };

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

                {/* Step progress for active jobs */}
                {type === 'active' && <StepProgress job={job} />}

                <div className="mt-2 space-y-3">
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
                    <div className="space-y-4">
                      {/* Step 1: Before Photos */}
                      {currentStep === 'before-photos' && (
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-amber-700 bg-amber-50 rounded-md p-2 border border-amber-200">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            <p className="text-xs font-medium">You must upload at least 3 before photos before starting work.</p>
                          </div>
                          <PhotoUploader
                            label="Before Photos"
                            description="Document the site condition before starting work"
                            minCount={3}
                            existingPhotos={job.beforePhotos || []}
                            onUpload={handleBeforePhotos}
                          />
                        </div>
                      )}

                      {/* Step 2: Work in progress — upload after photos when done */}
                      {currentStep === 'work-in-progress' && (
                        <div>
                          <div className="flex items-center gap-2 mb-3 text-green-700 bg-green-50 rounded-md p-2 border border-green-200">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <p className="text-xs font-medium">Before photos submitted ✓ — Complete the work, then upload after photos.</p>
                          </div>
                          <PhotoUploader
                            label="After Photos"
                            description="Document the finished work — at least 3 photos required"
                            minCount={3}
                            existingPhotos={job.afterPhotos || []}
                            onUpload={handleAfterPhotos}
                          />
                        </div>
                      )}

                      {/* Step 3: Client walkthrough sign-off */}
                      {currentStep === 'client-signoff' && (
                        <div>
                          <div className="flex items-center gap-2 mb-3 text-green-700 bg-green-50 rounded-md p-2 border border-green-200">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <p className="text-xs font-medium">Photos complete ✓ — Now walk the client through the work.</p>
                          </div>
                          <ClientSignoffForm jobId={job.id} />
                        </div>
                      )}

                      {/* Step 4: Ready to mark complete */}
                      {currentStep === 'ready-to-complete' && (
                        <div>
                          <div className="space-y-1 mb-3 text-sm">
                            <p className="text-green-700 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Before photos ({job.beforePhotos?.length})</p>
                            <p className="text-green-700 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> After photos ({job.afterPhotos?.length})</p>
                            <p className="text-green-700 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Client sign-off by {job.clientSignoffName}</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleComplete}
                            disabled={completing}
                            className="flex w-full justify-center items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            {completing ? 'Completing...' : '✅ Mark Job Complete'}
                          </button>
                        </div>
                      )}
                    </div>
                )}

                {type === 'completed' && (
                    <div className="text-sm text-gray-500 space-y-2">
                        {(job.beforePhotos?.length || 0) > 0 && (
                          <p className="flex items-center gap-1 text-gray-600">
                            <Camera className="h-3.5 w-3.5" /> {job.beforePhotos!.length} before photos
                          </p>
                        )}
                        {(job.afterPhotos?.length || 0) > 0 && (
                          <p className="flex items-center gap-1 text-gray-600">
                            <Camera className="h-3.5 w-3.5" /> {job.afterPhotos!.length} after photos
                          </p>
                        )}
                        {job.clientSignoff && (
                          <p className="flex items-center gap-1 text-green-600">
                            <Shield className="h-3.5 w-3.5" /> Signed off by {job.clientSignoffName}
                          </p>
                        )}
                        {job.proofOfWork && (
                             <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                Proof Submitted
                             </div>
                        )}
                        {job.contractorNotes && (
                            <p className="italic">&quot;{job.contractorNotes}&quot;</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
