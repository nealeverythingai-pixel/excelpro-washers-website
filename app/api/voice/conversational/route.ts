import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: NextRequest) {
  try {
    const twiml = new VoiceResponse();
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelprowashers.com';
    
    // Connect to ElevenLabs conversational AI via WebSocket
    const connect = twiml.connect();
    const stream = connect.stream({
      url: `wss://${baseUrl.replace('https://', '').replace('http://', '')}/api/voice/stream`
    });

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Voice conversational error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
