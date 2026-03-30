import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendSMS } from '@/lib/sms'
import { sendTelegram } from '@/lib/telegram'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const jobs = await db.jobs.getAll()
    const clients = await db.clients.getAll()

    // Build date strings for today and tomorrow (ET = UTC-4 in summer, UTC-5 in winter)
    // Cron runs at 14:00 UTC = 10:00 AM ET — safe for both EDT and EST
    const nowUTC = new Date()
    const ET_OFFSET = nowUTC.getTimezoneOffset() // use server time; Vercel is UTC
    const nowET = new Date(nowUTC.getTime() - 4 * 60 * 60 * 1000) // approximate ET (UTC-4)

    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = (d: Date) =>
      `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`

    const todayStr = dateStr(nowET)
    const tomorrowET = new Date(nowET.getTime() + 24 * 60 * 60 * 1000)
    const tomorrowStr = dateStr(tomorrowET)

    const activeJobs = jobs.filter(
      j => j.status !== 'Completed' && j.status !== 'Cancelled'
    )

    let remindersSent = 0
    const unassigned: string[] = []

    for (const job of activeJobs) {
      const jobDate = job.startDate.split('T')[0]
      const isTomorrow = jobDate === tomorrowStr
      const isToday = jobDate === todayStr

      if (!isTomorrow && !isToday) continue

      const client = clients.find(c => c.id === job.clientId)

      // Parse job time for display
      const timePart = job.startDate.split('T')[1] || '00:00'
      const [h, m] = timePart.split(':').map(Number)
      const period = h >= 12 ? 'PM' : 'AM'
      const displayHour = h % 12 || 12
      const displayTime = `${displayHour}:${String(m).padStart(2, '0')} ${period}`

      // No contractor yet — alert owner
      if (!job.assignedContractorId) {
        const when = isTomorrow ? 'tomorrow' : 'TODAY'
        unassigned.push(`• ${job.title} — ${when} at ${displayTime} (${client?.firstName} ${client?.lastName})`)
        continue
      }

      if (!client?.phone) continue

      // For same-day jobs only remind if job starts after noon (gives buffer for morning jobs)
      if (isToday) {
        if (h < 12) continue // morning job, skip — they got the booking confirmation
      }

      const when = isTomorrow ? `TOMORROW at ${displayTime}` : `TODAY at ${displayTime}`

      await sendSMS(
        client.phone,
        `Hi ${client.firstName}! 👋 Reminder from ExcelPro Washers.\n\nYour ${job.title} is ${when}.\nAddress: ${client.address}\n\nQuestions? Call (343) 574-0300. Reply STOP to unsubscribe.`
      )
      remindersSent++
    }

    // Alert owner about unassigned jobs
    if (unassigned.length > 0) {
      await sendTelegram(
        `⚠️ <b>Unassigned Jobs Need Attention!</b>\n\nThe following jobs have no contractor assigned yet:\n\n${unassigned.join('\n')}\n\nPlease assign a contractor or reach out to the client.`
      )
    }

    console.log(`📱 Sent ${remindersSent} reminder(s). ${unassigned.length} unassigned alert(s).`)
    return NextResponse.json({ success: true, remindersSent, unassignedAlerts: unassigned.length })
  } catch (error) {
    console.error('Reminder cron failed:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
