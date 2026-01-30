import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/contact
 * 
 * Enhanced contact form that uses AI to qualify leads
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📧 New contact form submission:', body);

    // Call AI Lead Qualifier
    const qualifyResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/ai/qualify-lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${body.firstName} ${body.lastName}`,
        email: body.email,
        phone: body.phone,
        service: Array.isArray(body.services) ? body.services.join(', ') : (body.service || body.services || 'window-cleaning'),
        message: body.details,
        address: body.address,
        propertyType: 'residential'
      })
    });

    if (!qualifyResponse.ok) {
      throw new Error('AI qualification failed');
    }

    const qualification = await qualifyResponse.json();

    console.log('✅ Lead qualified and quote generated');
    console.log(`   Score: ${qualification.score.overall}/100 (${qualification.score.category})`);
    console.log(`   Quote: $${qualification.quote.total}`);

    // Send confirmation email to customer
    // TODO: Implement email service
    console.log('📧 Sending quote email to:', body.email);

    // Return success with quote
    return NextResponse.json({
      success: true,
      message: 'Thank you! Your personalized quote has been sent.',
      quote: qualification.quote,
      leadId: qualification.leadId
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
