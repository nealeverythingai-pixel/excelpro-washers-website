/**
 * Voice DB Layer — Supabase operations for the voice service.
 * Mirrors lib/db/voice.ts from the main app but uses persistent clients.
 */

import { getSupabase } from './clients';

// ── Types ────────────────────────────────────────────────────

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CallConversation {
  call_sid: string;
  caller_phone: string;
  messages: ConversationMessage[];
  booking_saved: boolean;
  started_at: string;
  last_activity: string;
}

export interface CallLog {
  id?: string;
  call_sid: string;
  caller_phone: string;
  to_phone: string;
  status: string;
  duration: number;
  recording_url?: string | null;
  transcript?: ConversationMessage[] | null;
  booking_created: boolean;
  created_at?: string;
}

export interface VoiceBooking {
  id?: string;
  call_sid: string;
  caller_phone: string;
  customer_name: string;
  customer_phone: string;
  service_requested: string;
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
}

// ── Conversations ────────────────────────────────────────────

export const voiceConversations = {
  async get(callSid: string): Promise<CallConversation | null> {
    const { data, error } = await getSupabase()
      .from('call_conversations')
      .select('*')
      .eq('call_sid', callSid)
      .single();
    if (error || !data) return null;
    return data as CallConversation;
  },

  async upsert(conversation: CallConversation): Promise<CallConversation | null> {
    const { data, error } = await getSupabase()
      .from('call_conversations')
      .upsert(conversation, { onConflict: 'call_sid' })
      .select()
      .single();
    if (error) {
      console.error('[VoiceDB] Failed to upsert conversation:', error.message);
      return null;
    }
    return data as CallConversation;
  },

  async remove(callSid: string): Promise<void> {
    await getSupabase()
      .from('call_conversations')
      .delete()
      .eq('call_sid', callSid);
  },
};

// ── Call Logs ────────────────────────────────────────────────

export const voiceCallLogs = {
  async findByCallSid(callSid: string): Promise<CallLog | null> {
    const { data, error } = await getSupabase()
      .from('call_logs')
      .select('*')
      .eq('call_sid', callSid)
      .single();
    if (error || !data) return null;
    return data as CallLog;
  },

  async create(log: Omit<CallLog, 'id' | 'created_at'>): Promise<CallLog | null> {
    const { data, error } = await getSupabase()
      .from('call_logs')
      .insert(log)
      .select()
      .single();
    if (error) {
      console.error('[VoiceDB] Failed to create call log:', error.message);
      return null;
    }
    return data as CallLog;
  },

  async update(callSid: string, updates: Partial<CallLog>): Promise<CallLog | null> {
    const { data, error } = await getSupabase()
      .from('call_logs')
      .update(updates)
      .eq('call_sid', callSid)
      .select()
      .single();
    if (error) {
      console.error('[VoiceDB] Failed to update call log:', error.message);
      return null;
    }
    return data as CallLog;
  },
};

// ── Voice Bookings ───────────────────────────────────────────

export const voiceBookings = {
  async create(booking: Omit<VoiceBooking, 'id' | 'created_at'>): Promise<VoiceBooking | null> {
    const { data, error } = await getSupabase()
      .from('voice_bookings')
      .insert(booking)
      .select()
      .single();
    if (error) {
      console.error('[VoiceDB] Failed to create booking:', error.message);
      return null;
    }
    return data as VoiceBooking;
  },
};
