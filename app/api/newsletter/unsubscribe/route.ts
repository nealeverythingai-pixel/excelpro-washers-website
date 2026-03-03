import { NextResponse } from 'next/server';
import { subscribers } from '@/lib/db/subscribers';

/**
 * GET: Handles one-click unsubscribe links from emails.
 * URL format: /api/newsletter/unsubscribe?email=user@example.com
 * Redirects to the unsubscribe confirmation page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.redirect(new URL('/unsubscribe?status=error', request.url));
  }

  const result = await subscribers.unsubscribe(email);
  if (result.success) {
    return NextResponse.redirect(new URL(`/unsubscribe?status=success&email=${encodeURIComponent(email)}`, request.url));
  }
  return NextResponse.redirect(new URL('/unsubscribe?status=error', request.url));
}

/**
 * POST: Programmatic unsubscribe (for forms / JSON requests).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await subscribers.unsubscribe(email);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Unsubscribe failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'You have been unsubscribed.' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
