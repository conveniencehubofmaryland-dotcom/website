import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface StaffDocument {
  id: string
  staffId: string
  staffName: string
  staffEmail: string
  documentType: 'orientation' | 'offer_letter' | 'certification' | 'background_check' | 'training_cert' | 'direct_deposit'
  documentName: string
  documentUrl: string | null
  status: string
  notes?: string | null
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('chm_admin')?.value

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // Fetch new documents from staff_documents table
    const { data: staffDocs, error: docsError } = await supabase
      .from('staff_documents')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (docsError) throw docsError

    // Fetch staff records with document URLs from offer_letter_applicants
    const { data: staffRecords, error: staffError } = await supabase
      .from('offer_letter_applicants')
      .select('id, full_name, email, background_check_url, direct_deposit_url, own_car, notes')
      .order('created_at', { ascending: false })

    if (staffError) throw staffError

    // Transform staff_documents rows
    const newDocuments: StaffDocument[] = (staffDocs || []).map((doc: any) => ({
      id: doc.id,
      staffId: doc.staff_id,
      staffName: '', // Will be filled from staff lookup
      staffEmail: '', // Will be filled from staff lookup
      documentType: doc.document_type,
      documentName: doc.document_type,
      documentUrl: doc.document_url,
      status: doc.status,
      notes: doc.notes,
    }))

    // Build existing documents from offer_letter_applicants
    const existingDocuments: StaffDocument[] = []
    if (staffRecords) {
      staffRecords.forEach((staff: any) => {
        // Background check
        if (staff.background_check_url) {
          existingDocuments.push({
            id: `${staff.id}-bg-check`,
            staffId: staff.id,
            staffName: staff.full_name,
            staffEmail: staff.email,
            documentType: 'background_check',
            documentName: 'Background Check',
            documentUrl: staff.background_check_url,
            status: 'approved',
            notes: staff.notes || '',
          })
        }

        // Direct deposit
        if (staff.direct_deposit_url) {
          existingDocuments.push({
            id: `${staff.id}-direct-deposit`,
            staffId: staff.id,
            staffName: staff.full_name,
            staffEmail: staff.email,
            documentType: 'direct_deposit',
            documentName: 'Direct Deposit Form',
            documentUrl: staff.direct_deposit_url,
            status: 'signed',
            notes: staff.notes || '',
          })
        }
      })
    }

    // Fill in staff names/emails for new documents
    const documentsWithStaffInfo = newDocuments.map(doc => {
      const staff = staffRecords?.find((s: any) => s.id === doc.staffId)
      return {
        ...doc,
        staffName: staff?.full_name || 'Unknown',
        staffEmail: staff?.email || 'unknown@example.com',
      }
    })

    // Combine and return all documents
    const allDocuments = [...documentsWithStaffInfo, ...existingDocuments]

    return new Response(JSON.stringify(allDocuments), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch documents' }), { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('chm_admin')?.value

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const staffId = formData.get('staffId') as string
    const documentType = formData.get('documentType') as string

    if (!file || !staffId || !documentType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileName = `${staffId}-${documentType}-${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('application-documents')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('application-documents')
      .getPublicUrl(fileName)

    // Insert into staff_documents table
    const { data: docData, error: docError } = await supabase
      .from('staff_documents')
      .insert({
        staff_id: staffId,
        document_type: documentType,
        document_url: urlData.publicUrl,
        status: 'pending',
      })
      .select()
      .single()

    if (docError) throw docError

    return new Response(JSON.stringify(docData), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    return new Response(JSON.stringify({ error: 'Failed to upload document' }), { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('chm_admin')?.value

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { id, type } = await req.json()

    if (!id || !type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    // Only delete from staff_documents table (new uploads)
    // Don't delete from offer_letter_applicants
    const { error: deleteError } = await supabase
      .from('staff_documents')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete document' }), { status: 500 })
  }
}
