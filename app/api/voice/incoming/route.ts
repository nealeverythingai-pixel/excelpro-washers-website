import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: NextRequest) {
  try {
    const twiml = new VoiceResponse();
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelprowashers.com';
    
    // Gather speech input from caller
    const gather = twiml.gather({
      input: ['speech'],
      action: `${baseUrl}/api/voice/respond`,
      method: 'POST',
      speechTimeout: 'auto',
      language: 'en-US'
    });
    
    // Use ElevenLabs voice instead of robotic Polly
    const greeting = 'Hello! Thank you for calling ExcelPro Washers. How can I help you today?';
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
