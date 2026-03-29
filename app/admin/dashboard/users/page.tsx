import React from 'react';
import { db } from '@/lib/db';
import { User } from '@/lib/types';
import NewUserForm from './NewUserForm';
import { deleteUser } from './actions';
import { Trash2 } from 'lucide-react';
import { PinReveal } from './PinReveal';

export default async function UsersPage() {
  const users = await db.users.findMany();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-100">Team Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* List of Current Users */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
                <h2 className="text-lg font-medium text-zinc-100">Active Team Members</h2>
            </div>
            <ul className="divide-y divide-zinc-800">
                {users.length === 0 ? (
                    <li className="p-6 text-zinc-500 text-center">No users created yet.</li>
                ) : users.map((user: User) => (
                    <li key={user.id} className="p-6 flex justify-between items-center group">
                        <div>
                            <p className="font-semibold text-zinc-100">{user.name}</p>
                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                ${user.role === 'ADMIN' ? 'bg-purple-500/15 text-purple-400' : ''}
                                ${user.role === 'SALES' ? 'bg-green-500/15 text-green-400' : ''}
                                ${user.role === 'CONTRACTOR' ? 'bg-orange-500/15 text-orange-400' : ''}
                              `}>
                                {user.role}
                              </span>
                              <span>• {user.email}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <PinReveal pin={user.pin} />
                            <form action={deleteUser}>
                                <input type="hidden" name="userId" value={user.id} />
                                <button type="submit" className="text-zinc-500 hover:text-red-400 transition-colors">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        {/* Create New User Form */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 h-fit">
            <h2 className="text-lg font-medium text-zinc-100 mb-4">Add New Team Member</h2>
            <NewUserForm />
        </div>
      </div>
    </div>
  );
}
