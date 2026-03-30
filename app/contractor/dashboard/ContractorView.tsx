'use client'

import { useState, useTransition } from 'react'
import { Job, ContractorAvailability, ContractorBlock } from '@/lib/types'
import { acceptJob, completeJob, cancelJob, uploadBeforePhotos, uploadAfterPhotos, submitClientSignoff, setAvailabilityDay, saveBlock, removeBlock } from './actions'
import { CheckCircle, Clock, MapPin, User, Upload, Camera, Briefcase, AlertTriangle, Shield, ChevronDown, ChevronUp, CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'

type JobWithClient = Job & {
  clientName: string
  clientAddress: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type ModalChoice = 'available' | 'partial' | 'busy'

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
  const [viewDate, setViewDate] = useState(() => new Date())
  const [showSchedule, setShowSchedule] = useState(false)

  // Modal state
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalChoice, setModalChoice] = useState<ModalChoice>('available')
  const [partialFrom, setPartialFrom] = useState('08:00')
  const [partialTo, setPartialTo] = useState('17:00')

  const pad = (n: number) => String(n).padStart(2, '0')
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const todayStr = new Date().toISOString().slice(0, 10)

  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calCells: (string | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, idx) =>
      `${year}-${pad(month + 1)}-${pad(idx + 1)}`
    ),
  ]

  const getBlock = (d: string) => localBlocks.find(b => b.blockDate === d)
  const isPast = (d: string) => d < todayStr
  const monthLabel = viewDate.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })

  // Open modal for a date
  const openDay = (dateStr: string) => {
    if (isPast(dateStr)) return
    const existing = getBlock(dateStr)
    if (existing) {
      setModalChoice(existing.blockType === 'partial' ? 'partial' : 'busy')
      setPartialFrom(existing.availableFrom || '08:00')
      setPartialTo(existing.availableTo || '17:00')
    } else {
      setModalChoice('available')
      setPartialFrom('08:00')
      setPartialTo('17:00')
    }
    setSelectedDate(dateStr)
  }

  const closeModal = () => setSelectedDate(null)

  const confirmDay = () => {
    if (!selectedDate) return
    if (modalChoice === 'available') {
      // Clear any block for this date
      setLocalBlocks(p => p.filter(b => b.blockDate !== selectedDate))
      const fd = new FormData()
      fd.set('blockDate', selectedDate)
      startTransition(() => removeBlock(fd))
    } else {
      const isPartial = modalChoice === 'partial'
      const newBlock: ContractorBlock = {
        id: 'temp-' + selectedDate,
        contractorId: '',
        blockDate: selectedDate,
        blockType: isPartial ? 'partial' : 'full',
        availableFrom: isPartial ? partialFrom : undefined,
        availableTo: isPartial ? partialTo : undefined,
        createdAt: new Date().toISOString(),
      }
      setLocalBlocks(p => [...p.filter(b => b.blockDate !== selectedDate), newBlock])
      const fd = new FormData()
      fd.set('blockDate', selectedDate)
      fd.set('blockType', isPartial ? 'partial' : 'full')
      if (isPartial) {
        fd.set('availableFrom', partialFrom)
        fd.set('availableTo', partialTo)
      }
      startTransition(() => saveBlock(fd))
    }
    closeModal()
  }

  // Weekly schedule helpers
  const getDay = (dow: number) => localAvail.find(a => a.dayOfWeek === dow)

  const toggleWeekDay = (dow: number) => {
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

  const markedCount = localBlocks.filter(b =>
    b.blockDate.startsWith(`${year}-${pad(month + 1)}`)
  ).length

  return (
    <div className="space-y-4 pb-6">

      {/* ── Calendar card ────────────────────────────────────────────────── */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <button
            onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-800 active:scale-90 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="text-center">
            <p className="font-bold text-zinc-100">{monthLabel}</p>
            {markedCount > 0
              ? <p className="text-xs text-red-400 font-medium">{markedCount} day{markedCount > 1 ? 's' : ''} marked</p>
              : <p className="text-xs text-green-400 font-medium">All clear</p>
            }
          </div>
          <button
            onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-800 active:scale-90 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 px-3 pt-3 pb-1">
          {DAY_HEADERS.map((h, idx) => (
            <div key={idx} className="text-center text-xs font-bold text-zinc-600 py-1">{h}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 px-3 pb-3">
          {calCells.map((dateStr, idx) => {
            if (!dateStr) return <div key={`e-${idx}`} />
            const block = getBlock(dateStr)
            const past = isPast(dateStr)
            const isToday = dateStr === todayStr
            return (
              <button
                key={dateStr}
                onClick={() => openDay(dateStr)}
                disabled={past}
                className={[
                  'aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all active:scale-90 select-none relative',
                  block?.blockType === 'full'
                    ? 'bg-red-500 text-white shadow-sm'
                    : block?.blockType === 'partial'
                    ? 'bg-amber-400 text-white shadow-sm'
                    : isToday
                    ? 'bg-orange-500/15 text-orange-400 ring-2 ring-orange-500'
                    : past
                    ? 'text-zinc-700 cursor-default'
                    : 'text-zinc-300 hover:bg-zinc-800',
                ].join(' ')}
              >
                {new Date(dateStr + 'T12:00:00').getDate()}
                {block?.blockType === 'partial' && (
                  <span className="text-[8px] leading-none opacity-90 mt-0.5">
                    {block.availableFrom?.slice(0, 5)}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 pb-4 pt-1 text-xs text-zinc-500 border-t border-zinc-800">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Busy all day</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Partial hours</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500/15 ring-1 ring-orange-500 inline-block" /> Today</span>
        </div>
      </div>

      {/* ── Weekly recurring schedule (collapsible) ───────────────────────── */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSchedule(s => !s)}
          className="w-full flex items-center gap-3 px-4 py-4 active:bg-zinc-800 transition-colors"
        >
          <CalendarDays className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div className="flex-1 text-left">
            <p className="font-bold text-zinc-100 text-sm">Weekly Hours Template</p>
            <p className="text-xs text-zinc-500">Default working hours per day of week</p>
          </div>
          {showSchedule ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </button>

        {showSchedule && (
          <div className="divide-y divide-zinc-800 border-t border-zinc-800">
            {DAYS.map((label, dow) => {
              const slot = getDay(dow)
              return (
                <div key={dow} className={`transition-colors ${slot ? 'bg-green-500/5' : 'bg-zinc-900'}`}>
                  <button
                    type="button"
                    onClick={() => toggleWeekDay(dow)}
                    disabled={isPending}
                    className="w-full flex items-center gap-4 px-4 py-4 active:bg-zinc-800 transition-colors"
                  >
                    <div className={`w-12 h-7 rounded-full transition-colors flex-shrink-0 relative ${slot ? 'bg-green-500' : 'bg-zinc-700'}`}>
                      <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${slot ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className={`text-base font-semibold flex-1 text-left ${slot ? 'text-green-400' : 'text-zinc-600'}`}>{label}</span>
                    {slot && <span className="text-xs text-green-400 font-medium">{slot.startTime} – {slot.endTime}</span>}
                  </button>
                  {slot && (
                    <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Start</label>
                        <input type="time" value={slot.startTime} onChange={e => updateTime(dow, 'startTime', e.target.value)}
                          className="w-full rounded-xl border border-zinc-700 px-3 py-3 text-base font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-zinc-800 text-zinc-100" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">End</label>
                        <input type="time" value={slot.endTime} onChange={e => updateTime(dow, 'endTime', e.target.value)}
                          className="w-full rounded-xl border border-zinc-700 px-3 py-3 text-base font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-zinc-800 text-zinc-100" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Day modal (bottom sheet) ────────────────────────────────────────── */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          {/* Sheet */}
          <div className="relative bg-zinc-900 rounded-t-3xl shadow-2xl px-4 pt-2 pb-8 space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-zinc-100 text-lg">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-zinc-500">Choose your availability for this day</p>
              </div>
              <button onClick={closeModal} className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 active:scale-90 transition-all">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {/* Option buttons */}
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'available', emoji: '✅', label: 'Available', sub: 'All day', color: 'green' },
                { id: 'partial',   emoji: '🕐', label: 'Partial',   sub: 'Set hours', color: 'amber' },
                { id: 'busy',      emoji: '🚫', label: 'Busy',      sub: 'All day', color: 'red' },
              ] as { id: ModalChoice; emoji: string; label: string; sub: string; color: string }[]).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setModalChoice(opt.id)}
                  className={[
                    'flex flex-col items-center gap-1 rounded-2xl py-4 px-2 border-2 transition-all active:scale-95',
                    modalChoice === opt.id
                      ? opt.color === 'green'  ? 'border-green-500 bg-green-500/10'
                      : opt.color === 'amber'  ? 'border-amber-400 bg-amber-500/10'
                      : 'border-red-500 bg-red-500/10'
                      : 'border-zinc-700 bg-zinc-800',
                  ].join(' ')}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-sm font-bold text-zinc-100">{opt.label}</span>
                  <span className="text-xs text-zinc-500">{opt.sub}</span>
                </button>
              ))}
            </div>

            {/* Time pickers — only shown for partial */}
            {modalChoice === 'partial' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Available from</label>
                  <input
                    type="time"
                    value={partialFrom}
                    onChange={e => setPartialFrom(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 px-4 py-3.5 text-base font-semibold focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-zinc-800 text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Available until</label>
                  <input
                    type="time"
                    value={partialTo}
                    onChange={e => setPartialTo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 px-4 py-3.5 text-base font-semibold focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-zinc-800 text-zinc-100"
                  />
                </div>
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={confirmDay}
              disabled={isPending}
              className={[
                'w-full py-4 rounded-2xl text-white font-bold text-base shadow-sm active:scale-[0.98] transition-all',
                modalChoice === 'available' ? 'bg-green-500'
                : modalChoice === 'partial' ? 'bg-amber-400'
                : 'bg-red-500',
              ].join(' ')}
            >
              {modalChoice === 'available' ? 'Mark as Available'
                : modalChoice === 'partial' ? `Set Hours ${partialFrom} – ${partialTo}`
                : 'Mark as Busy'}
            </button>
          </div>
        </div>
      )}
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
      <div className="border-b border-zinc-800 -mx-4 px-4 sm:mx-0 sm:px-0">
        <nav className="-mb-px flex overflow-x-auto scrollbar-none gap-1" aria-label="Tabs">
          {([
            { id: 'available',    icon: <Clock className="w-4 h-4 flex-shrink-0" />,       label: 'Job Board',   count: availableJobs.length },
            { id: 'active',       icon: <Briefcase className="w-4 h-4 flex-shrink-0" />,   label: 'Active',      count: activeJobs.length },
            { id: 'availability', icon: <CalendarDays className="w-4 h-4 flex-shrink-0" />, label: 'Availability', count: null },
            { id: 'completed',    icon: <CheckCircle className="w-4 h-4 flex-shrink-0" />,  label: 'History',     count: completedJobs.length },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 whitespace-nowrap border-b-2 py-3.5 px-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                  activeTab === tab.id ? 'bg-orange-500/15 text-orange-400' : 'bg-zinc-800 text-zinc-500'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
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
            <div className="col-span-full text-center py-12 text-zinc-500">No scheduled jobs available at the moment.</div>
        )}
        {activeTab === 'active' && activeJobs.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-500">You have no active jobs. Accept a scheduled job to get started.</div>
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
            <div className={`h-1.5 flex-1 rounded-full ${s.done ? 'bg-green-500' : isActive ? 'bg-orange-400' : 'bg-zinc-700'}`} />
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
          <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
            <Camera className="h-4 w-4 text-orange-500" />
            {label}
          </h4>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          photos.length >= minCount ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'
        }`}>
          {photos.length}/{minCount} required
        </span>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative h-16 w-16 rounded-md overflow-hidden border border-zinc-700">
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

      <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-700 transition-colors">
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
    <div className="space-y-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-1.5">
          <Shield className="h-4 w-4" />
          Client Walkthrough & Sign-off
        </h4>
        {expanded ? <ChevronUp className="h-4 w-4 text-blue-400" /> : <ChevronDown className="h-4 w-4 text-blue-400" />}
      </button>

      {expanded && (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-blue-300/80">
            Walk the client through the completed work. The client must type their name below to confirm they are satisfied with the job.
          </p>

          <div>
            <label className="block text-xs font-medium text-blue-300 mb-1">Client&apos;s Full Name *</label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Client types their name here"
              className="w-full rounded-xl border border-blue-500/40 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-blue-300 mb-1">Client Feedback (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any notes from the client..."
              className="w-full rounded-xl border border-blue-500/40 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !clientName.trim()}
            className="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const currentStep = type === 'active' ? getJobStep(job) : null;

    const handleCancel = async () => {
      if (!cancelReason.trim()) return;
      setCancelling(true);
      const fd = new FormData();
      fd.set('jobId', job.id);
      fd.set('reason', cancelReason.trim());
      await cancelJob(fd);
      setCancelling(false);
      setShowCancelModal(false);
    };

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
        <div className="overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="p-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold leading-6 text-zinc-100">{job.title}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${job.status === 'Scheduled' ? 'bg-blue-500/15 text-blue-400' : ''}
                        ${job.status === 'Active' ? 'bg-amber-500/15 text-amber-400' : ''}
                        ${job.status === 'Completed' ? 'bg-green-500/15 text-green-400' : ''}
                    `}>
                        {job.status}
                    </span>
                </div>

                {/* Step progress for active jobs */}
                {type === 'active' && <StepProgress job={job} />}

                <div className="mt-2 space-y-3">
                    <p className="text-sm text-zinc-500 line-clamp-2">{job.description || 'No description provided.'}</p>
                    <div className="flex items-center text-sm text-zinc-500">
                        <User className="mr-2 h-4 w-4 text-zinc-600" />
                        {job.clientName}
                    </div>
                    <div className="flex items-center text-sm text-zinc-500">
                        <MapPin className="mr-2 h-4 w-4 text-zinc-600" />
                        {job.clientAddress}
                    </div>
                    <div className="flex items-center text-sm text-zinc-500">
                        <Clock className="mr-2 h-4 w-4 text-zinc-600" />
                        {(() => {
                          // Parse without timezone conversion (stored as local time)
                          const [datePart, timePart] = job.startDate.split('T')
                          const [y, m, d] = datePart.split('-').map(Number)
                          const [h, min] = (timePart || '00:00').split(':').map(Number)
                          const dt = new Date(y, m - 1, d, h, min)
                          return dt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                        })()}
                    </div>
                </div>
            </div>
            <div className="bg-zinc-800/50 px-5 py-3">
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
                
                {type === 'active' && showCancelModal && (
                    <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 space-y-3">
                      <p className="text-sm font-semibold text-red-400">Cancel this job?</p>
                      <p className="text-xs text-zinc-400">The job will go back on the board for another contractor. This cannot be undone.</p>
                      <textarea
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                        placeholder="Reason for cancelling (required)..."
                        rows={3}
                        className="w-full rounded-xl border border-red-500/40 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                          className="flex-1 rounded-xl border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
                        >
                          Keep Job
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={cancelling || !cancelReason.trim()}
                          className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                        </button>
                      </div>
                    </div>
                )}

                {type === 'active' && (
                    <div className="space-y-4">
                      {/* Step 1: Before Photos */}
                      {currentStep === 'before-photos' && (
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-amber-400 bg-amber-500/10 rounded-xl p-2 border border-amber-500/30">
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
                          <div className="flex items-center gap-2 mb-3 text-green-400 bg-green-500/10 rounded-xl p-2 border border-green-500/30">
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
                          <div className="flex items-center gap-2 mb-3 text-green-400 bg-green-500/10 rounded-xl p-2 border border-green-500/30">
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
                            <p className="text-green-400 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Before photos ({job.beforePhotos?.length})</p>
                            <p className="text-green-400 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> After photos ({job.afterPhotos?.length})</p>
                            <p className="text-green-400 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Client sign-off by {job.clientSignoffName}</p>
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

                      {/* Cancel job — always available on active jobs */}
                      {!showCancelModal && (
                        <button
                          type="button"
                          onClick={() => setShowCancelModal(true)}
                          className="w-full rounded-xl border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Cancel Job
                        </button>
                      )}
                    </div>
                )}

                {type === 'completed' && (
                    <div className="text-sm text-zinc-500 space-y-2">
                        {(job.beforePhotos?.length || 0) > 0 && (
                          <p className="flex items-center gap-1 text-zinc-400">
                            <Camera className="h-3.5 w-3.5" /> {job.beforePhotos!.length} before photos
                          </p>
                        )}
                        {(job.afterPhotos?.length || 0) > 0 && (
                          <p className="flex items-center gap-1 text-zinc-400">
                            <Camera className="h-3.5 w-3.5" /> {job.afterPhotos!.length} after photos
                          </p>
                        )}
                        {job.clientSignoff && (
                          <p className="flex items-center gap-1 text-green-400">
                            <Shield className="h-3.5 w-3.5" /> Signed off by {job.clientSignoffName}
                          </p>
                        )}
                        {job.proofOfWork && (
                             <div className="flex items-center gap-1 text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                Proof Submitted
                             </div>
                        )}
                        {job.contractorNotes && (
                            <p className="italic text-zinc-500">&quot;{job.contractorNotes}&quot;</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
