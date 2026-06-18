import { NextRequest, NextResponse } from 'next/server'
import { AILeadQualifier } from '@/lib/ai/LeadQualifier'
import { LeadRouter } from '@/lib/ai/LeadRouter'
import { NotificationService } from '@/lib/notifications/NotificationService'
import { db } from '@/lib/db'
import { leadQuotes } from '@/lib/db/leads'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📞 ElevenLabs webhook:', body.type, body.data?.conversation_id)

    // ElevenLabs sends "post_call_transcription" (not "call.ended") when a call finishes,
    // and nests call_successful/data_collection_results under data.analysis.
    // call_successful is the string "success" | "failure" | "unknown", not a boolean.
    if (body.type !== 'post_call_transcription') {
      return NextResponse.json({ received: true, skipped: 'not post_call_transcription' })
    }
    const callSuccessful = body.data?.analysis?.call_successful ?? body.data?.call_successful
    if (callSuccessful !== 'success' && callSuccessful !== true) {
      console.log('Call not successful — skipping lead creation:', body.data?.conversation_id)
      return NextResponse.json({ received: true, skipped: 'call_not_successful' })
    }

    // 3. Extract data_collection_results variables
    const dc = body.data?.analysis?.data_collection_results ?? body.data?.data_collection_results ?? {}
    const callerName  = dc.caller_name?.value       ?? 'Unknown Caller'
    const callerPhone = dc.caller_phone?.value      ?? ''
    const serviceRaw  = dc.service_requested?.value ?? 'window-cleaning'
    const address     = dc.property_address?.value  ?? ''

    // Normalise service string to CRM slug
    const slugMap: Record<string, string> = {
      'window cleaning':  'window-cleaning',  'windows': 'window-cleaning',
      'pressure washing': 'pressure-washing', 'pressure wash': 'pressure-washing',
      'soft wash':        'soft-wash',        'soft washing': 'soft-wash',
      'gutter cleaning':  'gutter-cleaning',  'gutters': 'gutter-cleaning',
      'roof cleaning':    'roof-cleaning',    'roof': 'roof-cleaning',
    }
    const service = slugMap[serviceRaw.toLowerCase().trim()] ?? serviceRaw.toLowerCase().trim()

    // 4. Build message from user transcript turns
    const transcript: Array<{ role: string; message: string }> = body.data?.transcript ?? []
    const message = transcript
      .filter(t => t.role === 'user')
      .map(t => t.message)
      .join(' ') || `Phone inquiry about ${service}`

    // Phone calls don't capture email — use synthetic placeholder
    const email = `${callerPhone.replace(/\D/g, '')}@call.excelprowashers.com`

    console.log(`📞 Phone lead: ${callerName} / ${callerPhone} / ${service}`)

    // 5. AI qualification
    const qualifier = new AILeadQualifier()
    const result = await qualifier.qualifyLead({
      name: callerName,
      email,
      phone: callerPhone,
      service,
      message,
      address,
      propertyType: 'residential',
    })
    console.log(`📊 Score: ${result.score.overall}/100 (${result.score.category.toUpperCase()})`)

    // 6. Store in Supabase requests table
    const requestId = `req_call_${body.data.conversation_id}`
    const nameParts = callerName.split(' ')
    try {
      await db.requests.create({
        id:             requestId,
        name:           callerName,
        firstName:      nameParts[0] ?? callerName,
        lastName:       nameParts.slice(1).join(' '),
        email,
        phone:          callerPhone,
        address,
        service,
        message,
        status:         'New',
        aiScore:        result.score.overall,
        aiCategory:     result.score.category,
        aiReasoning:    result.score.reasoning,
        estimatedValue: result.score.estimatedValue,
      })
    } catch (e) { console.error('DB insert failed (non-critical):', e) }

    // 7. Create quote record
    try {
      await leadQuotes.create({
        id:         `quote_call_${Date.now()}`,
        request_id: requestId,
        title:      `Quote for ${service}`,
        items:      [{ description: service, quantity: 1, unitPrice: result.quote.total }],
        total:      result.quote.total,
        status:     'draft',
      })
    } catch (e) { console.error('Quote insert failed (non-critical):', e) }

    // 8. Route lead — owner SMS + email + follow-up scheduling
    try {
      await LeadRouter.routeLead({
        id:             requestId,
        name:           callerName,
        email,
        phone:          callerPhone,
        service,
        details:        message,
        message,
        score:          result.score.overall,
        category:       result.score.category,
        estimatedValue: result.score.estimatedValue,
        reasoning:      result.score.reasoning,
        quoteTotal:     result.quote.total,
        address,
      })
    } catch (e) { console.error('Lead routing failed (non-critical):', e) }

    // 9. Log AI decision for performance tracking
    try {
      await NotificationService.logAIDecision({
        leadId:    requestId,
        inputData: { name: callerName, email, phone: callerPhone, service, message, address, source: 'phone-call' },
        outputData: {
          score:          result.score.overall,
          category:       result.score.category,
          reasoning:      result.score.reasoning,
          estimatedValue: result.score.estimatedValue,
          quote:          result.quote.total,
        },
      })
    } catch (e) { console.error('AI log failed (non-critical):', e) }

    console.log('✅ Phone lead qualified and routed:', requestId)
    return NextResponse.json({ success: true, leadId: requestId })

  } catch (error) {
    console.error('❌ ElevenLabs webhook error:', error)
    // Return 200 so ElevenLabs does not retry endlessly
    return NextResponse.json({ error: 'Internal error' }, { status: 200 })
  }
}
