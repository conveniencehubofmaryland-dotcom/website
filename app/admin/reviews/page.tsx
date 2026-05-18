import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import type { Review } from '@/lib/types'
import ReviewActionButton from '@/components/ReviewActionButton'

export const runtime = 'edge'

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter = 'pending' } = await searchParams
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const params: Record<string, string> = {
    select: '*',
    order:  'created_at.desc',
  }
  if (filter === 'pending') params.approved = 'eq.false'
  if (filter === 'approved') params.approved = 'eq.true'

  const reviews = await dbSelectAuth<Review>('reviews', token, params)

  const pendingCount = filter === 'all'
    ? reviews.filter(r => !r.approved).length
    : filter === 'pending' ? reviews.length : 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-chm-black">Reviews</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 mt-1">{pendingCount} pending approval</p>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { label: 'Pending',  value: 'pending'  },
            { label: 'Approved', value: 'approved' },
            { label: 'All',      value: 'all'      },
          ].map(f => (
            <a
              key={f.value}
              href={`/admin/reviews?filter=${f.value}`}
              className={`text-xs px-3 py-1.5 border uppercase tracking-wide font-semibold transition-colors ${
                filter === f.value
                  ? 'bg-chm-black text-white border-chm-black'
                  : 'text-gray-500 border-gray-200 hover:border-chm-black hover:text-chm-black'
              }`}
            >
              {f.label}
            </a>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div
              key={r.id}
              className={`bg-white border p-5 flex items-start gap-4 ${
                !r.approved ? 'border-amber-200' : 'border-gray-100'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <p className="font-semibold text-chm-black">{r.customer_name}</p>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} className={j < r.rating ? 'text-amber-400' : 'text-gray-200'}>★</span>
                    ))}
                  </span>
                  {r.service_mentioned && (
                    <span className="text-xs text-chm-red uppercase tracking-wide">{r.service_mentioned}</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{r.body}</p>
              </div>
              <ReviewActionButton id={r.id} initialApproved={r.approved} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
