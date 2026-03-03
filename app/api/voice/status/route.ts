import { NextRequest, NextResponse } from 'next/server';
import { voiceConversations, voiceCallLogs } from '@/lib/db/voice';

// ── SMS helper for call summary ──────────────────────────────

async function sendCallSummaryToOwner(callSid: string, from: string, duration: string, transcript: { role: string; content: string }[]) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER || !process.env.OWNER_PHONE_NUMBER) return;
  if (!transcript || transcript.length === 0) return;

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    // Summarize the conversation (last few turns, max 400 chars for SMS)
    const summary = transcript
      .slice(-6) // Last 3 exchanges
      .map(m => `${m.role === 'user' ? '👤' : '🤖'} ${m.content}`)
      .join('\n')
      .substring(0, 400);

    const smsBody = `📞 Call Ended\nFrom: ${from}\nDuration: ${duration}s\nTurns: ${Math.ceil(transcript.length / 2)}\n\n${summary}`;

    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: process.env.OWNER_PHONE_NUMBER,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: smsBody,
      }),
    });
    console.log(`[Call Status] ✅ Call summary SMS sent for ${callSid}`);
  } catch (err) {
    console.error(`[Call Status] ❌ Failed to send summary SMS:`, err);
  }
}

// ── Main handler ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callStatus = formData.get('CallStatus') as string;
    const duration = formData.get('CallDuration') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;

    console.log(`[Call Status] ${callSid}: ${callStatus} - Duration: ${duration}s - From: ${from}`);

    // Load conversation transcript from Supabase
    let transcript: { role: 'user' | 'assistant'; content: string }[] | null = null;
    let bookingCreated = false;
    try {
      const conversation = await voiceConversations.get(callSid);
      if (conversation) {
        transcript = conversation.messages;
        bookingCreated = conversation.booking_saved || false;
      }
    } catch {
      // Non-critical
    }

    // Save/update call log in Supabase
    try {
      const existing = await voiceCallLogs.findByCallSid(callSid);
      if (existing) {
        await voiceCallLogs.update(callSid, {
          status: callStatus,
          duration: parseInt(duration) || 0,
          recording_url: recordingUrl || null,
          transcript,
          booking_created: bookingCreated,
        });
      } else {
        await voiceCallLogs.create({
          call_sid: callSid,
          caller_phone: from,
          to_phone: to,
          status: callStatus,
          duration: parseInt(duration) || 0,
          recording_url: recordingUrl || null,
          transcript,
          booking_created: bookingCreated,
        });
      }
      console.log(`[Call Status] ✅ Call log saved to Supabase for ${callSid}`);
    } catch (dbError) {
      console.error('[Call Status] ❌ Failed to save call log:', dbError);
    }

    // On call end: send summary SMS to owner and clean up conversation
    if (callStatus === 'completed' || callStatus === 'failed' || callStatus === 'no-answer') {
      if (transcript && transcript.length > 0) {
        sendCallSummaryToOwner(callSid, from, duration, transcript);
      }
      try {
        await voiceConversations.remove(callSid);
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Call status error:', error);
    return NextResponse.json({ error: 'Failed to log call status' }, { status: 500 });
  }
}
