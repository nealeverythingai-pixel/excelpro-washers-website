/**
 * Voice DB Layer — backed by Supabase
 *
 * Handles all database operations for the AI receptionist:
 * - Call conversations (persisted across serverless invocations)
 * - Call logs (with transcripts)
 * - Voice bookings (leads captured by AI)
 */

import { supabase } from '@/lib/supabase';

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
  /**
   * Get an active conversation by CallSid
   */
  async get(callSid: string): Promise<CallConversation | null> {
    const { data, error } = await supabase
      .from('call_conversations')
      .select('*')
      .eq('call_sid', callSid)
      .single();

    if (error || !data) return null;
    return data as CallConversation;
  },

  /**
   * Create or update a conversation
   */
  async upsert(conversation: CallConversation): Promise<CallConversation | null> {
    const { data, error } = await supabase
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

  /**
   * Remove a conversation (after call ends)
   */
  async remove(callSid: string): Promise<void> {
    await supabase
      .from('call_conversations')
      .delete()
      .eq('call_sid', callSid);
  },

  /**
   * Clean up stale conversations (older than 1 hour)
   */
  async cleanup(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    await supabase
      .from('call_conversations')
      .delete()
      .lt('last_activity', oneHourAgo);
  },
};

// ── Call Logs ────────────────────────────────────────────────

export const voiceCallLogs = {
  /**
   * Get all call logs, most recent first
   */
  async getAll(limit = 50): Promise<CallLog[]> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[VoiceDB] Failed to get call logs:', error.message);
      return [];
    }
    return (data || []) as CallLog[];
  },

  /**
   * Get a single call log by CallSid
   */
  async findByCallSid(callSid: string): Promise<CallLog | null> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('call_sid', callSid)
      .single();

    if (error || !data) return null;
    return data as CallLog;
  },

  /**
   * Create a new call log
   */
  async create(log: Omit<CallLog, 'id' | 'created_at'>): Promise<CallLog | null> {
    const { data, error } = await supabase
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

  /**
   * Update an existing call log
   */
  async update(callSid: string, updates: Partial<CallLog>): Promise<CallLog | null> {
    const { data, error } = await supabase
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

  /**
   * Get call stats for dashboard
   */
  async getStats(): Promise<{
    totalCalls: number;
    totalDuration: number;
    bookingsCaptured: number;
    avgDuration: number;
    recentCalls: CallLog[];
  }> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .order('created_at', { ascending: false });

    const logs = (data || []) as CallLog[];
    const totalCalls = logs.length;
    const totalDuration = logs.reduce((sum, l) => sum + (l.duration || 0), 0);
    const bookingsCaptured = logs.filter(l => l.booking_created).length;

    return {
      totalCalls,
      totalDuration,
      bookingsCaptured,
      avgDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
      recentCalls: logs.slice(0, 20),
    };
  },
};

// ── Voice Bookings ───────────────────────────────────────────

export const voiceBookings = {
  /**
   * Get all bookings, most recent first
   */
  async getAll(limit = 50): Promise<VoiceBooking[]> {
    const { data, error } = await supabase
      .from('voice_bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[VoiceDB] Failed to get bookings:', error.message);
      return [];
    }
    return (data || []) as VoiceBooking[];
  },

  /**
   * Create a new booking
   */
  async create(booking: Omit<VoiceBooking, 'id' | 'created_at'>): Promise<VoiceBooking | null> {
    const { data, error } = await supabase
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

  /**
   * Update booking status
   */
  async updateStatus(id: string, status: VoiceBooking['status']): Promise<VoiceBooking | null> {
    const { data, error } = await supabase
      .from('voice_bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[VoiceDB] Failed to update booking status:', error.message);
      return null;
    }
    return data as VoiceBooking;
  },

  /**
   * Check if a booking already exists for a call
   */
  async existsForCall(callSid: string): Promise<boolean> {
    const { data } = await supabase
      .from('voice_bookings')
      .select('id')
      .eq('call_sid', callSid)
      .limit(1);

    return (data?.length || 0) > 0;
  },
};
