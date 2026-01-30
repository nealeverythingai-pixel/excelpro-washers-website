'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
  const password = formData.get('password')
  
  // TODO: Change this to use an environment variable (process.env.ADMIN_PASSWORD)
  const CORRECT_PASSWORD = 'Exceljobber613' 

  if (password === CORRECT_PASSWORD) {
    cookies().set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })
    redirect('/admin/dashboard')
  } else {
    return { message: 'Incorrect password' }
  }
}

export async function logout() {
  cookies().delete('admin_session')
  redirect('/admin/login')
}
