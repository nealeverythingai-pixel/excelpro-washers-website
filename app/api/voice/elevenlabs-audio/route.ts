import { NextRequest, NextResponse } from 'next/server';

/**
 * ElevenLabs audio — proxied to Railway voice microservice.
 * Streaming audio is handled much better on a persistent server.
 */
export async function GET(request: NextRequest) {
  const voiceServiceUrl = process.env.VOICE_SERVICE_URL;

  if (!voiceServiceUrl) {
    return NextResponse.json({ error: 'Voice service not configured' }, { status: 503 });
  }

  try {
    const text = request.nextUrl.searchParams.get('text');
    if (!text) {
      return NextResponse.json({ error: 'Text parameter required' }, { status: 400 });
    }

    const url = new URL('/api/voice/elevenlabs-audio', voiceServiceUrl);
    url.searchParams.set('text', text);

    const proxyRes = await fetch(url.toString());

    if (!proxyRes.ok) {
      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: proxyRes.status }
      );
    }

    const audioBuffer = await proxyRes.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Voice Proxy] elevenlabs-audio error:', error);
    return NextResponse.json({ error: 'Audio proxy failed' }, { status: 502 });
  }
}
