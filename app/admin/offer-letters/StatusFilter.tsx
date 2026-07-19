'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type FilterStatus = 'all' | 'draft' | 'sent' | 'signed' | 'expired'

const STATUS_FILTER_LABELS: FilterStatus[] = ['all', 'draft', 'sent', 'signed', 'expired']

export default function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterStatus = (searchParams.get('status') || 'all') as FilterStatus

  const handleFilter = (status: FilterStatus) => {
    if (status === 'all') {
      router.push('/admin/offer-letters')
    } else {
      router.push(`/admin/offer-letters?status=${status}`)
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {STATUS_FILTER_LABELS.map(s => (
        <button
          key={s}
          onClick={() => handleFilter(s)}
          className={`text-xs px-3 py-1.5 border uppercase tracking-wide font-semibold transition-colors ${
            filterStatus === s
              ? 'bg-chm-black text-white border-chm-black'
              : 'text-gray-500 border-gray-200 hover:border-chm-black hover:text-chm-black'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
