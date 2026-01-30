import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WarmLeadSequence } from '@/lib/ai/WarmLeadSequence';
import { ColdLeadSequence } from '@/lib/ai/ColdLeadSequence';
import { isRateLimited, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

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

    // Get all pending follow-ups from database
    const pendingFollowUps = await db.scheduledFollowUps?.getAll() || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    for (const followUp of pendingFollowUps) {
      // Skip if not due yet
      const scheduledDate = new Date(followUp.scheduledFor);
      if (scheduledDate > today) continue;

      // Skip if already completed
      if (followUp.completed) continue;

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
          // Mark as completed
          await db.scheduledFollowUps?.update(followUp.id, { 
            completed: true,
            completedAt: new Date().toISOString()
          });
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
