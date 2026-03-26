/**
 * GET /health
 * Health check endpoint for Railway monitoring.
 */

import { Request, Response } from 'express';

export function healthHandler(_req: Request, res: Response) {
  res.json({
    status: 'ok',
    service: 'excelpro-voice-service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: {
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      supabase: !!process.env.SUPABASE_ANON_KEY,
      twilio: !!process.env.TWILIO_AUTH_TOKEN,
    },
  });
}
