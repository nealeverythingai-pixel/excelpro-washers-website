import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Cron Job: Check for Stale Leads
 * Runs daily at 6 PM
 * Identifies leads that haven't been contacted in 30+ days
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is from Vercel Cron (security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('⚠️ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Checking for stale leads...');

    const requests = await db.requests.getAll();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleLeads = requests.filter(req => {
      const createdDate = new Date(req.createdAt);
      return createdDate < thirtyDaysAgo && req.status === 'New';
    });

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
        createdAt: l.createdAt
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
