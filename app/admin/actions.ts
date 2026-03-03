'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
    // Store a session with admin identity — base64 encoded JSON
    const sessionData = {
      email,
      role: 'ADMIN',
      loginAt: new Date().toISOString(),
      id: Buffer.from(email).toString('base64').substring(0, 12),
    }
    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64')

    cookies().set('admin_session', sessionValue, {
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
  cookies().delete('admin_session')
  redirect('/admin/login')
}

export function getAdminSession(): { email: string; role: string; id: string; loginAt: string } | null {
  try {
    const session = cookies().get('admin_session')?.value
    if (!session) return null
    // Handle legacy 'true' cookie from old auth system
    if (session === 'true') return { email: 'admin@excelpro.ca', role: 'ADMIN', id: 'legacy', loginAt: '' }
    const data = JSON.parse(Buffer.from(session, 'base64').toString('utf-8'))
    return data
  } catch {
    return null
  }
}
