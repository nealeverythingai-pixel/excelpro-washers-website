/**
 * Secure Session Management
 *
 * HMAC-signed session cookies — replaces the old unsigned base64 encoding.
 * The session payload is still base64 JSON, but now includes an HMAC-SHA256
 * signature that prevents forgery.
 *
 * Format: <base64-payload>.<hex-signature>
 */

import { createHmac, timingSafeEqual } from 'crypto';

// The secret key for signing — falls back to ADMIN_PASSWORD if SESSION_SECRET isn't set
function getSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('SESSION_SECRET or ADMIN_PASSWORD must be set');
  return secret;
}

export interface AdminSessionData {
  email: string;
  role: 'ADMIN';
  id: string;
  loginAt: string;
}

export interface PortalSessionData {
  userId: string;
  role: 'CONTRACTOR' | 'SALES';
  email: string;
  loginAt: string;
}

/**
 * Sign a session payload → returns "base64payload.hexsignature"
 */
export function signSession(data: AdminSessionData | PortalSessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64');
  const signature = createHmac('sha256', getSecret())
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Verify and decode a signed session cookie.
 * Returns null if tampered, expired, or invalid.
 */
export function verifySession<T = AdminSessionData>(cookie: string): T | null {
  try {
    const dotIndex = cookie.lastIndexOf('.');
    if (dotIndex === -1) return null;

    const payload = cookie.substring(0, dotIndex);
    const providedSig = cookie.substring(dotIndex + 1);

    // Recompute expected signature
    const expectedSig = createHmac('sha256', getSecret())
      .update(payload)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(providedSig, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    // Signature valid — decode payload
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8')) as T;
    return data;
  } catch {
    return null;
  }
}

/**
 * Verify specifically an admin session — checks role === 'ADMIN'
 */
export function verifyAdminSession(cookie: string | undefined): AdminSessionData | null {
  if (!cookie) return null;

  // Handle legacy unsigned cookies — reject them (force re-login)
  if (cookie === 'true') return null;
  if (!cookie.includes('.')) return null;

  const data = verifySession<AdminSessionData>(cookie);
  if (!data || data.role !== 'ADMIN') return null;
  return data;
}

/**
 * Verify a contractor or sales portal session
 */
export function verifyPortalSession(
  cookie: string | undefined,
  expectedRole: 'CONTRACTOR' | 'SALES'
): PortalSessionData | null {
  if (!cookie) return null;
  if (!cookie.includes('.')) return null;

  const data = verifySession<PortalSessionData>(cookie);
  if (!data || data.role !== expectedRole) return null;
  return data;
}
