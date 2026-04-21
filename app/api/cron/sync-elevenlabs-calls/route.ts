import { NextRequest, NextResponse } from 'next/server'
import { AILeadQualifier } from '@/lib/ai/LeadQualifier'
import { LeadRouter } from '@/lib/ai/LeadRouter'
import { NotificationService } from '@/lib/notifications/NotificationService'
import { db } from '@/lib/db'
import { leadQuotes } from '@/lib/db/leads'

const SLUG_MAP: Record<string, string> = {
  'window cleaning': 'window-cleaning', 'windows': 'window-cleaning',
  'pressure washing': 'pressure-washing', 'pressure wash': 'pressure-washing',
  'soft wash': 'soft-wash', 'soft washing': 'soft-wash',
  'gutter cleaning': 'gutter-cleaning', 'gutters': 'gutter-cleaning',
  'roof cleaning': 'roof-cleaning', 'roof': 'roof-cleaning',
}

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  const agentId = process.env.ELEVENLABS_AGENT_ID
  if (!apiKey || !agentId) {
    console.error('Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  // Fetch recent conversations for our agent
  const listRes = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${agentId}&page_size=20`,
    { headers: { 'xi-api-key': apiKey } }
  )
  if (!listRes.ok) {
    console.error('ElevenLabs list error:', await listRes.text())
    return NextResponse.json({ error: 'ElevenLabs API failed' }, { status: 500 })
  }

  const listData = await listRes.json()
  const conversations = listData.conversations ?? []
  let processed = 0, skipped = 0

  for (const conv of conversations) {
    // Only process successful completed calls
    if (!conv.call_successful || conv.status !== 'done') { skipped++; continue }

    const requestId = `req_call_${conv.conversation_id}`

    // Skip if already in CRM (dedup by conversation_id)
    const existing = await db.requests.findById(requestId)
    if (existing) { skipped++; continue }

    // Fetch full conversation detail (transcript + data_collection)
    const detailRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conv.conversation_id}`,
      { headers: { 'xi-api-key': apiKey } }
    )
    if (!detailRes.ok) {
      console.error(`Failed to fetch conversation ${conv.conversation_id}`)
      skipped++; continue
    }
    const detail = await detailRes.json()

    // Extract data collection values (ElevenLabs nests these under analysis)
    const dc = detail.analysis?.data_collection ?? detail.data_collection ?? {}
    const callerName  = dc.caller_name?.value       ?? 'Unknown Caller'
    const callerPhone = dc.caller_phone?.value      ?? ''
    const serviceRaw  = dc.service_requested?.value ?? 'window-cleaning'
    const address     = dc.property_address?.value  ?? ''
    const service = SLUG_MAP[serviceRaw.toLowerCase().trim()] ?? serviceRaw.toLowerCase().trim()

    const transcript: Array<{ role: string; message: string }> = detail.transcript ?? []
    const message = transcript
      .filter(t => t.role === 'user')
      .map(t => t.message)
      .join(' ') || `Phone inquiry about ${service}`
    const email = `${callerPhone.replace(/\D/g, '')}@call.excelprowashers.com`

    console.log(`📞 Syncing call: ${callerName} / ${callerPhone} / ${service}`)

    // AI qualification
    const qualifier = new AILeadQualifier()
    const result = await qualifier.qualifyLead({
      name: callerName, email, phone: callerPhone,
      service, message, address, propertyType: 'residential',
    })
    console.log(`📊 Score: ${result.score.overall}/100 (${result.score.category.toUpperCase()})`)

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
    } catch (e) { console.error('DB insert failed:', e); skipped++; continue }

    try {
      await leadQuotes.create({
        id:         `quote_call_${conv.conversation_id}`,
        request_id: requestId,
        title:      `Quote for ${service}`,
        items:      [{ description: service, quantity: 1, unitPrice: result.quote.total }],
        total:      result.quote.total,
        status:     'draft',
      })
    } catch (e) { console.error('Quote insert failed:', e) }

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
    } catch (e) { console.error('Lead routing failed:', e) }

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
    } catch (e) { console.error('AI log failed:', e) }

    console.log(`✅ Synced call lead: ${requestId}`)
    processed++
  }

  console.log(`📊 ElevenLabs sync complete: ${processed} new, ${skipped} skipped`)
  return NextResponse.json({ processed, skipped })
}
