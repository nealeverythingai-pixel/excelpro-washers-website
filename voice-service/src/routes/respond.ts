/**
 * POST /api/voice/respond
 * Processes caller speech using Claude AI, generates conversational response.
 * This is the most latency-sensitive route — benefits hugely from persistent connections.
 */

import { Request, Response } from 'express';
import twilio from 'twilio';
import { getAnthropic, getElevenLabs } from '../lib/clients';
import { voiceConversations, voiceBookings, ConversationMessage } from '../lib/voice-db';
import { sendSMS } from '../lib/sms';

const VoiceResponse = twilio.twiml.VoiceResponse;

function getBaseUrl(): string {
  return process.env.VOICE_SERVICE_URL || process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${process.env.PORT || 3001}`;
}

// ── TTS helpers ──────────────────────────────────────────────

function speakText(twiml: any, text: string, baseUrl: string) {
  if (getElevenLabs()) {
    twiml.play(`${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(text)}`);
  } else {
    twiml.say({ voice: 'Polly.Joanna', language: 'en-US' }, text);
  }
}

function speakInGather(gather: any, text: string, baseUrl: string) {
  if (getElevenLabs()) {
    gather.play(`${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(text)}`);
  } else {
    gather.say({ voice: 'Polly.Joanna', language: 'en-US' }, text);
  }
}

// ── Business hours ───────────────────────────────────────────

function getBusinessHoursContext(): string {
  const now = new Date();
  const ottawaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Toronto' }));
  const day = ottawaTime.getDay();
  const hour = ottawaTime.getHours();

  const isOpen = day >= 1 && day <= 6 && hour >= 8 && hour < 18;
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
  const timeStr = ottawaTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return isOpen
    ? `CURRENT STATUS: It's ${dayName} ${timeStr} — you are OPEN right now.`
    : `CURRENT STATUS: It's ${dayName} ${timeStr} — you are CLOSED right now. Let callers know we're closed but you're happy to take their info and someone will call them back during business hours (Mon-Sat, 8 AM - 6 PM).`;
}

// ── System prompt ────────────────────────────────────────────

const RECEPTIONIST_PROMPT = `You are a friendly, professional receptionist for ExcelPro Washers, a window and exterior cleaning company. You are answering the phone.

BUSINESS INFO:
- Services: window cleaning (interior & exterior), pressure washing (driveways, decks, siding), gutter cleaning, commercial building washing
- Pricing: residential jobs start around $150, commercial jobs are quoted individually after a free estimate
- Service area: Ottawa and surrounding areas (Kanata, Orleans, Barrhaven, Nepean, Gloucester)
- Hours: Monday through Saturday, 8 AM to 6 PM Eastern Time
- Booking: collect their info and someone from the team will call back to schedule

CONVERSATION RULES:
- Keep every response under 2 sentences. Sound warm, natural, and human.
- NEVER repeat a question you already asked. Check the conversation history before responding.
- If they want to book or get an estimate, collect these ONE AT A TIME in this order:
  1. Their name
  2. Their phone number (or confirm the one they called from)
  3. What service they need
- Once you have ALL THREE, respond with EXACTLY this format (include the markers):
  "Great, I've got you down! [BOOKING: name=Their Name, phone=Their Phone, service=Their Service]. Someone from our team will call you back shortly to schedule. Is there anything else I can help with?"
- If they ask about specific pricing for a job, don't make up numbers — offer a free estimate instead.
- If they want to speak with someone directly, say: "Sure, let me transfer you now."
- If they want to leave a message, say: "Of course, go ahead and leave your message after the tone."
- If you don't know something, say you'll have someone call them back.

IMPORTANT: The [BOOKING: ...] marker is critical — it's how the system knows to save the appointment. Always include it when you have all 3 pieces of info.`;

// ── Booking extractor ────────────────────────────────────────

interface BookingInfo {
  name: string;
  phone: string;
  service: string;
}

function extractBooking(text: string): BookingInfo | null {
  const match = text.match(/\[BOOKING:\s*name=([^,]+),\s*phone=([^,]+),\s*service=([^\]]+)\]/i);
  if (!match) return null;
  return { name: match[1].trim(), phone: match[2].trim(), service: match[3].trim() };
}

function cleanForSpeech(text: string): string {
  return text.replace(/\[BOOKING:[^\]]+\]/gi, '').replace(/\s{2,}/g, ' ').trim();
}

// ── Main handler ─────────────────────────────────────────────

export async function respondHandler(req: Request, res: Response) {
  try {
    const speechResult = req.body.SpeechResult as string;
    const callSid = req.body.CallSid as string;
    const callerPhone = req.body.From as string || 'unknown';
    const baseUrl = getBaseUrl();

    // No speech detected
    if (!speechResult) {
      const twiml = new VoiceResponse();
      speakText(twiml, "Sorry, I didn't catch that. Could you say that again?", baseUrl);
      twiml.redirect(`${baseUrl}/api/voice/incoming`);
      res.type('text/xml').send(twiml.toString());
      return;
    }

    // ── Load conversation history ─────────────────────────
    let conversation = await voiceConversations.get(callSid);
    if (!conversation) {
      conversation = {
        call_sid: callSid,
        messages: [],
        caller_phone: callerPhone,
        booking_saved: false,
        started_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      };
    }

    conversation.messages.push({ role: 'user', content: speechResult });
    conversation.last_activity = new Date().toISOString();

    // ── Call Claude AI (persistent client = fast) ─────────
    const anthropic = getAnthropic();
    const systemPrompt = RECEPTIONIST_PROMPT + '\n\n' + getBusinessHoursContext();

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemPrompt,
      messages: conversation.messages as { role: 'user' | 'assistant'; content: string }[],
    });

    const aiResponse = message.content[0].type === 'text'
      ? message.content[0].text
      : "I'm sorry, could you say that one more time?";

    conversation.messages.push({ role: 'assistant', content: aiResponse });

    const turn = Math.ceil(conversation.messages.length / 2);
    console.log(`[Call ${callSid}] Turn ${turn} | Caller: ${speechResult}`);
    console.log(`[Call ${callSid}] Turn ${turn} | AI: ${aiResponse}`);

    // ── Check for booking ─────────────────────────────────
    const booking = extractBooking(aiResponse);
    if (booking && !conversation.booking_saved) {
      conversation.booking_saved = true;

      // Save booking to Supabase
      try {
        await voiceBookings.create({
          call_sid: callSid,
          caller_phone: callerPhone,
          customer_name: booking.name,
          customer_phone: booking.phone,
          service_requested: booking.service,
          status: 'new',
          notes: `Phone booking via AI Receptionist. Caller: ${callerPhone}`,
        });
        console.log(`[Call ${callSid}] ✅ Booking saved: ${booking.name} / ${booking.service}`);
      } catch (err) {
        console.error(`[Call ${callSid}] ❌ Failed to save booking:`, err);
      }

      // Notify owner via SMS (fire and forget)
      const ownerPhone = process.env.OWNER_PHONE_NUMBER;
      if (ownerPhone) {
        sendSMS(
          ownerPhone,
          `📞 NEW PHONE BOOKING!\n\nName: ${booking.name}\nPhone: ${booking.phone}\nService: ${booking.service}\n\nCollected by AI Receptionist\nCall ID: ${callSid}\n\n📲 Call them back to confirm!`
        );
      }

      // Confirm to caller via SMS
      if (callerPhone && callerPhone !== 'unknown') {
        sendSMS(
          callerPhone,
          `Thanks for calling ExcelPro Washers, ${booking.name}! ✨\n\nWe've noted your request for ${booking.service}. Someone from our team will call you back shortly to schedule.\n\nExcelPro Washers\n📞 ${process.env.TWILIO_PHONE_NUMBER}`
        );
      }
    }

    // ── Persist conversation ──────────────────────────────
    try {
      await voiceConversations.upsert(conversation);
    } catch (err) {
      console.error(`[Call ${callSid}] ⚠️ Failed to persist conversation:`, err);
    }

    // ── Build TwiML response ──────────────────────────────
    const twiml = new VoiceResponse();

    // Check for transfer request
    if (/transfer you now|connect you|put you through/i.test(aiResponse)) {
      speakText(twiml, cleanForSpeech(aiResponse), baseUrl);
      const ownerPhone = process.env.OWNER_PHONE_NUMBER;
      if (ownerPhone) {
        twiml.dial({ callerId: process.env.TWILIO_PHONE_NUMBER }, ownerPhone);
      } else {
        speakText(twiml, "I'm sorry, no one is available right now. Please leave a message after the beep.", baseUrl);
        twiml.record({ maxLength: 120, transcribe: true, playBeep: true, action: `${baseUrl}/api/voice/status` });
      }
      twiml.hangup();
      res.type('text/xml').send(twiml.toString());
      return;
    }

    // Check for voicemail request
    if (/leave.*(message|voicemail)|after the (tone|beep)/i.test(aiResponse)) {
      speakText(twiml, cleanForSpeech(aiResponse), baseUrl);
      twiml.record({ maxLength: 120, transcribe: true, playBeep: true, action: `${baseUrl}/api/voice/status` });
      speakText(twiml, "Thanks for your message. We'll get back to you soon. Goodbye!", baseUrl);
      twiml.hangup();
      res.type('text/xml').send(twiml.toString());
      return;
    }

    // Standard response — continue conversation
    const gather = twiml.gather({
      input: ['speech', 'dtmf'],
      action: `${baseUrl}/api/voice/respond`,
      method: 'POST',
      speechTimeout: '3',
      numDigits: 1,
      language: 'en-US',
      hints: 'window cleaning, pressure washing, gutter cleaning, appointment, pricing, schedule, yes, no, estimate, quote, transfer, message',
    });

    speakInGather(gather, cleanForSpeech(aiResponse), baseUrl);

    // No response fallback → voicemail
    speakText(twiml, "Are you still there? If you'd like to leave a message, please do so after the beep.", baseUrl);
    twiml.record({ maxLength: 120, transcribe: true, playBeep: true, action: `${baseUrl}/api/voice/status` });
    twiml.hangup();

    res.type('text/xml').send(twiml.toString());
  } catch (error) {
    console.error('[Respond] Error:', error);

    const twiml = new VoiceResponse();
    twiml.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      "I'm sorry, we're experiencing a brief technical issue. Please leave your name and number after the beep and we'll call you right back."
    );
    twiml.record({ maxLength: 60, transcribe: true, playBeep: true });
    twiml.hangup();
    res.type('text/xml').send(twiml.toString());
  }
}
