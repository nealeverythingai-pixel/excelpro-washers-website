import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendSMS } from '@/lib/sms'

export async function GET(request: Request) {
  // Verify this is called by Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const jobs = await db.jobs.getAll()
    const clients = await db.clients.getAll()

    // Find jobs scheduled for tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`

    const tomorrowJobs = jobs.filter(job => {
      if (job.status === 'Completed' || job.status === 'Cancelled') return false
      if (!job.assignedContractorId) return false // Only remind if contractor assigned
      return job.startDate.startsWith(tomorrowStr)
    })

    let sent = 0
    for (const job of tomorrowJobs) {
      const client = clients.find(c => c.id === job.clientId)
      if (!client?.phone) continue

      // Parse time from startDate for display
      const timePart = job.startDate.split('T')[1] || '00:00'
      const [h, m] = timePart.split(':').map(Number)
      const period = h >= 12 ? 'PM' : 'AM'
      const displayHour = h % 12 || 12
      const displayTime = `${displayHour}:${String(m).padStart(2, '0')} ${period}`

      await sendSMS(
        client.phone,
        `Hi ${client.firstName}! 👋 Reminder from ExcelPro Washers.\n\nYour ${job.title} is scheduled for TOMORROW at ${displayTime}.\nAddress: ${client.address}\n\nQuestions? Call (343) 574-0300. Reply STOP to unsubscribe.`
      )
      sent++
    }

    console.log(`📱 Sent ${sent} reminder SMS(es) for tomorrow's jobs`)
    return NextResponse.json({ success: true, remindersSent: sent })
  } catch (error) {
    console.error('Reminder cron failed:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
