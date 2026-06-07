import { NextRequest, NextResponse } from 'next/server'
import { dbInsert } from '@/lib/db'
import { sendAdminEmail } from '@/lib/email'
import { sendAdminSMS } from '@/lib/sms'

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

  // Send admin notifications
  await Promise.all([
    sendAdminEmail(
      'New Review Submitted',
      `<h2>New ${ratingNum}-Star Review</h2>
       <p><strong>Customer:</strong> ${customer_name.trim()}</p>
       ${service_mentioned ? `<p><strong>Service:</strong> ${service_mentioned.trim()}</p>` : ''}
       <p><strong>Review:</strong></p>
       <p>${reviewBody.trim()}</p>
       <p><a href="https://conveniencehubofmaryland.com/admin/reviews" style="color:#E8192C">Approve in Admin →</a></p>`
    ),
    sendAdminSMS(
      `NEW REVIEW\n⭐ ${ratingNum}/5 from ${customer_name.trim()}\n${service_mentioned ? `Service: ${service_mentioned.trim()}\n` : ''}Admin: conveniencehubofmaryland.com/admin/reviews`
    ),
  ])

  return NextResponse.json({ success: true })
}
