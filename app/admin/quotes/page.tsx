import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import QuoteRequestsTable from './QuoteRequestsTable'

type LineItem = { label: string; amount: number }

type QuoteRequest = {
  id: string
  name: string
  email: string
  phone: string
  category: string
  selections: Record<string, unknown> & { breakdown?: LineItem[] }
  estimated_subtotal: number | null
  estimated_tax: number | null
  estimated_total: number | null
  status: 'new' | 'contacted' | 'booked' | 'closed'
  created_at: string
}

export default async function AdminQuotesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const requests = await dbSelectAuth<QuoteRequest>('quote_requests', token, { order: 'created_at.desc' })

  const total = requests.length
  const newCount = requests.filter(r => r.status === 'new').length
  const bookedCount = requests.filter(r => r.status === 'booked').length
  const priced = requests.filter(r => r.estimated_total != null)
  const avgQuote = priced.length > 0
    ? Math.round(priced.reduce((sum, r) => sum + (r.estimated_total || 0), 0) / priced.length)
    : 0
  const totalPipelineValue = priced
    .filter(r => r.status !== 'closed')
    .reduce((sum, r) => sum + (r.estimated_total || 0), 0)

  const categoryMap = new Map<string, number>()
  requests.forEach(r => {
    categoryMap.set(r.category, (categoryMap.get(r.category) || 0) + 1)
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-chm-black">Quote Requests</h1>
        <p className="text-sm text-gray-400 mt-1">Leads from the Get a Quote page</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-12">
        <div className="border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Total Requests</p>
          <p className="text-3xl font-bold text-chm-black">{total}</p>
        </div>
        <div className="border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">New</p>
          <p className="text-3xl font-bold text-blue-600">{newCount}</p>
        </div>
        <div className="border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Booked</p>
          <p className="text-3xl font-bold text-green-600">{bookedCount}</p>
        </div>
        <div className="border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Avg Quote</p>
          <p className="text-3xl font-bold text-chm-red">${avgQuote}</p>
        </div>
        <div className="border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Open Pipeline</p>
          <p className="text-3xl font-bold text-chm-red">${totalPipelineValue.toFixed(0)}</p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="font-serif text-2xl text-chm-black mb-4">By Category</h2>
        <div className="flex flex-wrap gap-3">
          {Array.from(categoryMap.entries()).map(([cat, count]) => (
            <div key={cat} className="border border-gray-200 px-4 py-2 text-sm">
              <span className="text-gray-500">{cat}:</span> <span className="font-semibold text-chm-black">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-2xl text-chm-black mb-4">All Requests</h2>
        <QuoteRequestsTable requests={requests} />
      </div>
    </div>
  )
}
