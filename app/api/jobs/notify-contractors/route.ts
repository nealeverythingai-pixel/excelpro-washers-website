import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Resend } from 'resend'
import twilio from 'twilio'

const resend = new Resend(process.env.RESEND_API_KEY)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Get job details
    const job = await db.jobs.findById(jobId)
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Get client details
    const client = await db.clients.findById(job.clientId)
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Get all active contractors
    const allUsers = await db.users.getAll()
    const contractors = allUsers.filter(
      user => user.role === 'CONTRACTOR' && user.active === true
    )

    if (contractors.length === 0) {
      return NextResponse.json(
        { error: 'No active contractors found' },
        { status: 404 }
      )
    }

    console.log(`📢 Notifying ${contractors.length} contractors about job ${jobId}`)

    // Create accept link
    const acceptLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contractor/dashboard?job=${jobId}`

    const notifications = []

    // Send SMS to each contractor
    for (const contractor of contractors) {
      if (contractor.phone && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const message = await twilioClient.messages.create({
            body: `🚨 NEW JOB AVAILABLE!\n\n${job.title}\nClient: ${client.firstName} ${client.lastName}\nLocation: ${client.address}\nPay: $${job.contractorEarnings || job.total * 0.7}\n\nFirst to accept gets the job!\n\nAccept: ${acceptLink}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contractor.phone,
          })
          notifications.push({
            type: 'SMS',
            contractor: contractor.name,
            status: 'sent',
            sid: message.sid,
          })
          console.log(`✅ SMS sent to ${contractor.name} (${contractor.phone})`)
        } catch (error) {
          console.error(`❌ SMS failed for ${contractor.name}:`, error)
          notifications.push({
            type: 'SMS',
            contractor: contractor.name,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      // Send Email to each contractor
      if (contractor.email) {
        try {
          await resend.emails.send({
            from: 'ExcelPro Washers <jobs@excelprowashers.ca>',
            to: contractor.email,
            subject: `🚨 New Job Available - ${job.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #16a34a;">New Job Available!</h2>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">${job.title}</h3>
                  <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
                  <p><strong>Location:</strong> ${client.address}</p>
                  <p><strong>Service Date:</strong> ${new Date(job.startDate).toLocaleDateString()}</p>
                  <p><strong>Your Earnings:</strong> $${job.contractorEarnings || Math.round(job.total * 0.7)}</p>
                  ${job.description ? `<p><strong>Details:</strong> ${job.description}</p>` : ''}
                </div>
                <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                  <p style="margin: 0;"><strong>⏱️ First Come, First Served!</strong></p>
                  <p style="margin: 5px 0 0 0;">The first contractor to accept gets this job.</p>
                </div>
                <a href="${acceptLink}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                  Accept Job Now
                </a>
                <p style="color: #6b7280; font-size: 14px;">Log in to your contractor portal to see all available jobs.</p>
              </div>
            `,
          })
          notifications.push({
            type: 'Email',
            contractor: contractor.name,
            status: 'sent',
          })
          console.log(`✅ Email sent to ${contractor.name} (${contractor.email})`)
        } catch (error) {
          console.error(`❌ Email failed for ${contractor.name}:`, error)
          notifications.push({
            type: 'Email',
            contractor: contractor.name,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notified ${contractors.length} contractors`,
      contractors: contractors.length,
      notifications,
    })
  } catch (error) {
    console.error('Error notifying contractors:', error)
    return NextResponse.json(
      {
        error: 'Failed to notify contractors',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
