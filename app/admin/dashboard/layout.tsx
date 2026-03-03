import { cookies } from 'next/headers'
import { AdminDashboardShell } from './AdminDashboardShell'

async function getAdminInfo(): Promise<{ email: string; initials: string }> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session === 'true') return { email: 'Admin', initials: 'A' }
  try {
    const data = JSON.parse(Buffer.from(session, 'base64').toString('utf-8'))
    const email = data.email || 'Admin'
    const initials = email.split('@')[0].slice(0, 2).toUpperCase()
    return { email, initials }
  } catch {
    return { email: 'Admin', initials: 'A' }
  }
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
