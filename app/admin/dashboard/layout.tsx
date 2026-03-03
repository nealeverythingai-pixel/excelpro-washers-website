import { cookies } from 'next/headers'
import { AdminDashboardShell } from './AdminDashboardShell'
import { verifyAdminSession } from '@/lib/session'

async function getAdminInfo(): Promise<{ email: string; initials: string }> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  const data = verifyAdminSession(session)
  if (!data) return { email: 'Admin', initials: 'A' }
  const email = data.email || 'Admin'
  const initials = email.split('@')[0].slice(0, 2).toUpperCase()
  return { email, initials }
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { email, initials } = await getAdminInfo()
  return (
    <AdminDashboardShell adminEmail={email} adminInitials={initials}>
      {children}
    </AdminDashboardShell>
  )
}
