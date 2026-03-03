import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wloqmcksdjanhiatvnsz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.warn('⚠️ SUPABASE_ANON_KEY is not set — Supabase features will not work');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
