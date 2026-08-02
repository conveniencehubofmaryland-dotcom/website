'use client'

import { useCallback, useEffect, useState } from 'react'

type Shift = {
  id: string
  date: string
  start_time: string
  end_time: string
  location: string
  role: string
  pay_rate?: number
  job_description?: string
  notes?: string
  status?: string
  staff_name?: string
  staff_email?: string
  staff_phone?: string
  applicant_id?: string
}

type JobPosting = {
  id: string
  title: string
}

type FormData = {
  date: string
  start_time: string
  end_time: string
  location: string
  role: string
  pay_rate: string
  job_description: string
  notes: string
}

export default function ShiftsSection() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [roles, setRoles] = useState<JobPosting[]>([])
  const [formData, setFormData] = useState<FormData>({
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    role: '',
    pay_rate: '',
    job_description: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchShifts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/shifts')
      if (!res.ok) throw new Error('Failed to load shifts')
      const data = await res.json()
      if (Array.isArray(data)) setShifts(data)
    } catch (error) {
      console.error('Error loading shifts:', error)
      setMessage('❌ Failed to load shifts')
      setShifts([])
    }
  }, [])

  const fetchRoles = useCallback(async () => {
    const roleList = [
      { id: '1', title: 'Cleaning Specialist' },
      { id: '2', title: 'Laundry Handler' },
      { id: '3', title: 'Culinary & Housekeeping Staff' },
      { id: '4', title: 'Nanny / Childcare Staff' },
      { id: '5', title: 'Care Companion (Adult)' },
      { id: '6', title: 'Commercial Cleaner' },
    ]
    setRoles(roleList)
  }, [])

  useEffect(() => {
    fetchShifts()
    fetchRoles()
  }, [fetchShifts, fetchRoles])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date || !formData.start_time || !formData.end_time || !formData.location || !formData.role) {
      setMessage('❌ Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pay_rate: formData.pay_rate ? parseFloat(formData.pay_rate) : null,
        }),
      })
      if (res.ok) {
        setMessage('✅ Shift created!')
        setFormData({
          date: '',
          start_time: '',
          end_time: '',
          location: '',
          role: '',
          pay_rate: '',
          job_description: '',
          notes: '',
        })
        fetchShifts()
      } else {
        setMessage('❌ Failed to create shift')
      }
    } catch (error) {
      setMessage('❌ Error creating shift')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkNoShow = async (shiftId: string, applicantId: string) => {
    if (!confirm('Mark this shift as a no-show? This will be logged.')) return
    try {
      const res = await fetch('/api/admin/shifts/mark-noshow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: applicantId,
          shift_id: shiftId,
          notes: '',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        alert(
          `✓ No-show recorded\n${data.applicant_name} now has ${data.no_show_count} no-shows\n${data.warning || ''}`
        )
        fetchShifts()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert('Failed to mark no-show')
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this shift?')) return
    try {
      const res = await fetch('/api/admin/shifts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setMessage('✅ Shift deleted')
        fetchShifts()
      } else {
        setMessage('❌ Failed to delete shift')
      }
    } catch (error) {
      setMessage('❌ Error deleting shift')
      console.error(error)
    }
  }

  return (
    <div>
      <h2 className="font-serif text-3xl text-chm-black mb-8">Shifts</h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Create New Shift Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-chm-black mb-6">Create New Shift</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-chm-red text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-chm-red text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-chm-red text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                placeholder="E.g., Downtown DC"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-chm-red text-sm"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold text-gray-700 mb-2">
                Role *
              </label>
              <select
                required
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-chm-red text-sm bg-white"
              >
                <option value="">Select a role...</option>
                {roles.map(role => (
                  <option key={role.id} value={role.title}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-semibold text-gray-700 mb-2">
                Pay Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="E.g., 25.00"
                value={formData.pay_rate}
                onChange={e => setFormData({ ...formData, pay_rate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-chm-red text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              placeholder="Describe the job responsibilities and requirements..."
              value={formData.job_description}
              onChange={e => setFormData({ ...formData, job_description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-chm-red text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <input
              type="text"
              placeholder="Optional notes about the shift"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-chm-red text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-chm-red text-white py-2 rounded font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors text-sm uppercase tracking-widest"
          >
            {loading ? 'Creating...' : 'Create Shift'}
          </button>
        </form>
      </div>

      {/* Shifts Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-chm-black">All Shifts</h3>
        </div>

        {shifts.length === 0 ? (
          <p className="text-gray-600 p-6 text-center text-sm">No shifts yet. Create one above to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold text-gray-600">
                    Start
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold text-gray-600">
                    End
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold text-gray-600">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold text-gray-600">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold text-gray-600">
                    Pay Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold text-gray-600">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift, idx) => (
                  <tr
                    key={shift.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">
                      {shift.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{shift.start_time}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{shift.end_time}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{shift.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{shift.role}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-chm-red whitespace-nowrap">
                      ${shift.pay_rate || 'TBD'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {shift.job_description ? shift.job_description.substring(0, 30) + '...' : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          shift.status === 'claimed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {shift.status === 'claimed' ? 'Claimed' : 'Available'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm space-y-1">
                      {shift.status === 'claimed' && shift.applicant_id ? (
                        <button
                          onClick={() => handleMarkNoShow(shift.id, shift.applicant_id!)}
                          className="block text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors font-semibold w-full text-center whitespace-nowrap"
                          title="Mark as no-show"
                        >
                          No-Show
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="block text-xs px-2 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded transition-colors font-semibold w-full text-center whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Claimed Shifts Section */}
      {shifts.some(s => s.status === 'claimed') && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-chm-black mb-6">Staff Who Claimed Shifts</h3>
          <div className="space-y-4">
            {shifts
              .filter(s => s.status === 'claimed')
              .map(shift => (
                <div key={shift.id} className="border border-green-200 bg-green-50/50 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-1">
                        Shift Details
                      </p>
                      <p className="font-semibold text-sm">
                        {shift.date} • {shift.start_time}-{shift.end_time} • {shift.role}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{shift.location}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-1">
                        Staff Details
                      </p>
                      <p className="font-semibold text-sm">{shift.staff_name}</p>
                      <p className="text-xs text-gray-700 mt-1">📧 {shift.staff_email}</p>
                      <p className="text-xs text-gray-700">📱 {shift.staff_phone}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
