import { NextRequest, NextResponse } from 'next/server';

/**
 * Voice status callback — proxied to Railway voice microservice.
 * Handles call completion logging and summary SMS.
 */
export async function POST(request: NextRequest) {
  const voiceServiceUrl = process.env.VOICE_SERVICE_URL;

  if (!voiceServiceUrl) {
    // Fallback: just acknowledge
    return NextResponse.json({ success: true });
  }

  try {
    const url = new URL('/api/voice/status', voiceServiceUrl);
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
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Voice Proxy] status error:', error);
    return NextResponse.json({ success: true }); // Don't break Twilio's flow
  }
}
