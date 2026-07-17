import { NextRequest, NextResponse } from 'next/server'
import { dbSelectAuth, dbInsertAuth } from '@/lib/db'
import { sendUserEmail, sendAdminEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { applicant_id, position, salary_annual, start_date, benefits_summary, manager_name, deadline_date, pay_frequency } = body

  if (!applicant_id || !position || !salary_annual || !start_date || !manager_name || !deadline_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Fetch the applicant to get email and name
  const applicants = await dbSelectAuth<any>('offer_letter_applicants', token, {
    select: 'id,full_name,email,position',
