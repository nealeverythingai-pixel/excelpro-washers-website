'use client'

import { useState, useTransition } from 'react'
import { MapPin, Plus, ChevronRight, X, Clock, Star, Home, ArrowLeft, Trash2, Navigation } from 'lucide-react'
import { createSession, logDoor, getSessionKnocks, updateKnockStatus, deleteKnock } from './actions'
import Link from 'next/link'

type Session = { id: string; area: string; date: string; rep_name: string }
type Knock = { id: string; session_id: string; address: string; status: string; notes: string | null; knocked_at: string; session?: { area: string; date: string } }

const STATUS_CONFIG = {
  not_home:    { label: 'Not Home',    emoji: '🚪', color: 'bg-zinc-700',    text: 'text-zinc-300',  border: 'border-zinc-600' },
  no_interest: { label: 'No Interest', emoji: '👋', color: 'bg-red-500/20',  text: 'text-red-300',   border: 'border-red-500/30' },
  maybe:       { label: 'Maybe',       emoji: '🤔', color: 'bg-amber-500/20',text: 'text-amber-300', border: 'border-amber-500/30' },
  come_back:   { label: 'Come Back',   emoji: '🔄', color: 'bg-blue-500/20', text: 'text-blue-300',  border: 'border-blue-500/30' },
  sold:        { label: 'Sold! 🎉',    emoji: '💰', color: 'bg-green-500/20',text: 'text-green-300', border: 'border-green-500/30' },
}

export default function CanvassingClient({
  repId, repName, initialSessions, initialFollowUps,
}: {
  repId: string; repName: string
  initialSessions: Session[]
  initialFollowUps: Knock[]
}) {
  const [tab, setTab] = useState<'today' | 'followups' | 'history'>('today')
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [followUps] = useState<Knock[]>(initialFollowUps)
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [sessionKnocks, setSessionKnocks] = useState<Knock[]>([])
  const [showNewSession, setShowNewSession] = useState(false)
  const [showLogDoor, setShowLogDoor] = useState(false)
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  const todayStr = new Date().toISOString().split('T')[0]
  const todaySessions = sessions.filter(s => s.date === todayStr)

  // Stats for today
  const todayMaybes = sessionKnocks.filter(k => k.status === 'maybe').length
  const todayComeBack = sessionKnocks.filter(k => k.status === 'come_back').length
  const todaySold = sessionKnocks.filter(k => k.status === 'sold').length
  const todayNotHome = sessionKnocks.filter(k => k.status === 'not_home').length

  const openSession = async (session: Session) => {
    setActiveSession(session)
    const knocks = await getSessionKnocks(session.id)
    setSessionKnocks(knocks as Knock[])
  }

  const handleNewSession = () => {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('repId', repId)
      fd.set('repName', repName)
      fd.set('area', area)
      const newSession = await createSession(fd)
      setSessions(prev => [newSession as Session, ...prev])
      setShowNewSession(false)
      setArea('')
      setActiveSession(newSession as Session)
      setSessionKnocks([])
    })
  }

  const handleLogDoor = (status: string) => {
    if (!activeSession || !address.trim()) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('sessionId', activeSession.id)
      fd.set('address', address.trim())
      fd.set('status', status)
      fd.set('notes', notes)
      await logDoor(fd)
      const knocks = await getSessionKnocks(activeSession.id)
      setSessionKnocks(knocks as Knock[])
      setAddress('')
      setNotes('')
      setShowLogDoor(false)
    })
  }

  const handleUpdateStatus = (knockId: string, status: string) => {
    startTransition(async () => {
      await updateKnockStatus(knockId, status)
      if (activeSession) {
        const knocks = await getSessionKnocks(activeSession.id)
        setSessionKnocks(knocks as Knock[])
      }
    })
  }

  const handleDelete = (knockId: string) => {
    startTransition(async () => {
      await deleteKnock(knockId)
      if (activeSession) {
        const knocks = await getSessionKnocks(activeSession.id)
        setSessionKnocks(knocks as Knock[])
      }
    })
  }

  // ── Active session view ──
  if (activeSession) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => { setActiveSession(null); setSessionKnocks([]) }}
            className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-zinc-100 truncate">{activeSession.area}</p>
            <p className="text-xs text-zinc-500">{activeSession.date}</p>
          </div>
          <button onClick={() => setShowLogDoor(true)}
            className="flex items-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-500 px-4 py-2 text-sm font-bold text-white">
            <Plus className="w-4 h-4" /> Log Door
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Knocked', value: sessionKnocks.length, color: 'text-zinc-100' },
            { label: 'Not Home', value: todayNotHome, color: 'text-zinc-400' },
            { label: 'Maybe', value: todayMaybes, color: 'text-amber-400' },
            { label: 'Come Back', value: todayComeBack, color: 'text-blue-400' },
            { label: 'Sold', value: todaySold, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-zinc-900 border border-zinc-800 p-2 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-zinc-500 font-medium leading-tight mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Log Door modal */}
        {showLogDoor && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-700 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-zinc-100">Log a Door</p>
              <button onClick={() => setShowLogDoor(false)}>
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Address (e.g. 42 Oak St)"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => handleLogDoor(key)}
                  disabled={!address.trim() || isPending}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all disabled:opacity-40 ${cfg.color} ${cfg.text} ${cfg.border} hover:opacity-90 active:scale-95`}
                >
                  <span className="text-base">{cfg.emoji}</span> {cfg.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Knock list */}
        {sessionKnocks.length === 0 ? (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center">
            <Home className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No doors logged yet</p>
            <p className="text-zinc-600 text-xs mt-1">Tap "Log Door" to start tracking</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...sessionKnocks].reverse().map(knock => {
              const cfg = STATUS_CONFIG[knock.status as keyof typeof STATUS_CONFIG]
              return (
                <div key={knock.id} className={`rounded-xl border p-3 ${cfg.color} ${cfg.border}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cfg.emoji}</span>
                        <p className="font-semibold text-zinc-100 text-sm truncate">{knock.address}</p>
                      </div>
                      {knock.notes && <p className="text-xs text-zinc-400 mt-0.5 pl-6">{knock.notes}</p>}
                      <p className="text-[10px] text-zinc-600 mt-1 pl-6">
                        {new Date(knock.knocked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Quick re-status for maybes/come-backs */}
                      {(knock.status === 'maybe' || knock.status === 'come_back' || knock.status === 'not_home') && (
                        <button
                          onClick={() => handleUpdateStatus(knock.id, 'sold')}
                          className="text-[10px] bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg px-2 py-1 font-bold hover:bg-green-500/30"
                        >
                          Sold
                        </button>
                      )}
                      {knock.status === 'not_home' && (
                        <button
                          onClick={() => handleUpdateStatus(knock.id, 'come_back')}
                          className="text-[10px] bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg px-2 py-1 font-bold hover:bg-blue-500/30"
                        >
                          Come Back
                        </button>
                      )}
                      <button onClick={() => handleDelete(knock.id)} className="text-zinc-600 hover:text-red-400 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Main view ──
  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Door Tracker</h1>
          <p className="text-sm text-zinc-500">Track every knock, follow up on every lead</p>
        </div>
        <button onClick={() => setShowNewSession(true)}
          className="flex items-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-500 px-4 py-2.5 text-sm font-bold text-white">
          <Plus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
        {([['today', 'Today'], ['followups', `Follow-ups (${followUps.length})`], ['history', 'History']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${tab === key ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* New Session Modal */}
      {showNewSession && (
        <div className="rounded-2xl bg-zinc-900 border border-green-500/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-zinc-100">Start New Session</p>
            <button onClick={() => setShowNewSession(false)}><X className="w-4 h-4 text-zinc-500" /></button>
          </div>
          <input
            autoFocus
            type="text"
            placeholder="Street or area (e.g. Barrhaven South)"
            value={area}
            onChange={e => setArea(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && area.trim() && handleNewSession()}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          />
          <button onClick={handleNewSession} disabled={!area.trim() || isPending}
            className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50">
            {isPending ? 'Starting...' : 'Start Session'}
          </button>
        </div>
      )}

      {/* TODAY tab */}
      {tab === 'today' && (
        <div className="space-y-4">
          {todaySessions.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-10 text-center">
              <Navigation className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium">No sessions today</p>
              <p className="text-zinc-600 text-sm mt-1">Tap "New Session" to start knocking</p>
            </div>
          ) : (
            todaySessions.map(s => (
              <button key={s.id} onClick={() => openSession(s)}
                className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-4 text-left transition-all active:scale-[0.98]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-100">{s.area}</p>
                      <p className="text-xs text-zinc-500">Today · Tap to open</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* FOLLOW-UPS tab */}
      {tab === 'followups' && (
        <div className="space-y-3">
          {followUps.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-10 text-center">
              <Star className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium">No follow-ups yet</p>
              <p className="text-zinc-600 text-sm mt-1">Doors marked "Maybe" or "Come Back" appear here</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-zinc-500 font-medium px-1">{followUps.length} doors to follow up on</p>
              {followUps.map(knock => {
                const cfg = STATUS_CONFIG[knock.status as keyof typeof STATUS_CONFIG]
                return (
                  <div key={knock.id} className={`rounded-xl border p-4 ${cfg.color} ${cfg.border}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color} ${cfg.text} border ${cfg.border}`}>
                            {cfg.emoji} {cfg.label}
                          </span>
                        </div>
                        <p className="font-semibold text-zinc-100">{knock.address}</p>
                        {knock.notes && <p className="text-xs text-zinc-400 mt-0.5">{knock.notes}</p>}
                        <p className="text-[10px] text-zinc-600 mt-1">
                          {knock.session?.area} · {new Date(knock.knocked_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Link
                          href={`/sales/dashboard/quote?address=${encodeURIComponent(knock.address)}&knockId=${knock.id}`}
                          className="text-[10px] bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg px-2.5 py-1.5 font-bold hover:bg-green-500/30 text-center whitespace-nowrap"
                        >
                          → Quote
                        </Link>
                        <button
                          onClick={() => handleUpdateStatus(knock.id, 'sold')}
                          className="text-[10px] bg-zinc-700 border border-zinc-600 text-zinc-300 rounded-lg px-2.5 py-1.5 font-bold hover:bg-zinc-600 whitespace-nowrap"
                        >
                          Mark Sold
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* HISTORY tab */}
      {tab === 'history' && (
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-10 text-center">
              <Clock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium">No history yet</p>
            </div>
          ) : (
            sessions.map(s => (
              <button key={s.id} onClick={() => openSession(s)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-4 text-left transition-all active:scale-[0.98]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-zinc-100 text-sm">{s.area}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{s.date}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
