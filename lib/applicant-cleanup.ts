import { serviceHeaders } from './supabase-keys'
import { sbFetch } from './shift-eligibility'

const BUCKET = 'application-documents'

// The file path inside the bucket, from a stored public link or a plain path.
export function storagePathOf(value: string | null | undefined): string | null {
  if (!value) return null
  const marker = `/${BUCKET}/`
  if (value.includes(marker)) return decodeURIComponent(value.split(marker)[1].split('?')[0])
  return value.startsWith('http') ? null : value
}

// Removes files from the bucket. Returns false if the storage service refused.
export async function removeStoredFiles(paths: string[]): Promise<boolean> {
  const clean = Array.from(new Set(paths.filter(Boolean)))
  if (clean.length === 0) return true
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return false
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: serviceHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefixes: clean }),
  })
  if (!res.ok) console.error('[storage] delete failed:', await res.text())
  return res.ok
}

async function rowsOf<T>(path: string): Promise<T[]> {
  const res = await sbFetch(path)
  if (!res.ok) throw new Error(`Lookup failed: ${path}`)
  return (await res.json()) as T[]
}

async function deleteRows(path: string): Promise<void> {
  const res = await sbFetch(path, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
  if (!res.ok) throw new Error(`Delete failed: ${path} (${await res.text()})`)
}

export type DeleteResult = { ok: true } | { ok: false; status: number; error: string }

// Removes an applicant and everything linked to them: documents, W-9, certificates, offers,
// and the stored files. Refuses if the applicant has worked shifts, because pay records must be kept.
export async function deleteApplicantCompletely(applicantId: string): Promise<DeleteResult> {
  const id = encodeURIComponent(applicantId)
  const [applicant] = await rowsOf<{ id: string; email: string }>(`offer_letter_applicants?id=eq.${id}&select=id,email`)
  if (!applicant) return { ok: true }
  const email = encodeURIComponent(applicant.email)

  const [worked] = await rowsOf<{ id: string }>(`shifts?applicant_id=eq.${id}&select=id&limit=1`)
  if (worked) {
    return {
      ok: false,
      status: 409,
      error: 'This applicant has worked shifts, so their pay records must be kept and the profile cannot be fully deleted.',
    }
  }

  const docs = await rowsOf<{ document_url: string | null }>(`staff_documents?staff_id=eq.${id}&select=document_url`)
  const w9s = await rowsOf<{ file_path: string | null }>(`w9_forms?or=(applicant_id.eq.${id},staff_email.ilike.${email})&select=file_path`)
  const certs = await rowsOf<{ id: string }>(`staff_module_progress?staff_email=ilike.${email}&select=id`)

  const paths = [
    ...docs.map(d => storagePathOf(d.document_url)),
    ...w9s.map(w => storagePathOf(w.file_path)),
    ...certs.map(c => `certificates/${c.id}.html`),
    `badges/${applicant.id}.html`,
  ].filter((p): p is string => !!p)

  // Files first, then the rows, then the applicant record.
  if (!(await removeStoredFiles(paths))) {
    return { ok: false, status: 500, error: 'Could not remove the stored files. Nothing was deleted. Please try again.' }
  }
  await deleteRows(`staff_documents?staff_id=eq.${id}`)
  await deleteRows(`w9_forms?or=(applicant_id.eq.${id},staff_email.ilike.${email})`)
  await deleteRows(`staff_module_progress?staff_email=ilike.${email}`)
  await deleteRows(`offer_letters?applicant_id=eq.${id}`)
  await deleteRows(`offer_letter_applicants?id=eq.${id}`)
  return { ok: true }
}
