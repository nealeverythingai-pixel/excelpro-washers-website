import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import Anthropic from '@anthropic-ai/sdk';
import { voiceConversations, voiceBookings, voiceCallLogs } from '@/lib/db/voice';

const VoiceResponse = twilio.twiml.VoiceResponse;

// ── Helpers ──────────────────────────────────────────────────

/** Speak text via ElevenLabs (if configured) or Twilio built-in TTS */
function speakText(twiml: any, text: string, baseUrl: string) {
  if (process.env.ELEVENLABS_API_KEY) {
    twiml.play(`${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(text)}`);
  } else {
    twiml.say({ voice: 'Polly.Joanna', language: 'en-US' }, text);
  }
}

/** Same as speakText but on a <Gather> node */
function speakInGather(gather: any, text: string, baseUrl: string) {
  if (process.env.ELEVENLABS_API_KEY) {
    gather.play(`${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(text)}`);
  } else {
    gather.say({ voice: 'Polly.Joanna', language: 'en-US' }, text);
  }
}

// ── Business hours check ─────────────────────────────────────

function getBusinessHoursContext(): string {
  // Seattle is Pacific Time (UTC-8 / UTC-7 DST)
  const now = new Date();
  const seattleTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const day = seattleTime.getDay(); // 0=Sun, 1=Mon...6=Sat
  const hour = seattleTime.getHours();
  
  const isOpen = day >= 1 && day <= 6 && hour >= 8 && hour < 18;
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
  const timeStr = seattleTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  if (isOpen) {
    return `CURRENT STATUS: It's ${dayName} ${timeStr} — you are OPEN right now.`;
  } else {
    return `CURRENT STATUS: It's ${dayName} ${timeStr} — you are CLOSED right now. Let callers know we're closed but you're happy to take their info and someone will call them back during business hours (Mon-Sat, 8 AM - 6 PM).`;
  }
}

// ── SMS to caller ────────────────────────────────────────────

async function sendCallerConfirmation(booking: BookingInfo, callerPhone: string, callSid: string) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) return;
  if (!callerPhone || callerPhone === 'unknown') return;
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const smsBody = `Thanks for calling ExcelPro Washers, ${booking.name}! ✨\n\nWe've noted your request for ${booking.service}. Someone from our team will call you back shortly to schedule.\n\nExcelPro Washers\n📞 ${process.env.TWILIO_PHONE_NUMBER}`;

    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: callerPhone,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: smsBody,
      }),
    });
    console.log(`[Call ${callSid}] ✅ Confirmation SMS sent to caller ${callerPhone}`);
  } catch (err) {
    console.error(`[Call ${callSid}] ❌ Failed to send caller SMS:`, err);
  }
}

// ── AI Receptionist system prompt ────────────────────────────

const RECEPTIONIST_PROMPT = `You are a friendly, professional receptionist for ExcelPro Washers, a window and exterior cleaning company. You are answering the phone.

BUSINESS INFO:
- Services: window cleaning (interior & exterior), pressure washing (driveways, decks, siding), gutter cleaning, commercial building washing
- Pricing: residential jobs start around $150, commercial jobs are quoted individually after a free estimate
- Service area: Greater Seattle area
- Hours: Monday through Saturday, 8 AM to 6 PM
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

function getSystemPrompt(): string {
  return RECEPTIONIST_PROMPT + '\n\n' + getBusinessHoursContext();
}

// ── Booking extractor ────────────────────────────────────────

interface BookingInfo {
  name: string;
  phone: string;
  service: string;
}

function extractBooking(text: string): BookingInfo | null {
  const match = text.match(/\[BOOKING:\s*name=([^,]+),\s*phone=([^,]+),\s*service=([^\]]+)\]/i);
  if (!match) return null;
  return {
    name: match[1].trim(),
    phone: match[2].trim(),
    service: match[3].trim(),
  };
}

/** Strip the [BOOKING: ...] marker from text before speaking it aloud */
function cleanForSpeech(text: string): string {
  return text.replace(/\[BOOKING:[^\]]+\]/gi, '').replace(/\s{2,}/g, ' ').trim();
}

// ── Notification helper ──────────────────────────────────────

async function notifyOwnerOfBooking(booking: BookingInfo, callSid: string) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER || !process.env.OWNER_PHONE_NUMBER) {
    console.log(`[Call ${callSid}] ⚠️ Owner SMS skipped — Twilio or OWNER_PHONE_NUMBER not configured`);
    return;
  }
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    const smsBody = `📞 NEW PHONE BOOKING!\n\nName: ${booking.name}\nPhone: ${booking.phone}\nService: ${booking.service}\n\nCollected by AI Receptionist\nCall ID: ${callSid}\n\n📲 Call them back to confirm!`;

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
    console.log(`[Call ${callSid}] ✅ Booking SMS sent to owner`);
  } catch (err) {
    console.error(`[Call ${callSid}] ❌ Failed to send booking SMS:`, err);
  }
}

// ── Main handler ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const callSid = formData.get('CallSid') as string;
    const callerPhone = formData.get('From') as string || 'unknown';

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelprowashers.com';

    // ── No speech detected ────────────────────────────────
    if (!speechResult) {
      const twiml = new VoiceResponse();
      speakText(twiml, "Sorry, I didn't catch that. Could you say that again?", baseUrl);
      twiml.redirect(`${baseUrl}/api/voice/incoming`);
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // ── Load conversation history from Supabase ───────────
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

    // ── Get AI response with full history ─────────────────
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: getSystemPrompt(),
      messages: conversation.messages,
    });

    const aiResponse = message.content[0].type === 'text'
      ? message.content[0].text
      : "I'm sorry, could you say that one more time?";

    conversation.messages.push({ role: 'assistant', content: aiResponse });

    // Log conversation turn
    const turn = Math.ceil(conversation.messages.length / 2);
    console.log(`[Call ${callSid}] Turn ${turn} | Caller: ${speechResult}`);
    console.log(`[Call ${callSid}] Turn ${turn} | AI: ${aiResponse}`);

    // ── Check for booking info ────────────────────────────
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
        console.log(`[Call ${callSid}] ✅ Booking saved to Supabase: ${booking.name} / ${booking.service}`);
      } catch (err) {
        console.error(`[Call ${callSid}] ❌ Failed to save booking:`, err);
      }

      // Notify owner via SMS (fire and forget)
      notifyOwnerOfBooking(booking, callSid);

      // Send confirmation SMS to the caller
      sendCallerConfirmation(booking, callerPhone, callSid);
    }

    // ── Persist conversation to Supabase ──────────────────
    try {
      await voiceConversations.upsert(conversation);
    } catch (err) {
      console.error(`[Call ${callSid}] ⚠️ Failed to persist conversation:`, err);
    }

    // ── Check for transfer request ────────────────────────
    const wantsTransfer = /transfer you now|connect you|put you through/i.test(aiResponse);
    if (wantsTransfer) {
      const twiml = new VoiceResponse();
      speakText(twiml, cleanForSpeech(aiResponse), baseUrl);

      const ownerPhone = process.env.OWNER_PHONE_NUMBER;
      if (ownerPhone) {
        twiml.dial({ callerId: process.env.TWILIO_PHONE_NUMBER }, ownerPhone);
      } else {
        speakText(twiml, "I'm sorry, no one is available right now. Please leave a message after the beep.", baseUrl);
        twiml.record({ maxLength: 120, transcribe: true, playBeep: true, action: `${baseUrl}/api/voice/status` });
      }
      twiml.hangup();
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // ── Check for voicemail request ───────────────────────
    const wantsVoicemail = /leave.*(message|voicemail)|after the (tone|beep)/i.test(aiResponse);
    if (wantsVoicemail) {
      const twiml = new VoiceResponse();
      speakText(twiml, cleanForSpeech(aiResponse), baseUrl);
      twiml.record({ maxLength: 120, transcribe: true, playBeep: true, action: `${baseUrl}/api/voice/status` });
      speakText(twiml, "Thanks for your message. We'll get back to you soon. Goodbye!", baseUrl);
      twiml.hangup();
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // ── Standard response — continue conversation ────────
    const twiml = new VoiceResponse();

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

    // If no response, offer voicemail before hanging up
    speakText(twiml, "Are you still there? If you'd like to leave a message, please do so after the beep.", baseUrl);
    twiml.record({ maxLength: 120, transcribe: true, playBeep: true, action: `${baseUrl}/api/voice/status` });
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error('Voice response error:', error);

    const twiml = new VoiceResponse();
    twiml.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      "I'm sorry, we're experiencing a brief technical issue. Please leave your name and number after the beep and we'll call you right back."
    );
    twiml.record({ maxLength: 60, transcribe: true, playBeep: true });
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
