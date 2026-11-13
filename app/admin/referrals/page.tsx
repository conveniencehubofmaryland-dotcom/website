import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import type { MemberReferral } from '@/lib/types'
import ReferralsManager from '@/components/ReferralsManager'

export default async function AdminReferralsPage() {
  const token = (await cookies()).get('chm_admin')?.value ?? ''
  const rows = await dbSelectAuth<MemberReferral>('member_referrals', token, { order: 'created_at.desc' })
  const earned = rows.filter(r => r.status === 'earned').length
  const redeemed = rows.filter(r => r.status === 'redeemed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-chm-black">Referrals</h1>
        <p className="text-sm text-gray-400 mt-1">
          Each member earns one $15 bonus. It is earned automatically when a referred friend pays. Mark it redeemed when the member shows proof.
        </p>
        <p className="text-sm text-gray-600 mt-2">{earned} ready to redeem · {redeemed} redeemed · {rows.length} total</p>
      </div>
      <ReferralsManager rows={rows} />
    </div>
  )
}
