import { cookies } from 'next/headers'
import CanvassingClient from './CanvassingClient'
import { getSessions, getAllFollowUps } from './actions'
import { verifyPortalSession } from '@/lib/session'
import { db } from '@/lib/db'

export default async function CanvassingPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('sales_session')?.value
  const session = verifyPortalSession(sessionCookie, 'SALES')

  const repId = session?.userId || 'unknown'

  // Get rep name from DB
  let repName = 'Rep'
  if (repId !== 'unknown') {
    const user = await db.users.findById(repId)
    repName = user?.name || 'Rep'
  }

  const [sessions, followUps] = await Promise.all([
    getSessions(repId),
    getAllFollowUps(repId),
  ])

  return (
    <CanvassingClient
      repId={repId}
      repName={repName}
      initialSessions={sessions}
      initialFollowUps={followUps}
    />
  )
}
