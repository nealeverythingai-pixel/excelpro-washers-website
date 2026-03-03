import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/admin/ai-performance
 * 
 * Returns comprehensive AI performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const requests = await db.requests.getAll();
    
    // Filter leads that have been AI-qualified
    const qualifiedLeads = requests.filter(r => r.aiScore !== undefined);
    
    // Calculate metrics
    const totalLeads = qualifiedLeads.length;
    
    // Get feedback data
    const aiFeedback = await db.aiFeedback?.getAll() || [];
    const leadFeedback = aiFeedback.filter(f => f.agentType === 'lead-qualifier');
    
    // Calculate accuracy rate based on feedback
    const feedbackWithOutcome = leadFeedback.filter(f => f.actualOutcome !== 'pending');
    const accurateDecisions = feedbackWithOutcome.filter(f => f.actualOutcome === 'success').length;
    const accuracyRate = feedbackWithOutcome.length > 0
      ? Math.round((accurateDecisions / feedbackWithOutcome.length) * 100)
      : 0;
    
    // Average score
    const averageScore = totalLeads > 0
      ? Math.round(qualifiedLeads.reduce((sum, l) => sum + (l.aiScore || 0), 0) / totalLeads)
      : 0;
    
    // Category breakdown
    const categoryBreakdown = {
      hot: qualifiedLeads.filter(l => l.aiCategory === 'hot').length,
      warm: qualifiedLeads.filter(l => l.aiCategory === 'warm').length,
      cold: qualifiedLeads.filter(l => l.aiCategory === 'cold').length,
    };
    
    // Conversion rates by category
    const calculateConversionRate = (category: string) => {
      const categoryLeads = qualifiedLeads.filter(l => l.aiCategory === category);
      if (categoryLeads.length === 0) return 0;
      
      const converted = categoryLeads.filter(l => l.status === 'Converted').length;
      return Math.round((converted / categoryLeads.length) * 100);
    };
    
    const conversionRates = {
      hot: calculateConversionRate('hot'),
      warm: calculateConversionRate('warm'),
      cold: calculateConversionRate('cold'),
    };
    
    // Recent decisions (last 20)
    const recentDecisions = qualifiedLeads
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
      .map(lead => {
        // Find feedback for this lead
        const feedback = leadFeedback.find(f => 
          f.inputData?.email === lead.email || 
          f.metadata?.leadId === lead.id
        );
        
        return {
          id: lead.id,
          timestamp: lead.createdAt,
          leadName: lead.name || `${lead.firstName} ${lead.lastName}`,
          aiScore: lead.aiScore || 0,
          aiCategory: lead.aiCategory || 'unknown',
          aiReasoning: lead.aiReasoning || 'No reasoning provided',
          estimatedValue: lead.estimatedValue || 0,
          actualOutcome: lead.status === 'Converted' ? 'converted' as const :
                        lead.status === 'Lost' ? 'lost' as const :
                        'pending' as const,
          feedback: feedback?.userFeedback as 'accurate' | 'inaccurate' | undefined
        };
      });
    
    return NextResponse.json({
      totalLeads,
      accuracyRate,
      averageScore,
      categoryBreakdown,
      conversionRates,
      recentDecisions
    });

  } catch (error) {
    console.error('Error fetching AI performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI performance data' },
      { status: 500 }
    );
  }
}
