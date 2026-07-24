import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('staff_session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: true, staffName: 'Staff Member' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Session check failed' },
      { status: 500 }
    )
  }
}
