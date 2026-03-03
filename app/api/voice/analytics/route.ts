import { NextResponse } from 'next/server';
import { voiceCallLogs, voiceBookings } from '@/lib/db/voice';

export async function GET() {
  try {
    const [stats, bookings] = await Promise.all([
      voiceCallLogs.getStats(),
      voiceBookings.getAll(50),
    ]);

    return NextResponse.json({
      stats,
      bookings,
    });
  } catch (error) {
    console.error('Call analytics API error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
