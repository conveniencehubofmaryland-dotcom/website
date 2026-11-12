import { NextRequest, NextResponse } from 'next/server'
import { serviceHeaders } from '@/lib/supabase-keys'

export async function GET(req: NextRequest) {
  const applicantId = req.nextUrl.searchParams.get('applicant_id')
  const inviteToken = req.nextUrl.searchParams.get('invite_token')

  // Must have one or the other
  if (!applicantId && !inviteToken) {
    return NextResponse.json({ error: 'Missing applicant_id or invite_token', orientation_accepted: false }, { status: 400 })
  }

  try {
    let finalApplicantId = applicantId

    // If invite token provided, look it up to get applicant_id
    if (inviteToken && !applicantId) {
      const inviteRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/staff_invites?invite_token=eq.${encodeURIComponent(inviteToken)}&select=applicant_id`,
        {
          headers: {
            ...serviceHeaders(),
          },
        }
      )
      const inviteData = await inviteRes.json()
      if (!inviteData || inviteData.length === 0) {
        return NextResponse.json({ error: 'Invalid invite token', orientation_accepted: false }, { status: 404 })
      }
      finalApplicantId = inviteData[0].applicant_id
    }

    // Fetch applicant details
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${encodeURIComponent(String(finalApplicantId))}&select=orientation_accepted,full_name,onboarding_status`,
      {
        headers: {
          ...serviceHeaders(),
        },
      }
    )
    const data = await res.json()
    if (!data || data.length === 0) {
      return NextResponse.json({ orientation_accepted: false, staffName: '', onboarding_status: 'new' })
    }

    return NextResponse.json({
      orientation_accepted: data[0].orientation_accepted || false,
      staffName: data[0].full_name || 'Staff Member',
      onboarding_status: data[0].onboarding_status || 'new',
      applicant_id: finalApplicantId,
    })
  } catch (err) {
    console.error('[welcome-check] Error:', err)
    return NextResponse.json({ orientation_accepted: false, staffName: '', onboarding_status: 'new' })
  }
}
