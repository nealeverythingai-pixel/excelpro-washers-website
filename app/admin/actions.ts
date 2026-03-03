'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { signSession, verifyAdminSession, type AdminSessionData } from '@/lib/session'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password')
  
  const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'neal.everything.ai@gmail.com'

  if (!CORRECT_PASSWORD) {
    console.error('❌ ADMIN_PASSWORD environment variable not set');
    return { message: 'Server configuration error' }
  }

  if (!email || !email.includes('@')) {
    return { message: 'Please enter a valid email address' }
  }

  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return { message: 'Incorrect email or password' }
  }

  if (password === CORRECT_PASSWORD) {
    // HMAC-signed session cookie — tamper-proof
    const sessionData: AdminSessionData = {
      email,
      role: 'ADMIN',
      loginAt: new Date().toISOString(),
      id: Buffer.from(email).toString('base64').substring(0, 12),
    }
    const sessionValue = signSession(sessionData)

    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })
    redirect('/admin/dashboard')
  } else {
    return { message: 'Incorrect email or password' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}

export async function getAdminSession(): Promise<AdminSessionData | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  return verifyAdminSession(session)
}
