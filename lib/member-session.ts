import { cookies } from 'next/headers'
import { sbFetch } from '@/lib/shift-eligibility'

export const MEMBER_COOKIE = 'member_session'

export type SessionMember = {
  id: string
  name: string
  email: string
  phone: string
  state: string
  tier: string
  status: string
  recurring: boolean
  service_frequency: string | null
  created_at: string
}

// Returns the signed-in, active member for this browser, or null.
export async function getSessionMember(): Promise<SessionMember | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_COOKIE)?.value ?? ''
  if (!/^[0-9a-f]{64}$/.test(token)) return null
  try {
    const res = await sbFetch(
      `members?login_session_token=eq.${token}&select=id,name,email,phone,state,tier,status,recurring,service_frequency,created_at,login_session_expires_at`
    )
    if (!res.ok) return null
    const rows = (await res.json()) as (SessionMember & { login_session_expires_at: string | null })[]
    const m = rows[0]
    if (!m || m.status !== 'active') return null
    if (!m.login_session_expires_at || new Date(m.login_session_expires_at) < new Date()) return null
    return m
  } catch {
    return null
  }
}
