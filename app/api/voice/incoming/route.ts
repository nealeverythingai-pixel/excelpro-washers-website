import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: NextRequest) {
  try {
    const twiml = new VoiceResponse();
    
    // Gather speech input from caller
    const gather = twiml.gather({
      input: ['speech'],
      action: '/api/voice/respond',
      method: 'POST',
      speechTimeout: 'auto',
      language: 'en-US'
    });
    
    gather.say({
      voice: 'Polly.Joanna'
    }, 'Hello! Thank you for calling ExcelPro Washers. How can I help you today?');
    
    // If no input, redirect
    twiml.redirect('/api/voice/incoming');
    
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
