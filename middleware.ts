import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isValidAdminSession(value: string | undefined): boolean {
  if (!value) return false
  // Legacy support for old 'true' cookie — still allow but should re-login eventually
  if (value === 'true') return true
  try {
    const data = JSON.parse(Buffer.from(value, 'base64').toString('utf-8'))
    return data && data.email && data.role === 'ADMIN'
  } catch {
    return false
  }
}
 
export function middleware(request: NextRequest) {
  // Redirect /admin to /admin/dashboard
  if (request.nextUrl.pathname === '/admin') {
     return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Protect /admin/dashboard
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
      const adminSession = request.cookies.get('admin_session')?.value
      if (!isValidAdminSession(adminSession)) {
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        // Clear invalid cookies
        if (adminSession) response.cookies.delete('admin_session')
        return response
      }
  }

  // Redirect /contractor to /contractor/dashboard
  if (request.nextUrl.pathname === '/contractor') {
     return NextResponse.redirect(new URL('/contractor/dashboard', request.url))
  }

  // Protect /contractor/dashboard
  if (request.nextUrl.pathname.startsWith('/contractor/dashboard')) {
      const contractorSession = request.cookies.get('contractor_session')
      if (!contractorSession) {
        return NextResponse.redirect(new URL('/contractor/login', request.url))
      }
  }

  // Redirect /sales to /sales/dashboard
  if (request.nextUrl.pathname === '/sales') {
     return NextResponse.redirect(new URL('/sales/dashboard', request.url))
  }

  // Protect /sales/dashboard
  if (request.nextUrl.pathname.startsWith('/sales/dashboard')) {
      const salesSession = request.cookies.get('sales_session')
      if (!salesSession) {
        return NextResponse.redirect(new URL('/sales/login', request.url))
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
