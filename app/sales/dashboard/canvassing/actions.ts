'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getSessions(repId: string) {
  const { data } = await getSupabase()
    .from('canvassing_sessions')
    .select('*')
    .eq('rep_id', repId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getSessionKnocks(sessionId: string) {
  const { data } = await getSupabase()
    .from('door_knocks')
    .select('*')
    .eq('session_id', sessionId)
    .order('knocked_at', { ascending: true })
  return data || []
}

export async function getAllFollowUps(repId: string) {
  // Get all maybes and come-backs across all sessions for this rep
  const { data: sessions } = await getSupabase()
    .from('canvassing_sessions')
    .select('id, area, date')
    .eq('rep_id', repId)

  if (!sessions?.length) return []

  const sessionIds = sessions.map(s => s.id)
  const { data: knocks } = await getSupabase()
    .from('door_knocks')
    .select('*')
    .in('session_id', sessionIds)
    .in('status', ['maybe', 'come_back'])
    .order('knocked_at', { ascending: false })

  return (knocks || []).map(k => ({
    ...k,
    session: sessions.find(s => s.id === k.session_id),
  }))
}

export async function createSession(formData: FormData) {
  const repId = formData.get('repId') as string
  const repName = formData.get('repName') as string
  const area = formData.get('area') as string
  const date = new Date().toISOString().split('T')[0]

  const { data, error } = await getSupabase()
    .from('canvassing_sessions')
    .insert({ rep_id: repId, rep_name: repName, area, date })
    .select()
    .single()

  if (error) {
    console.error('createSession error code:', error.code, 'message:', error.message, 'details:', error.details, 'hint:', error.hint)
    return null
  }
  revalidatePath('/sales/dashboard/canvassing')
  return data
}

export async function logDoor(formData: FormData) {
  const sessionId = formData.get('sessionId') as string
  const address = formData.get('address') as string
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string

  await getSupabase().from('door_knocks').insert({
    session_id: sessionId,
    address,
    status,
    notes: notes || null,
  })

  revalidatePath('/sales/dashboard/canvassing')
}

export async function updateKnockStatus(knockId: string, status: string, notes?: string) {
  await getSupabase()
    .from('door_knocks')
    .update({ status, notes: notes || null })
    .eq('id', knockId)

  revalidatePath('/sales/dashboard/canvassing')
}

export async function deleteKnock(knockId: string) {
  await getSupabase().from('door_knocks').delete().eq('id', knockId)
  revalidatePath('/sales/dashboard/canvassing')
}
