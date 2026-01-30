import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import Anthropic from '@anthropic-ai/sdk';

const VoiceResponse = twilio.twiml.VoiceResponse;

// AI Receptionist system prompt - keep it concise for faster responses
const RECEPTIONIST_PROMPT = `You are ExcelPro Washers receptionist. Be brief and natural.

Services: window cleaning, pressure washing, gutter cleaning, commercial washing
Pricing: residential from $150, commercial by quote
Hours: Mon-Sat, 8 AM - 6 PM
Area: Greater Seattle

Keep responses under 20 words. Be conversational and helpful.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const callSid = formData.get('CallSid') as string;
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelprowashers.com';
    
    if (!speechResult) {
      const twiml = new VoiceResponse();
      const retryMsg = "I didn't catch that. Could you please repeat?";
      const retryUrl = `${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(retryMsg)}`;
      twiml.play(retryUrl);
      twiml.redirect(`${baseUrl}/api/voice/incoming`);
      
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Get AI response using Anthropic
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
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

    // Create TwiML response with ElevenLabs audio
    const twiml = new VoiceResponse();
    
    const audioUrl = `${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(aiResponse)}`;
    
    const gather = twiml.gather({
      input: ['speech'],
      action: `${baseUrl}/api/voice/respond`,
      method: 'POST',
      speechTimeout: '1',
      language: 'en-US',
      hints: 'window cleaning, pressure washing, gutter cleaning, appointment, pricing, schedule, yes, no'
    });
    
    gather.play(audioUrl);
    
    // If no response, end gracefully with shorter message
    const goodbyeUrl = `${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent('Thanks for calling!')}`;
    twiml.play(goodbyeUrl);
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
    
  } catch (error) {
    console.error('Voice response error:', error);
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelprowashers.com';
    const twiml = new VoiceResponse();
    const errorMsg = "I apologize, but I'm experiencing technical difficulties. Please try calling back in a few moments.";
    const errorUrl = `${baseUrl}/api/voice/elevenlabs-audio?text=${encodeURIComponent(errorMsg)}`;
    twiml.play(errorUrl);
    twiml.hangup();
    
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
