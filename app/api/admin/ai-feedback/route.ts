import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/admin/ai-feedback
 * 
 * Submit feedback on AI lead qualification accuracy
 */
export async function POST(request: NextRequest) {
  try {
    const { leadId, feedback } = await request.json();

    if (!leadId || !feedback) {
      return NextResponse.json(
        { error: 'leadId and feedback are required' },
        { status: 400 }
      );
    }

    if (feedback !== 'accurate' && feedback !== 'inaccurate') {
      return NextResponse.json(
        { error: 'feedback must be "accurate" or "inaccurate"' },
        { status: 400 }
      );
    }

    // Find the lead request
    const lead = await db.requests.findById(leadId);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Check if feedback already exists for this lead
    const existingFeedback = (await db.aiFeedback?.getAll() || [])
      .find(f => f.metadata?.leadId === leadId);

    if (existingFeedback) {
      // Update existing feedback
      await db.aiFeedback?.update(existingFeedback.id, {
        userFeedback: feedback,
        actualOutcome: feedback === 'accurate' ? 'success' : 'failure',
        metadata: {
          ...existingFeedback.metadata,
          updatedAt: new Date().toISOString()
        }
      });

      console.log(`✅ Updated AI feedback for lead ${leadId}: ${feedback}`);

      return NextResponse.json({
        success: true,
        message: 'Feedback updated successfully',
        feedbackId: existingFeedback.id
      });
    }

    // Create new feedback entry
    const feedbackEntry = await db.aiFeedback?.create({
      agentType: 'lead-qualifier',
      inputData: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        service: lead.service,
        message: lead.message
      },
      outputData: {
        score: lead.aiScore || 0,
        category: lead.aiCategory || 'unknown',
        reasoning: lead.aiReasoning || '',
        estimatedValue: lead.estimatedValue || 0
      },
      actualOutcome: feedback === 'accurate' ? 'success' : 'failure',
      userFeedback: feedback,
      metadata: {
        leadId: leadId,
        feedbackProvidedAt: new Date().toISOString()
      }
    });

    console.log(`✅ Created AI feedback for lead ${leadId}: ${feedback}`);

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedbackEntry?.id
    });

  } catch (error) {
    console.error('Error submitting AI feedback:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to submit feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
