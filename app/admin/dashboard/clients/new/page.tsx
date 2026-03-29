'use client'

import { createClient } from '../../../actions/clients'
import Link from 'next/link'

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">New Client</h1>
        <Link href="/admin/dashboard/clients" className="text-sm font-medium text-zinc-500 hover:text-zinc-100">
          Cancel
        </Link>
      </div>

      <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
        <form action={async (formData) => { await createClient(formData); }} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-zinc-200">First Name</label>
              <input type="text" name="firstName" id="firstName" required className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm" />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-zinc-200">Last Name</label>
              <input type="text" name="lastName" id="lastName" required className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm" />
            </div>

             <div className="sm:col-span-2">
              <label htmlFor="companyName" className="block text-sm font-medium text-zinc-200">Company Name (Optional)</label>
              <input type="text" name="companyName" id="companyName" className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-200">Email Address</label>
              <input type="email" name="email" id="email" required className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-200">Phone Information</label>
              <input type="tel" name="phone" id="phone" className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm" placeholder="(555) 555-5555" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-zinc-200">Property Address</label>
              <textarea name="address" id="address" rows={3} className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm" placeholder="123 Main St, Springfield, IL"></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-5">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
