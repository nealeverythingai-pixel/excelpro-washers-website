import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Request as LeadRequest } from '@/lib/types';

/**
 * GET /api/admin/leads
 * 
 * Retrieve all leads with AI qualification data
 */
export async function GET(request: NextRequest) {
  try {
    // Get all requests from database
    const allRequests = await db.requests.getAll();
    
    // Sort by date (newest first) and AI score (highest first)
    const sortedLeads = allRequests.sort((a: LeadRequest, b: LeadRequest) => {
      // First sort by score if both have scores
      if (a.aiScore && b.aiScore && a.aiScore !== b.aiScore) {
        return b.aiScore - a.aiScore;
      }
      // Then sort by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      leads: sortedLeads,
      total: sortedLeads.length,
      stats: {
        hot: sortedLeads.filter((l: LeadRequest) => l.aiCategory === 'hot').length,
        warm: sortedLeads.filter((l: LeadRequest) => l.aiCategory === 'warm').length,
        cold: sortedLeads.filter((l: LeadRequest) => l.aiCategory === 'cold').length,
      }
    });

  } catch (error) {
    console.error('❌ Failed to fetch leads:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch leads',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
