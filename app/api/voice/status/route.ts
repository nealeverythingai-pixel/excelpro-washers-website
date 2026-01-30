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

    // Log call details to database
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

    console.log(`[Call Status] ${callSid}: ${callStatus} - Duration: ${duration}s`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Call status error:', error);
    return NextResponse.json({ error: 'Failed to log call status' }, { status: 500 });
  }
}
