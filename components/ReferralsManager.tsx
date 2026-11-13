'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MemberReferral } from '@/lib/types'

const STATUS_LABEL: Record<MemberReferral['status'], string> = {
  pending: 'Pending (friend booked, not paid yet)',
  earned: 'Earned: ready to redeem',
  redeemed: 'Redeemed',
  ineligible: 'Not eligible (member already had their bonus)',
}

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

function RedeemButton({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const redeem = async () => {
    if (!confirm('Redeem this $15 bonus? Make sure the member has shown proof.')) return
    setBusy(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/referrals/${id}/redeem`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not redeem')
      router.refresh()
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-1">
      <button onClick={redeem} disabled={busy} className="text-xs px-3 py-2 uppercase tracking-wide font-semibold bg-chm-black text-white disabled:opacity-50">
        Mark redeemed
      </button>
      {msg && <p className="text-xs text-chm-red">{msg}</p>}
    </div>
  )
}

export default function ReferralsManager({ rows }: { rows: MemberReferral[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">No referrals yet. They appear here when a friend uses a member code.</p>
  }
  return (
    <div className="overflow-x-auto bg-white border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-cream text-left text-xs uppercase tracking-widest text-gray-500">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Member (referrer)</th>
            <th className="p-3">Friend (referred)</th>
            <th className="p-3">Status</th>
            <th className="p-3">Proof</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t border-gray-100 align-top">
              <td className="p-3 whitespace-nowrap">{fmt(r.created_at)}</td>
              <td className="p-3">
                <p className="font-semibold text-chm-black">{r.referrer_name}</p>
                <p className="text-xs text-gray-500">{r.referrer_email}</p>
                <p className="text-xs text-gray-500">Code: {r.referrer_code}</p>
              </td>
              <td className="p-3">
                <p className="font-semibold text-chm-black">{r.referred_name}</p>
                <p className="text-xs text-gray-500">{r.referred_email}</p>
                {r.referred_phone && <p className="text-xs text-gray-500">{r.referred_phone}</p>}
              </td>
              <td className="p-3">
                <p>{STATUS_LABEL[r.status]}</p>
                {r.earned_at && <p className="text-xs text-gray-500">Earned {fmt(r.earned_at)}</p>}
                {r.redeemed_at && <p className="text-xs text-gray-500">Redeemed {fmt(r.redeemed_at)}</p>}
                {r.note && <p className="text-xs text-gray-500">{r.note}</p>}
              </td>
              <td className="p-3 text-xs">
                {r.proof_charge_id ? (
                  <>
                    <p>Payment: ${Number(r.proof_amount ?? 0).toFixed(2)}</p>
                    <p className="text-gray-500 break-all">Charge ID: {r.proof_charge_id}</p>
                  </>
                ) : (
                  <p className="text-gray-400">No payment yet</p>
                )}
              </td>
              <td className="p-3">
                {r.status === 'earned' ? <RedeemButton id={r.id} /> : <span className="text-xs text-gray-400">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
