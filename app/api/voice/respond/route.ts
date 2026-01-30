import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import Anthropic from '@anthropic-ai/sdk';

const VoiceResponse = twilio.twiml.VoiceResponse;

// AI Receptionist system prompt
const RECEPTIONIST_PROMPT = `You are a friendly and professional receptionist for ExcelPro Washers, a window and pressure washing company. 

Your role:
- Greet callers warmly and professionally
- Answer questions about our services (window cleaning, pressure washing, gutter cleaning)
- Help schedule appointments
- Provide pricing information (residential from $150, commercial quotes available)
- Take messages for callbacks
- Handle emergency requests

Keep responses brief (1-2 sentences), conversational, and helpful. Always be polite and professional.

Services we offer:
- Window Cleaning (interior & exterior)
- Pressure Washing (driveways, patios, decks)
- Gutter Cleaning
- Commercial Building Washing

Business hours: Monday-Saturday, 8 AM - 6 PM
Service areas: Greater Seattle area`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const callSid = formData.get('CallSid') as string;
    
    if (!speechResult) {
      const twiml = new VoiceResponse();
      twiml.say("I didn't catch that. Could you please repeat?");
      twiml.redirect('/api/voice/incoming');
      
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Get AI response using Anthropic
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      system: RECEPTIONIST_PROMPT,
      messages: [
        {
          role: 'user',
          content: speechResult
        }
      ],
    });

    const aiResponse = message.content[0].type === 'text' 
      ? message.content[0].text 
      : "I apologize, I didn't understand that. Could you rephrase?";

    // Log the conversation
    console.log(`[Call ${callSid}] Caller: ${speechResult}`);
    console.log(`[Call ${callSid}] AI: ${aiResponse}`);

    // Create TwiML response
    const twiml = new VoiceResponse();
    
    const gather = twiml.gather({
      input: ['speech'],
      action: '/api/voice/respond',
      method: 'POST',
      speechTimeout: 'auto',
      language: 'en-US'
    });
    
    gather.say({
      voice: 'Polly.Joanna'
    }, aiResponse);
    
    // If no response, end gracefully
    twiml.say('Thank you for calling ExcelPro Washers. Have a great day!');
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
    
  } catch (error) {
    console.error('Voice response error:', error);
    
    const twiml = new VoiceResponse();
    twiml.say("I apologize, but I'm experiencing technical difficulties. Please try calling back in a few moments.");
    twiml.hangup();
    
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
