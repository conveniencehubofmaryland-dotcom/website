import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import type { Deal } from '@/lib/types'
import DealsManager from '@/components/DealsManager'


export default async function AdminDealsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''
  const deals = await dbSelectAuth<Deal>('deals', token, { order: 'sort_order' })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-chm-black">Deals</h1>
        <p className="text-sm text-gray-400 mt-1">Manage weekly deals and promotions shown on the Deals page.</p>
      </div>
      <DealsManager initialDeals={deals} />
    </div>
  )
}
