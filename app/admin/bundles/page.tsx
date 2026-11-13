import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import type { BundleRow, MembershipPlan } from '@/lib/types'
import BundlesManager from '@/components/BundlesManager'

export default async function AdminBundlesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''
  const [bundles, plans] = await Promise.all([
    dbSelectAuth<BundleRow>('bundles', token, { order: 'sort_order' }),
    dbSelectAuth<MembershipPlan>('membership_plans', token, { order: 'sort_order' }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-chm-black">Bundles &amp; Membership</h1>
        <p className="text-sm text-gray-400 mt-1">Edit the bundles and membership plans shown on the Deals page.</p>
      </div>
      <BundlesManager initialBundles={bundles} initialPlans={plans} />
    </div>
  )
}
