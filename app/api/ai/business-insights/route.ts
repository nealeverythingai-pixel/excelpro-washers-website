import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { analysisType, timeframe } = await request.json()

    // Gather comprehensive business data
    const [requests, clients, quotes, jobs, invoices, users] = await Promise.all([
      db.requests.getAll(),
      db.clients.getAll(),
      db.quotes.getAll(),
      db.jobs.getAll(),
      db.invoices.getAll(),
      db.users.getAll(),
    ])

    // Calculate business metrics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const recentLeads = requests.filter(r => new Date(r.createdAt) > thirtyDaysAgo)
    const previousLeads = requests.filter(r => 
      new Date(r.createdAt) > sixtyDaysAgo && new Date(r.createdAt) <= thirtyDaysAgo
    )

    const recentJobs = jobs.filter(j => new Date(j.createdAt) > thirtyDaysAgo)
    const previousJobs = jobs.filter(j => 
      new Date(j.createdAt) > sixtyDaysAgo && new Date(j.createdAt) <= thirtyDaysAgo
    )

    const paidInvoices = invoices.filter(inv => inv.status === 'Paid')
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const recentRevenue = paidInvoices
      .filter(inv => new Date(inv.createdAt) > thirtyDaysAgo)
      .reduce((sum, inv) => sum + inv.total, 0)

    const contractors = users.filter(u => u.role === 'CONTRACTOR')
    const activeContractors = contractors.filter(c => c.active)

    // Calculate conversion rates
    const convertedLeads = requests.filter(r => r.status === 'Converted').length
    const leadConversionRate = requests.length > 0 
      ? Math.round((convertedLeads / requests.length) * 100)
      : 0

    const acceptedQuotes = quotes.filter(q => q.status === 'Approved' || q.status === 'Converted').length
    const quoteAcceptanceRate = quotes.length > 0
      ? Math.round((acceptedQuotes / quotes.length) * 100)
      : 0

    // Contractor utilization
    const assignedJobs = jobs.filter(j => j.assignedContractorId).length
    const totalJobs = jobs.length
    const contractorUtilization = totalJobs > 0
      ? Math.round((assignedJobs / totalJobs) * 100)
      : 0

    // Service breakdown
    const serviceRevenue: Record<string, number> = {}
    jobs.forEach(job => {
      const service = job.title.split('-')[0].trim() || 'Other'
      serviceRevenue[service] = (serviceRevenue[service] || 0) + job.total
    })

    // Growth metrics
    const leadGrowth = previousLeads.length > 0
      ? Math.round(((recentLeads.length - previousLeads.length) / previousLeads.length) * 100)
      : 0

    const jobGrowth = previousJobs.length > 0
      ? Math.round(((recentJobs.length - previousJobs.length) / previousJobs.length) * 100)
      : 0

    const businessMetrics = {
      // Current state
      totalLeads: requests.length,
      totalClients: clients.length,
      totalJobs: jobs.length,
      totalRevenue,
      activeContractors: activeContractors.length,
      
      // Recent performance (30 days)
      recentLeads: recentLeads.length,
      recentJobs: recentJobs.length,
      recentRevenue,
      
      // Conversion metrics
      leadConversionRate,
      quoteAcceptanceRate,
      contractorUtilization,
      
      // Growth metrics
      leadGrowth,
      jobGrowth,
      
      // Service breakdown
      serviceRevenue,
      
      // Average values
      avgJobValue: totalJobs > 0 ? Math.round(totalRevenue / totalJobs) : 0,
      avgLeadsPerMonth: Math.round(requests.length / Math.max(1, 
        (now.getTime() - new Date(requests[0]?.createdAt || now).getTime()) / (30 * 24 * 60 * 60 * 1000)
      )),
      
      // Contractor performance
      contractorStats: contractors.map(c => {
        const contractorJobs = jobs.filter(j => j.assignedContractorId === c.id)
        const completed = contractorJobs.filter(j => j.status === 'Completed').length
        return {
          name: c.name,
          totalJobs: contractorJobs.length,
          completedJobs: completed,
          completionRate: contractorJobs.length > 0 
            ? Math.round((completed / contractorJobs.length) * 100)
            : 0,
          skills: c.skills || [],
          totalEarnings: c.totalEarnings || 0,
        }
      }),
    }

    // Development roadmap context
    const developmentContext = `
EXCELPRO WASHERS DEVELOPMENT ROADMAP:

CURRENT INFRASTRUCTURE:
- Next.js 14 with App Router
- JSON file database (.local-db.json)
- Claude 3 Haiku for AI agents
- Twilio for SMS notifications
- Resend for email automation
- Stripe for payments (test mode)
- Deployed locally (dev mode)

EXISTING AI AGENTS:
1. Lead Qualification Agent (Claude)
2. Email Automation (Resend - 6 triggers)
3. SMS Notifications (Twilio - 3 triggers)
4. Quote Optimizer (Claude)
5. Contractor Analytics (Claude)
6. Customer Communication Assistant (Claude)
7. Business Insights Agent (YOU)

PLANNED DEVELOPMENT PHASES:

PHASE 1 (CURRENT - Month 1):
- Multi-portal system (Admin, Sales, Contractor) ✓
- Job distribution automation ✓
- First-come-first-served contractor system ✓
- Basic AI agents ✓
- JSON file database ✓

PHASE 2 (Month 2-3):
- Deploy to production (Vercel + Cloudflare domain)
- Migrate from JSON to Supabase PostgreSQL
- Add AI feedback loop (learning from outcomes)
- Enhanced business analytics dashboard
- Automated weekly reports

PHASE 3 (Month 4-6):
- Vector database + RAG (pgvector in Supabase)
- Semantic search over quotes/jobs/customers
- Predictive analytics (revenue forecasting)
- Dynamic pricing based on demand
- Advanced contractor recommendation engine

PHASE 4 (Month 6-12):
- Real-time notifications (WebSockets)
- Mobile app for contractors
- Customer portal for tracking
- Integration with accounting software
- Consider MCP servers if needed

INFRASTRUCTURE UPGRADE TRIGGERS:
- 100+ clients → Migrate to PostgreSQL
- 500+ jobs → Add vector database for RAG
- 10+ contractors → Advanced scheduling AI
- $50k+ monthly revenue → Consider custom infrastructure
- Multiple locations → Geographic routing system
`

    const prompt = `You are the Business Insights AI Agent for ExcelPro Washers. Your role is to analyze business performance, identify opportunities, and recommend the right tools/infrastructure based on growth stage.

${developmentContext}

CURRENT BUSINESS METRICS:
${JSON.stringify(businessMetrics, null, 2)}

BUSINESS STAGE ASSESSMENT CRITERIA:
- Startup (0-20 clients, <$10k revenue, 1-3 contractors)
- Growth (20-100 clients, $10k-$50k revenue, 3-10 contractors)
- Scale-Up (100-500 clients, $50k-$200k revenue, 10-30 contractors)
- Enterprise (500+ clients, $200k+ revenue, 30+ contractors)

YOUR TASK: Provide comprehensive business insights with THREE sections:

1. CURRENT STATE ASSESSMENT:
   - What stage is the business in?
   - What's working well?
   - What are the bottlenecks?
   - Are they ready for next development phase?

2. STRATEGIC RECOMMENDATIONS:
   - Top 3 priorities to focus on NOW
   - Infrastructure/tools needed based on current scale
   - When to upgrade (e.g., "Migrate to PostgreSQL when you hit 50 clients")
   - Which AI agents need improvement
   - Marketing/operational suggestions

3. GROWTH PREDICTIONS & PLANNING:
   - Revenue forecast (next 30/60/90 days)
   - When will they hit next infrastructure trigger?
   - Recommended hiring timeline (contractors, sales)
   - Tool/infrastructure upgrade schedule
   - Budget recommendations

4. INTELLIGENT QUESTIONS TO ASK:
   Based on the data gaps, ask 3-5 questions that would help you provide better insights:
   - "How many hours per week does each contractor work?"
   - "What's your customer acquisition cost?"
   - "Are there seasonal patterns I should know about?"
   etc.

IMPORTANT: Match recommendations to their ACTUAL growth stage. Don't recommend enterprise tools for a startup. Be specific about triggers like "When you reach 100 jobs, implement X" or "At $50k monthly revenue, consider Y".

Return JSON:
{
  "businessStage": "<startup|growth|scale-up|enterprise>",
  "stageProgress": "<percentage through current stage>",
  "summary": "<executive summary>",
  "wins": ["<achievement 1>", "<achievement 2>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "topPriorities": [
    {
      "priority": "<priority name>",
      "reasoning": "<why this matters now>",
      "actionItems": ["<action 1>", "<action 2>"],
      "timeline": "<when to implement>"
    }
  ],
  "infrastructureRecommendations": [
    {
      "tool": "<tool/upgrade name>",
      "trigger": "<when to implement>",
      "reasoning": "<why needed>",
      "cost": "<estimated cost>",
      "priority": "<critical|high|medium|low>"
    }
  ],
  "predictions": {
    "next30Days": {
      "revenue": <number>,
      "jobs": <number>,
      "newClients": <number>
    },
    "next60Days": {
      "revenue": <number>,
      "jobs": <number>,
      "newClients": <number>
    },
    "milestones": [
      {
        "milestone": "<milestone name>",
        "estimatedDate": "<when>",
        "preparation": ["<what to do before>"]
      }
    ]
  },
  "questionsForOwner": [
    {
      "question": "<question>",
      "why": "<why this helps>",
      "impact": "<high|medium|low>"
    }
  ],
  "aiAgentPerformance": [
    {
      "agent": "<agent name>",
      "status": "<excellent|good|needs-improvement>",
      "recommendation": "<what to improve>"
    }
  ]
}

Be data-driven, specific, and actionable. Return ONLY valid JSON, no markdown.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    let insights
    try {
      const cleanedText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      insights = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse AI response as JSON')
    }

    return NextResponse.json({
      success: true,
      insights,
      metrics: businessMetrics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating business insights:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate business insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
