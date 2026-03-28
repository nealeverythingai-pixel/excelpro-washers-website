'use client'

import { useFormState } from 'react-dom'
import { login } from '../actions'
import { TrendingUp, Users, FileText } from 'lucide-react'

const initialState = { message: '' }

export default function SalesLoginPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <div className="flex min-h-[100dvh]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-green-700 to-green-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(74,222,128,0.15)_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
            <span className="text-base font-black text-white">EP</span>
          </div>
          <div>
            <p className="text-base font-bold text-white">ExcelPro Washers</p>
            <p className="text-xs text-green-300">Ottawa, ON</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
            <span className="text-xs font-medium text-green-200">Sales Portal</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Close more<br />
            <span className="text-green-300">deals today</span>
          </h1>
          <p className="text-green-200/80 text-sm leading-relaxed max-w-xs">
            Build quotes, manage your pipeline and present pricing confidently to every client.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-3">
          {[
            { icon: TrendingUp, label: 'Quotes', desc: 'Fast builder' },
            { icon: Users, label: 'Clients', desc: 'Full history' },
            { icon: FileText, label: 'Pipeline', desc: 'Live updates' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <item.icon className="h-4 w-4 text-green-300 mb-2" />
              <p className="text-xs font-semibold text-white">{item.label}</p>
              <p className="text-[10px] text-green-300/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-xl shadow-green-500/30">
              <span className="text-2xl font-black text-white">EP</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">ExcelPro Sales</p>
              <p className="text-sm text-gray-400">Sign in with your team credentials</p>
            </div>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in with your team credentials</p>
          </div>

          <form action={formAction} className="space-y-4">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email"
              className="block w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none"
            />
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Access Code"
              inputMode="numeric"
              className="block w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none tracking-[0.3em] text-center font-mono"
            />

            {state?.message && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium text-center">
                {state.message}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-green-500 py-4 text-base font-bold text-white shadow-lg shadow-green-500/25 hover:from-green-700 hover:to-green-600 active:scale-[0.98] transition-all cursor-pointer"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            ExcelPro Washers &middot; Ottawa
          </p>
        </div>
      </div>
    </div>
  )
}
