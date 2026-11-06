// Shared shift rules: who may claim a shift and how staff hours are recorded.
// Server-side only (uses the service role key).

export const COMMERCIAL_ROLE = 'Commercial Cleaner'
export const COMMERCIAL_ELIGIBLE_POSITION = 'Cleaning Specialist'

export type StaffApplicant = {
  id: string
  full_name: string
  email: string
  position: string | null
  orientation_accepted: boolean
}

export type ShiftRow = {
  id: string
  date: string
  start_time: string
  end_time: string
  location: string
  role: string
  pay_rate?: number | null
  job_description?: string | null
  notes?: string | null
  status?: string | null
  staff_name?: string | null
  staff_email?: string | null
  staff_phone?: string | null
  applicant_id?: string | null
  appointment_id?: string | null
  clock_in_at?: string | null
  clock_out_at?: string | null
  staff_confirmed_at?: string | null
  approved_at?: string | null
  hours_worked?: number | null
}

export type EligibilityResult = { eligible: boolean; reason: string }

export async function sbFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Database not configured')
  const headers = new Headers(init.headers)
  headers.set('apikey', key)
  headers.set('Authorization', `Bearer ${key}`)
  headers.set('Content-Type', 'application/json')
  return fetch(`${url}/rest/v1/${path}`, { ...init, headers })
}

// Looks up the signed-in applicant from the staff session token.
export async function getApplicantBySession(token: string | null | undefined): Promise<StaffApplicant | null> {
  if (!token) return null
  const res = await sbFetch(
    `offer_letter_applicants?login_session_token=eq.${encodeURIComponent(token)}&select=id,full_name,email,position,orientation_accepted,login_session_expires_at`
  )
  if (!res.ok) return null
  const rows = await res.json()
  if (!Array.isArray(rows) || rows.length === 0) return null
  const row = rows[0]
  if (row.login_session_expires_at && new Date(row.login_session_expires_at) < new Date()) return null
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    position: row.position ?? null,
    orientation_accepted: Boolean(row.orientation_accepted),
  }
}

export async function loadShift(id: string): Promise<ShiftRow | null> {
  const res = await sbFetch(`shifts?id=eq.${encodeURIComponent(id)}&select=*`)
  if (!res.ok) return null
  const rows = await res.json()
  return Array.isArray(rows) && rows.length > 0 ? (rows[0] as ShiftRow) : null
}

// Training counts as passed when the position has modules and the staff member
// has a completed record (score 80+) for every one of them.
export async function hasPassedTraining(email: string, position: string): Promise<boolean> {
  const modRes = await sbFetch(`training_modules?position=eq.${encodeURIComponent(position)}&select=id`)
  if (!modRes.ok) return false
  const modules = (await modRes.json()) as { id: string }[]
  if (!Array.isArray(modules) || modules.length === 0) return false

  const progRes = await sbFetch(
    `staff_module_progress?staff_email=ilike.${encodeURIComponent(email)}&status=eq.completed&select=module_id`
  )
  if (!progRes.ok) return false
  const progress = (await progRes.json()) as { module_id: string }[]
  const done = new Set(progress.map(p => p.module_id))
  return modules.every(m => done.has(m.id))
}

// Builds an eligibility checker for one applicant. Training is looked up once per position.
export function createEligibilityChecker(applicant: StaffApplicant) {
  const trainingCache = new Map<string, Promise<boolean>>()
  const trained = (position: string) => {
    if (!trainingCache.has(position)) trainingCache.set(position, hasPassedTraining(applicant.email, position))
    return trainingCache.get(position) as Promise<boolean>
  }

  return async function check(shift: ShiftRow): Promise<EligibilityResult> {
    if (!applicant.orientation_accepted) {
      return { eligible: false, reason: 'Finish orientation before claiming shifts.' }
    }

    if (shift.role === COMMERCIAL_ROLE) {
      if (applicant.position === COMMERCIAL_ELIGIBLE_POSITION) return { eligible: true, reason: '' }
      return { eligible: false, reason: 'Commercial Cleaner shifts are open to Cleaning Specialists only.' }
    }

    if (!applicant.position || applicant.position !== shift.role) {
      return { eligible: false, reason: 'This shift does not match your position.' }
    }

    if (!(await trained(applicant.position))) {
      return { eligible: false, reason: 'Pass the training for your position before claiming this shift.' }
    }

    return { eligible: true, reason: '' }
  }
}

// Hours = exact minutes between clock-in and clock-out. Stored hours use 2 decimals.
export function computeWorked(clockInIso: string, clockOutIso: string) {
  const minutes = Math.round((Date.parse(clockOutIso) - Date.parse(clockInIso)) / 60000)
  const hours = Math.round((minutes / 60) * 100) / 100
  return { minutes, hours }
}
