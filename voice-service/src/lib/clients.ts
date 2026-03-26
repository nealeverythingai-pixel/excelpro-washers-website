/**
 * Persistent client singletons — initialized once, reused across all requests.
 * This is the key advantage over Vercel serverless functions.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// ── Supabase (persistent connection) ─────────────────────────

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY are required');
    }
    _supabase = createClient(url, key);
    console.log('[Clients] ✅ Supabase client initialized');
  }
  return _supabase;
}

// ── Anthropic (persistent connection) ────────────────────────

let _anthropic: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    console.log('[Clients] ✅ Anthropic client initialized');
  }
  return _anthropic;
}

// ── ElevenLabs (persistent connection) ───────────────────────

let _elevenlabs: ElevenLabsClient | null = null;

export function getElevenLabs(): ElevenLabsClient | null {
  if (!process.env.ELEVENLABS_API_KEY) {
    return null; // Fallback to Polly
  }
  if (!_elevenlabs) {
    _elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    console.log('[Clients] ✅ ElevenLabs client initialized');
  }
  return _elevenlabs;
}

export const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
