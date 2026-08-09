import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface StaffDocument {
  id: string
  staffId: string
  staffName: string
  staffEmail: string
  documentType: 'orientation' | 'offer_letter' | 'certification' | 'background_check' | 'training_cert' | 'direct_deposit'
  documentName: string
  dateSigned: string | null
  documentUrl: string | null
  status: string
  ownCar: boolean | null
  notes?: string | null
}

// CORRECTED: Fetch from offer_letter_applicants.orientation_accepted_at (not orientation_signed_at)
async function fetchOrientations(): Promise<StaffDocument[]> {
  const { data, error } = await supabase
    .from('offer_letter_applicants')
    .select('id, full_name, email, orientation_accepted, orientation_accepted_at')
    .eq('orientation_accepted', true)

  if (error) {
    console.error('Error fetching orientations:', error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    staffId: row.id,
    staffName: row.full_name,
    staffEmail: row.email,
    documentType: 'orientation' as const,
    documentName: 'Orientation & MOU',
    dateSigned: row.orientation_accepted_at,
    documentUrl: null,
    status: 'signed',
    ownCar: null,
  }))
}

// Fetch offer letters from offer_letters table
async function fetchOfferLetters(): Promise<StaffDocument[]> {
  const { data, error } = await supabase
    .from('offer_letters')
    .select('id, applicant_id, created_at, signed_at')
    .not('signed_at', 'is', null)

  if (error) {
    console.error('Error fetching offer letters:', error)
    return []
  }

  const applicantIds = (data || []).map(o => o.applicant_id)
  if (applicantIds.length === 0) return []

  const { data: applicants, error: appError } = await supabase
    .from('offer_letter_applicants')
    .select('id, full_name, email')
    .in('id', applicantIds)

  if (appError) {
    console.error('Error fetching applicant info:', appError)
    return []
  }

  const applicantMap = new Map(applicants.map(a => [a.id, a]))

  return (data || []).map(row => {
    const applicant = applicantMap.get(row.applicant_id)
    return {
      id: row.id,
      staffId: row.applicant_id,
      staffName: applicant?.full_name || 'Unknown',
      staffEmail: applicant?.email || '',
      documentType: 'offer_letter' as const,
      documentName: 'Offer Letter',
      dateSigned: row.signed_at,
      documentUrl: null,
      status: 'signed',
      ownCar: null,
    }
  })
}

// Fetch certifications from staff_module_progress table
async function fetchCertifications(): Promise<StaffDocument[]> {
  const { data, error } = await supabase
    .from('staff_module_progress')
    .select('id, staff_id, completed_at, module_id')
    .not('completed_at', 'is', null)

  if (error) {
    console.error('Error fetching certifications:', error)
    return []
  }

  const staffIds = (data || []).map(p => p.staff_id)
  if (staffIds.length === 0) return []

  const { data: staff, error: staffError } = await supabase
    .from('offer_letter_applicants')
    .select('id, full_name, email')
    .in('id', staffIds)

  if (staffError) {
    console.error('Error fetching staff info:', staffError)
    return []
  }

  const staffMap = new Map(staff.map(s => [s.id, s]))

  const moduleIds = (data || []).map(p => p.module_id)
  const { data: modules, error: moduleError } = await supabase
    .from('training_modules')
    .select('id, title')
    .in('id', moduleIds)

  if (moduleError) {
    console.error('Error fetching module titles:', moduleError)
  }

  const moduleMap = new Map(modules.map(m => [m.id, m.title]))

  return (data || []).map(row => {
    const person = staffMap.get(row.staff_id)
    const moduleName = moduleMap.get(row.module_id) || 'Training Module'
    return {
      id: row.id,
      staffId: row.staff_id,
      staffName: person?.full_name || 'Unknown',
      staffEmail: person?.email || '',
      documentType: 'certification' as const,
      documentName: `Certification: ${moduleName}`,
      dateSigned: row.completed_at,
      documentUrl: null,
      status: 'completed',
      ownCar: null,
    }
  })
}

// Fetch background checks from offer_letter_applicants.background_check_url
async function fetchBackgroundChecks(): Promise<StaffDocument[]> {
  const { data, error } = await supabase
    .from('offer_letter_applicants')
    .select('id, full_name, email, background_check_url, background_check_status')
    .not('background_check_url', 'is', null)

  if (error) {
    console.error('Error fetching background checks:', error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    staffId: row.id,
    staffName: row.full_name,
    staffEmail: row.email,
    documentType: 'background_check' as const,
    documentName: 'Background Check',
    dateSigned: null,
    documentUrl: row.background_check_url,
    status: row.background_check_status || 'uploaded',
    ownCar: null,
  }))
}

// Fetch other documents from staff_documents table
async function fetchStaffDocuments(): Promise<StaffDocument[]> {
  const { data, error } = await supabase
    .from('staff_documents')
    .select('id, staff_id, document_type, document_url, status, notes, uploaded_at')

  if (error) {
    console.error('Error fetching staff documents:', error)
    return []
  }

  const staffIds = (data || []).map(d => d.staff_id)
  if (staffIds.length === 0) return []

  const { data: staff, error: staffError } = await supabase
    .from('offer_letter_applicants')
    .select('id, full_name, email')
    .in('id', staffIds)

  if (staffError) {
    console.error('Error fetching staff info:', staffError)
    return []
  }

  const staffMap = new Map(staff.map(s => [s.id, s]))

  return (data || []).map(row => {
    const person = staffMap.get(row.staff_id)
    const docTypeMap: Record<string, string> = {
      'direct_deposit': 'Direct Deposit Form',
      'background_check': 'Background Check (Additional)',
      'training_cert': 'Training Certificate',
      'certification': 'Certification',
      'orientation': 'Orientation Document',
      'offer_letter': 'Offer Letter (Copy)',
    }
    return {
      id: row.id,
      staffId: row.staff_id,
      staffName: person?.full_name || 'Unknown',
      staffEmail: person?.email || '',
      documentType: (row.document_type as any) || 'direct_deposit',
      documentName: docTypeMap[row.document_type] || row.document_type,
      dateSigned: row.uploaded_at,
      documentUrl: row.document_url,
      status: row.status,
      ownCar: null,
      notes: row.notes,
    }
  })
}

// GET: Fetch all documents from all sources
export async function GET(req: NextRequest) {
  try {
    const [orientations, offerLetters, certifications, backgroundChecks, staffDocs] = await Promise.all([
      fetchOrientations(),
      fetchOfferLetters(),
      fetchCertifications(),
      fetchBackgroundChecks(),
      fetchStaffDocuments(),
    ])

    const allDocuments = [
      ...orientations,
      ...offerLetters,
      ...certifications,
      ...backgroundChecks,
      ...staffDocs,
    ]

    return NextResponse.json(allDocuments)
  } catch (error) {
    console.error('Error in GET /api/admin/staff-documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// DELETE: Remove document from appropriate source
export async function DELETE(req: NextRequest) {
  try {
    const { documentId, documentType, staffId } = await req.json()

    if (!documentId || !documentType) {
      return NextResponse.json({ error: 'Missing documentId or documentType' }, { status: 400 })
    }

    switch (documentType) {
      case 'orientation': {
        // Update offer_letter_applicants to clear orientation
        const { error } = await supabase
          .from('offer_letter_applicants')
          .update({ orientation_accepted: false, orientation_accepted_at: null })
          .eq('id', staffId)

        if (error) throw error
        break
      }

      case 'offer_letter': {
        // Delete from offer_letters table
        const { error } = await supabase
          .from('offer_letters')
          .delete()
          .eq('id', documentId)

        if (error) throw error
        break
      }

      case 'certification': {
        // Delete from staff_module_progress table
        const { error } = await supabase
          .from('staff_module_progress')
          .delete()
          .eq('id', documentId)

        if (error) throw error
        break
      }

      case 'background_check': {
        // Delete file from storage and clear URL
        if (documentId) {
          await supabase.storage.from('application-documents').remove([documentId])
        }

        const { error } = await supabase
          .from('offer_letter_applicants')
          .update({ background_check_url: null, background_check_status: null })
          .eq('id', staffId)

        if (error) throw error
        break
      }

      default: {
        // Delete from staff_documents table
        const { error: docError } = await supabase
          .from('staff_documents')
          .delete()
          .eq('id', documentId)

        if (docError) throw docError

        // Also delete from storage if URL exists
        if (documentId) {
          await supabase.storage.from('application-documents').remove([documentId])
        }
        break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/staff-documents:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}

// POST: Upload new document to staff_documents
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const staffId = formData.get('staffId') as string
    const documentType = formData.get('documentType') as string
    const notes = formData.get('notes') as string

    if (!file || !staffId || !documentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upload file to storage
    const timestamp = Date.now()
    const filePath = `${staffId}/${timestamp}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('application-documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('application-documents')
      .getPublicUrl(filePath)

    // Insert into staff_documents
    const { data, error: dbError } = await supabase
      .from('staff_documents')
      .insert([
        {
          staff_id: staffId,
          document_type: documentType,
          document_url: urlData.publicUrl,
          status: 'uploaded',
          notes,
          uploaded_at: new Date().toISOString(),
        },
      ])
      .select()

    if (dbError) throw dbError

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in POST /api/admin/staff-documents:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}

// PATCH: Share document (send email)
export async function PATCH(req: NextRequest) {
  try {
    const { documentId, staffEmail, staffName, documentName } = await req.json()

    if (!documentId || !staffEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Call share route via internal API
    const shareResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/staff-documents/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId,
        staffEmail,
        staffName,
        documentName,
      }),
    })

    if (!shareResponse.ok) {
      throw new Error('Failed to send email')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/admin/staff-documents:', error)
    return NextResponse.json({ error: 'Failed to share document' }, { status: 500 })
  }
}
