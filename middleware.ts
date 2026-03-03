import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ── HMAC session verification (Edge Runtime compatible) ─────────────
// Uses Web Crypto API instead of Node.js 'crypto' module.
// Mirrors lib/session.ts signing logic.

async function hmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

async function verifySignedCookie(cookie: string | undefined, requiredRole?: string): Promise<boolean> {
  if (!cookie) return false
  if (cookie === 'true' || !cookie.includes('.')) return false

  try {
    const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD
    if (!secret) return false

    const dotIndex = cookie.lastIndexOf('.')
    const payload = cookie.substring(0, dotIndex)
    const providedSig = cookie.substring(dotIndex + 1)

    const expectedSig = await hmacSha256(secret, payload)
    if (!timingSafeCompare(providedSig, expectedSig)) return false

    if (requiredRole) {
      const data = JSON.parse(atob(payload))
      return data?.role === requiredRole
    }
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  // Redirect /admin to /admin/dashboard
  if (request.nextUrl.pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Protect /admin/dashboard — verify HMAC signature + ADMIN role
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const adminSession = request.cookies.get('admin_session')?.value
    if (!(await verifySignedCookie(adminSession, 'ADMIN'))) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      if (adminSession) response.cookies.delete('admin_session')
      return response
    }
  }

  // Redirect /contractor to /contractor/dashboard
  if (request.nextUrl.pathname === '/contractor') {
    return NextResponse.redirect(new URL('/contractor/dashboard', request.url))
  }

  // Protect /contractor/dashboard — verify HMAC signature + CONTRACTOR role
  if (request.nextUrl.pathname.startsWith('/contractor/dashboard')) {
    const session = request.cookies.get('contractor_session')?.value
    if (!(await verifySignedCookie(session, 'CONTRACTOR'))) {
      const response = NextResponse.redirect(new URL('/contractor/login', request.url))
      if (session) response.cookies.delete('contractor_session')
      return response
    }
  }

  // Redirect /sales to /sales/dashboard
  if (request.nextUrl.pathname === '/sales') {
    return NextResponse.redirect(new URL('/sales/dashboard', request.url))
  }

  // Protect /sales/dashboard — verify HMAC signature + SALES role
  if (request.nextUrl.pathname.startsWith('/sales/dashboard')) {
    const session = request.cookies.get('sales_session')?.value
    if (!(await verifySignedCookie(session, 'SALES'))) {
      const response = NextResponse.redirect(new URL('/sales/login', request.url))
      if (session) response.cookies.delete('sales_session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin', '/admin/dashboard/:path*',
    '/contractor', '/contractor/dashboard/:path*',
    '/sales', '/sales/dashboard/:path*'
  ],
}
