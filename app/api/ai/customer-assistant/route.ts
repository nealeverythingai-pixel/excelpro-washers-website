import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { 
      type, // 'quote-followup' | 'job-complete' | 'payment-reminder' | 'custom'
      clientId,
      jobId,
      quoteId,
      customContext 
    } = await request.json()

    if (!type) {
      return NextResponse.json(
        { error: 'Communication type is required' },
        { status: 400 }
      )
    }

    // Gather context based on type
    let context = ''
    let client = null
    let job = null
    let quote = null

    if (clientId) {
      client = await db.clients.findById(clientId)
      context += `Client: ${client?.firstName} ${client?.lastName}\n`
    }

    if (jobId) {
      job = await db.jobs.findById(jobId)
      context += `Job: ${job?.title}\n`
      context += `Date: ${new Date(job?.startDate || '').toLocaleDateString()}\n`
    }

    if (quoteId) {
      quote = await db.quotes.findById(quoteId)
      context += `Quote: ${quote?.title}\n`
      context += `Amount: $${quote?.total}\n`
    }

    if (customContext) {
      context += `Additional Context: ${customContext}\n`
    }

    // Build prompt based on communication type
    let prompt = ''

    if (type === 'quote-followup') {
      prompt = `You are a professional customer communication assistant for ExcelPro Washers, a pressure washing company in Ottawa.

CONTEXT:
${context}

TASK: Generate a warm, professional follow-up email for a quote we sent to the customer.

The email should:
- Thank them for their interest
- Remind them of the quote details (service and pricing)
- Offer to answer any questions
- Provide a gentle call-to-action to accept the quote
- Include availability for scheduling
- Sound friendly but professional
- Be 150-200 words

Brand Voice: Professional, friendly, reliable, customer-focused

Return JSON:
{
  "subject": "<email subject line>",
  "body": "<email body text>",
  "tone": "<tone description>"
}

Return ONLY valid JSON, no markdown.`
    } else if (type === 'job-complete') {
      prompt = `You are a professional customer communication assistant for ExcelPro Washers.

CONTEXT:
${context}

TASK: Generate a post-job completion email to thank the customer.

The email should:
- Thank them for choosing ExcelPro Washers
- Confirm the service was completed
- Ask for feedback
- Mention they'll receive an invoice shortly
- Offer future services
- Request a Google review (if they're happy)
- Be warm and appreciative
- Be 150-200 words

Return JSON:
{
  "subject": "<email subject line>",
  "body": "<email body text>",
  "tone": "<tone description>"
}

Return ONLY valid JSON, no markdown.`
    } else if (type === 'payment-reminder') {
      prompt = `You are a professional customer communication assistant for ExcelPro Washers.

CONTEXT:
${context}

TASK: Generate a friendly payment reminder email.

The email should:
- Politely remind about the outstanding invoice
- Include payment details/link
- Offer payment options
- Be understanding and non-confrontational
- Maintain good customer relationship
- Offer to help if there are any issues
- Be 100-150 words

Return JSON:
{
  "subject": "<email subject line>",
  "body": "<email body text>",
  "tone": "<tone description>"
}

Return ONLY valid JSON, no markdown.`
    } else {
      prompt = `You are a professional customer communication assistant for ExcelPro Washers.

CONTEXT:
${context}

TASK: Generate a professional customer communication email.

Brand Voice: Professional, friendly, reliable, customer-focused

Return JSON:
{
  "subject": "<email subject line>",
  "body": "<email body text>",
  "tone": "<tone description>"
}

Return ONLY valid JSON, no markdown.`
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    let emailData
    try {
      const cleanedText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      emailData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse AI response as JSON')
    }

    return NextResponse.json({
      success: true,
      email: emailData,
      context: {
        type,
        client: client ? `${client.firstName} ${client.lastName}` : null,
        job: job?.title,
        quote: quote?.title,
      },
    })
  } catch (error) {
    console.error('Error generating customer communication:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate communication',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
