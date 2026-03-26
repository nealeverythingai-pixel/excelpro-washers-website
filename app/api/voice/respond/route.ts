import { NextRequest, NextResponse } from 'next/server';

/**
 * Voice respond — proxied to Railway voice microservice.
 * The real AI conversation handler runs on Railway for persistent Claude
 * connections, zero cold starts, and unlimited execution time.
 */
export async function POST(request: NextRequest) {
  const voiceServiceUrl = process.env.VOICE_SERVICE_URL;

  if (!voiceServiceUrl) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">I'm sorry, our voice service is being set up. Please visit excelprowashers.com or call back shortly.</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
  }

  try {
    const url = new URL('/api/voice/respond', voiceServiceUrl);
    const body = await request.text();

    const proxyRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/x-www-form-urlencoded',
        ...(request.headers.get('x-twilio-signature') && {
          'x-twilio-signature': request.headers.get('x-twilio-signature')!,
        }),
      },
      body,
    });

    const responseBody = await proxyRes.text();
    return new NextResponse(responseBody, {
      status: proxyRes.status,
      headers: { 'Content-Type': proxyRes.headers.get('Content-Type') || 'text/xml' },
    });
  } catch (error) {
    console.error('[Voice Proxy] respond error:', error);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">We are experiencing a technical issue. Please leave a message after the beep.</Say>
  <Record maxLength="60" transcribe="true" playBeep="true"/>
  <Hangup/>
</Response>`;
    return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
  }
}
