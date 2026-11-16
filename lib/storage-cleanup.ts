import { serviceHeaders } from './supabase-keys'
import { sbFetch } from './shift-eligibility'
import { storagePathOf, removeStoredFiles } from './applicant-cleanup'

const BUCKET = 'application-documents'
const GRACE_MS = 24 * 60 * 60 * 1000 // never touch files created in the last 24 hours

type StoredFile = { path: string; createdAt: string | null }

// Every file in the bucket, walking into folders.
async function listAllFiles(prefix = ''): Promise<StoredFile[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('Storage is not configured')
  const out: StoredFile[] = []
  let offset = 0
  for (;;) {
    const res = await fetch(`${url}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: serviceHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    })
    if (!res.ok) throw new Error(`Could not list files: ${await res.text()}`)
    const items = (await res.json()) as { name: string; id: string | null; created_at?: string | null }[]
    for (const item of items) {
      if (item.id === null) {
        out.push(...(await listAllFiles(`${prefix}${item.name}/`)))
      } else {
        out.push({ path: `${prefix}${item.name}`, createdAt: item.created_at || null })
      }
    }
    if (items.length < 1000) break
    offset += 1000
  }
  return out
}

// Every file path the database still points to.
async function linkedPaths(): Promise<Set<string>> {
  const linked = new Set<string>()
  const add = (p: string | null | undefined) => {
    const clean = storagePathOf(p)
    if (clean) linked.add(clean)
  }

  const docs = await sbFetch('staff_documents?select=document_url')
  for (const d of docs.ok ? ((await docs.json()) as { document_url: string | null }[]) : []) add(d.document_url)

  const w9 = await sbFetch('w9_forms?select=file_path')
  for (const w of w9.ok ? ((await w9.json()) as { file_path: string | null }[]) : []) add(w.file_path)

  const apps = await sbFetch('offer_letter_applicants?select=id,background_check_url')
  for (const a of apps.ok ? ((await apps.json()) as { id: string; background_check_url: string | null }[]) : []) {
    add(a.background_check_url)
    linked.add(`badges/${a.id}.html`)
  }

  const certs = await sbFetch('staff_module_progress?select=id')
  for (const c of certs.ok ? ((await certs.json()) as { id: string }[]) : []) linked.add(`certificates/${c.id}.html`)

  return linked
}

// Files in storage that no record points to, and that are older than the grace period.
export async function findUnlinkedFiles(): Promise<string[]> {
  const [files, linked] = await Promise.all([listAllFiles(), linkedPaths()])
  const cutoff = Date.now() - GRACE_MS
  return files
    .filter(f => !linked.has(f.path))
    .filter(f => !f.createdAt || new Date(f.createdAt).getTime() < cutoff)
    .map(f => f.path)
}

export async function deleteUnlinkedFiles(paths: string[]): Promise<{ deleted: number; failed: number }> {
  let deleted = 0
  let failed = 0
  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100)
    if (await removeStoredFiles(batch)) deleted += batch.length
    else failed += batch.length
  }
  return { deleted, failed }
}
