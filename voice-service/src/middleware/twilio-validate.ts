/**
 * Twilio signature validation middleware.
 * Ensures webhooks are actually coming from Twilio, not spoofed.
 */

import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';

export function validateTwilioSignature(req: Request, res: Response, next: NextFunction) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // Skip validation in development
  if (!authToken) {
    console.warn('[Twilio] AUTH_TOKEN not set — skipping signature validation');
    return next();
  }

  const signature = req.headers['x-twilio-signature'] as string;
  if (!signature) {
    console.error('[Twilio] ❌ Missing x-twilio-signature header');
    return res.status(403).send('Forbidden');
  }

  // Build the full URL that Twilio signed against
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['host'];
  const url = `${protocol}://${host}${req.originalUrl}`;

  const isValid = twilio.validateRequest(authToken, signature, url, req.body || {});

  if (!isValid) {
    console.error('[Twilio] ❌ Invalid signature — rejecting request');
    return res.status(403).send('Forbidden');
  }

  next();
}
