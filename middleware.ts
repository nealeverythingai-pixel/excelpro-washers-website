import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // Redirect /admin to /admin/dashboard
  if (request.nextUrl.pathname === '/admin') {
     return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Protect /admin/dashboard
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
      const adminSession = request.cookies.get('admin_session')
      if (!adminSession) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
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
