import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient | null {
  // Accept either the project URL or a pasted REST URL from the dashboard.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  if (!client) client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return client
}

export async function getUserData(uid: string): Promise<Record<string, unknown> | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.from('users').select('data, plan').eq('id', uid).maybeSingle()
  if (error) throw error
  if (!data) return null
  const json = (data.data as Record<string, unknown> | undefined) || {}
  return { ...json, uid, plan: data.plan || json.plan || 'free' }
}

export async function upsertUserData(uid: string, values: Record<string, unknown>) {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase is not configured')
  const current = await getUserData(uid)
  const { plan, ...rest } = values
  const merged = { ...(current || {}), ...rest, uid }
  const row: Record<string, unknown> = { id: uid, data: merged }
  if (plan !== undefined) row.plan = String(plan)
  const { error } = await supabase.from('users').upsert(row)
  if (error) throw error
}
