'use client'

import { createUser } from './actions'
import { useFormState } from 'react-dom'

const initialState = {
  message: '',
}

export default function NewUserForm() {
    const [state, formAction] = useFormState(createUser, initialState)

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email (Username)</label>
                <input type="email" name="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Access PIN</label>
                <input type="text" name="pin" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" placeholder="e.g. 1234" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select name="role" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                    <option value="SALES">Sales Representative</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            {state?.message && (
                <p className={`text-sm ${state.message === 'User created' ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>
            )}

            <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Create User
            </button>
        </form>
    )
}
