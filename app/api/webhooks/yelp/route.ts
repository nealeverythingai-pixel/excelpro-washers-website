/**
 * POST /api/webhooks/yelp
 *
 * Inbound webhook for Yelp leads.
 * Accepts leads from:
 *   - Zapier (Yelp "Request a Quote" → Zapier Webhook → here)
 *   - Make / n8n
 *   - Email parser forwarding Yelp notification emails
 *   - Direct API call (e.g. from admin or AI Advisor)
 *
 * Flow: validate → normalize → AILeadQualifier → LeadRouter (full funnel)
 */

import { NextRequest, NextResponse } from 'next/server';
import { AILeadQualifier } from '@/lib/ai/LeadQualifier';
import { LeadRouter } from '@/lib/ai/LeadRouter';
import { NotificationService } from '@/lib/notifications/NotificationService';
import { leadRequests, leadQuotes } from '@/lib/db/leads';
import { subscribers } from '@/lib/db/subscribers';

const YELP_WEBHOOK_SECRET = process.env.YELP_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth: verify webhook secret ──────────────────────────────
    const authHeader = request.headers.get('authorization') || '';
    const querySecret = request.nextUrl.searchParams.get('secret') || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const providedSecret = bearerToken || querySecret;

    if (!YELP_WEBHOOK_SECRET) {
      console.error('❌ YELP_WEBHOOK_SECRET not set — rejecting Yelp webhook');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }

    if (providedSecret !== YELP_WEBHOOK_SECRET) {
      console.warn('⚠️  Yelp webhook: invalid secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Parse & normalize payload ────────────────────────────────
    const body = await request.json();
    console.log('📥 Yelp webhook received:', JSON.stringify(body).slice(0, 500));

    // Flexible field mapping — handles Zapier, raw Yelp email parse, or manual
    const firstName = body.first_name || body.firstName || body.name?.split(' ')[0] || 'Yelp';
    const lastName = body.last_name || body.lastName || body.name?.split(' ').slice(1).join(' ') || 'Lead';
    const name = `${firstName} ${lastName}`.trim();
    const email = body.email || body.consumer_email || '';
    const phone = body.phone || body.consumer_phone || '';
    const message = body.message || body.description || body.request_details || body.text || '';
    const address = body.address || body.location || '';
    const service = normalizeYelpService(body.service || body.category || body.service_category || message);

    // Basic validation
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'At least an email or phone is required' },
        { status: 400 }
      );
    }

    // Duplicate guard: check if same email was submitted in last 24 hours
    const existing = await leadRequests.getAll();
    const recentDuplicate = existing.find(
      (r) =>
        r.email === email &&
        r.source === 'yelp' &&
        Date.now() - new Date(r.created_at).getTime() < 24 * 60 * 60 * 1000
    );
    if (recentDuplicate) {
      console.log(`⏭️  Duplicate Yelp lead skipped: ${email} (submitted ${recentDuplicate.created_at})`);
      return NextResponse.json({
        success: true,
        message: 'Duplicate lead — already in pipeline',
        leadId: recentDuplicate.id,
      });
    }

    // ── 3. AI Lead Qualification ────────────────────────────────────
    const qualifier = new AILeadQualifier();
    const result = await qualifier.qualifyLead({
      name,
      email,
      phone,
      service,
      message: `[YELP LEAD] ${message}`,
      address,
      propertyType: 'residential',
    });

    console.log(`📊 Yelp Lead Score: ${result.score.overall}/100 (${result.score.category.toUpperCase()})`);

    // ── 4. Store in Supabase ────────────────────────────────────────
    const requestId = `yelp_${Date.now()}`;
    await leadRequests.create({
      id: requestId,
      name,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      address,
      service,
      message: `[YELP] ${message}`,
      status: 'new',
      ai_score: result.score.overall,
      ai_category: result.score.category,
      ai_reasoning: result.score.reasoning,
      estimated_value: result.score.estimatedValue,
      source: 'yelp',
    });

    // Create quote
    const quoteId = `quote_yelp_${Date.now()}`;
    await leadQuotes.create({
      id: quoteId,
      request_id: requestId,
      title: `Yelp Quote — ${service}`,
      items: [{ description: service, quantity: 1, unitPrice: result.quote.total }],
      total: result.quote.total,
      status: 'draft',
    });

    // ── 5. Route through full funnel ────────────────────────────────
    try {
      await LeadRouter.routeLead({
        id: requestId,
        name,
        email,
        phone,
        service,
        details: `[YELP LEAD] ${message}`,
        message: `[YELP LEAD] ${message}`,
        score: result.score.overall,
        category: result.score.category,
        estimatedValue: result.score.estimatedValue,
        reasoning: result.score.reasoning,
        quoteTotal: result.quote.total,
        address,
      });
    } catch (routeErr) {
      console.error('Yelp lead routing failed (non-critical):', routeErr);
    }

    // ── 6. Log AI decision ──────────────────────────────────────────
    try {
      await NotificationService.logAIDecision({
        leadId: requestId,
        inputData: { name, email, phone, service, message, address, source: 'yelp' },
        outputData: {
          score: result.score.overall,
          category: result.score.category,
          reasoning: result.score.reasoning,
          estimatedValue: result.score.estimatedValue,
          quote: result.quote.total,
        },
      });
    } catch (logErr) {
      console.error('AI decision log failed (non-critical):', logErr);
    }

    console.log(`✅ Yelp lead processed: ${name} (${email}) → ${result.score.category.toUpperCase()} [${result.score.overall}/100]`);

    return NextResponse.json({
      success: true,
      message: 'Yelp lead processed and routed through funnel',
      leadId: requestId,
      score: result.score.overall,
      category: result.score.category,
      estimatedValue: result.score.estimatedValue,
      quoteTotal: result.quote.total,
    });
  } catch (error) {
    console.error('❌ Yelp webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process Yelp lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Map Yelp service categories to our internal service slugs
 */
function normalizeYelpService(raw: string): string {
  const text = (raw || '').toLowerCase();

  if (text.includes('window')) return 'window-cleaning';
  if (text.includes('gutter')) return 'gutter-cleaning';
  if (text.includes('roof')) return 'roof-cleaning';
  if (text.includes('soft') || text.includes('house wash') || text.includes('siding')) return 'soft-wash';
  if (text.includes('pressure') || text.includes('power wash') || text.includes('driveway') || text.includes('deck') || text.includes('patio')) return 'pressure-washing';

  // Default for general "exterior cleaning" Yelp category
  return 'pressure-washing';
}
