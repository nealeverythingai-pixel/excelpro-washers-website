import { NextRequest, NextResponse } from 'next/server';
import { syncAllEmbeddings } from '@/lib/ai/embeddings';
import { verifyAdminSession } from '@/lib/session';

/**
 * POST /api/ai/sync-embeddings
 * 
 * Re-indexes all CRM records for semantic search.
 * Can be called manually from the admin dashboard or via cron.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check — HMAC-signed session or cron secret
    const adminCookie = request.cookies.get('admin_session')?.value;
    const cronSecret = request.headers.get('authorization');
    const isAuthed = verifyAdminSession(adminCookie) || cronSecret === `Bearer ${process.env.CRON_SECRET}`;

    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const counts = await syncAllEmbeddings();

    return NextResponse.json({
      success: true,
      message: `Indexed ${counts.clients} clients, ${counts.jobs} jobs, ${counts.leads} leads, ${counts.quotes} quotes.`,
      counts,
    });
  } catch (error) {
    console.error('Sync embeddings error:', error);
    return NextResponse.json(
      { error: 'Failed to sync embeddings', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
