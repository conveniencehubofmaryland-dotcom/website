import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: staffRecords, error: fetchError } = await supabase
      .from('offer_letter_applicants')
      .select('id, full_name, email, phone, own_car, background_check_url, created_at')
      .not('background_check_url', 'is', null)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('[staff-docs-get] Fetch error:', fetchError)
      throw fetchError
    }

    const documents = (staffRecords || []).map(staff => ({
      id: staff.id,
      staffName: staff.full_name,
      staffEmail: staff.email,
      staffPhone: staff.phone,
      ownCar: staff.own_car,
      documentUrl: staff.background_check_url,
      dateUploaded: staff.created_at,
    }))

    console.log('[staff-docs-get] Found', documents.length, 'documents')
    return NextResponse.json(documents)
  } catch (err) {
    console.error('[staff-docs-get] Error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to fetch documents: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, documentUrl } = await req.json()

    if (!id || !documentUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: id, documentUrl' },
        { status: 400 }
      )
    }

    console.log('[staff-docs-delete] Deleting document:', documentUrl, 'for staff:', id)

    if (documentUrl) {
      const { error: deleteStorageError } = await supabase.storage
        .from('application-documents')
        .remove([documentUrl])

      if (deleteStorageError) {
        console.error('[staff-docs-delete] Storage delete error:', deleteStorageError)
      }
    }

    const { error: updateError } = await supabase
      .from('offer_letter_applicants')
      .update({ background_check_url: null })
      .eq('id', id)

    if (updateError) {
      console.error('[staff-docs-delete] DB update error:', updateError)
      throw updateError
    }

    console.log('[staff-docs-delete] Successfully deleted document for staff:', id)
    return NextResponse.json({ success: true, message: 'Document deleted' })
  } catch (err) {
    console.error('[staff-docs-delete] Error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to delete document: ${errorMessage}` },
      { status: 500 }
    )
  }
}
