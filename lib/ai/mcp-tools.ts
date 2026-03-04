/**
 * MCP Tool Definitions for ExcelPro AI
 *
 * These tools are passed to Anthropic's tool_use API so the AI Business
 * Advisor can take real actions inside the CRM:  create clients, schedule
 * jobs, generate quotes/invoices, manage leads, and look up data.
 *
 * Architecture:
 *   AI Advisor  ──(tool_use)──▸  toolDefinitions  ──▸  executeTool()  ──▸  db / leadRequests / etc.
 */

import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/lib/db';
import { leadRequests, leadFollowUps, leadQuotes, type LeadQuote } from '@/lib/db/leads';
import { voiceCallLogs, voiceBookings } from '@/lib/db/voice';
import { subscribers } from '@/lib/db/subscribers';
import {
  semanticSearch,
  upsertEmbedding,
  clientToText,
  jobToText,
  quoteToText,
  syncAllEmbeddings,
} from '@/lib/ai/embeddings';
import { EmailService } from '@/lib/email/EmailService';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Tool definitions (Anthropic tool_use format)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const toolDefinitions: Anthropic.Messages.Tool[] = [
  // ── READ: Clients ──────────────────────────────────────────────
  {
    name: 'list_clients',
    description: 'List all clients in the CRM. Returns an array of client objects with id, firstName, lastName, email, phone, address, companyName, createdAt.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_client',
    description: 'Get a single client by ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Client ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_clients',
    description: 'Search clients by name, email, or phone. Returns matching clients.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search term (name, email, or phone)' },
      },
      required: ['query'],
    },
  },

  // ── WRITE: Clients ─────────────────────────────────────────────
  {
    name: 'create_client',
    description: 'Create a new client in the CRM. Always confirm with the user before creating.',
    input_schema: {
      type: 'object' as const,
      properties: {
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        address: { type: 'string', description: 'Street address' },
        companyName: { type: 'string', description: 'Company name (optional)' },
      },
      required: ['firstName', 'lastName', 'email', 'phone', 'address'],
    },
  },
  {
    name: 'update_client',
    description: 'Update an existing client. Only include fields to change.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Client ID' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        address: { type: 'string' },
        companyName: { type: 'string' },
      },
      required: ['id'],
    },
  },

  // ── READ: Jobs ─────────────────────────────────────────────────
  {
    name: 'list_jobs',
    description: 'List all jobs. Optionally filter by status. Returns id, clientId, title, description, status, startDate, total, assignedContractorName, etc.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', description: 'Filter by status: Scheduled, In Progress, Completed, Cancelled' },
        clientId: { type: 'string', description: 'Filter by client ID' },
      },
      required: [],
    },
  },
  {
    name: 'get_job',
    description: 'Get a single job by ID with full details.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Job ID' },
      },
      required: ['id'],
    },
  },

  // ── WRITE: Jobs ────────────────────────────────────────────────
  {
    name: 'create_job',
    description: 'Create a new job/work order. Always confirm details with the user before creating.',
    input_schema: {
      type: 'object' as const,
      properties: {
        clientId: { type: 'string', description: 'Client ID this job is for' },
        title: { type: 'string', description: 'Job title (e.g., "Window Cleaning - 2-storey house")' },
        description: { type: 'string', description: 'Job description/notes' },
        startDate: { type: 'string', description: 'Start date in ISO format (YYYY-MM-DD)' },
        endDate: { type: 'string', description: 'End date (optional)' },
        total: { type: 'number', description: 'Total price in dollars' },
      },
      required: ['clientId', 'title', 'startDate', 'total'],
    },
  },
  {
    name: 'update_job_status',
    description: 'Update a job status (Scheduled, In Progress, Completed, Cancelled).',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Job ID' },
        status: { type: 'string', description: 'New status: Scheduled, In Progress, Completed, Cancelled' },
      },
      required: ['id', 'status'],
    },
  },

  // ── READ: Quotes ───────────────────────────────────────────────
  {
    name: 'list_quotes',
    description: 'List all quotes. Returns id, clientId, title, total, status, items, createdAt.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', description: 'Filter by status: Draft, Sent, Accepted, Rejected' },
        clientId: { type: 'string', description: 'Filter by client ID' },
      },
      required: [],
    },
  },

  // ── WRITE: Quotes ──────────────────────────────────────────────
  {
    name: 'create_quote',
    description: 'Create a new quote for a client. Confirm details with user before creating.',
    input_schema: {
      type: 'object' as const,
      properties: {
        clientId: { type: 'string', description: 'Client ID' },
        title: { type: 'string', description: 'Quote title' },
        items: {
          type: 'array',
          description: 'Line items',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number' },
            },
            required: ['description', 'quantity', 'unitPrice'],
          },
        },
        total: { type: 'number', description: 'Total amount' },
      },
      required: ['clientId', 'title', 'items', 'total'],
    },
  },
  {
    name: 'update_quote_status',
    description: 'Update a quote status (Draft, Sent, Accepted, Rejected).',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Quote ID' },
        status: { type: 'string', description: 'New status: Draft, Sent, Accepted, Rejected' },
      },
      required: ['id', 'status'],
    },
  },

  // ── READ: Invoices ─────────────────────────────────────────────
  {
    name: 'list_invoices',
    description: 'List all invoices. Returns id, clientId, jobId, total, status, dueDate, createdAt.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', description: 'Filter by status: Draft, Sent, Paid, Unpaid, Overdue' },
        clientId: { type: 'string', description: 'Filter by client ID' },
      },
      required: [],
    },
  },

  // ── WRITE: Invoices ────────────────────────────────────────────
  {
    name: 'create_invoice',
    description: 'Create a new invoice. Confirm details with user before creating.',
    input_schema: {
      type: 'object' as const,
      properties: {
        clientId: { type: 'string', description: 'Client ID' },
        jobId: { type: 'string', description: 'Associated job ID (optional)' },
        total: { type: 'number', description: 'Invoice total in dollars' },
        dueDate: { type: 'string', description: 'Due date in ISO format (YYYY-MM-DD)' },
      },
      required: ['clientId', 'total', 'dueDate'],
    },
  },
  {
    name: 'update_invoice_status',
    description: 'Update an invoice status (Draft, Sent, Paid, Unpaid, Overdue).',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Invoice ID' },
        status: { type: 'string', description: 'New status: Draft, Sent, Paid, Unpaid, Overdue' },
      },
      required: ['id', 'status'],
    },
  },

  // ── READ: Leads ────────────────────────────────────────────────
  {
    name: 'list_leads',
    description: 'List all leads from the AI-qualified pipeline. Returns name, email, phone, service, aiScore, aiCategory (hot/warm/cold), status, estimatedValue, source (website/yelp/google/etc).',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: { type: 'string', description: 'Filter by AI category: hot, warm, cold' },
        status: { type: 'string', description: 'Filter by status: new, viewed, contacted, converted, lost, archived' },
        source: { type: 'string', description: 'Filter by lead source: website, yelp, google, thumbtack, referral, phone, other' },
      },
      required: [],
    },
  },
  {
    name: 'get_lead_stats',
    description: 'Get lead pipeline statistics: total, hot, warm, cold, converted counts, average AI score.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'update_lead_status',
    description: 'Update a lead status (new, viewed, contacted, converted, lost, archived).',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Lead ID' },
        status: { type: 'string', description: 'New status: new, viewed, contacted, converted, lost, archived' },
      },
      required: ['id', 'status'],
    },
  },

  // ── READ: Requests ─────────────────────────────────────────────
  {
    name: 'list_requests',
    description: 'List all service requests / contact form submissions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', description: 'Filter by status: New, Viewed, Contacted, Converted' },
      },
      required: [],
    },
  },

  // ── READ: Contractors ──────────────────────────────────────────
  {
    name: 'list_contractors',
    description: 'List all contractors with their skills, completed jobs, and earnings.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  // ── READ: Voice / Calls ────────────────────────────────────────
  {
    name: 'list_call_logs',
    description: 'List recent call logs from the AI receptionist.',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Number of logs to return (default 20)' },
      },
      required: [],
    },
  },
  {
    name: 'list_voice_bookings',
    description: 'List bookings created by the AI phone receptionist.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', description: 'Filter by status: new, contacted, scheduled, completed, cancelled' },
      },
      required: [],
    },
  },

  // ── READ: Email Subscribers ────────────────────────────────────
  {
    name: 'get_subscriber_stats',
    description: 'Get email subscriber statistics: total, active, unsubscribed, by source.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  // ── Business Analytics ─────────────────────────────────────────
  {
    name: 'get_revenue_summary',
    description: 'Get revenue summary: total revenue, last 30 days, pending, average job value, top services by revenue.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_pipeline_overview',
    description: 'Get full business pipeline: leads → requests → quotes → jobs → invoices counts and conversion rates.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  // ── Convert lead to client ─────────────────────────────────────
  {
    name: 'convert_lead_to_client',
    description: 'Convert an AI-qualified lead into a CRM client and create an initial quote/job. Confirm with the user first.',
    input_schema: {
      type: 'object' as const,
      properties: {
        leadId: { type: 'string', description: 'Lead ID from the AI pipeline' },
        createQuote: { type: 'boolean', description: 'Whether to auto-create a quote from the lead estimate' },
      },
      required: ['leadId'],
    },
  },

  // ── Semantic Search ────────────────────────────────────────────
  {
    name: 'search_crm_semantic',
    description: 'Search across ALL CRM data using natural language / meaning-based search. Use this when the user describes something vaguely like "that guy on Bank Street" or "the big pressure washing job last month". Returns the most relevant matching records.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Natural language search query' },
        entityType: { type: 'string', description: 'Optional: filter to client, job, quote, lead, or request' },
        limit: { type: 'number', description: 'Max results (default 10)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'sync_search_index',
    description: 'Re-index all CRM records for semantic search. Use when the user says search results are stale or after bulk data changes.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  // ── Email Actions ──────────────────────────────────────────────
  {
    name: 'send_email',
    description: 'Send a custom email to any email address via Resend. Use for individual outreach, promos, follow-ups, or campaign emails. The body should be well-formatted HTML. ALWAYS confirm with the admin before calling this tool.',
    input_schema: {
      type: 'object' as const,
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject line' },
        bodyHtml: { type: 'string', description: 'Email body as HTML. Use professional styling, headings, bullet points, CTA buttons. Include ExcelPro Washers branding.' },
      },
      required: ['to', 'subject', 'bodyHtml'],
    },
  },
  {
    name: 'send_quote_email',
    description: 'Send a professional instant quote email to a client/lead with service pricing, timeline, and CTA. Use when the user asks to email a quote to someone.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Recipient name' },
        email: { type: 'string', description: 'Recipient email' },
        service: { type: 'string', description: 'Services requested (comma-separated: "Window Cleaning, Pressure Washing")' },
        estimatedValue: { type: 'number', description: 'Estimated price in dollars' },
        details: { type: 'string', description: 'Optional extra details about the job' },
        leadCategory: { type: 'string', description: 'Lead priority: hot, warm, or cold' },
      },
      required: ['name', 'email', 'service', 'estimatedValue'],
    },
  },
  {
    name: 'send_follow_up_email',
    description: 'Send a follow-up email to a lead/client who received a quote but has not booked yet.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Recipient name' },
        email: { type: 'string', description: 'Recipient email' },
        service: { type: 'string', description: 'Service they were quoted on' },
        daysSince: { type: 'number', description: 'Days since the original quote was sent' },
      },
      required: ['name', 'email', 'service', 'daysSince'],
    },
  },
  {
    name: 'send_special_offer_email',
    description: 'Send a special discount offer email (15% off) to a lead/client. Good for re-engaging cold leads or filling schedule gaps.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Recipient name' },
        email: { type: 'string', description: 'Recipient email' },
        service: { type: 'string', description: 'Service to discount' },
        originalPrice: { type: 'number', description: 'Original price before discount' },
      },
      required: ['name', 'email', 'service', 'originalPrice'],
    },
  },

  // ── Yelp Lead Management ───────────────────────────────────────
  {
    name: 'list_yelp_leads',
    description: 'List all leads that came from Yelp. Shortcut for list_leads with source=yelp. Returns name, email, phone, service, aiScore, category, status.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: { type: 'string', description: 'Filter by AI category: hot, warm, cold' },
        status: { type: 'string', description: 'Filter by status: new, viewed, contacted, converted, lost, archived' },
      },
      required: [],
    },
  },
  {
    name: 'get_yelp_lead_stats',
    description: 'Get Yelp-specific lead statistics: total Yelp leads, breakdown by category (hot/warm/cold), conversion rate, average AI score, total estimated value.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_leads_by_source',
    description: 'Get a breakdown of leads grouped by source (website, yelp, google, thumbtack, referral, phone). Shows count, conversion rate, and avg score per source.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Tool executor — runs the actual action
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function executeTool(
  name: string,
  input: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    switch (name) {
      // ── Clients ──────────────────────────────────────────────
      case 'list_clients': {
        const clients = await db.clients.getAll();
        return { success: true, data: clients };
      }
      case 'get_client': {
        const client = await db.clients.findById(input.id);
        if (!client) return { success: false, error: `Client ${input.id} not found` };
        return { success: true, data: client };
      }
      case 'search_clients': {
        const all = await db.clients.getAll();
        const q = input.query.toLowerCase();
        const matches = all.filter(c =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
        );
        return { success: true, data: matches };
      }
      case 'create_client': {
        const client = await db.clients.create({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          address: input.address,
          companyName: input.companyName,
        });
        // Auto-index for semantic search
        if (client) {
          upsertEmbedding('client', client.id, clientToText(client), {
            name: `${client.firstName} ${client.lastName}`,
            email: client.email,
          }).catch(() => {});
        }
        return { success: true, data: client };
      }
      case 'update_client': {
        const { id, ...updates } = input;
        const updated = await db.clients.update(id, updates);
        return { success: true, data: updated };
      }

      // ── Jobs ─────────────────────────────────────────────────
      case 'list_jobs': {
        let jobs = await db.jobs.getAll();
        if (input.status) jobs = jobs.filter(j => j.status === input.status);
        if (input.clientId) jobs = jobs.filter(j => j.clientId === input.clientId);
        return { success: true, data: jobs };
      }
      case 'get_job': {
        const job = await db.jobs.findById(input.id);
        if (!job) return { success: false, error: `Job ${input.id} not found` };
        return { success: true, data: job };
      }
      case 'create_job': {
        const job = await db.jobs.create({
          clientId: input.clientId,
          title: input.title,
          description: input.description || '',
          startDate: input.startDate,
          endDate: input.endDate,
          total: input.total,
          status: 'Scheduled',
        });
        // Auto-index for semantic search
        if (job) {
          upsertEmbedding('job', job.id, jobToText(job), {
            title: job.title, status: job.status, total: job.total,
          }).catch(() => {});
        }
        return { success: true, data: job };
      }
      case 'update_job_status': {
        const updated = await db.jobs.update(input.id, { status: input.status });
        return { success: true, data: updated };
      }

      // ── Quotes ───────────────────────────────────────────────
      case 'list_quotes': {
        let quotes = await db.quotes.getAll();
        if (input.status) quotes = quotes.filter(q => q.status === input.status);
        if (input.clientId) quotes = quotes.filter(q => q.clientId === input.clientId);
        return { success: true, data: quotes };
      }
      case 'create_quote': {
        const quote = await db.quotes.create({
          clientId: input.clientId,
          title: input.title,
          items: input.items || [],
          total: input.total,
          status: 'Draft',
        });
        // Auto-index for semantic search
        if (quote) {
          upsertEmbedding('quote', quote.id, quoteToText(quote), {
            title: quote.title, status: quote.status, total: quote.total,
          }).catch(() => {});
        }
        return { success: true, data: quote };
      }
      case 'update_quote_status': {
        const updated = await db.quotes.updateStatus(input.id, input.status);
        return { success: true, data: updated };
      }

      // ── Invoices ─────────────────────────────────────────────
      case 'list_invoices': {
        let invoices = await db.invoices.getAll();
        if (input.status) invoices = invoices.filter(i => i.status === input.status);
        if (input.clientId) invoices = invoices.filter(i => i.clientId === input.clientId);
        return { success: true, data: invoices };
      }
      case 'create_invoice': {
        const invoice = await db.invoices.create({
          clientId: input.clientId,
          jobId: input.jobId,
          total: input.total,
          dueDate: input.dueDate,
          status: 'Draft',
        });
        return { success: true, data: invoice };
      }
      case 'update_invoice_status': {
        const updated = await db.invoices.updateStatus(input.id, input.status);
        return { success: true, data: updated };
      }

      // ── Leads (Supabase) ─────────────────────────────────────
      case 'list_leads': {
        let leads = await leadRequests.getAll();
        if (input.category) leads = leads.filter(l => l.ai_category === input.category);
        if (input.status) leads = leads.filter(l => l.status === input.status);
        if (input.source) leads = leads.filter(l => l.source === input.source);
        return { success: true, data: leads };
      }
      case 'get_lead_stats': {
        const stats = await leadRequests.getStats();
        return { success: true, data: stats };
      }
      case 'update_lead_status': {
        const updated = await leadRequests.update(input.id, { status: input.status });
        return { success: true, data: updated };
      }

      // ── Yelp Leads ───────────────────────────────────────────
      case 'list_yelp_leads': {
        let leads = await leadRequests.getAll();
        leads = leads.filter(l => l.source === 'yelp');
        if (input.category) leads = leads.filter(l => l.ai_category === input.category);
        if (input.status) leads = leads.filter(l => l.status === input.status);
        return { success: true, data: leads };
      }
      case 'get_yelp_lead_stats': {
        const allLeads = await leadRequests.getAll();
        const yelpLeads = allLeads.filter(l => l.source === 'yelp');
        const hot = yelpLeads.filter(l => l.ai_category === 'hot').length;
        const warm = yelpLeads.filter(l => l.ai_category === 'warm').length;
        const cold = yelpLeads.filter(l => l.ai_category === 'cold').length;
        const converted = yelpLeads.filter(l => l.status === 'converted').length;
        const avgScore = yelpLeads.length > 0 ? Math.round(yelpLeads.reduce((s, l) => s + (l.ai_score || 0), 0) / yelpLeads.length) : 0;
        const totalValue = yelpLeads.reduce((s, l) => s + (l.estimated_value || 0), 0);
        return {
          success: true,
          data: {
            total: yelpLeads.length,
            hot, warm, cold,
            converted,
            conversionRate: yelpLeads.length > 0 ? `${Math.round((converted / yelpLeads.length) * 100)}%` : '0%',
            avgAiScore: avgScore,
            totalEstimatedValue: totalValue,
          },
        };
      }
      case 'get_leads_by_source': {
        const allLeads = await leadRequests.getAll();
        const sources = ['website', 'yelp', 'google', 'thumbtack', 'referral', 'phone', 'other'];
        const breakdown = sources.map(src => {
          const srcLeads = allLeads.filter(l => (l.source || 'website') === src);
          const conv = srcLeads.filter(l => l.status === 'converted').length;
          return {
            source: src,
            count: srcLeads.length,
            converted: conv,
            conversionRate: srcLeads.length > 0 ? `${Math.round((conv / srcLeads.length) * 100)}%` : '0%',
            avgScore: srcLeads.length > 0 ? Math.round(srcLeads.reduce((s, l) => s + (l.ai_score || 0), 0) / srcLeads.length) : 0,
            totalValue: srcLeads.reduce((s, l) => s + (l.estimated_value || 0), 0),
          };
        }).filter(s => s.count > 0);
        // Also show untagged leads (source is null/undefined)
        const untagged = allLeads.filter(l => !l.source);
        if (untagged.length > 0) {
          const conv = untagged.filter(l => l.status === 'converted').length;
          breakdown.push({
            source: 'untagged',
            count: untagged.length,
            converted: conv,
            conversionRate: untagged.length > 0 ? `${Math.round((conv / untagged.length) * 100)}%` : '0%',
            avgScore: Math.round(untagged.reduce((s, l) => s + (l.ai_score || 0), 0) / untagged.length),
            totalValue: untagged.reduce((s, l) => s + (l.estimated_value || 0), 0),
          });
        }
        return { success: true, data: breakdown };
      }

      // ── Requests ─────────────────────────────────────────────
      case 'list_requests': {
        let requests = await db.requests.getAll();
        if (input.status) requests = requests.filter(r => r.status === input.status);
        return { success: true, data: requests };
      }

      // ── Contractors ──────────────────────────────────────────
      case 'list_contractors': {
        const users = await db.users.getAll();
        const contractors = users.filter(u => u.role === 'CONTRACTOR');
        return { success: true, data: contractors };
      }

      // ── Voice / Calls ────────────────────────────────────────
      case 'list_call_logs': {
        const logs = await voiceCallLogs.getAll(input.limit || 20);
        return { success: true, data: logs };
      }
      case 'list_voice_bookings': {
        let bookings = await voiceBookings.getAll(50);
        if (input.status) bookings = bookings.filter(b => b.status === input.status);
        return { success: true, data: bookings };
      }

      // ── Subscribers ──────────────────────────────────────────
      case 'get_subscriber_stats': {
        const stats = await subscribers.getStats();
        return { success: true, data: stats };
      }

      // ── Analytics ────────────────────────────────────────────
      case 'get_revenue_summary': {
        const [invoices, jobs] = await Promise.all([
          db.invoices.getAll(),
          db.jobs.getAll(),
        ]);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const paidInvoices = invoices.filter(i => i.status === 'Paid');
        const totalRevenue = paidInvoices.reduce((s, i) => s + i.total, 0);
        const recentRevenue = paidInvoices
          .filter(i => new Date(i.createdAt) > thirtyDaysAgo)
          .reduce((s, i) => s + i.total, 0);
        const pendingRevenue = invoices
          .filter(i => i.status === 'Sent' || i.status === 'Unpaid')
          .reduce((s, i) => s + i.total, 0);
        const completedJobs = jobs.filter(j => j.status === 'Completed').length;
        const avgJobValue = completedJobs > 0 ? Math.round(totalRevenue / completedJobs) : 0;

        // Revenue by service
        const serviceRevenue: Record<string, number> = {};
        paidInvoices.forEach(inv => {
          const job = jobs.find(j => j.id === inv.jobId);
          const service = job ? job.title.split('-')[0].trim() : 'Other';
          serviceRevenue[service] = (serviceRevenue[service] || 0) + inv.total;
        });

        return {
          success: true,
          data: {
            totalRevenue,
            revenueLast30Days: recentRevenue,
            pendingRevenue,
            completedJobs,
            avgJobValue,
            serviceRevenue,
          },
        };
      }
      case 'get_pipeline_overview': {
        const [clients, jobs, quotes, invoices, leads, requests] = await Promise.all([
          db.clients.getAll(),
          db.jobs.getAll(),
          db.quotes.getAll(),
          db.invoices.getAll(),
          leadRequests.getAll(),
          db.requests.getAll(),
        ]);
        const leadStats = await leadRequests.getStats();
        return {
          success: true,
          data: {
            leads: { ...leadStats, total: leads.length },
            requests: { total: requests.length, new: requests.filter(r => r.status === 'New').length },
            clients: { total: clients.length },
            quotes: {
              total: quotes.length,
              draft: quotes.filter(q => q.status === 'Draft').length,
              sent: quotes.filter(q => q.status === 'Sent').length,
              accepted: quotes.filter(q => q.status === 'Accepted').length,
            },
            jobs: {
              total: jobs.length,
              scheduled: jobs.filter(j => j.status === 'Scheduled').length,
              inProgress: jobs.filter(j => j.status === 'Active').length,
              completed: jobs.filter(j => j.status === 'Completed').length,
            },
            invoices: {
              total: invoices.length,
              paid: invoices.filter(i => i.status === 'Paid').length,
              sent: invoices.filter(i => i.status === 'Sent').length,
              overdue: invoices.filter(i => i.status === 'Overdue').length,
            },
          },
        };
      }

      // ── Convert lead → client ────────────────────────────────
      case 'convert_lead_to_client': {
        const lead = await leadRequests.findById(input.leadId);
        if (!lead) return { success: false, error: `Lead ${input.leadId} not found` };

        // Create client from lead
        const client = await db.clients.create({
          firstName: lead.first_name || lead.name?.split(' ')[0] || 'Unknown',
          lastName: lead.last_name || lead.name?.split(' ').slice(1).join(' ') || '',
          email: lead.email,
          phone: lead.phone,
          address: lead.address || '',
        });

        // Mark lead as converted
        await leadRequests.update(input.leadId, { status: 'converted' });

        let quote = null;
        if (input.createQuote && lead.estimated_value && client) {
          // Find the lead's auto-generated quote from Supabase
          const allLeadQuotes = await leadQuotes.getAll();
          const matchingQuote = allLeadQuotes.find(
            (q: LeadQuote) => q.request_id === input.leadId
          );
          quote = await db.quotes.create({
            clientId: client.id,
            title: `${lead.service || 'Service'} Quote`,
            items: matchingQuote?.items || [],
            total: matchingQuote?.total || lead.estimated_value,
            status: 'Draft',
          });
        }

        return {
          success: true,
          data: {
            client,
            quote,
            message: `Converted lead "${lead.name || lead.email}" to client${quote ? ' with draft quote' : ''}.`,
          },
        };
      }

      // ── Semantic Search ──────────────────────────────────────
      case 'search_crm_semantic': {
        const results = await semanticSearch(input.query, {
          entityType: input.entityType,
          limit: input.limit || 10,
        });
        return { success: true, data: results };
      }
      case 'sync_search_index': {
        const counts = await syncAllEmbeddings();
        return {
          success: true,
          data: {
            message: `Re-indexed ${counts.clients} clients, ${counts.jobs} jobs, ${counts.leads} leads, ${counts.quotes} quotes.`,
            counts,
          },
        };
      }

      // ── Email Actions ────────────────────────────────────────
      case 'send_email': {
        const result = await EmailService.send({
          to: input.to,
          subject: input.subject,
          html: input.bodyHtml,
        });
        if (!result.success) {
          return { success: false, error: result.error || 'Email send failed' };
        }
        return {
          success: true,
          data: {
            message: `Email sent to ${input.to}`,
            subject: input.subject,
            messageId: result.messageId,
          },
        };
      }
      case 'send_quote_email': {
        const sent = await EmailService.sendInstantQuote({
          name: input.name,
          email: input.email,
          service: input.service,
          estimatedValue: input.estimatedValue,
          details: input.details,
          leadCategory: input.leadCategory as 'hot' | 'warm' | 'cold' | undefined,
        });
        return {
          success: sent,
          data: sent
            ? { message: `Quote email sent to ${input.name} (${input.email}) for ${input.service} at ~$${input.estimatedValue}` }
            : undefined,
          error: sent ? undefined : 'Failed to send quote email — check RESEND_API_KEY',
        };
      }
      case 'send_follow_up_email': {
        const sent = await EmailService.sendFollowUp({
          name: input.name,
          email: input.email,
          service: input.service,
          daysSince: input.daysSince,
        });
        return {
          success: sent,
          data: sent
            ? { message: `Follow-up email sent to ${input.name} (${input.email}) about their ${input.service} quote` }
            : undefined,
          error: sent ? undefined : 'Failed to send follow-up email — check RESEND_API_KEY',
        };
      }
      case 'send_special_offer_email': {
        const sent = await EmailService.sendSpecialOffer({
          name: input.name,
          email: input.email,
          service: input.service,
          originalPrice: input.originalPrice,
        });
        return {
          success: sent,
          data: sent
            ? { message: `Special offer email (15% off) sent to ${input.name} (${input.email}) — $${input.originalPrice} → $${Math.round(input.originalPrice * 0.85)}` }
            : undefined,
          error: sent ? undefined : 'Failed to send offer email — check RESEND_API_KEY',
        };
      }

      default:
        return { success: false, error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    console.error(`[MCP] Tool "${name}" failed:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error executing tool',
    };
  }
}
