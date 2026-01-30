import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: NextRequest) {
  try {
    const twiml = new VoiceResponse();
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelprowashers.com';
    
    // Use shorter speech timeout for more responsive conversation
    const gather = twiml.gather({
      input: ['speech'],
      action: `${baseUrl}/api/voice/respond`,
      method: 'POST',
      speechTimeout: '1',
      language: 'en-US',
      hints: 'window cleaning, pressure washing, gutter cleaning, appointment, pricing, schedule'
    });
    
    // Use ElevenLabs voice with shorter greeting for faster interaction
    const greeting = 'Hi! ExcelPro Washers. How can I help?';
    const audioUrl = `${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(greeting)}`;
    gather.play(audioUrl);
    
    // If no input, redirect
    twiml.redirect(`${baseUrl}/api/voice/incoming`);
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Voice incoming error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
