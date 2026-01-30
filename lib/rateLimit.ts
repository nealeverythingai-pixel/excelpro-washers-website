/**
 * Simple in-memory rate limiter for API routes
 * For production, use @upstash/ratelimit with Redis
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit by IP address
 * @param identifier - Usually IP address or user ID
 * @param limit - Maximum requests allowed in window
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limit exceeded
 */
export function isRateLimited(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minute default
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetAt < now) {
    // First request or window expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs
    });
    return false;
  }

  if (entry.count >= limit) {
    // Rate limit exceeded
    return true;
  }

  // Increment counter
  entry.count++;
  rateLimitMap.set(identifier, entry);
  return false;
}

/**
 * Get IP address from request headers
 * Works with Vercel, Cloudflare, and other proxies
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');
  
  if (cfConnecting) return cfConnecting;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real;
  
  return 'unknown';
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(retryAfterSeconds: number = 60) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfterSeconds.toString()
      }
    }
  );
}
