'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { signSession } from '@/lib/session'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Find user in DB
  const users = await db.users.findMany()
  const validUser = users.find(u => 
      u.email === email && 
      u.pin === password && 
      u.role === 'SALES'
  )

  if (validUser) {
    // HMAC-signed session cookie
    const sessionValue = signSession({
      userId: validUser.id,
      role: 'SALES',
      email: validUser.email,
      loginAt: new Date().toISOString(),
    })

    const cookieStore = await cookies()
    cookieStore.set('sales_session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })
    redirect('/sales/dashboard')
  } else {
    return { message: 'Invalid Email or PIN' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('sales_session')
  redirect('/sales/login')
}
