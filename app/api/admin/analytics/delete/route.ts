import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { table, id } = body

  if (!table || !id) {
    return NextResponse.json({ error: 'Missing table or id' }, { status: 400 })
  }

  const allowedTables = ['offer_letters', 'offer_letter_applicants', 'staff_module_progress']
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  }

  try {
    console.log('[delete] Deleting from', table, 'id:', id)

    // If deleting applicant, first delete all related offer letters
    if (table === 'offer_letter_applicants') {
      console.log('[delete] Deleting related offer letters for applicant:', id)
      const offerDeleteRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letters?applicant_id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      )
      console.log('[delete] Offer letters delete status:', offerDeleteRes.status)
      if (!offerDeleteRes.ok) {
        const offerError = await offerDeleteRes.text()
        console.error('[delete] Failed to delete related offer letters:', offerError)
        return NextResponse.json({ error: 'Failed to delete related records' }, { status: 500 })
      }
    }

    // Delete the main record
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )

    const resText = await res.text()
    console.log('[delete] Response status:', res.status)
    console.log('[delete] Response:', resText)

    if (!res.ok) {
      console.error(`[delete] ${table} delete failed:`, resText)
      return NextResponse.json({ error: `Delete failed: ${resText}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[delete] Exception:', err)
    return NextResponse.json({ error: `Exception: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 500 })
  }
}
