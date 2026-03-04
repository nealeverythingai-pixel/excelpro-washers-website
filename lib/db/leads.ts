/**
 * Supabase-backed DB layer for Leads, Quotes, Follow-ups, and AI Feedback
 * Replaces JSON file DB for lead qualification pipeline
 */

import { supabase } from '../supabase';

// ─── Types ──────────────────────────────────────────────────────────

export interface LeadRequest {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  address?: string;
  service?: string;
  message?: string;
  status: 'new' | 'viewed' | 'contacted' | 'converted' | 'lost' | 'archived';
  ai_score?: number;
  ai_category?: 'hot' | 'warm' | 'cold';
  ai_reasoning?: string;
  estimated_value?: number;
  next_follow_up?: string;
  source?: 'website' | 'yelp' | 'google' | 'thumbtack' | 'referral' | 'phone' | 'other';
  created_at: string;
}

export interface LeadQuote {
  id: string;
  request_id: string;
  title: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'accepted' | 'converted';
  created_at: string;
}

export interface LeadFollowUp {
  id: string;
  lead_id: string;
  category: 'warm' | 'cold';
  type: 'follow-up' | 'special-offer' | 'final-check' | 'educational' | 'seasonal' | 're-engagement' | 'case-study';
  scheduled_for: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface LeadAIFeedback {
  id: string;
  agent_type: string;
  input_data: any;
  output_data: any;
  actual_outcome?: 'success' | 'failure' | 'pending';
  user_feedback?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ─── Lead Requests ──────────────────────────────────────────────────

export const leadRequests = {
  async getAll(): Promise<LeadRequest[]> {
    const { data, error } = await supabase
      .from('lead_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('leadRequests.getAll error:', error); return []; }
    return data || [];
  },

  async findById(id: string): Promise<LeadRequest | null> {
    const { data, error } = await supabase
      .from('lead_requests')
      .select('*')
      .eq('id', id)
      .single();
    if (error) { console.error('leadRequests.findById error:', error); return null; }
    return data;
  },

  async create(request: Partial<LeadRequest> & { id: string }): Promise<LeadRequest | null> {
    const row = {
      id: request.id,
      name: request.name || null,
      first_name: request.first_name || null,
      last_name: request.last_name || null,
      email: request.email || '',
      phone: request.phone || '',
      address: request.address || null,
      service: request.service || null,
      message: request.message || null,
      status: request.status || 'new',
      ai_score: request.ai_score ?? null,
      ai_category: request.ai_category || null,
      ai_reasoning: request.ai_reasoning || null,
      estimated_value: request.estimated_value ?? null,
      next_follow_up: request.next_follow_up || null,
      source: request.source || null,
    };
    const { data, error } = await supabase
      .from('lead_requests')
      .insert(row)
      .select()
      .single();
    if (error) { console.error('leadRequests.create error:', error); return null; }
    return data;
  },

  async update(id: string, updates: Partial<LeadRequest>): Promise<LeadRequest | null> {
    const { data, error } = await supabase
      .from('lead_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('leadRequests.update error:', error); return null; }
    return data;
  },

  async updateStatus(id: string, status: LeadRequest['status']): Promise<LeadRequest | null> {
    return this.update(id, { status });
  },

  async getStale(daysOld: number = 30): Promise<LeadRequest[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    const { data, error } = await supabase
      .from('lead_requests')
      .select('*')
      .eq('status', 'new')
      .lt('created_at', cutoff.toISOString())
      .order('created_at', { ascending: false });
    if (error) { console.error('leadRequests.getStale error:', error); return []; }
    return data || [];
  },

  async getStats() {
    const { data: all, error } = await supabase
      .from('lead_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !all) return { total: 0, hot: 0, warm: 0, cold: 0, converted: 0, avgScore: 0 };
    const hot = all.filter(r => r.ai_category === 'hot').length;
    const warm = all.filter(r => r.ai_category === 'warm').length;
    const cold = all.filter(r => r.ai_category === 'cold').length;
    const converted = all.filter(r => r.status === 'converted').length;
    const scores = all.filter(r => r.ai_score != null).map(r => r.ai_score!);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { total: all.length, hot, warm, cold, converted, avgScore };
  },
};

// ─── Lead Quotes ────────────────────────────────────────────────────

export const leadQuotes = {
  async getAll(): Promise<LeadQuote[]> {
    const { data, error } = await supabase
      .from('lead_quotes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('leadQuotes.getAll error:', error); return []; }
    return data || [];
  },

  async findById(id: string): Promise<LeadQuote | null> {
    const { data, error } = await supabase
      .from('lead_quotes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async create(quote: Omit<LeadQuote, 'created_at'>): Promise<LeadQuote | null> {
    const { data, error } = await supabase
      .from('lead_quotes')
      .insert(quote)
      .select()
      .single();
    if (error) { console.error('leadQuotes.create error:', error); return null; }
    return data;
  },

  async updateStatus(id: string, status: LeadQuote['status']): Promise<LeadQuote | null> {
    const { data, error } = await supabase
      .from('lead_quotes')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  },
};

// ─── Scheduled Follow-Ups ───────────────────────────────────────────

export const leadFollowUps = {
  async getAll(): Promise<LeadFollowUp[]> {
    const { data, error } = await supabase
      .from('lead_follow_ups')
      .select('*')
      .order('scheduled_for', { ascending: true });
    if (error) { console.error('leadFollowUps.getAll error:', error); return []; }
    return data || [];
  },

  async findByLeadId(leadId: string): Promise<LeadFollowUp[]> {
    const { data, error } = await supabase
      .from('lead_follow_ups')
      .select('*')
      .eq('lead_id', leadId)
      .order('scheduled_for', { ascending: true });
    if (error) { console.error('leadFollowUps.findByLeadId error:', error); return []; }
    return data || [];
  },

  async create(followUp: Omit<LeadFollowUp, 'created_at'>): Promise<LeadFollowUp | null> {
    const { data, error } = await supabase
      .from('lead_follow_ups')
      .insert(followUp)
      .select()
      .single();
    if (error) { console.error('leadFollowUps.create error:', error); return null; }
    return data;
  },

  async update(id: string, updates: Partial<LeadFollowUp>): Promise<LeadFollowUp | null> {
    const { data, error } = await supabase
      .from('lead_follow_ups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  },

  async getPending(): Promise<LeadFollowUp[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('lead_follow_ups')
      .select('*')
      .eq('completed', false)
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true });
    if (error) { console.error('leadFollowUps.getPending error:', error); return []; }
    return data || [];
  },

  async markCompleted(id: string): Promise<void> {
    await supabase
      .from('lead_follow_ups')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', id);
  },
};

// ─── AI Feedback ────────────────────────────────────────────────────

export const leadAIFeedback = {
  async create(feedback: Omit<LeadAIFeedback, 'id' | 'created_at'>): Promise<LeadAIFeedback | null> {
    const { data, error } = await supabase
      .from('lead_ai_feedback')
      .insert(feedback)
      .select()
      .single();
    if (error) { console.error('leadAIFeedback.create error:', error); return null; }
    return data;
  },

  async getRecent(agentType: string, limit: number = 10): Promise<LeadAIFeedback[]> {
    const { data, error } = await supabase
      .from('lead_ai_feedback')
      .select('*')
      .eq('agent_type', agentType)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return data || [];
  },
};
