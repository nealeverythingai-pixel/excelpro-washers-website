/**
 * POST /api/voice/status
 * Twilio call status callback. Logs call completion and sends summary SMS.
 */

import { Request, Response } from 'express';
import { voiceConversations, voiceCallLogs } from '../lib/voice-db';
import { sendSMS } from '../lib/sms';

export async function statusHandler(req: Request, res: Response) {
  try {
    const callSid = req.body.CallSid as string;
    const from = req.body.From as string;
    const to = req.body.To as string;
    const callStatus = req.body.CallStatus as string;
    const duration = req.body.CallDuration as string;
    const recordingUrl = req.body.RecordingUrl as string;

    console.log(`[Call Status] ${callSid}: ${callStatus} - Duration: ${duration}s - From: ${from}`);

    // Load conversation transcript
    let transcript: { role: string; content: string }[] | null = null;
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

    // Save/update call log
    try {
      const existing = await voiceCallLogs.findByCallSid(callSid);
      if (existing) {
        await voiceCallLogs.update(callSid, {
          status: callStatus,
          duration: parseInt(duration) || 0,
          recording_url: recordingUrl || null,
          transcript: transcript as any,
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
          transcript: transcript as any,
          booking_created: bookingCreated,
        });
      }
      console.log(`[Call Status] ✅ Call log saved for ${callSid}`);
    } catch (dbError) {
      console.error('[Call Status] ❌ Failed to save call log:', dbError);
    }

    // On call end: send summary SMS + clean up conversation
    if (callStatus === 'completed' || callStatus === 'failed' || callStatus === 'no-answer') {
      if (transcript && transcript.length > 0) {
        const ownerPhone = process.env.OWNER_PHONE_NUMBER;
        if (ownerPhone) {
          const summary = transcript
            .slice(-6)
            .map(m => `${m.role === 'user' ? '👤' : '🤖'} ${m.content}`)
            .join('\n')
            .substring(0, 400);

          sendSMS(
            ownerPhone,
            `📞 Call Ended\nFrom: ${from}\nDuration: ${duration}s\nTurns: ${Math.ceil(transcript.length / 2)}\n\n${summary}`
          );
        }
      }

      // Clean up conversation record
      try {
        await voiceConversations.remove(callSid);
      } catch {
        // Non-critical
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Status] Error:', error);
    res.status(500).json({ error: 'Failed to log call status' });
  }
}
