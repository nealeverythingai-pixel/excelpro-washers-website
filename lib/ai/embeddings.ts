/**
 * Semantic Search Service — pgvector + Voyage/OpenAI Embeddings
 *
 * Generates text embeddings for CRM records and stores them in
 * Supabase pgvector for meaning-based search.
 *
 * Used by the AI Advisor's search_crm_semantic tool to find records
 * by meaning rather than exact keyword match.
 */

import { supabase } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

// ── Types ────────────────────────────────────────────────────────────

export interface EmbeddingRecord {
  entity_type: string;
  entity_id: string;
  content: string;
  metadata: Record<string, any>;
  similarity?: number;
}

// ── Embedding generation ─────────────────────────────────────────────
// Uses Anthropic's Voyage embeddings via the API if available,
// otherwise falls back to a lightweight text representation.

const EMBEDDING_DIM = 1536;

/**
 * Generate an embedding vector for text using Voyage API.
 * Falls back to null if not available (records still stored for keyword search).
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.VOYAGE_API_KEY || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('[Embeddings] No VOYAGE_API_KEY or OPENAI_API_KEY set — skipping vector embedding');
    return null;
  }

  try {
    // Try Voyage API first (recommended for Anthropic ecosystem)
    if (process.env.VOYAGE_API_KEY) {
      const res = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'voyage-3-lite',
          input: [text.slice(0, 4000)], // Truncate to stay within limits
          input_type: 'document',
        }),
      });
      const data = await res.json();
      if (data.data?.[0]?.embedding) {
        return data.data[0].embedding;
      }
    }

    // Fallback: OpenAI ada-002
    if (process.env.OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text.slice(0, 8000),
        }),
      });
      const data = await res.json();
      if (data.data?.[0]?.embedding) {
        return data.data[0].embedding;
      }
    }

    return null;
  } catch (err) {
    console.error('[Embeddings] Failed to generate embedding:', err);
    return null;
  }
}

// ── Text builders (turn records into searchable text) ────────────────

export function clientToText(client: any): string {
  return [
    `Client: ${client.firstName || client.first_name} ${client.lastName || client.last_name}`,
    client.companyName || client.company_name ? `Company: ${client.companyName || client.company_name}` : '',
    `Email: ${client.email}`,
    `Phone: ${client.phone}`,
    `Address: ${client.address}`,
  ].filter(Boolean).join('. ');
}

export function jobToText(job: any, clientName?: string): string {
  return [
    `Job: ${job.title}`,
    clientName ? `Client: ${clientName}` : '',
    job.description ? `Description: ${job.description}` : '',
    `Status: ${job.status}`,
    `Total: $${job.total}`,
    `Date: ${job.startDate || job.start_date}`,
    job.assignedContractorName || job.assigned_contractor_name
      ? `Contractor: ${job.assignedContractorName || job.assigned_contractor_name}`
      : '',
  ].filter(Boolean).join('. ');
}

export function leadToText(lead: any): string {
  return [
    `Lead: ${lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`}`.trim(),
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    lead.service ? `Service: ${lead.service}` : '',
    lead.message ? `Message: ${lead.message}` : '',
    lead.ai_category ? `AI Category: ${lead.ai_category}` : '',
    lead.ai_score ? `AI Score: ${lead.ai_score}` : '',
    lead.estimated_value ? `Estimated Value: $${lead.estimated_value}` : '',
  ].filter(Boolean).join('. ');
}

export function quoteToText(quote: any, clientName?: string): string {
  return [
    `Quote: ${quote.title}`,
    clientName ? `Client: ${clientName}` : '',
    `Total: $${quote.total}`,
    `Status: ${quote.status}`,
  ].filter(Boolean).join('. ');
}

// ── Upsert embedding ─────────────────────────────────────────────────

export async function upsertEmbedding(
  entityType: string,
  entityId: string,
  content: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  const embedding = await generateEmbedding(content);

  const row: any = {
    entity_type: entityType,
    entity_id: entityId,
    content,
    metadata,
    updated_at: new Date().toISOString(),
  };

  if (embedding) {
    row.embedding = JSON.stringify(embedding);
  }

  const { error } = await supabase
    .from('crm_embeddings')
    .upsert(row, { onConflict: 'entity_type,entity_id' });

  if (error) {
    console.error(`[Embeddings] Failed to upsert ${entityType}/${entityId}:`, error.message);
  }
}

// ── Semantic search ──────────────────────────────────────────────────

export async function semanticSearch(
  query: string,
  options: {
    entityType?: string;
    limit?: number;
  } = {}
): Promise<EmbeddingRecord[]> {
  const limit = options.limit || 10;

  // Try vector search first
  const queryEmbedding = await generateEmbedding(query);

  if (queryEmbedding) {
    // Use the pgvector search function
    const { data, error } = await supabase.rpc('search_crm', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: limit,
      filter_type: options.entityType || null,
    });

    if (!error && data && data.length > 0) {
      return data;
    }
  }

  // Fallback: text-based search using PostgreSQL ILIKE
  const q = `%${query}%`;
  let queryBuilder = supabase
    .from('crm_embeddings')
    .select('entity_type, entity_id, content, metadata')
    .ilike('content', q)
    .limit(limit);

  if (options.entityType) {
    queryBuilder = queryBuilder.eq('entity_type', options.entityType);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('[Embeddings] Fallback search failed:', error.message);
    return [];
  }

  return (data || []).map(row => ({
    ...row,
    similarity: 0.5, // Approximate for text match
  }));
}

// ── Bulk sync: index all CRM records ─────────────────────────────────

export async function syncAllEmbeddings(): Promise<{
  clients: number;
  jobs: number;
  leads: number;
  quotes: number;
}> {
  const { db } = await import('@/lib/db');
  const { leadRequests } = await import('@/lib/db/leads');

  const [clients, jobs, quotes, leads] = await Promise.all([
    db.clients.getAll(),
    db.jobs.getAll(),
    db.quotes.getAll(),
    leadRequests.getAll(),
  ]);

  let counts = { clients: 0, jobs: 0, leads: 0, quotes: 0 };

  // Index clients
  for (const client of clients) {
    await upsertEmbedding('client', client.id, clientToText(client), {
      name: `${client.firstName} ${client.lastName}`,
      email: client.email,
    });
    counts.clients++;
  }

  // Index jobs
  for (const job of jobs) {
    const client = clients.find(c => c.id === job.clientId);
    const clientName = client ? `${client.firstName} ${client.lastName}` : undefined;
    await upsertEmbedding('job', job.id, jobToText(job, clientName), {
      title: job.title,
      status: job.status,
      total: job.total,
    });
    counts.jobs++;
  }

  // Index leads
  for (const lead of leads) {
    await upsertEmbedding('lead', lead.id, leadToText(lead), {
      name: lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
      category: lead.ai_category,
      score: lead.ai_score,
    });
    counts.leads++;
  }

  // Index quotes
  for (const quote of quotes) {
    const client = clients.find(c => c.id === quote.clientId);
    const clientName = client ? `${client.firstName} ${client.lastName}` : undefined;
    await upsertEmbedding('quote', quote.id, quoteToText(quote, clientName), {
      title: quote.title,
      status: quote.status,
      total: quote.total,
    });
    counts.quotes++;
  }

  return counts;
}

// ── Delete embedding when a record is deleted ────────────────────────

export async function deleteEmbedding(entityType: string, entityId: string): Promise<void> {
  await supabase
    .from('crm_embeddings')
    .delete()
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
}
