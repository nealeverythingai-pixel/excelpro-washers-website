import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/lib/db';
import { leadRequests, leadFollowUps } from '@/lib/db/leads';
import { subscribers } from '@/lib/db/subscribers';
import { voiceCallLogs, voiceBookings } from '@/lib/db/voice';
import { isRateLimited, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // ── Auth: verify admin session ──────────────────────────────────
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Check required API keys ─────────────────────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured. Add it to your Vercel environment variables.' },
        { status: 500 }
      );
    }

    // ── Rate limiting: 5 req/min per IP (dashboard page, not chat) ──
    const clientIp = getClientIp(request);
    if (isRateLimited(`insights-${clientIp}`, 5, 60_000)) {
      return rateLimitResponse(60);
    }

    // ── Gather data from BOTH sources ───────────────────────────────
    // JSON DB (clients, jobs, quotes, invoices — not yet migrated)
    const [clients, quotes, jobs, invoices, users] = await Promise.all([
      db.clients.getAll(),
      db.quotes.getAll(),
      db.jobs.getAll(),
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

    // ── Calculate metrics ───────────────────────────────────────────
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentLeads = allLeads.filter(r => new Date(r.created_at) > thirtyDaysAgo);
    const previousLeads = allLeads.filter(r =>
      new Date(r.created_at) > sixtyDaysAgo && new Date(r.created_at) <= thirtyDaysAgo
    );

    const recentJobs = jobs.filter(j => new Date(j.createdAt) > thirtyDaysAgo);
    const previousJobs = jobs.filter(j =>
      new Date(j.createdAt) > sixtyDaysAgo && new Date(j.createdAt) <= thirtyDaysAgo
    );

    const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const recentRevenue = paidInvoices
      .filter(inv => new Date(inv.createdAt) > thirtyDaysAgo)
      .reduce((sum, inv) => sum + inv.total, 0);

    const contractors = users.filter(u => u.role === 'CONTRACTOR');
    const activeContractors = contractors.filter(c => c.active);

    const acceptedQuotes = quotes.filter(q => q.status === 'Approved' || q.status === 'Converted').length;
    const quoteAcceptanceRate = quotes.length > 0
      ? Math.round((acceptedQuotes / quotes.length) * 100)
      : 0;

    const assignedJobs = jobs.filter(j => j.assignedContractorId).length;
    const contractorUtilization = jobs.length > 0
      ? Math.round((assignedJobs / jobs.length) * 100)
      : 0;

    // Service breakdown
    const serviceRevenue: Record<string, number> = {};
    jobs.forEach(job => {
      const service = job.title.split('-')[0].trim() || 'Other';
      serviceRevenue[service] = (serviceRevenue[service] || 0) + job.total;
    });

    // Growth metrics
    const leadGrowth = previousLeads.length > 0
      ? Math.round(((recentLeads.length - previousLeads.length) / previousLeads.length) * 100)
      : 0;

    const jobGrowth = previousJobs.length > 0
      ? Math.round(((recentJobs.length - previousJobs.length) / previousJobs.length) * 100)
      : 0;

    const businessMetrics = {
      overview: {
        totalClients: clients.length,
        totalJobs: jobs.length,
        completedJobs: jobs.filter(j => j.status === 'Completed').length,
        totalRevenue,
        activeContractors: activeContractors.length,
        totalContractors: contractors.length,
      },
      recent: {
        leadsLast30Days: recentLeads.length,
        jobsLast30Days: recentJobs.length,
        revenueLast30Days: recentRevenue,
      },
      growth: {
        leadGrowth: `${leadGrowth}%`,
        jobGrowth: `${jobGrowth}%`,
      },
      performance: {
        quoteAcceptanceRate: `${quoteAcceptanceRate}%`,
        contractorUtilization: `${contractorUtilization}%`,
        avgJobValue: jobs.length > 0 ? Math.round(totalRevenue / jobs.length) : 0,
      },
      services: serviceRevenue,
      aiLeadPipeline: {
        totalLeads: leadStats.total,
        hot: leadStats.hot,
        warm: leadStats.warm,
        cold: leadStats.cold,
        converted: leadStats.converted,
        averageAIScore: leadStats.avgScore,
        pendingFollowUps: pendingFollowUps.length,
        leadConversionRate: allLeads.length > 0
          ? `${((leadStats.converted / allLeads.length) * 100).toFixed(1)}%`
          : '0%',
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
      contractorStats: contractors.map(c => {
        const contractorJobs = jobs.filter(j => j.assignedContractorId === c.id);
        const completed = contractorJobs.filter(j => j.status === 'Completed').length;
        return {
          name: c.name,
          totalJobs: contractorJobs.length,
          completedJobs: completed,
          completionRate: contractorJobs.length > 0
            ? Math.round((completed / contractorJobs.length) * 100)
            : 0,
          skills: c.skills || [],
          totalEarnings: c.totalEarnings || 0,
        };
      }),
      currentDate: now.toISOString().split('T')[0],
    };

    // ── System prompt ───────────────────────────────────────────────
    const systemPrompt = `You are the Business Insights AI Agent for ExcelPro Washers, a window cleaning and pressure washing company in Ottawa, ON.

CURRENT INFRASTRUCTURE (as of March 2026):
- Next.js app deployed on Vercel with multi-portal system (Customer, Sales, Contractor, Admin)
- Supabase PostgreSQL for leads, AI follow-ups, voice call logs, bookings, and newsletter subscribers
- Legacy JSON file DB for clients, jobs, quotes, invoices (migration to Supabase planned)
- 10 AI Agents live: Lead Qualifier (Claude 3.5 Haiku), Lead Router, Warm/Cold Lead Sequences, AI Phone Receptionist (Twilio + ElevenLabs), Business Advisor, Business Insights (you), Contractor Analytics, Customer Comm Assistant, Quote Optimizer
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

BUSINESS STAGE CRITERIA:
- Startup (0-20 clients, <$10k revenue, 1-3 contractors)
- Growth (20-100 clients, $10k-$50k revenue, 3-10 contractors)
- Scale-Up (100-500 clients, $50k-$200k revenue, 10-30 contractors)
- Enterprise (500+ clients, $200k+ revenue, 30+ contractors)

IMPORTANT RULES:
- Match recommendations to their ACTUAL growth stage. Don't recommend enterprise tools for a startup.
- Be specific about triggers: "When you reach 100 jobs, implement X" or "At $50k monthly revenue, consider Y"
- Use ACTUAL numbers from the metrics — never invent data
- Be honest: "You're not ready for that yet" when applicable
- Return ONLY valid JSON, no markdown fences, no explanations outside JSON`;

    const userPrompt = `Analyze these real-time business metrics and return comprehensive insights.

CURRENT BUSINESS METRICS:
${JSON.stringify(businessMetrics, null, 2)}

Return a JSON object with this EXACT schema:
{
  "businessStage": "startup|growth|scale-up|enterprise",
  "stageProgress": "e.g. 35% through startup",
  "currentState": {
    "summary": "1-2 sentence executive summary",
    "strengths": ["strength 1", "strength 2", ...],
    "bottlenecks": ["bottleneck 1", "bottleneck 2", ...]
  },
  "topPriorities": [
    {
      "priority": "priority name",
      "timeline": "e.g. This week, Next 2 weeks",
      "impact": "critical|high|medium",
      "actionItems": ["step 1", "step 2"]
    }
  ],
  "infrastructureRecommendations": [
    {
      "tool": "tool name",
      "trigger": "when to implement",
      "priority": "critical|high|medium|low",
      "reasoning": "why this matters",
      "estimatedCost": "$X/month"
    }
  ],
  "predictions": {
    "next30Days": { "revenue": 0, "jobs": 0, "newClients": 0 },
    "next60Days": { "revenue": 0, "jobs": 0, "newClients": 0 },
    "milestones": [
      { "milestone": "name", "estimatedDate": "when" }
    ]
  },
  "questionsForOwner": [
    { "question": "...", "why": "why this matters", "impact": "high|medium|low" }
  ],
  "aiAgentPerformance": [
    { "agent": "agent name", "status": "excellent|good|needs-improvement", "recommendation": "..." }
  ]
}

Return ONLY the JSON object. No markdown, no code fences.`;

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20250414',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    let insights;
    try {
      // Strip any accidental markdown fences
      let text = content.text.trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      }
      insights = JSON.parse(text);
    } catch {
      console.error('Failed to parse insights JSON:', content.text.slice(0, 500));
      return NextResponse.json(
        { error: 'AI returned invalid format. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      insights,
      metrics: businessMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Business Insights Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Analytics failed: ${message}` },
      { status: 500 }
    )
  }
}
