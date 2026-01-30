'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Find user in DB
  const users = await db.users.findMany()
  const validUser = users.find(u => 
      u.email === email && 
      u.pin === password && 
      u.role === 'CONTRACTOR'
  )

  if (validUser) {
    cookies().set('contractor_session', validUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })
    redirect('/contractor/dashboard')
  } else {
    return { message: 'Invalid Email or PIN' }
  }
}

export async function logout() {
  cookies().delete('contractor_session')
  redirect('/contractor/login')
}
