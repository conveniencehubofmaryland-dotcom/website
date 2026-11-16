import { requireAdmin } from '@/lib/admin-auth'
import { deleteUnlinkedFiles, findUnlinkedFiles } from '@/lib/storage-cleanup'
import { NextRequest, NextResponse } from 'next/server'

// Admin: list stored files that no record uses (read only).
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const paths = await findUnlinkedFiles()
    return NextResponse.json({ count: paths.length, paths })
  } catch (err) {
    console.error('[storage-cleanup] list error:', err)
    return NextResponse.json({ error: 'Could not check the stored files.' }, { status: 500 })
  }
}

// Admin: delete the unlinked files listed by GET. Re-checks before deleting.
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const paths = await findUnlinkedFiles()
    const result = await deleteUnlinkedFiles(paths)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('[storage-cleanup] delete error:', err)
    return NextResponse.json({ error: 'Could not delete the unlinked files.' }, { status: 500 })
  }
}
