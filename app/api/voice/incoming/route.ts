import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

/** Speak text via ElevenLabs or Twilio TTS */
function speakText(twiml: any, text: string, baseUrl: string) {
  if (process.env.ELEVENLABS_API_KEY) {
    twiml.play(`${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(text)}`);
  } else {
    twiml.say({ voice: 'Polly.Joanna', language: 'en-US' }, text);
  }
}

function speakInGather(gather: any, text: string, baseUrl: string) {
  if (process.env.ELEVENLABS_API_KEY) {
    gather.play(`${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(text)}`);
  } else {
    gather.say({ voice: 'Polly.Joanna', language: 'en-US' }, text);
  }
}

export async function POST(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelprowashers.com';

    // ── Track retry count via query param to prevent infinite loop ──
    const retryParam = request.nextUrl.searchParams.get('retry');
    const retryCount = retryParam ? parseInt(retryParam, 10) : 0;

    const twiml = new VoiceResponse();

    if (retryCount >= 2) {
      // Max retries reached — offer voicemail and hang up
      speakText(twiml, "It seems like you may be busy. If you'd like to leave a message, please do so after the beep. Otherwise, feel free to call us back anytime.", baseUrl);
      twiml.record({
        maxLength: 120,
        transcribe: true,
        playBeep: true,
        action: `${baseUrl}/api/voice/status`,
      });
      speakText(twiml, 'Thanks for calling ExcelPro Washers. Goodbye!', baseUrl);
      twiml.hangup();
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // ── First contact or retry ──────────────────────────────
    const greeting = retryCount === 0
      ? 'Hello! Thank you for calling ExcelPro Washers. How can I help you today?'
      : "I'm still here whenever you're ready. You can ask about our services, pricing, or schedule an appointment.";

    const gather = twiml.gather({
      input: ['speech', 'dtmf'],
      action: `${baseUrl}/api/voice/respond`,
      method: 'POST',
      speechTimeout: '3',
      numDigits: 1,
      language: 'en-US',
      hints: 'window cleaning, pressure washing, gutter cleaning, appointment, pricing, schedule, estimate, quote',
    });

    speakInGather(gather, greeting, baseUrl);

    // No input → retry with incremented counter
    twiml.redirect(`${baseUrl}/api/voice/incoming?retry=${retryCount + 1}`);

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Voice incoming error:', error);
    const twiml = new VoiceResponse();
    twiml.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      'Thank you for calling ExcelPro Washers. We are temporarily unable to take your call. Please try again shortly or visit us at excelprowashers.com.'
    );
    twiml.hangup();
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
