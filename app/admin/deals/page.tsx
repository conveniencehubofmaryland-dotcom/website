import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import type { Deal, BundleRow, MembershipPlan } from '@/lib/types'
import DealsManager from '@/components/DealsManager'
import BundlesManager from '@/components/BundlesManager'

export default async function AdminDealsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''
  const [deals, bundles, plans] = await Promise.all([
    dbSelectAuth<Deal>('deals', token, { order: 'sort_order' }),
    dbSelectAuth<BundleRow>('bundles', token, { order: 'sort_order' }),
    dbSelectAuth<MembershipPlan>('membership_plans', token, { order: 'sort_order' }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-chm-black">Deals</h1>
        <p className="text-sm text-gray-400 mt-1">Manage weekly deals and promotions shown on the Deals page.</p>
      </div>
      <DealsManager initialDeals={deals} />

      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="mb-8">
          <h2 className="font-serif text-3xl text-chm-black">Bundles &amp; Membership</h2>
          <p className="text-sm text-gray-400 mt-1">Edit the bundles and membership plans shown on the Deals page.</p>
        </div>
        <BundlesManager initialBundles={bundles} initialPlans={plans} />
      </div>
    </div>
  )
}
