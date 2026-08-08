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
  documentType: 'orientation' | 'offer_letter' | 'certification' | 'background_check' | 'training_cert' | 'direct_deposit'
  documentName: string
  dateSigned: string | null
  documentUrl: string | null
  status: string
  ownCar: boolean | null
}

export async function GET() {
  try {
    const allDocuments: Document[] = []

    // ===== OLD SOURCES (Orientations, Offer Letters, Certifications, Background Checks) =====

    // Fetch orientations (signed)
    const { data: orientations } = await supabase
      .from('offer_letter_applicants')
      .select('id, full_name, email, orientation_signed_at, own_car, background_check_url')
      .not('orientation_signed_at', 'is', null)

    // Fetch offer letters (signed)
    const { data: offerLetters } = await supabase
      .from('offer_letters')
      .select('id, signed_at, applicant_id')
      .not('signed_at', 'is', null)

    // Get applicant info for offer letters
    const applicantIds = offerLetters?.map(ol => ol.applicant_id) || []
    const applicantMap: Record<number, { full_name: string; email: string; own_car: boolean; background_check_url: string | null }> = {}

    if (applicantIds.length > 0) {
      const { data: applicants } = await supabase
        .from('offer_letter_applicants')
        .select('id, full_name, email, own_car, background_check_url')
        .in('id', applicantIds)

      applicants?.forEach(app => {
        applicantMap[app.id] = {
          full_name: app.full_name,
          email: app.email,
          own_car: app.own_car,
          background_check_url: app.background_check_url,
        }
      })
    }

    // Fetch training certifications (completed)
    const { data: certifications } = await supabase
      .from('staff_module_progress')
      .select('id, staff_id, module_id, completed_at, training_modules(title)')
      .not('completed_at', 'is', null)

    // Get staff info for certifications
    const staffIds = certifications?.map(c => c.staff_id) || []
    const staffMap: Record<string, { name: string; email: string; own_car: boolean; background_check_url: string | null }> = {}

    if (staffIds.length > 0) {
      const { data: staffRecords } = await supabase
        .from('offer_letter_applicants')
        .select('id, full_name, email, own_car, background_check_url')
        .in('id', staffIds)

      staffRecords?.forEach(staff => {
        staffMap[staff.id] = {
          name: staff.full_name,
          email: staff.email,
          own_car: staff.own_car,
          background_check_url: staff.background_check_url,
        }
      })
    }

    // Add orientations from old source
    orientations?.forEach(o => {
      allDocuments.push({
        id: `orientation-${o.id}`,
        staffId: o.id,
        staffName: o.full_name,
        staffEmail: o.email,
        documentType: 'orientation',
        documentName: 'Orientation/MOU',
        dateSigned: o.orientation_signed_at,
        documentUrl: null,
        status: 'signed',
        ownCar: o.own_car,
      })
    })

    // Add offer letters from old source
    offerLetters?.forEach(ol => {
      const applicant = applicantMap[ol.applicant_id]
      if (applicant) {
        allDocuments.push({
          id: `offer-${ol.id}`,
          staffId: String(ol.applicant_id),
          staffName: applicant.full_name,
          staffEmail: applicant.email,
          documentType: 'offer_letter',
          documentName: 'Offer Letter',
          dateSigned: ol.signed_at,
          documentUrl: null,
          status: 'signed',
          ownCar: applicant.own_car,
        })
      }
    })

    // Add training certifications from old source
    certifications?.forEach(c => {
      const staff = staffMap[c.staff_id]
      if (staff) {
        allDocuments.push({
          id: `cert-${c.id}`,
          staffId: c.staff_id,
          staffName: staff.name,
          staffEmail: staff.email,
          documentType: 'certification',
          documentName: `${c.training_modules?.[0]?.title || 'Training'} Certification`,
          dateSigned: c.completed_at,
          documentUrl: null,
          status: 'completed',
          ownCar: staff.own_car,
        })
      }
    })

    // Add background checks from old source (offer_letter_applicants.background_check_url)
    const uniqueApplicants = [
      ...new Map(
        orientations?.map(o => [o.id, { id: o.id, name: o.full_name, email: o.email, own_car: o.own_car, url: o.background_check_url }]) || []
      ).values(),
      ...Object.entries(applicantMap)
        .filter(([, a]) => a.background_check_url)
        .map(([id, a]) => ({ id: parseInt(id), name: a.full_name, email: a.email, own_car: a.own_car, url: a.background_check_url })),
    ]

    uniqueApplicants.forEach((applicant, idx) => {
      if (applicant.url) {
        allDocuments.push({
          id: `bg-${idx}`,
          staffId: String(applicant.id),
          staffName: applicant.name,
          staffEmail: applicant.email,
          documentType: 'background_check',
          documentName: 'Background Check',
          dateSigned: null,
          documentUrl: applicant.url,
          status: 'pending',
          ownCar: applicant.own_car,
        })
      }
    })

    // ===== NEW SOURCE (staff_documents table) =====

    const { data: staffDocs } = await supabase
      .from('staff_documents')
      .select('*')
      .order('uploaded_at', { ascending: false })

    const { data: staffInfo } = await supabase
      .from('offer_letter_applicants')
      .select('id, full_name, email, own_car')

    const staffInfoMap: Record<string, { full_name: string; email: string; own_car: boolean }> = {}
    staffInfo?.forEach(s => {
      staffInfoMap[s.id] = { full_name: s.full_name, email: s.email, own_car: s.own_car }
    })

    staffDocs?.forEach(doc => {
      const staff = staffInfoMap[doc.staff_id]
      if (staff) {
        allDocuments.push({
          id: doc.id,
          staffId: doc.staff_id,
          staffName: staff.full_name,
          staffEmail: staff.email,
          documentType: doc.document_type === 'training_cert' ? 'certification' : doc.document_type,
          documentName: doc.document_type === 'background_check'
            ? 'Background Check'
            : doc.document_type === 'training_cert'
            ? 'Training Certificate'
            : doc.document_type === 'orientation'
            ? 'Orientation/MOU'
            : doc.document_type === 'offer_letter'
            ? 'Offer Letter'
            : 'Direct Deposit Form',
          dateSigned: null,
          documentUrl: doc.document_url,
          status: doc.status || 'pending',
          ownCar: staff.own_car,
        })
      }
    })

    return NextResponse.json(allDocuments)
  } catch (err) {
    console.error('Error fetching documents:', err)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
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
    const status = (formData.get('status') as string) || 'pending'
    const notes = (formData.get('notes') as string) || null

    if (!staffId || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields: staffId, documentType' },
        { status: 400 }
      )
    }

    let documentUrl: string | null = null

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

    const { data: staffData } = await supabase
      .from('offer_letter_applicants')
      .select('full_name, email, own_car')
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
      ownCar: staffData?.own_car,
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

export async function DELETE(req: NextRequest) {
  try {
    const { id, type } = await req.json()

    if (type === 'orientation') {
      const applicantId = parseInt(id.replace('orientation-', ''))
      const { error } = await supabase
        .from('offer_letter_applicants')
        .update({ orientation_signed_at: null })
        .eq('id', applicantId)
      if (error) throw error
    } else if (type === 'offer_letter') {
      const offerId = parseInt(id.replace('offer-', ''))
      const { error } = await supabase
        .from('offer_letters')
        .delete()
        .eq('id', offerId)
      if (error) throw error
    } else if (type === 'certification') {
      const certId = id.replace('cert-', '')
      const { error } = await supabase
        .from('staff_module_progress')
        .delete()
        .eq('id', certId)
      if (error) throw error
    } else if (type === 'background_check') {
      const { error: deleteError } = await supabase.storage
        .from('application-documents')
        .remove([id])
      if (deleteError) throw deleteError
    } else {
      // NEW: Delete from staff_documents table
      const { data: doc } = await supabase
        .from('staff_documents')
        .select('document_url')
        .eq('id', id)
        .single()

      if (doc?.document_url) {
        await supabase.storage
          .from('application-documents')
          .remove([doc.document_url])
      }

      const { error } = await supabase
        .from('staff_documents')
        .delete()
        .eq('id', id)
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting document:', err)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
