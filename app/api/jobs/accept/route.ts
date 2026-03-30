import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Resend } from 'resend'
import twilio from 'twilio'
import { sendTelegram } from '@/lib/telegram'

const resend = new Resend(process.env.RESEND_API_KEY)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request: Request) {
  try {
    const { jobId, contractorId } = await request.json()

    if (!jobId || !contractorId) {
      return NextResponse.json(
        { error: 'Job ID and Contractor ID are required' },
        { status: 400 }
      )
    }

    // Get current job state (CRITICAL: check before updating)
    const job = await db.jobs.findById(jobId)
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // RACE CONDITION CHECK: If already assigned, reject
    if (job.assignedContractorId) {
      return NextResponse.json(
        {
          error: 'Job already assigned',
          message: 'Sorry, another contractor accepted this job first.',
          assignedTo: job.assignedContractorName,
        },
        { status: 409 } // 409 Conflict
      )
    }

    // Get contractor details
    const allUsers = await db.users.getAll()
    const contractor = allUsers.find(u => u.id === contractorId)
    if (!contractor || contractor.role !== 'CONTRACTOR') {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      )
    }

    // Get client details for notifications
    const client = await db.clients.findById(job.clientId)

    // Calculate contractor earnings (70% of job total by default)
    const contractorEarnings = job.contractorEarnings || Math.round(job.total * 0.7)

    // Assign job to contractor (ATOMIC OPERATION)
    await db.jobs.update(jobId, {
      ...job,
      assignedContractorId: contractorId,
      assignedContractorName: contractor.name,
      assignedAt: new Date().toISOString(),
      contractorEarnings,
      availableToContractors: false, // Remove from job board
    })

    console.log(`✅ Job ${jobId} assigned to ${contractor.name}`)

    // Update contractor stats
    await db.users.update(contractorId, {
      ...contractor,
      completedJobs: (contractor.completedJobs || 0), // Will increment on job completion
    })

    // Send confirmation SMS to contractor
    if (contractor.phone && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `✅ JOB CONFIRMED!\n\nYou got it! ${job.title} is now yours.\n\nClient: ${client?.firstName} ${client?.lastName}\nLocation: ${client?.address}\nDate: ${job.startDate.split('T')[0]}\nYour Pay: $${contractorEarnings}\n\nCheck your dashboard for details.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: contractor.phone,
        })
        console.log(`📱 Confirmation SMS sent to ${contractor.name}`)
      } catch (error) {
        console.error('SMS confirmation failed:', error)
      }
    }

    // Send confirmation email to contractor
    if (contractor.email) {
      try {
        await resend.emails.send({
          from: 'ExcelPro Washers <jobs@excelprowashers.ca>',
          to: contractor.email,
          subject: `✅ Job Confirmed - ${job.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Job Confirmed!</h2>
              <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p style="margin: 0 0 10px 0; font-size: 18px;"><strong>You got the job!</strong></p>
                <p style="margin: 0;">This job has been assigned to you.</p>
              </div>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${job.title}</h3>
                ${client ? `
                  <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
                  <p><strong>Phone:</strong> ${client.phone}</p>
                  <p><strong>Email:</strong> ${client.email}</p>
                  <p><strong>Location:</strong> ${client.address}</p>
                ` : ''}
                <p><strong>Service Date:</strong> ${new Date(job.startDate).toLocaleDateString()}</p>
                <p><strong>Your Earnings:</strong> $${contractorEarnings}</p>
                ${job.description ? `<p><strong>Details:</strong> ${job.description}</p>` : ''}
              </div>
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Contact the client to confirm details</li>
                <li>Complete the job on the scheduled date</li>
                <li>Update job status in your dashboard</li>
                <li>Add proof of work photos when complete</li>
              </ul>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contractor/dashboard" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                View Job Details
              </a>
            </div>
          `,
        })
        console.log(`✉️ Confirmation email sent to ${contractor.name}`)
      } catch (error) {
        console.error('Email confirmation failed:', error)
      }
    }

    // Notify owner via Telegram
    await sendTelegram(
      `✅ <b>Job Assigned!</b>\n\n<b>${job.title}</b>\nContractor: ${contractor.name}\nClient: ${client?.firstName} ${client?.lastName}\nDate: ${job.startDate.split('T')[0]}`
    )

    return NextResponse.json({
      success: true,
      message: 'Job accepted successfully',
      job: {
        id: job.id,
        title: job.title,
        assignedTo: contractor.name,
        earnings: contractorEarnings,
        startDate: job.startDate,
      },
    })
  } catch (error) {
    console.error('Error accepting job:', error)
    return NextResponse.json(
      {
        error: 'Failed to accept job',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
