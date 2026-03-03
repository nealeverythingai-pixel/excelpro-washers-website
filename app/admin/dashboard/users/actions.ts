'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { User, UserRole } from '@/lib/types'

export async function createUser(prevState: any, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const pin = formData.get('pin') as string
  const role = formData.get('role') as UserRole

  if (!name || !email || !pin || !role) {
    return { message: 'All fields are required' }
  }

  const existingUsers = await db.users.findMany()
  if (existingUsers.some(u => u.email === email)) {
      return { message: 'Email already exists' }
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    pin,
    role,
    active: true
  }

  await db.users.create(newUser)
  revalidatePath('/admin/dashboard/users')
  return { message: 'User created' }
}

export async function deleteUser(formData: FormData) {
    const userId = formData.get('userId') as string
    if (!userId) return
    await db.users.delete(userId)
    revalidatePath('/admin/dashboard/users')
}
