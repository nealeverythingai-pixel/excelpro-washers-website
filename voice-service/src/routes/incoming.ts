/**
 * POST /api/voice/incoming
 * Twilio webhook for incoming phone calls.
 * Returns TwiML greeting with speech/DTMF gather.
 */

import { Request, Response } from 'express';
import twilio from 'twilio';
import { getElevenLabs } from '../lib/clients';

const VoiceResponse = twilio.twiml.VoiceResponse;

function getBaseUrl(): string {
  return process.env.VOICE_SERVICE_URL || process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${process.env.PORT || 3001}`;
}

/** Speak text via ElevenLabs (if available) or Twilio Polly TTS */
function speakInGather(gather: any, text: string, baseUrl: string) {
  if (getElevenLabs()) {
    gather.play(`${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(text)}`);
  } else {
    gather.say({ voice: 'Polly.Joanna', language: 'en-US' }, text);
  }
}

function speakText(twiml: any, text: string, baseUrl: string) {
  if (getElevenLabs()) {
    twiml.play(`${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(text)}`);
  } else {
    twiml.say({ voice: 'Polly.Joanna', language: 'en-US' }, text);
  }
}

export function incomingHandler(req: Request, res: Response) {
  try {
    const baseUrl = getBaseUrl();

    // Track retry count to prevent infinite loop
    const retryCount = parseInt(req.query.retry as string || '0', 10);

    const twiml = new VoiceResponse();

    if (retryCount >= 2) {
      // Max retries — offer voicemail
      speakText(
        twiml,
        "It seems like you may be busy. If you'd like to leave a message, please do so after the beep. Otherwise, feel free to call us back anytime.",
        baseUrl
      );
      twiml.record({
        maxLength: 120,
        transcribe: true,
        playBeep: true,
        action: `${baseUrl}/api/voice/status`,
      });
      speakText(twiml, 'Thanks for calling ExcelPro Washers. Goodbye!', baseUrl);
      twiml.hangup();

      res.type('text/xml').send(twiml.toString());
      return;
    }

    // Greeting
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

    res.type('text/xml').send(twiml.toString());
  } catch (error) {
    console.error('[Incoming] Error:', error);
    const twiml = new VoiceResponse();
    twiml.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      'Thank you for calling ExcelPro Washers. We are temporarily unable to take your call. Please try again shortly or visit us at excelprowashers.com.'
    );
    twiml.hangup();
    res.type('text/xml').send(twiml.toString());
  }
}
