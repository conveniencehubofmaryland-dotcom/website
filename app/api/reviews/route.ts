import { NextRequest, NextResponse } from 'next/server'
import { dbInsert } from '@/lib/db'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customer_name, rating, body: reviewBody, service_mentioned } = body

  if (!customer_name?.trim() || !reviewBody?.trim()) {
    return NextResponse.json({ error: 'Name and review are required.' }, { status: 400 })
  }

  const ratingNum = Number(rating)
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: 'Rating must be 1–5.' }, { status: 400 })
  }

  const { error } = await dbInsert('reviews', {
    customer_name:     customer_name.trim(),
    rating:            ratingNum,
    body:              reviewBody.trim(),
    service_mentioned: service_mentioned?.trim() || null,
    approved:          false,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to submit review. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
