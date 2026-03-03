import { NextRequest, NextResponse } from 'next/server';
import { AILeadQualifier } from '@/lib/ai/LeadQualifier';
import { LeadRouter } from '@/lib/ai/LeadRouter';
import { NotificationService } from '@/lib/notifications/NotificationService';
import { leadRequests, leadQuotes } from '@/lib/db/leads';
import { subscribers } from '@/lib/db/subscribers';

/**
 * POST /api/contact
 * 
 * Enhanced contact form — qualifies leads directly (no self-fetch)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📧 New contact form submission:', body);

    const name = `${body.firstName} ${body.lastName}`.trim();
    const email = body.email;
    const phone = body.phone || '';
    const service = Array.isArray(body.services) ? body.services.join(', ') : (body.service || body.services || 'window-cleaning');
    const message = body.details || body.message || '';
    const address = body.address || '';

    // 1. AI Lead Qualification (direct import — no HTTP self-fetch)
    const qualifier = new AILeadQualifier();
    const result = await qualifier.qualifyLead({
      name,
      email,
      phone,
      service,
      message,
      address,
      propertyType: 'residential'
    });

    console.log(`📊 Lead Score: ${result.score.overall}/100 (${result.score.category.toUpperCase()})`);

    // 2. Store in Supabase
    const requestId = `req_${Date.now()}`;
    await leadRequests.create({
      id: requestId,
      name,
      first_name: body.firstName || '',
      last_name: body.lastName || '',
      email,
      phone,
      address,
      service,
      message,
      status: 'new',
      ai_score: result.score.overall,
      ai_category: result.score.category,
      ai_reasoning: result.score.reasoning,
      estimated_value: result.score.estimatedValue,
    });

    // 3. Create quote in Supabase
    const quoteId = `quote_${Date.now()}`;
    await leadQuotes.create({
      id: quoteId,
      request_id: requestId,
      title: `Quote for ${service}`,
      items: [{ description: service, quantity: 1, unitPrice: result.quote.total }],
      total: result.quote.total,
      status: 'draft',
    });

    // 4. Route lead — the Router is the single orchestrator for:
    //    - Owner notifications (SMS + email + Slack)
    //    - Customer emails (quote or educational)
    //    - Follow-up scheduling
    try {
      await LeadRouter.routeLead({
        id: requestId,
        name,
        email,
        phone,
        service,
        details: message,
        message,
        score: result.score.overall,
        category: result.score.category,
        estimatedValue: result.score.estimatedValue,
        reasoning: result.score.reasoning,
        quoteTotal: result.quote.total,
        address,
      });
    } catch (routeErr) {
      console.error('Lead routing failed (non-critical):', routeErr);
    }

    // 5. Log AI decision for performance tracking
    try {
      await NotificationService.logAIDecision({
        leadId: requestId,
        inputData: { name, email, phone, service, message, address },
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

    // 6. Auto-subscribe if user gave marketing consent
    if (body.marketingConsent) {
      try {
        await subscribers.subscribe({ email, name, source: 'contact-form' });
        console.log('📬 Subscribed to newsletter via contact form');
      } catch (subErr) {
        console.error('Newsletter subscribe failed (non-critical):', subErr);
      }
    }

    console.log('✅ Lead qualified, quote generated, notifications sent');

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your personalized quote has been sent.',
      quote: result.quote,
      leadId: requestId,
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
