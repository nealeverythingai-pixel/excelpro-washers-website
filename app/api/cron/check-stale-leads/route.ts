import { NextRequest, NextResponse } from 'next/server';
import { leadRequests } from '@/lib/db/leads';
import { isRateLimited, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * Cron Job: Check for Stale Leads
 * Runs daily at 6 PM
 * Finds leads older than 30 days that haven't been contacted
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting: Max 5 requests per minute per IP
    const clientIp = getClientIp(request);
    if (isRateLimited(`cron-stale-${clientIp}`, 5, 60 * 1000)) {
      return rateLimitResponse(60);
    }

    // Verify this is from Vercel Cron (security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('⚠️ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Checking for stale leads...');

    // Supabase query finds leads older than 30 days with status 'new'
    const staleLeads = await leadRequests.getStale(30);

    if (staleLeads.length > 0) {
      console.log(`⚠️ Found ${staleLeads.length} stale leads:`);
      staleLeads.forEach(lead => {
        console.log(`   - ${lead.name} (${lead.email}) - ${lead.status}`);
      });

      // TODO: Send admin notification about stale leads
      // await notifyStaleLeads(staleLeads);
    } else {
      console.log('✅ No stale leads found');
    }

    return NextResponse.json({
      success: true,
      staleLeads: staleLeads.length,
      leads: staleLeads.map(l => ({
        id: l.id,
        name: l.name,
        email: l.email,
        createdAt: l.created_at
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Stale leads check error:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
