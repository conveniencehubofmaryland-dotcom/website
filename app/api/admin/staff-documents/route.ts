import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
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

    // Combine all documents
    interface Document {
  id: string
  staffName: string
  staffEmail: string
  documentType: 'orientation' | 'offer_letter' | 'certification' | 'background_check'
  documentName: string
  dateSigned: string | null
  documentUrl: string | null
  status: string
  ownCar: boolean | null
}

const allDocuments: Document[] = []

    // Add orientations
    orientations?.forEach(o => {
      allDocuments.push({
        id: `orientation-${o.id}`,
        staffName: o.full_name,
        staffEmail: o.email,
        documentType: 'orientation' as const,
        documentName: 'Orientation/MOU',
        dateSigned: o.orientation_signed_at,
        documentUrl: null,
        status: 'signed',
        ownCar: o.own_car,
      })
    })

    // Add offer letters
    offerLetters?.forEach(ol => {
      const applicant = applicantMap[ol.applicant_id]
      if (applicant) {
        allDocuments.push({
          id: `offer-${ol.id}`,
          staffName: applicant.full_name,
          staffEmail: applicant.email,
          documentType: 'offer_letter' as const,
          documentName: 'Offer Letter',
          dateSigned: ol.signed_at,
          documentUrl: null,
          status: 'signed',
          ownCar: applicant.own_car,
        })
      }
    })

    // Add training certifications
    certifications?.forEach(c => {
      const staff = staffMap[c.staff_id]
      if (staff) {
        allDocuments.push({
          id: `cert-${c.id}`,
          staffName: staff.name,
          staffEmail: staff.email,
          documentType: 'certification' as const,
          documentName: `${c.training_modules?.title || 'Training'} Certification`,
          dateSigned: c.completed_at,
          documentUrl: null,
          status: 'completed',
          ownCar: staff.own_car,
        })
      }
    })

    // Add background checks
    const uniqueApplicants = [
      ...new Map(
        orientations?.map(o => [o.id, { name: o.full_name, email: o.email, own_car: o.own_car, url: o.background_check_url }]) || []
      ).values(),
      ...Object.entries(applicantMap)
        .filter(([, a]) => a.background_check_url)
        .map(([, a]) => ({ name: a.full_name, email: a.email, own_car: a.own_car, url: a.background_check_url })),
    ]

    uniqueApplicants.forEach((applicant, idx) => {
      if (applicant.url) {
        allDocuments.push({
          id: `bg-${idx}`,
          staffName: applicant.name,
          staffEmail: applicant.email,
          documentType: 'background_check' as const,
          documentName: 'Background Check',
          dateSigned: null,
          documentUrl: applicant.url,
          status: 'pending',
          ownCar: applicant.own_car,
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
