import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/lib/db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Gather comprehensive business metrics
    const clients = await db.clients.getAll();
    const jobs = await db.jobs.getAll();
    const quotes = await db.quotes.getAll();
    const invoices = await db.invoices.getAll();
    const requests = await db.requests.getAll();
    const users = await db.users.getAll();

    // Calculate key metrics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentLeads = requests.filter(r => new Date(r.createdAt) > thirtyDaysAgo).length;
    const recentJobs = jobs.filter(j => new Date(j.createdAt) > thirtyDaysAgo).length;
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

    const avgJobValue = completedJobs > 0 ? totalRevenue / completedJobs : 0;
    
    const leadConversionRate = requests.length > 0 
      ? ((clients.length / requests.length) * 100).toFixed(1)
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

    // Contractor utilization
    const contractors = users.filter(u => u.role === 'CONTRACTOR');
    const contractorStats = contractors.map(c => ({
      name: c.name,
      completedJobs: c.completedJobs || 0,
      earnings: (c as any).earnings || 0,
      skills: c.skills || []
    }));

    const businessMetrics = {
      overview: {
        totalClients: clients.length,
        totalJobs: jobs.length,
        completedJobs,
        totalRevenue,
        pendingRevenue,
        avgJobValue: Math.round(avgJobValue),
        contractors: contractors.length
      },
      recent: {
        leadsLast30Days: recentLeads,
        jobsLast30Days: recentJobs,
        revenueLast30Days: recentRevenue
      },
      performance: {
        leadConversionRate: `${leadConversionRate}%`,
        quoteAcceptanceRate: `${quoteAcceptanceRate}%`
      },
      services: serviceRevenue,
      contractors: contractorStats,
      currentDate: now.toISOString().split('T')[0]
    };

    // Development roadmap context
    const developmentContext = `
CURRENT INFRASTRUCTURE (Phase 1 - LIVE):
- Next.js 14 multi-portal system (Customer, Sales, Contractor, Admin)
- JSON file database (.local-db.json)
- 7 AI Agents: Lead Qualification, Quote Optimizer, Contractor Analytics, Business Insights, Customer Assistant, Email/SMS automation
- Stripe payment processing
- PDF invoice generation
- Real-time contractor job distribution

DEVELOPMENT ROADMAP:
Phase 2 (Month 2-3): 
- Vercel production deployment
- Supabase PostgreSQL migration (trigger: 50-100 clients)
- AI feedback loops for learning
- Customer feedback system

Phase 3 (Month 4-6):
- Vector database + RAG (trigger: 500+ jobs history)
- Predictive analytics and dynamic pricing
- Advanced contractor scheduling
- Mobile app development starts

Phase 4 (Month 6-12):
- Real-time features (WebSockets)
- Mobile app launch
- Multi-location support
- MCP servers (maybe - if needed)

INFRASTRUCTURE UPGRADE TRIGGERS:
- 100+ clients → Migrate to PostgreSQL
- 500+ jobs → Implement vector database for RAG
- 10+ contractors → Advanced AI scheduling
- $50k+ monthly revenue → Custom infrastructure
- Multiple locations → Geographic routing system
`;

    // Build conversation context
    const conversationContext = conversationHistory
      ?.slice(-5)
      .map((msg: any) => `${msg.role === 'user' ? 'Business Owner' : 'AI Advisor'}: ${msg.content}`)
      .join('\n\n') || '';

    const prompt = `You are an expert AI Business Advisor for ExcelPro Washers, a window cleaning and pressure washing company.

${developmentContext}

CURRENT BUSINESS METRICS (Real-time data):
${JSON.stringify(businessMetrics, null, 2)}

CONVERSATION HISTORY:
${conversationContext}

CURRENT QUESTION FROM BUSINESS OWNER:
"${message}"

YOUR ROLE:
- Provide specific, actionable advice based on ACTUAL business data
- Reference real numbers from the metrics above
- Recommend tools/infrastructure ONLY when triggers are met
- Be conversational, friendly, and strategic
- If data is missing, ask clarifying questions
- Focus on ROI and practical next steps
- Use emojis occasionally to be engaging

RESPONSE FORMAT REQUIREMENTS:
1. **Use markdown formatting** - Bold important text with **bold text**
2. **Provide step-by-step instructions** when recommending actions:
   - Step 1: [Action]
   - Step 2: [Action]
   - Step 3: [Action]
3. **Highlight key metrics** and important numbers in bold
4. **Structure your response clearly**:
   - Start with a brief summary (1-2 lines)
   - Break down into numbered steps or bullet points
   - End with expected outcome or next milestone
5. Use **bold** for:
   - Important metrics (e.g., **$1,200 revenue**, **5 active clients**)
   - Action items and deadlines (e.g., **Deploy by Week 2**, **Hire contractor now**)
   - Key insights (e.g., **Critical bottleneck**, **High priority**)
   - Tool recommendations (e.g., **Supabase PostgreSQL**, **Stripe payments**)

GUIDELINES:
1. Answer directly with step-by-step actionable advice
2. Use actual data: "You have **X clients**" not "You might have..."
3. Match recommendations to growth stage:
   - Startup (0-20 clients): Focus on getting customers, testing processes
   - Growth (20-100 clients): Optimize operations, quality control
   - Scale-Up (100-500 clients): Automate, hire, infrastructure upgrades
   - Enterprise (500+ clients): Advanced systems, multiple locations
4. Be honest: "You're not ready for that yet" or "**Perfect timing for this**"
5. Explain the "why" behind recommendations

Example response format:
"Right now you have **2 clients** and **$2,050 in revenue** 📊

**Here's your action plan for this week:**

**Step 1: Deploy to Production** (Priority: Critical)
- Set up Vercel account
- Connect your GitHub repository
- Deploy in 15 minutes
- **Why:** Get real customers testing your system

**Step 2: Generate Your First Lead**
- Share website with 5 local businesses
- Post on Facebook community groups
- **Target:** 3 leads by end of week

**Expected Outcome:** By next Friday, you'll have **3-5 new leads** and real feedback on your automation."

Respond to the business owner's question now using this format:`;


    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const advisorResponse = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I had trouble processing that. Could you rephrase your question?';

    return NextResponse.json({
      response: advisorResponse,
      metrics: businessMetrics
    });

  } catch (error) {
    console.error('Business Advisor Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get advisor response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
