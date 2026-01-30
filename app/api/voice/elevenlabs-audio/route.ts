import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text');
    
    if (!text) {
      return NextResponse.json({ error: 'Text parameter required' }, { status: 400 });
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.8,
        style: 0.5,
        use_speaker_boost: true,
      },
    });

    // Convert the stream to a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('ElevenLabs audio generation error:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}
