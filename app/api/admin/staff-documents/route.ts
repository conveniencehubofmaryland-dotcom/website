import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Document {
  id: string
  staffId: string
  staffName: string
  staffEmail: string
  documentType: 'background_check' | 'training_cert' | 'orientation' | 'offer_letter' | 'direct_deposit'
  documentName: string
  documentUrl: string | null
  status: string
  notes: string | null
}

export async function GET() {
  try {
    // Fetch from staff_documents table
    const { data: staffDocs, error: docsError } = await supabase
      .from('staff_documents')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (docsError) throw docsError

    // Fetch staff info for documents
    const { data: staff } = await supabase
      .from('offer_letter_applicants')
      .select('id, full_name, email')

    const staffMap: Record<string, { full_name: string; email: string }> = {}
    staff?.forEach(s => {
      staffMap[s.id] = { full_name: s.full_name, email: s.email }
    })

    // Format response
    const documents: Document[] = (staffDocs || []).map(doc => ({
      id: doc.id,
      staffId: doc.staff_id,
      staffName: staffMap[doc.staff_id]?.full_name || 'Unknown',
      staffEmail: staffMap[doc.staff_id]?.email || 'unknown@example.com',
      documentType: doc.document_type,
      documentName: doc.document_type === 'background_check'
        ? 'Background Check'
        : doc.document_type === 'training_cert'
        ? 'Training Certificate'
        : doc.document_type === 'orientation'
        ? 'Orientation/MOU'
        : doc.document_type === 'offer_letter'
        ? 'Offer Letter'
        : 'Direct Deposit Form',
      documentUrl: doc.document_url,
      status: doc.status || 'pending',
      notes: doc.notes,
    }))

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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const staffId = formData.get('staffId') as string
    const documentType = formData.get('documentType') as string
    const file = formData.get('document') as File
    const status = formData.get('status') as string || 'pending'
    const notes = formData.get('notes') as string || null

    if (!staffId || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields: staffId, documentType' },
        { status: 400 }
      )
    }

    let documentUrl: string | null = null

    // Upload file if provided
    if (file) {
      const buffer = await file.arrayBuffer()
      const ext = file.name.split('.').pop()
      const fileName = `${staffId}_${documentType}_${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(fileName, buffer, {
          contentType: file.type,
        })

      if (uploadError) throw uploadError
      documentUrl = fileName
    }

    // Save to staff_documents table
    const { data: newDoc, error: insertError } = await supabase
      .from('staff_documents')
      .insert({
        staff_id: staffId,
        document_type: documentType,
        document_url: documentUrl,
        status,
        notes,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Fetch staff info
    const { data: staffData } = await supabase
      .from('offer_letter_applicants')
      .select('full_name, email')
      .eq('id', staffId)
      .single()

    return NextResponse.json({
      id: newDoc.id,
      staffId: newDoc.staff_id,
      staffName: staffData?.full_name || 'Unknown',
      staffEmail: staffData?.email || 'unknown@example.com',
      documentType: newDoc.document_type,
      documentName: newDoc.document_type === 'background_check'
        ? 'Background Check'
        : newDoc.document_type === 'training_cert'
        ? 'Training Certificate'
        : newDoc.document_type === 'orientation'
        ? 'Orientation/MOU'
        : newDoc.document_type === 'offer_letter'
        ? 'Offer Letter'
        : 'Direct Deposit Form',
      documentUrl: newDoc.document_url,
      status: newDoc.status,
      notes: newDoc.notes,
    })
  } catch (err) {
    console.error('[staff-docs-post] Error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to create document: ${errorMessage}` },
      { status: 500 }
    )
  }
}
