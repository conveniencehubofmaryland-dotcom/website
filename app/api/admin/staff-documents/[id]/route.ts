import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id
    const formData = await req.formData()
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string
    const file = formData.get('document') as File | null

    // Get current document
    const { data: currentDoc } = await supabase
      .from('staff_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (!currentDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    let documentUrl = currentDoc.document_url

    // If new file uploaded, delete old one and upload new
    if (file) {
      // Delete old file if exists
      if (currentDoc.document_url) {
        await supabase.storage
          .from('application-documents')
          .remove([currentDoc.document_url])
      }

      // Upload new file
      const buffer = await file.arrayBuffer()
      const ext = file.name.split('.').pop()
      const fileName = `${currentDoc.staff_id}_${currentDoc.document_type}_${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(fileName, buffer, {
          contentType: file.type,
        })

      if (uploadError) throw uploadError
      documentUrl = fileName
    }

    // Update document
    const { data: updatedDoc, error: updateError } = await supabase
      .from('staff_documents')
      .update({
        status,
        notes,
        document_url: documentUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) throw updateError

    // Fetch staff info
    const { data: staffData } = await supabase
      .from('offer_letter_applicants')
      .select('full_name, email')
      .eq('id', updatedDoc.staff_id)
      .single()

    return NextResponse.json({
      id: updatedDoc.id,
      staffId: updatedDoc.staff_id,
      staffName: staffData?.full_name || 'Unknown',
      staffEmail: staffData?.email || 'unknown@example.com',
      documentType: updatedDoc.document_type,
      documentName: updatedDoc.document_type === 'background_check'
        ? 'Background Check'
        : updatedDoc.document_type === 'training_cert'
        ? 'Training Certificate'
        : updatedDoc.document_type === 'orientation'
        ? 'Orientation/MOU'
        : updatedDoc.document_type === 'offer_letter'
        ? 'Offer Letter'
        : 'Direct Deposit Form',
      documentUrl: updatedDoc.document_url,
      status: updatedDoc.status,
      notes: updatedDoc.notes,
    })
  } catch (err) {
    console.error('[staff-docs-put] Error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to update document: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id

    // Get document to find file to delete
    const { data: doc } = await supabase
      .from('staff_documents')
      .select('document_url')
      .eq('id', documentId)
      .single()

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete file from storage
    if (doc.document_url) {
      await supabase.storage
        .from('application-documents')
        .remove([doc.document_url])
    }

    // Delete record
    const { error: deleteError } = await supabase
      .from('staff_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) throw deleteError

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
