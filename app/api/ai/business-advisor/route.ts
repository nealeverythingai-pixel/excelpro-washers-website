import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/lib/db';
import { leadRequests, leadFollowUps } from '@/lib/db/leads';
import { subscribers } from '@/lib/db/subscribers';
import { voiceCallLogs, voiceBookings } from '@/lib/db/voice';
import { isRateLimited, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // ── Auth: verify admin session ──────────────────────────────────
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Rate limiting: 10 req/min per IP ────────────────────────────
    const clientIp = getClientIp(request);
    if (isRateLimited(`advisor-${clientIp}`, 10, 60_000)) {
      return rateLimitResponse(60);
    }

    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // ── Gather metrics from BOTH data sources ───────────────────────
    // JSON DB (clients, jobs, quotes, invoices — not yet migrated)
    const [clients, jobs, quotes, invoices, users] = await Promise.all([
      db.clients.getAll(),
      db.jobs.getAll(),
      db.quotes.getAll(),
      db.invoices.getAll(),
      db.users.getAll(),
    ]);

    // Supabase (leads, follow-ups, voice, subscribers)
    const [allLeads, pendingFollowUps, leadStats, subscriberStats, callLogs, bookings] =
      await Promise.all([
        leadRequests.getAll(),
        leadFollowUps.getPending(),
        leadRequests.getStats(),
        subscribers.getStats(),
        voiceCallLogs.getAll(100),
        voiceBookings.getAll(100),
      ]);

    // ── Compute metrics ─────────────────────────────────────────────
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const completedJobs = jobs.filter(j => j.status === 'Completed').length;

    const totalRevenue = invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + i.total, 0);

    const recentRevenue = invoices
      .filter(i => i.status === 'Paid' && new Date(i.createdAt) > thirtyDaysAgo)
      .reduce((sum, i) => sum + i.total, 0);

    const pendingRevenue = invoices
      .filter(i => i.status === 'Sent' || i.status === 'Unpaid')
      .reduce((sum, i) => sum + i.total, 0);

    const avgJobValue = completedJobs > 0 ? Math.round(totalRevenue / completedJobs) : 0;

    const leadConversionRate = allLeads.length > 0
      ? ((clients.length / allLeads.length) * 100).toFixed(1)
      : '0';

    const quoteAcceptanceRate = quotes.length > 0
      ? ((quotes.filter(q => q.status === 'Accepted').length / quotes.length) * 100).toFixed(1)
      : '0';

    // Service breakdown
    const serviceRevenue = invoices
      .filter(i => i.status === 'Paid')
      .reduce((acc, invoice) => {
        const job = jobs.find(j => j.id === invoice.jobId);
        if (job) {
          const service = job.title.split('-')[0].trim() || 'Other';
          acc[service] = (acc[service] || 0) + invoice.total;
        }
        return acc;
      }, {} as Record<string, number>);

    // Contractors
    const contractors = users.filter(u => u.role === 'CONTRACTOR');
    const contractorStats = contractors.map(c => ({
      name: c.name,
      completedJobs: c.completedJobs || 0,
      earnings: (c as any).earnings || 0,
      skills: c.skills || [],
    }));

    // AI Lead pipeline (Supabase)
    const recentLeads = allLeads.filter(r => new Date(r.created_at) > thirtyDaysAgo);

    const businessMetrics = {
      overview: {
        totalClients: clients.length,
        totalJobs: jobs.length,
        completedJobs,
        totalRevenue,
        pendingRevenue,
        avgJobValue,
        contractors: contractors.length,
      },
      recent: {
        leadsLast30Days: recentLeads.length,
        jobsLast30Days: jobs.filter(j => new Date(j.createdAt) > thirtyDaysAgo).length,
        revenueLast30Days: recentRevenue,
      },
      performance: {
        leadConversionRate: `${leadConversionRate}%`,
        quoteAcceptanceRate: `${quoteAcceptanceRate}%`,
      },
      services: serviceRevenue,
      contractors: contractorStats,
      aiLeadPipeline: {
        totalLeads: leadStats.total,
        hot: leadStats.hot,
        warm: leadStats.warm,
        cold: leadStats.cold,
        converted: leadStats.converted,
        averageAIScore: leadStats.avgScore,
        pendingFollowUps: pendingFollowUps.length,
      },
      voiceCalls: {
        totalCalls: callLogs.length,
        bookingsFromCalls: bookings.length,
      },
      emailMarketing: {
        totalSubscribers: subscriberStats.total,
        activeSubscribers: subscriberStats.active,
        unsubscribed: subscriberStats.unsubscribed,
        sources: subscriberStats.sources,
      },
      currentDate: now.toISOString().split('T')[0],
    };

    // ── System prompt ───────────────────────────────────────────────
    const systemPrompt = `You are an expert AI Business Advisor for ExcelPro Washers, a window cleaning and pressure washing company in Ottawa, ON.

CURRENT INFRASTRUCTURE (as of March 2026):
- Next.js app deployed on Vercel with multi-portal system (Customer, Sales, Contractor, Admin)
- Supabase PostgreSQL for leads, AI follow-ups, voice call logs, bookings, and newsletter subscribers
- Legacy JSON file DB for clients, jobs, quotes, invoices (migration to Supabase planned)
- 10 AI Agents live: Lead Qualifier (Claude 3.5 Haiku), Lead Router, Warm/Cold Lead Sequences, AI Phone Receptionist (Twilio + ElevenLabs), Business Advisor (you), Business Insights, Contractor Analytics, Customer Comm Assistant, Quote Optimizer
- Email via Resend (CAN-SPAM compliant with unsubscribe links)
- SMS/Voice via Twilio, TTS via ElevenLabs
- Stripe payment processing + PDF invoice generation
- Full email marketing system with campaign composer, subscriber management
- Automated follow-up cron jobs (9 AM daily)

DEVELOPMENT ROADMAP:
Phase 2 (Next):
- Migrate clients/jobs/quotes/invoices from JSON DB to Supabase
- Customer-facing portal improvements
- AI feedback loops for learning from outcomes

Phase 3 (Future):
- Vector database + RAG for historical context (trigger: 500+ jobs)
- Predictive analytics and dynamic pricing
- Advanced contractor scheduling
- Mobile app

INFRASTRUCTURE UPGRADE TRIGGERS:
- 100+ clients → Ensure full Supabase migration is complete
- 500+ jobs → Implement vector database for RAG
- 10+ contractors → Advanced AI scheduling
- $50k+ monthly revenue → Custom infrastructure
- Multiple locations → Geographic routing system

CURRENT BUSINESS METRICS (real-time):
${JSON.stringify(businessMetrics, null, 2)}

YOUR ROLE:
- Provide specific, actionable advice based on ACTUAL business data above
- Reference real numbers from the metrics
- Recommend upgrades ONLY when triggers are met
- Be conversational, friendly, and strategic
- If data is missing, ask clarifying questions
- Focus on ROI and practical next steps
- Use emojis occasionally to be engaging

RESPONSE FORMAT:
- Use **bold** for important numbers, actions, and insights
- Use bullet lists and numbered steps for actionable advice
- Keep responses concise but thorough (aim for 200-400 words)
- End with a clear next step or question`;

    // ── Build proper multi-turn messages ─────────────────────────────
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];

    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-8)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }
    messages.push({ role: 'user', content: message });

    // Ensure messages alternate roles (Anthropic requirement)
    const cleanMessages: typeof messages = [];
    for (const msg of messages) {
      if (cleanMessages.length === 0 || cleanMessages[cleanMessages.length - 1].role !== msg.role) {
        cleanMessages.push(msg);
      } else {
        // Merge consecutive same-role messages
        cleanMessages[cleanMessages.length - 1].content += '\n\n' + msg.content;
      }
    }

    // ── Stream response from Claude ─────────────────────────────────
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: cleanMessages,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          console.error('Stream error:', err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Business Advisor Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get advisor response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
