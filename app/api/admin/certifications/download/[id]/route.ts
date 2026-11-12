import { requireAdmin } from '@/lib/admin-auth'
import { buildCertificateHtml } from '@/lib/certificate'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('staff_module_progress')
      .select('*, training_modules(title)')
      .eq('id', id)
      .single()

    if (error || !data || !data.completed_at) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const htmlContent = buildCertificateHtml({
      id: String(data.id),
      staffName: String(data.staff_name ?? ''),
      moduleTitle: data.training_modules?.title || 'Training Module',
      score: typeof data.quiz_score === 'number' ? data.quiz_score : null,
      completedAt: String(data.completed_at),
    })

    const safeName = String(data.staff_name ?? 'Staff').replace(/[^A-Za-z0-9_-]/g, '_')
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Certificate-${safeName}.html"`,
      },
    })
  } catch (err) {
    console.error('[certifications download] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
