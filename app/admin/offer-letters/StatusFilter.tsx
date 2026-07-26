'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type FilterStatus = 'all' | 'new' | 'ready' | 'sent' | 'signed'

const STATUS_FILTER_LABELS: FilterStatus[] = ['all', 'new', 'ready', 'sent', 'signed']

const STATUS_LABELS: Record<FilterStatus, string> = {
  all: 'All',
  new: 'New',
  ready: 'Ready',
  sent: 'Sent',
  signed: 'Signed',
}

export default function StatusFilter() {
  const searchParams = useSearchParams()
  const filterStatus = (searchParams.get('status') || 'all') as FilterStatus

  return (
    <div className="flex gap-2 flex-wrap">
      {STATUS_FILTER_LABELS.map(s => {
        const isActive = filterStatus === s
        const href = s === 'all' ? '/admin/offer-letters' : `/admin/offer-letters?status=${s}`

        return (
          <Link
            key={s}
            href={href}
            className={`text-xs px-3 py-1.5 border uppercase tracking-wide font-semibold transition-colors ${
              isActive
                ? 'bg-chm-black text-white border-chm-black'
                : 'text-gray-500 border-gray-200 hover:border-chm-black hover:text-chm-black'
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        )
      })}
    </div>
  )
}
