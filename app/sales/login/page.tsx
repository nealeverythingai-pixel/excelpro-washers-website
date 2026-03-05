'use client'

import { useFormState } from 'react-dom'
import { login } from '../actions'

const initialState = {
  message: '',
}

export default function SalesLoginPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center bg-gray-50 px-6"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="w-full max-w-sm mx-auto space-y-8">
        {/* Logo + Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
            <span className="text-2xl font-black text-white">EP</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ExcelPro Sales</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in with your team credentials</p>
          </div>
        </div>

        {/* Login Form */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-3">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email"
              className="block w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            />
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Access Code"
              inputMode="numeric"
              className="block w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors tracking-[0.3em] text-center font-mono"
            />
          </div>

          {state?.message && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium text-center">
              {state.message}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-green-600 py-4 text-base font-bold text-white shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          ExcelPro Washers &middot; Ottawa
        </p>
      </div>
    </div>
  )
}
