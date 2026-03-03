import { NextRequest, NextResponse } from 'next/server';
import { AILeadQualifier } from '@/lib/ai/LeadQualifier';
import { LeadRouter } from '@/lib/ai/LeadRouter';
import { NotificationService } from '@/lib/notifications/NotificationService';
import { leadRequests, leadQuotes, leadAIFeedback } from '@/lib/db/leads';

/**
 * POST /api/ai/qualify-lead
 * 
 * Receives lead data, qualifies with AI, stores in database
 * Returns: Lead score, personalized quote, next actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, email, phone, service, message, address, propertyType } = body;

    // Validate required fields
    if (!name || !email || !service || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize AI Lead Qualifier
    const qualifier = new AILeadQualifier();

    // Qualify the lead
    console.log('🤖 Qualifying lead:', name);
    const result = await qualifier.qualifyLead({
      name,
      email,
      phone,
      service,
      message,
      address,
      propertyType
    });

    console.log(`📊 Lead Score: ${result.score.overall}/100 (${result.score.category.toUpperCase()})`);

    // Store in Supabase with AI analysis
    const request_id = `req_${Date.now()}`;
    await leadRequests.create({
      id: request_id,
      name,
      email,
      phone: phone || '',
      service,
      message,
      status: 'new',
      ai_score: result.score.overall,
      ai_category: result.score.category,
      ai_reasoning: result.score.reasoning,
      estimated_value: result.score.estimatedValue
    });

    // Create quote in Supabase
    const quote_id = `quote_${Date.now()}`;
    await leadQuotes.create({
      id: quote_id,
      request_id: request_id,
      title: `Quote for ${service}`,
      items: [{
        description: service,
        quantity: 1,
        unitPrice: result.quote.total
      }],
      total: result.quote.total,
      status: 'draft',
    });

    console.log('✅ Lead qualified, quote generated:', quote_id);

    // Route lead — the Router is the single orchestrator for:
    //   notifications, customer emails, and follow-up scheduling
    try {
      await LeadRouter.routeLead({
        id: request_id,
        name,
        email,
        phone: phone || '',
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
    } catch (routingError) {
      console.error('Lead routing failed (non-critical):', routingError);
    }

    // Log AI decision for performance tracking (separate from routing)
    try {
      await NotificationService.logAIDecision({
        leadId: request_id,
        inputData: { name, email, phone, service, message, address },
        outputData: {
          score: result.score.overall,
          category: result.score.category,
          reasoning: result.score.reasoning,
          estimatedValue: result.score.estimatedValue,
          quote: result.quote.total
        }
      });
      console.log('📊 AI decision logged');
    } catch (logError) {
      console.error('AI decision log failed (non-critical):', logError);
    }

    // Return comprehensive result
    return NextResponse.json({
      success: true,
      leadId: request_id,
      quoteId: quote_id,
      score: result.score,
      quote: result.quote,
      followUp: result.followUpSchedule,
      nextAction: result.score.nextAction
    });

  } catch (error) {
    console.error('❌ Lead qualification error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to qualify lead',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/qualify-lead?requestId=xxx
 * 
 * Retrieve AI qualification for existing request
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'requestId parameter required' },
        { status: 400 }
      );
    }

    const leadRequest = await leadRequests.findById(requestId);

    if (!leadRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: leadRequest,
      score: {
        overall: leadRequest.ai_score || 0,
        category: leadRequest.ai_category || 'unknown',
        reasoning: leadRequest.ai_reasoning || 'Not analyzed',
        estimatedValue: leadRequest.estimated_value || 0
      }
    });

  } catch (error) {
    console.error('Error retrieving lead qualification:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve qualification' },
      { status: 500 }
    );
  }
}
