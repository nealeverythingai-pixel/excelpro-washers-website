import React from 'react';
import { db } from '@/lib/db';
import { User } from '@/lib/types';
import NewUserForm from './NewUserForm';
import { deleteUser } from './actions';
import { Trash2 } from 'lucide-react';

export default async function UsersPage() {
  const users = await db.users.findMany();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* List of Current Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Active Team Members</h2>
            </div>
            <ul className="divide-y divide-gray-200">
                {users.length === 0 ? (
                    <li className="p-6 text-gray-500 text-center">No users created yet.</li>
                ) : users.map((user: User) => (
                    <li key={user.id} className="p-6 flex justify-between items-center group">
                        <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : ''}
                                ${user.role === 'SALES' ? 'bg-green-100 text-green-800' : ''}
                                ${user.role === 'CONTRACTOR' ? 'bg-orange-100 text-orange-800' : ''}
                              `}>
                                {user.role}
                              </span>
                              <span>• {user.email}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                PIN: {user.pin}
                            </div>
                            <form action={deleteUser}>
                                <input type="hidden" name="userId" value={user.id} />
                                <button type="submit" className="text-gray-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        {/* Create New User Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Team Member</h2>
            <NewUserForm />
        </div>
      </div>
    </div>
  );
}
