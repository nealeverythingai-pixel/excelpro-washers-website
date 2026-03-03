/**
 * Supabase-backed subscriber management for email marketing
 */

import { supabase } from '../supabase';

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  source: 'footer' | 'contact-form' | 'blog' | 'cold-lead' | 'manual' | 'other';
  status: 'active' | 'unsubscribed' | 'bounced';
  consent_given: boolean;
  consent_date?: string;
  unsubscribed_at?: string;
  tags?: string[];
  created_at: string;
}

export interface Campaign {
  id: string;
  subject: string;
  body_html: string;
  status: 'draft' | 'sent';
  sent_at?: string;
  sent_to_count?: number;
  created_at: string;
}

// ─── Subscribers ────────────────────────────────────────────────────

export const subscribers = {
  async getAll(): Promise<Subscriber[]> {
    const { data, error } = await supabase
      .from('email_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('subscribers.getAll error:', error); return []; }
    return data || [];
  },

  async getActive(): Promise<Subscriber[]> {
    const { data, error } = await supabase
      .from('email_subscribers')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) { console.error('subscribers.getActive error:', error); return []; }
    return data || [];
  },

  async findByEmail(email: string): Promise<Subscriber | null> {
    const { data, error } = await supabase
      .from('email_subscribers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    if (error) return null;
    return data;
  },

  async subscribe(params: {
    email: string;
    name?: string;
    source: Subscriber['source'];
  }): Promise<{ success: boolean; error?: string }> {
    const email = params.email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await this.findByEmail(email);
    if (existing) {
      if (existing.status === 'active') {
        return { success: true }; // Already subscribed
      }
      // Re-subscribe
      const { error } = await supabase
        .from('email_subscribers')
        .update({
          status: 'active',
          name: params.name || existing.name,
          consent_given: true,
          consent_date: new Date().toISOString(),
          unsubscribed_at: null,
        })
        .eq('id', existing.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    // New subscriber
    const { error } = await supabase
      .from('email_subscribers')
      .insert({
        email,
        name: params.name || null,
        source: params.source,
        status: 'active',
        consent_given: true,
        consent_date: new Date().toISOString(),
      });
    if (error) {
      console.error('subscribers.subscribe error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  async unsubscribe(email: string): Promise<{ success: boolean; error?: string }> {
    const existing = await this.findByEmail(email.toLowerCase());
    if (!existing) return { success: true }; // Not found = nothing to unsubscribe

    const { error } = await supabase
      .from('email_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async getStats() {
    const all = await this.getAll();
    const active = all.filter(s => s.status === 'active').length;
    const unsubscribed = all.filter(s => s.status === 'unsubscribed').length;
    const bounced = all.filter(s => s.status === 'bounced').length;
    const sources: Record<string, number> = {};
    all.forEach(s => { sources[s.source] = (sources[s.source] || 0) + 1; });
    return { total: all.length, active, unsubscribed, bounced, sources };
  },
};

// ─── Campaigns ──────────────────────────────────────────────────────

export const campaigns = {
  async getAll(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('campaigns.getAll error:', error); return []; }
    return data || [];
  },

  async create(campaign: Omit<Campaign, 'id' | 'created_at'>): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert(campaign)
      .select()
      .single();
    if (error) { console.error('campaigns.create error:', error); return null; }
    return data;
  },

  async markSent(id: string, sentCount: number): Promise<void> {
    await supabase
      .from('email_campaigns')
      .update({ status: 'sent', sent_at: new Date().toISOString(), sent_to_count: sentCount })
      .eq('id', id);
  },
};
