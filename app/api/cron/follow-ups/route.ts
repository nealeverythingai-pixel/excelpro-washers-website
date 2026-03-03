import { NextRequest, NextResponse } from 'next/server';
import { leadFollowUps } from '@/lib/db/leads';
import { WarmLeadSequence } from '@/lib/ai/WarmLeadSequence';
import { ColdLeadSequence } from '@/lib/ai/ColdLeadSequence';
import { isRateLimited, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * Cron Job: Execute Pending Follow-ups
 * Runs daily at 9 AM
 * Vercel Cron: GET /api/cron/follow-ups
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting: Max 5 requests per minute per IP
    const clientIp = getClientIp(request);
    if (isRateLimited(`cron-followups-${clientIp}`, 5, 60 * 1000)) {
      return rateLimitResponse(60);
    }

    // Verify this is from Vercel Cron (security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('⚠️ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Starting daily follow-up check...');

    // Get all pending follow-ups from Supabase
    const pendingFollowUps = await leadFollowUps.getPending();
    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    for (const followUp of pendingFollowUps) {
      processed++;

      try {
        // Execute the follow-up based on type
        let success = false;

        if (followUp.category === 'warm') {
          success = await WarmLeadSequence.executeFollowUp(followUp);
        } else if (followUp.category === 'cold') {
          success = await ColdLeadSequence.executeFollowUp(followUp);
        }

        if (success) {
          // Mark as completed in Supabase
          await leadFollowUps.markCompleted(followUp.id);
          succeeded++;
          console.log(`  ✅ Executed follow-up ${followUp.id}`);
        } else {
          failed++;
          console.error(`  ❌ Failed follow-up ${followUp.id}`);
        }
      } catch (error) {
        failed++;
        console.error(`  ❌ Error executing follow-up ${followUp.id}:`, error);
      }
    }

    console.log(`\n📊 Follow-up execution complete:`);
    console.log(`   Processed: ${processed}`);
    console.log(`   Succeeded: ${succeeded}`);
    console.log(`   Failed: ${failed}`);

    return NextResponse.json({
      success: true,
      processed,
      succeeded,
      failed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
