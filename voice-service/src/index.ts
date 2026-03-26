/**
 * ExcelPro Washers — AI Voice Receptionist Microservice
 *
 * Runs on Railway as a persistent Express server.
 * Handles all Twilio voice webhooks with:
 *  - Persistent Anthropic/ElevenLabs/Supabase connections (no cold starts)
 *  - Streaming ElevenLabs TTS (no buffering)
 *  - Unlimited execution time (no serverless timeouts)
 */

import express from 'express';
import { incomingHandler } from './routes/incoming';
import { respondHandler } from './routes/respond';
import { statusHandler } from './routes/status';
import { elevenlabsAudioHandler } from './routes/elevenlabs-audio';
import { healthHandler } from './routes/health';

const app = express();

// ── Middleware ────────────────────────────────────────────────
// Twilio sends form-urlencoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ───────────────────────────────────────────────────
app.post('/api/voice/incoming', incomingHandler);
app.post('/api/voice/respond', respondHandler);
app.post('/api/voice/status', statusHandler);
app.get('/api/voice/elevenlabs-audio', elevenlabsAudioHandler);
app.get('/health', healthHandler);

// ── Start ────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎙️  ExcelPro Voice Service running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   ElevenLabs:   ${process.env.ELEVENLABS_API_KEY ? '✅ configured' : '⚠️  not set'}`);
  console.log(`   Anthropic:    ${process.env.ANTHROPIC_API_KEY ? '✅ configured' : '⚠️  not set'}`);
  console.log(`   Supabase:     ${process.env.SUPABASE_ANON_KEY ? '✅ configured' : '⚠️  not set'}`);
  console.log(`   Twilio:       ${process.env.TWILIO_AUTH_TOKEN ? '✅ configured' : '⚠️  not set'}\n`);
});
