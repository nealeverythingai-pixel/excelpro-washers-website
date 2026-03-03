'use client'

import { useFormState } from 'react-dom'
import { login } from '../actions'
import { Shield } from 'lucide-react'

const initialState = {
  message: '',
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-3">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Admin Login</h1>
        <p className="mb-6 text-center text-sm text-gray-500">ExcelPro Washers CRM</p>
        
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              placeholder="admin@excelpro.ca"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              placeholder="Enter password"
            />
          </div>

          {state?.message && (
            <div className="text-sm text-red-600 font-medium">
              {state.message}
            </div>
          )}

          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
