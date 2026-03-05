/**
 * Quick script to add a sales user via Supabase
 * Run: npx tsx scripts/add-sales-user.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wloqmcksdjanhiatvnsz.supabase.co'
// We need the anon key from Vercel env - let's read it
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ Set SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY env var first')
  console.log('You can find it in your Supabase dashboard → Settings → API → anon/public key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data, error } = await supabase.from('users').insert({
    id: crypto.randomUUID(),
    name: 'Mathiew',
    email: 'mathiew@excelprowashers.com',
    pin: '4521',
    role: 'SALES',
    active: true,
  }).select().single()

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Sales user created!')
    console.log(JSON.stringify(data, null, 2))
  }
}

main()
