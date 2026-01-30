import { NextRequest, NextResponse } from 'next/server';
import { AILeadQualifier } from '@/lib/ai/LeadQualifier';
import { db } from '@/lib/db';
import { LeadRouter } from '@/lib/ai/LeadRouter';

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

    // Store in database with AI analysis
    const request_id = `req_${Date.now()}`;
    await db.requests.create({
      id: request_id,
      name,
      email,
      phone: phone || '',
      service,
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
      // Add AI scoring data
      aiScore: result.score.overall,
      aiCategory: result.score.category,
      aiReasoning: result.score.reasoning,
      estimatedValue: result.score.estimatedValue
    });

    // Route lead to appropriate automation (Hot/Warm/Cold)
    try {
      await LeadRouter.routeLead({
        id: request_id,
        name,
        email,
        phone: phone || '',
        service,
        details: message,
        score: result.score.overall,
        category: result.score.category,
        estimatedValue: result.score.estimatedValue,
      });
    } catch (routingError) {
      console.error('Lead routing failed (non-critical):', routingError);
      // Don't fail the request if automation fails
    }

    // Create quote automatically
    const quote_id = `quote_${Date.now()}`;
    await db.quotes.create({
      clientId: request_id, // Link to request
      title: `Quote for ${service}`,
      items: [{
        description: service,
        quantity: 1,
        unitPrice: result.quote.total
      }],
      total: result.quote.total,
      status: 'Draft',
    });

    console.log('✅ Lead qualified, quote generated:', quote_id);

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

    const leadRequest = await db.requests.findById(requestId);

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
        overall: leadRequest.aiScore || 0,
        category: leadRequest.aiCategory || 'unknown',
        reasoning: leadRequest.aiReasoning || 'Not analyzed',
        estimatedValue: leadRequest.estimatedValue || 0
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
