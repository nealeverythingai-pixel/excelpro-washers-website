/**
 * GET /api/voice/elevenlabs-audio
 * Generates TTS audio via ElevenLabs and STREAMS it to Twilio.
 *
 * KEY IMPROVEMENT over Vercel:
 * - Persistent ElevenLabs client (no cold start)
 * - True streaming (pipes audio chunks directly instead of buffering entire file)
 * - No serverless timeout
 */

import { Request, Response } from 'express';
import { getElevenLabs, ELEVENLABS_VOICE_ID } from '../lib/clients';

export async function elevenlabsAudioHandler(req: Request, res: Response) {
  try {
    const text = req.query.text as string;

    if (!text) {
      res.status(400).json({ error: 'Text parameter required' });
      return;
    }

    const elevenlabs = getElevenLabs();
    if (!elevenlabs) {
      res.status(503).json({ error: 'ElevenLabs not configured' });
      return;
    }

    const audio = await elevenlabs.textToSpeech.convert(ELEVENLABS_VOICE_ID, {
      text,
      modelId: 'eleven_turbo_v2_5',
      voiceSettings: {
        stability: 0.4,
        similarityBoost: 0.8,
        style: 0.5,
        useSpeakerBoost: true,
      },
    });

    // Set headers for streaming audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Stream the audio directly to the response — no buffering!
    if (audio && typeof (audio as any).pipe === 'function') {
      // Node.js Readable stream — pipe directly
      (audio as any).pipe(res);
    } else if (audio && typeof (audio as any).getReader === 'function') {
      // Web ReadableStream — read chunks and write
      const reader = (audio as ReadableStream<Uint8Array>).getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            return;
          }
          if (value) {
            res.write(value);
          }
        }
      };
      await pump();
    } else {
      // Fallback: treat as buffer
      const chunks: Uint8Array[] = [];
      if (Symbol.asyncIterator in Object(audio)) {
        for await (const chunk of audio as AsyncIterable<Uint8Array>) {
          chunks.push(chunk);
        }
      }
      const buffer = Buffer.concat(chunks);
      if (buffer.length === 0) {
        res.status(502).json({ error: 'Empty audio response' });
        return;
      }
      res.setHeader('Content-Length', buffer.length.toString());
      res.send(buffer);
    }
  } catch (error: any) {
    console.error('[ElevenLabs] Audio generation error:', error?.message || error);
    res.status(502).json({ error: 'Failed to generate audio', detail: error?.message });
  }
}
