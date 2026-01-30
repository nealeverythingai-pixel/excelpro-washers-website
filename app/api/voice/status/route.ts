import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callStatus = formData.get('CallStatus') as string;
    const duration = formData.get('CallDuration') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;

    // Log to console (database writes fail on Vercel's read-only filesystem)
    console.log(`[Call Status] ${callSid}: ${callStatus} - Duration: ${duration}s - From: ${from}`);

    // Try to log to database, but don't fail if it errors (Vercel serverless is read-only)
    try {
      const db = await readDb();
      const callLog = {
        id: Date.now().toString(),
        callSid,
        from,
        to,
        status: callStatus,
        duration: parseInt(duration) || 0,
        recordingUrl: recordingUrl || null,
        timestamp: new Date().toISOString(),
      };
      db.callLogs = db.callLogs || [];
      db.callLogs.push(callLog);
      await writeDb(db);
    } catch (dbError) {
      // Silently fail database writes in production (Vercel read-only filesystem)
      console.log('[Call Status] Database write skipped (read-only filesystem)');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Call status error:', error);
    return NextResponse.json({ error: 'Failed to log call status' }, { status: 500 });
  }
}
