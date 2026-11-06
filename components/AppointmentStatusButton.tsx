'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Appointment } from '@/lib/types'

type Status = 'pending' | 'confirmed' | 'cancelled'
type AppointmentWithPayment = Appointment & {
  paid?: boolean | null
  amount_paid?: number | null
  quoted_total?: number | null
}

const COLORS: Record<Status, string> = {
  pending:   'text-amber-700 bg-amber-50 border-amber-200',
  confirmed: 'text-green-700 bg-green-50 border-green-200',
  cancelled: 'text-red-600   bg-red-50   border-red-200',
}

const MISMATCH_TOLERANCE = 0.005

export default function AppointmentStatusButton({
  appointment,
}: {
  appointment: AppointmentWithPayment
}) {
  const router = useRouter()
  const [status,  setStatus]  = useState<Status>(appointment.status)
  const [paid, setPaid] = useState<boolean>(!!appointment.paid)
  const [amountPaid, setAmountPaid] = useState<number | null>(appointment.amount_paid ?? null)
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const id = appointment.id

  const quoted = appointment.quoted_total != null ? Number(appointment.quoted_total) : null
  const mismatch = paid && quoted != null && amountPaid != null
    && Math.abs(amountPaid - quoted) > MISMATCH_TOLERANCE

  async function update(newStatus: Status) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) setStatus(newStatus)
    } finally {
      setLoading(false)
    }
  }

  async function markPaid() {
    const hint = quoted != null ? ` (quoted total: $${quoted.toFixed(2)})` : ''
    const input = window.prompt(`Enter the amount shown in Clover${hint}`)
    if (input === null) return
    const amount = Number(input)
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Please enter a valid amount.')
      return
    }

    if (quoted != null && Math.abs(amount - quoted) > MISMATCH_TOLERANCE) {
      const proceed = window.confirm(
        `The amount ($${amount.toFixed(2)}) does not match the quoted total ($${quoted.toFixed(2)}). Mark as paid anyway?`
      )
      if (!proceed) return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, paid: true, amount_paid: amount }),
      })
      if (res.ok) {
        setPaid(true)
        setAmountPaid(amount)
      } else {
        alert('Could not mark as paid. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this appointment? This cannot be undone.')) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setDeleted(true)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  if (deleted) return <span className="text-xs text-gray-300">Deleted</span>

  return (
    <div className="flex flex-col gap-2">
      <span className={`inline-block text-xs px-2 py-0.5 border font-semibold rounded-sm ${COLORS[status]}`}>
        {status}
      </span>

      {quoted != null && !paid && (
        <span className="text-xs text-gray-500">Quoted ${quoted.toFixed(2)}</span>
      )}

      {paid && (
        <span className="inline-block text-xs px-2 py-0.5 border font-semibold rounded-sm text-green-700 bg-green-50 border-green-200">
          Paid{amountPaid != null ? ` $${amountPaid.toFixed(2)}` : ''}
        </span>
      )}

      {mismatch && (
        <span className="inline-block text-xs px-2 py-0.5 border font-semibold rounded-sm text-red-600 bg-red-50 border-red-200">
          Amount mismatch (quoted ${quoted!.toFixed(2)})
        </span>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setShowDetails(true)}
          className="text-xs text-chm-black hover:underline underline-offset-2 font-semibold"
        >
          View
        </button>
        {!paid && (
          <button
            disabled={loading}
            onClick={markPaid}
            className="text-xs text-chm-black hover:underline underline-offset-2 font-semibold disabled:opacity-40"
          >
            Mark as Paid
          </button>
        )}
        {status !== 'confirmed' && (
          <button
            disabled={loading}
            onClick={() => update('confirmed')}
            className="text-xs text-green-700 hover:underline underline-offset-2 disabled:opacity-40"
          >
            Confirm
          </button>
        )}
        {status !== 'cancelled' && (
          <button
            disabled={loading}
            onClick={() => update('cancelled')}
            className="text-xs text-red-600 hover:underline underline-offset-2 disabled:opacity-40"
          >
            Cancel
          </button>
        )}
        {status !== 'pending' && (
          <button
            disabled={loading}
            onClick={() => update('pending')}
            className="text-xs text-gray-400 hover:underline underline-offset-2 disabled:opacity-40"
          >
            Reset
          </button>
        )}
        <button
          disabled={loading}
          onClick={handleDelete}
          className="text-xs text-gray-300 hover:text-red-600 transition-colors disabled:opacity-40"
        >
          Delete
        </button>
      </div>

      {showDetails && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-serif text-xl text-chm-black">Appointment Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-chm-black text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Client Name</p>
                <p className="text-chm-black font-medium">{appointment.customer_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Email</p>
                <p className="text-chm-black">{appointment.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Phone</p>
                <p className="text-chm-black">{appointment.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Service</p>
                <p className="text-chm-black">{appointment.services?.title || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Date &amp; Time</p>
                <p className="text-chm-black">{appointment.appointment_date} at {appointment.time_slot}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Address</p>
                <p className="text-chm-black">{appointment.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Notes</p>
                <p className="text-chm-black">{appointment.notes || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Quoted Total</p>
                <p className="text-chm-black">{quoted != null ? `$${quoted.toFixed(2)}` : '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
