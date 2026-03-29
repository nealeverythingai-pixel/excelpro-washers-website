'use client'

import { useFormState } from 'react-dom'
import { login } from '../actions'
import { HardHat, Wrench, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

const initialState = { message: '' }

export default function ContractorLoginPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-orange-600 to-orange-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(251,146,60,0.2)_0%,_transparent_60%)]" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
            <HardHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-white">ExcelPro Washers</p>
            <p className="text-xs text-orange-300">Ottawa, ON</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-300 animate-pulse" />
            <span className="text-xs font-medium text-orange-200">Contractor Portal</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Your jobs,<br />
            <span className="text-orange-300">your schedule</span>
          </h1>
          <p className="text-orange-200/80 text-sm leading-relaxed max-w-xs">
            View assigned jobs, update availability, and track your work — all in one place.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-3">
          {[
            { icon: Wrench, label: 'Jobs', desc: 'View assigned' },
            { icon: Clock, label: 'Availability', desc: 'Set your hours' },
            { icon: MapPin, label: 'Location', desc: 'Ottawa area' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <item.icon className="h-4 w-4 text-orange-300 mb-2" />
              <p className="text-xs font-semibold text-white">{item.label}</p>
              <p className="text-[10px] text-orange-300/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-zinc-950 px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl shadow-orange-900/50">
              <HardHat className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-zinc-100">Contractor Portal</p>
              <p className="text-sm text-zinc-500">Access available jobs and update status</p>
            </div>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block space-y-1">
            <h2 className="text-2xl font-bold text-zinc-100">Welcome back</h2>
            <p className="text-sm text-zinc-500">Sign in to your contractor account</p>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="block w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3.5 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
                Access Code
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your access code"
                className="block w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3.5 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>

            {state?.message && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-medium text-center">
                {state.message}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 py-4 text-base font-bold text-white shadow-lg shadow-orange-900/40 hover:from-orange-700 hover:to-orange-600 active:scale-[0.98] transition-all cursor-pointer"
            >
              Enter Portal
            </button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-zinc-500">
              Want to join the team?{' '}
              <Link href="/contractor/register" className="font-semibold text-orange-500 hover:text-orange-400 transition-colors">
                Apply here
              </Link>
            </p>
            <p className="text-xs text-zinc-600">ExcelPro Washers &middot; Ottawa</p>
          </div>
        </div>
      </div>
    </div>
  )
}
