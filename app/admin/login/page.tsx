'use client'

import { useFormState } from 'react-dom'
import { login } from '../actions'
import { Shield, Droplets } from 'lucide-react'

const initialState = { message: '' }

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-950 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-transparent to-slate-950" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-green-400/5 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-900/50">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-white">ExcelPro Washers</p>
            <p className="text-xs text-slate-400">Ottawa, ON</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-400">Admin Portal</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Manage your<br />
            <span className="text-green-400">business operations</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Access leads, clients, jobs, quotes, and analytics all from one powerful dashboard.
          </p>
        </div>

        <div className="relative flex items-center gap-4">
          {[
            { label: 'Leads', color: 'bg-blue-500' },
            { label: 'Revenue', color: 'bg-green-500' },
            { label: 'Jobs', color: 'bg-purple-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className="text-xs text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/25">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">ExcelPro Washers</p>
              <p className="text-sm text-gray-400">Admin Portal</p>
            </div>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your admin account</p>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                autoComplete="email"
                placeholder="admin@excelpro.ca"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                autoComplete="current-password"
                placeholder="Enter password"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none"
              />
            </div>

            {state?.message && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <Shield className="h-4 w-4 flex-shrink-0" />
                {state.message}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-500 py-3 text-sm font-semibold text-white shadow-md shadow-green-500/20 hover:from-green-700 hover:to-green-600 active:scale-[0.98] transition-all"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            ExcelPro Washers &middot; Secure Admin Access
          </p>
        </div>
      </div>
    </div>
  )
}
