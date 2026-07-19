'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  table: 'offer_letters' | 'offer_letter_applicants' | 'staff_module_progress'
  id: string
  name: string
}

export function DeleteButton({ table, id, name }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete this record for ${name}? This cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/admin/analytics/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, id }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to delete record')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete record')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-600 hover:text-red-800 font-semibold disabled:opacity-50"
    >
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
