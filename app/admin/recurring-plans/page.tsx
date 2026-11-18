'use client'

import { useCallback, useEffect, useState } from 'react'

type Plan = {
  id: string
  client_name: string | null
  client_email: string
  client_phone: string | null
  service_category: string | null
  frequency: string
  recurring_amount: number | null
  amount: number
  status: 'active' | 'paused' | 'cancelled'
  next_charge_date: string | null
  last_charge_at: string | null
  failed_attempts: number
  last_error: string | null
  admin_note: string | null
  created_at: string
}

const money = (n: number | null | undefined) => `$${Number(n ?? 0).toFixed(2)}`

export default function RecurringPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/recurring-plans', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not load plans.')
        return
      }
      setPlans(data.plans as Plan[])
    } catch {
      setError('Could not load plans.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function send(id: string, payload: { action?: 'pause' | 'resume' | 'cancel'; note?: string }) {
    setBusyId(id)
    setError('')
    try {
      const res = await fetch('/api/admin/recurring-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'The change could not be saved.')
        return
      }
      await load()
    } catch {
      setError('The change could not be saved.')
    } finally {
      setBusyId('')
    }
  }

  function confirmCancel(p: Plan) {
    if (window.confirm(`Cancel the plan for ${p.client_name || p.client_email}? No more charges will be made.`)) {
      send(p.id, { action: 'cancel' })
    }
  }

  const btn = 'px-3 py-1.5 text-xs uppercase tracking-widest border border-chm-red text-chm-red hover:bg-cream disabled:opacity-50'
  const btnSolid = 'px-3 py-1.5 text-xs uppercase tracking-widest bg-chm-red text-white hover:bg-red-700 disabled:opacity-50'

  return (
    <div>
      <h1 className="font-serif text-3xl text-chm-black mb-2">Recurring Plans</h1>
      <p className="text-sm text-gray-600 mb-6">
        Clients can also pause or cancel from their own link. Use these buttons when a client calls.
      </p>

      {error && <p className="text-sm text-chm-red mb-4">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {!loading && plans.length === 0 && <p className="text-sm text-gray-500">No recurring plans yet.</p>}

      <div className="space-y-4">
        {plans.map(p => (
          <div key={p.id} className="border border-gray-200 bg-white p-5 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-chm-black">{p.client_name || 'Client'} <span className="font-normal text-gray-500">· {p.client_email}{p.client_phone ? ` · ${p.client_phone}` : ''}</span></p>
                <p>{p.service_category || 'Service'} · {money(p.recurring_amount ?? p.amount)} every {p.frequency}</p>
                <p>
                  Status: <strong className={p.status === 'active' ? 'text-green-700' : p.status === 'paused' ? 'text-amber-700' : 'text-gray-500'}>{p.status}</strong>
                  {p.status === 'active' && p.next_charge_date && <> · Next charge {p.next_charge_date}</>}
                  {p.last_charge_at && <> · Last charged {new Date(p.last_charge_at).toLocaleDateString('en-US')}</>}
                </p>
                {p.failed_attempts > 0 && (
                  <p className="text-chm-red">Failed charges in a row: {p.failed_attempts}{p.last_error ? ` · ${p.last_error}` : ''}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {p.status === 'active' && (
                  <button type="button" className={btn} disabled={busyId === p.id} onClick={() => send(p.id, { action: 'pause' })}>Pause</button>
                )}
                {(p.status === 'paused' || p.status === 'cancelled') && (
                  <button type="button" className={btnSolid} disabled={busyId === p.id} onClick={() => send(p.id, { action: 'resume' })}>Resume</button>
                )}
                {p.status !== 'cancelled' && (
                  <button type="button" className={btn} disabled={busyId === p.id} onClick={() => confirmCancel(p)}>Cancel</button>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 border border-gray-300 px-3 py-2 text-sm"
                placeholder="Internal note (for example: client called on 11/18)"
                value={notes[p.id] ?? p.admin_note ?? ''}
                onChange={e => setNotes({ ...notes, [p.id]: e.target.value })}
              />
              <button type="button" className={btn} disabled={busyId === p.id} onClick={() => send(p.id, { note: notes[p.id] ?? p.admin_note ?? '' })}>
                Save note
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
