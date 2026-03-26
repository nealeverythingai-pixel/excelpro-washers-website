import { NextRequest, NextResponse } from 'next/server';

/**
 * Voice incoming — proxied to Railway voice microservice.
 * The real handler runs on Railway for zero cold starts and no timeouts.
 * If VOICE_SERVICE_URL is not set, returns a basic Polly TwiML fallback.
 */
export async function POST(request: NextRequest) {
  const voiceServiceUrl = process.env.VOICE_SERVICE_URL;

  if (!voiceServiceUrl) {
    // Fallback: basic Polly greeting if Railway isn't configured yet
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">Thank you for calling ExcelPro Washers. Please visit excelprowashers.com or call back shortly.</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
  }

  // Proxy to Railway
  try {
    const url = new URL('/api/voice/incoming', voiceServiceUrl);
    // Forward query params (retry count)
    request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

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
    console.error('[Voice Proxy] incoming error:', error);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">We are experiencing a technical issue. Please try again shortly.</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
  }
}
