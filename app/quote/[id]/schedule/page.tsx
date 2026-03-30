'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
]

export default function SchedulePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // Min date = tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Max date = 3 months out
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) {
      setError('Please select both a date and a time.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/quote/${id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, time: selectedTime }),
      })
      if (!res.ok) throw new Error('Failed')
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again or call us at (343) 574-0300.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You're all booked!</h1>
          <p className="text-gray-500 mb-2">
            Your appointment is confirmed for <strong>{new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong> at <strong>{selectedTime}</strong>.
          </p>
          <p className="text-gray-400 text-sm">We'll be in touch to confirm. Questions? Call us at <a href="tel:3435740300" className="text-sky-600 font-semibold">(343) 574-0300</a>.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo-horizontal.svg" alt="ExcelPro Washers" className="h-14 mx-auto" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-white text-xl font-bold">Quote Approved!</h1>
            <p className="text-green-100 text-sm mt-1">Now choose a date and time that works for you.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            {/* Date picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                min={minDate}
                max={maxDateStr}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                required
              />
            </div>

            {/* Time slots */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Preferred Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedTime === slot
                        ? 'bg-sky-500 text-white border-sky-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:text-sky-600'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !selectedDate || !selectedTime}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-base py-4 rounded-xl transition-colors"
            >
              {submitting ? 'Confirming…' : 'Confirm My Booking'}
            </button>

            <p className="text-center text-gray-400 text-xs">
              We'll send a confirmation and follow up closer to your appointment date.
            </p>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          ExcelPro Washers · (343) 574-0300 · Ottawa, ON
        </p>
      </div>
    </div>
  )
}
