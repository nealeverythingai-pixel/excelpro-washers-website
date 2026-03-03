import { NextResponse } from 'next/server';
import { subscribers, campaigns } from '@/lib/db/subscribers';

/**
 * GET /api/admin/email-marketing
 * Returns subscriber list, campaign history, and stats.
 */
export async function GET() {
  try {
    const [allSubscribers, allCampaigns, stats] = await Promise.all([
      subscribers.getAll(),
      campaigns.getAll(),
      subscribers.getStats(),
    ]);

    return NextResponse.json({
      subscribers: allSubscribers,
      campaigns: allCampaigns,
      stats,
    });
  } catch (error) {
    console.error('Email marketing data error:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
