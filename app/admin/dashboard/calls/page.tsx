'use client';

import { useEffect, useState } from 'react';
import {
  Phone, Clock, CalendarCheck, TrendingUp,
  PhoneIncoming, PhoneOff, ChevronDown, ChevronUp, User, Wrench
} from 'lucide-react';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CallLog {
  id: string;
  call_sid: string;
  caller_phone: string;
  to_phone: string;
  status: string;
  duration: number;
  recording_url?: string | null;
  transcript?: ConversationMessage[] | null;
  booking_created: boolean;
  created_at: string;
}

interface VoiceBooking {
  id: string;
  call_sid: string;
  caller_phone: string;
  customer_name: string;
  customer_phone: string;
  service_requested: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface CallStats {
  totalCalls: number;
  totalDuration: number;
  bookingsCaptured: number;
  avgDuration: number;
  recentCalls: CallLog[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-green-500/15 text-green-400',
    'in-progress': 'bg-blue-500/15 text-blue-400',
    failed: 'bg-red-500/15 text-red-400',
    'no-answer': 'bg-amber-500/15 text-amber-400',
    new: 'bg-purple-500/15 text-purple-400',
    contacted: 'bg-blue-500/15 text-blue-400',
    scheduled: 'bg-green-500/15 text-green-400',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-zinc-800 text-zinc-400'}`}>
      {status}
    </span>
  );
}

function TranscriptViewer({ transcript }: { transcript: ConversationMessage[] }) {
  return (
    <div className="mt-3 space-y-2 border-t border-zinc-800 pt-3">
      {transcript.map((msg, i) => (
        <div key={i} className={`flex gap-2 ${msg.role === 'assistant' ? 'pl-4' : ''}`}>
          <span className="text-xs mt-0.5">
            {msg.role === 'user' ? '👤' : '🤖'}
          </span>
          <p className={`text-sm ${msg.role === 'assistant' ? 'text-zinc-500' : 'text-zinc-200'}`}>
            {msg.content}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function CallsPage() {
  const [stats, setStats] = useState<CallStats | null>(null);
  const [bookings, setBookings] = useState<VoiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calls' | 'bookings'>('calls');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/voice/analytics');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error('Failed to load call analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Phone className="mx-auto h-12 w-12 text-zinc-500" />
        <h3 className="mt-2 text-lg font-medium text-zinc-100">No call data yet</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Call data will appear here once your AI receptionist handles calls.
        </p>
      </div>
    );
  }

  const bookingRate = stats.totalCalls > 0
    ? ((stats.bookingsCaptured / stats.totalCalls) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">📞 AI Receptionist</h1>
        <p className="text-sm text-zinc-500 mt-1">Call history, transcripts, and phone bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-zinc-900 p-5 border border-zinc-800">
          <div className="flex items-center">
            <div className="rounded-md bg-blue-500/15 p-3">
              <PhoneIncoming className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-500">Total Calls</p>
              <p className="text-2xl font-bold text-zinc-100">{stats.totalCalls}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-900 p-5 border border-zinc-800">
          <div className="flex items-center">
            <div className="rounded-md bg-green-500/15 p-3">
              <CalendarCheck className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-500">Bookings Captured</p>
              <p className="text-2xl font-bold text-zinc-100">{stats.bookingsCaptured}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-900 p-5 border border-zinc-800">
          <div className="flex items-center">
            <div className="rounded-md bg-purple-500/15 p-3">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-500">Booking Rate</p>
              <p className="text-2xl font-bold text-zinc-100">{bookingRate}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-900 p-5 border border-zinc-800">
          <div className="flex items-center">
            <div className="rounded-md bg-amber-500/15 p-3">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-500">Avg Duration</p>
              <p className="text-2xl font-bold text-zinc-100">{formatDuration(stats.avgDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('calls')}
            className={`py-3 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'calls'
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Phone className="inline h-4 w-4 mr-1" />
            Call History ({stats.recentCalls.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'bookings'
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CalendarCheck className="inline h-4 w-4 mr-1" />
            Phone Bookings ({bookings.length})
          </button>
        </nav>
      </div>

      {/* Call History Tab */}
      {activeTab === 'calls' && (
        <div className="space-y-3">
          {stats.recentCalls.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <PhoneOff className="mx-auto h-8 w-8 mb-2" />
              <p>No calls recorded yet</p>
            </div>
          ) : (
            stats.recentCalls.map((call) => {
              const isExpanded = expandedCall === call.call_sid;
              return (
                <div
                  key={call.call_sid}
                  className="rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedCall(isExpanded ? null : call.call_sid)}
                    className="w-full flex items-center justify-between p-4 hover:bg-zinc-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rounded-full p-2 ${call.booking_created ? 'bg-green-500/15' : 'bg-zinc-800'}`}>
                        <Phone className={`h-4 w-4 ${call.booking_created ? 'text-green-400' : 'text-zinc-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-100">
                          {call.caller_phone || 'Unknown caller'}
                          {call.booking_created && (
                            <span className="ml-2 text-xs text-green-400">📅 Booking</span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatDate(call.created_at)} · {formatDuration(call.duration)}
                          {call.transcript && ` · ${Math.ceil(call.transcript.length / 2)} turns`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={call.status} />
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-500" />
                      )}
                    </div>
                  </button>

                  {isExpanded && call.transcript && call.transcript.length > 0 && (
                    <div className="px-4 pb-4">
                      <TranscriptViewer transcript={call.transcript} />
                      {call.recording_url && (
                        <div className="mt-3 pt-3 border-t border-zinc-800">
                          <a
                            href={call.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-400 hover:underline"
                          >
                            🎙️ Listen to recording
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <CalendarCheck className="mx-auto h-8 w-8 mb-2" />
              <p>No phone bookings captured yet</p>
              <p className="text-xs mt-1">Bookings will appear here when callers schedule via the AI receptionist</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-zinc-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-500" />
                        <span className="text-sm font-medium text-zinc-100">{booking.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{booking.customer_phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-zinc-500" />
                        <span className="text-sm text-zinc-400">{booking.service_requested}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                    <td className="px-4 py-3 text-sm text-zinc-500">{formatDate(booking.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
