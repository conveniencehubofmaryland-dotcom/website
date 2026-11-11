'use client'

import { useEffect, useState } from 'react'

type Realtor = { id: string; name: string; email: string; phone: string; brokerage: string | null; approved: boolean; created_at: string }
type Code = { id: string; code: string; buyer_name: string; buyer_email: string; status: string; expires_at: string; used_at: string | null; realtors: { name: string } | null }

export default function AdminRealtorsPage() {
  const [realtors, setRealtors] = useState<Realtor[]>([])
  const [codes, setCodes] = useState<Code[]>([])
  const [err, setErr] = useState('')

  async function load() {
    const res = await fetch('/api/admin/realtors')
    if (!res.ok) { setErr('Could not load. Please sign in to admin again.'); return }
    const data = await res.json()
    setRealtors(data.realtors || [])
    setCodes(data.codes || [])
  }

  useEffect(() => { load() }, [])

  async function update(body: Record<string, unknown>) {
    setErr('')
    const res = await fetch('/api/admin/realtors', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) { setErr('Could not save that change.'); return }
    load()
  }

  return (
    <div className="p-6 space-y-10">
      <h1 className="font-serif text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>Realtor Partners</h1>
      {err && <p className="text-sm text-chm-red">{err}</p>}

      <section>
        <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-3">Partners</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">Name</th><th>Brokerage</th><th>Email</th><th>Phone</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {realtors.map(r => (
              <tr key={r.id} className="border-b">
                <td className="py-2">{r.name}</td><td>{r.brokerage || '—'}</td><td>{r.email}</td><td>{r.phone}</td>
                <td>{r.approved ? 'Approved' : 'Pending'}</td>
                <td><button onClick={() => update({ type: 'realtor', id: r.id, approved: !r.approved })} className="text-chm-red text-xs uppercase tracking-widest">{r.approved ? 'Suspend' : 'Approve'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-3">Referral codes</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">Code</th><th>Realtor</th><th>Buyer</th><th>Expires</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {codes.map(c => (
              <tr key={c.id} className="border-b">
                <td className="py-2 font-mono">{c.code}</td><td>{c.realtors?.name || '—'}</td><td>{c.buyer_name} · {c.buyer_email}</td>
                <td>{new Date(c.expires_at).toLocaleDateString()}</td>
                <td>{c.status === 'used' ? `Used ${c.used_at ? new Date(c.used_at).toLocaleDateString() : ''}` : c.status}</td>
                <td>{c.status === 'unused' && <button onClick={() => update({ type: 'code', id: c.id })} className="text-chm-red text-xs uppercase tracking-widest">Cancel</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
