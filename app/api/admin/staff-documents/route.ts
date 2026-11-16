import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'
import { removeStoredFiles, storagePathOf } from '@/lib/applicant-cleanup'
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
  documentType: 'orientation' | 'offer_letter' | 'certification' | 'background_check' | 'training_cert' | 'direct_deposit' | 'w9' | 'timesheet' | 'applicant_upload'
  documentName: string
  dateSigned: string | null
  documentUrl: string | null
  status: string
  ownCar: boolean | null
  notes?: string | null
  reviewStatus?: 'pending' | 'cleared' | 'not_cleared' | null
  reviewTable?: 'staff_documents' | 'staff_module_progress' | null
}

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

async function fetchCertifications(): Promise<StaffDocument[]> {
  const { data, error } = await supabase
    .from('staff_module_progress')
    .select('id, staff_name, staff_email, completed_at, module_id, certificate_url, review_status')
    .eq('status', 'completed')
    .not('completed_at', 'is', null)

  if (error) {
    console.error('Error fetching certifications:', error)
    return []
  }

  const moduleIds = (data || []).map(p => p.module_id)
  const { data: modules, error: moduleError } = await supabase
    .from('training_modules')
    .select('id, title')
    .in('id', moduleIds)

  if (moduleError) {
    console.error('Error fetching module titles:', moduleError)
  }

  const moduleMap = new Map((modules || []).map(m => [m.id, m.title]))

  return (data || []).map(row => {
    const moduleName = moduleMap.get(row.module_id) || 'Training Module'
    return {
      id: row.id,
      staffId: row.staff_email,
      staffName: row.staff_name,
      staffEmail: row.staff_email,
      documentType: 'certification' as const,
      documentName: `Certification: ${moduleName}`,
      dateSigned: row.completed_at,
      documentUrl: row.certificate_url || null,
      status: 'completed',
      ownCar: null,
      reviewStatus: row.review_status || 'pending',
      reviewTable: 'staff_module_progress' as const,
    }
  })
}

async function fetchW9Forms(): Promise<StaffDocument[]> {
  const { data, error } = await supabase
    .from('w9_forms')
    .select('id, applicant_id, staff_email, full_name, signed_at, file_path')
    .order('signed_at', { ascending: false })

  if (error) {
    console.error('Error fetching W-9 forms:', error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    staffId: row.applicant_id || row.id,
    staffName: row.full_name,
    staffEmail: row.staff_email,
    documentType: 'w9' as const,
    documentName: 'IRS Form W-9',
    dateSigned: row.signed_at,
    // Uploaded W-9 files open directly; older records use the generated form.
    documentUrl: row.file_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-documents/${encodeURIComponent(row.file_path)}`
      : null,
    status: 'signed',
    ownCar: null,
  }))
}

// One timesheet per staff member per week (Monday to Sunday) that has shifts.
async function fetchTimesheets(): Promise<StaffDocument[]> {
  const { data: shifts, error } = await supabase
    .from('shifts')
    .select('applicant_id, date')
    .not('applicant_id', 'is', null)
  if (error) {
    console.error('Error fetching timesheet shifts:', error)
    return []
  }

  const weeks = new Map<string, { applicantId: string; week: string }>()
  for (const row of shifts || []) {
    const d = new Date(`${row.date}T12:00:00Z`)
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
    const week = d.toISOString().slice(0, 10)
    weeks.set(`${row.applicant_id}_${week}`, { applicantId: row.applicant_id, week })
  }
  if (weeks.size === 0) return []

  const applicantIds = Array.from(new Set(Array.from(weeks.values()).map(w => w.applicantId)))
  const { data: applicants } = await supabase
    .from('offer_letter_applicants')
    .select('id, full_name, email')
    .in('id', applicantIds)
  const byId = new Map((applicants || []).map(a => [a.id, a]))

  return Array.from(weeks.entries())
    .sort((a, b) => b[1].week.localeCompare(a[1].week))
    .map(([id, w]) => {
      const applicant = byId.get(w.applicantId)
      return {
        id,
        staffId: w.applicantId,
        staffName: applicant?.full_name || 'Staff',
        staffEmail: applicant?.email || '',
        documentType: 'timesheet' as const,
        documentName: `Timesheet: week of ${w.week}`,
        dateSigned: w.week,
        documentUrl: null,
        status: 'signed',
        ownCar: null,
      }
    })
}

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
    // The database stores the file name only; build the public storage link so it can be opened.
    documentUrl: row.background_check_url
      ? (String(row.background_check_url).startsWith('http')
          ? String(row.background_check_url)
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-documents/${encodeURIComponent(String(row.background_check_url))}`)
      : null,
    status: row.background_check_status || 'uploaded',
    ownCar: null,
  }))
}

async function fetchStaffDocuments(): Promise<StaffDocument[]> {
  const { data, error } = await supabase
    .from('staff_documents')
    .select('id, staff_id, document_type, document_url, status, notes, uploaded_at, review_status')

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

  const docTypeMap: Record<string, string> = {
    'direct_deposit': 'Direct Deposit Form / Voided Check',
    'background_check': 'Background Check (Additional)',
    'training_cert': 'Training Certificate',
    'certification': 'Certification',
    'orientation': 'Orientation Document',
    'offer_letter': 'Offer Letter (Copy)',
    'cpr_certification': 'CPR Certificate (uploaded)',
    'first_aid_certification': 'First Aid Certificate (uploaded)',
    'cmt_certificate': 'CMT Certificate',
    'cna_certificate': 'CNA Certificate',
    'staff_photo': 'Staff Photo (badge)',
    'staff_badge': 'Staff Badge (copy)',
  }

  return (data || []).map(row => {
    const person = staffMap.get(row.staff_id)
    // Files uploaded by applicants on the welcome form: listed with their own name and opened from the file link.
    const isApplicantUpload = ['cpr_certification', 'first_aid_certification', 'cmt_certificate', 'cna_certificate', 'staff_photo'].includes(row.document_type)
    const documentType = ((isApplicantUpload ? 'applicant_upload' : row.document_type) as 'direct_deposit' | 'background_check' | 'training_cert' | 'certification' | 'orientation' | 'offer_letter' | 'applicant_upload') || 'direct_deposit'
    
    return {
      id: row.id,
      staffId: row.staff_id,
      staffName: person?.full_name || 'Unknown',
      staffEmail: person?.email || '',
      documentType,
      documentName: docTypeMap[row.document_type] || row.document_type,
      dateSigned: row.uploaded_at,
      documentUrl: row.document_url,
      status: row.status,
      ownCar: null,
      notes: row.notes,
      reviewStatus: isApplicantUpload || row.document_type === 'direct_deposit' ? (row.review_status || 'pending') : null,
      reviewTable: isApplicantUpload || row.document_type === 'direct_deposit' ? ('staff_documents' as const) : null,
    }
  })
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const [orientations, offerLetters, certifications, backgroundChecks, staffDocs, w9Forms, timesheets] = await Promise.all([
      fetchOrientations(),
      fetchOfferLetters(),
      fetchCertifications(),
      fetchBackgroundChecks(),
      fetchStaffDocuments(),
      fetchW9Forms(),
      fetchTimesheets(),
    ])

    const allDocuments = [
      ...orientations,
      ...offerLetters,
      ...certifications,
      ...backgroundChecks,
      ...staffDocs,
      ...w9Forms,
      ...timesheets,
    ]

    // Show only people who still exist, and list each file once.
    const { data: live } = await supabase.from('offer_letter_applicants').select('email')
    const liveEmails = new Set((live || []).map(a => String(a.email).toLowerCase()))
    const seen = new Set<string>()
    const cleaned = allDocuments.filter(d => {
      const email = String(d.staffEmail).toLowerCase()
      if (!liveEmails.has(email)) return false
      const key = `${email}|${d.documentType}|${d.documentName}|${d.documentUrl || d.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return NextResponse.json(cleaned)
  } catch (error) {
    console.error('Error in GET /api/admin/staff-documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const staffId = formData.get('staffId') as string
    const documentType = formData.get('documentType') as string
    const notes = formData.get('notes') as string

    if (!file || !staffId || !documentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const timestamp = Date.now()
    const filePath = `${staffId}/${timestamp}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('application-documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('application-documents')
      .getPublicUrl(filePath)

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

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  try {
    const { documentId, documentType, staffId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: 'Missing documentId' }, { status: 400 })
    }

    switch (documentType) {
      case 'orientation': {
        const { error } = await supabase
          .from('offer_letter_applicants')
          .update({ orientation_accepted: false, orientation_accepted_at: null })
          .eq('id', staffId)
        if (error) throw error
        break
      }

      case 'offer_letter': {
        const { error } = await supabase
          .from('offer_letters')
          .delete()
          .eq('id', documentId)
        if (error) throw error
        break
      }

      case 'certification': {
        // Remove the stored certificate file along with its record.
        if (!(await removeStoredFiles([`certificates/${documentId}.html`]))) {
          return NextResponse.json({ error: 'Could not remove the stored file. Nothing was deleted.' }, { status: 500 })
        }
        const { error } = await supabase
          .from('staff_module_progress')
          .delete()
          .eq('id', documentId)
        if (error) throw error
        break
      }

      case 'background_check': {
        const { error } = await supabase
          .from('offer_letter_applicants')
          .update({ background_check_url: null, background_check_status: null })
          .eq('id', staffId)
        if (error) throw error
        break
      }

      default: {
        // Remove the stored file along with the record.
        const { data: doc } = await supabase.from('staff_documents').select('document_url').eq('id', documentId).single()
        const path = storagePathOf(doc?.document_url)
        const badgeFile = documentType === 'staff_badge' && staffId ? [`badges/${staffId}.html`] : []
        if ((path || badgeFile.length) && !(await removeStoredFiles([path || '', ...badgeFile]))) {
          return NextResponse.json({ error: 'Could not remove the stored file. Nothing was deleted.' }, { status: 500 })
        }
        const { error: docError } = await supabase
          .from('staff_documents')
          .delete()
          .eq('id', documentId)
        if (docError) throw docError
        break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/staff-documents:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  try {
    const { documentId, staffEmail, staffName, documentName } = await request.json()

    if (!documentId || !staffEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  try {
    const url = new URL(request.url)
    const documentId = url.pathname.split('/').pop()

    const formData = await request.formData()
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string
    const file = formData.get('file') as File | null

    if (!documentId) {
      return NextResponse.json({ error: 'Missing documentId' }, { status: 400 })
    }

    let documentUrl: string | null = null

    if (file) {
      const timestamp = Date.now()
      const filePath = `${documentId}/${timestamp}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('application-documents')
        .getPublicUrl(filePath)

      documentUrl = urlData.publicUrl
    }

    const updateData: Record<string, string | null> = {
      status,
      notes,
    }

    if (documentUrl) {
      updateData.document_url = documentUrl
    }

    const { data, error: dbError } = await supabase
      .from('staff_documents')
      .update(updateData)
      .eq('id', documentId)
      .select()

    if (dbError) throw dbError

    const updated = data?.[0]
    if (!updated) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: updated.id,
      staffId: updated.staff_id,
      status: updated.status,
      notes: updated.notes,
      documentUrl: updated.document_url,
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/staff-documents:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}
