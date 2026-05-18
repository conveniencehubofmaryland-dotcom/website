import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/admin/login', '/api/admin/login', '/api/admin/logout']

export function proxy(req: NextRequest) {
  if (PUBLIC_PATHS.includes(req.nextUrl.pathname)) return NextResponse.next()

  const token = req.cookies.get('chm_admin')?.value
  if (!token) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
