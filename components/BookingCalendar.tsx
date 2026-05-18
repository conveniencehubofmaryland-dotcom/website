'use client'
import { useState } from 'react'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su']

type Props = {
  value: string        // 'YYYY-MM-DD' or ''
  onChange: (val: string) => void
  min: string          // 'YYYY-MM-DD'
  max: string          // 'YYYY-MM-DD'
  onSundayAttempt?: () => void
}

export default function BookingCalendar({ value, onChange, min, max, onSundayAttempt }: Props) {
  const initialDate = value ? new Date(value + 'T12:00:00') : new Date()
  const [view, setView] = useState({ year: initialDate.getFullYear(), month: initialDate.getMonth() })

  const nowYM  = { year: new Date().getFullYear(), month: new Date().getMonth() }
  const atMin  = view.year === nowYM.year && view.month === nowYM.month
  const maxDate = new Date(max + 'T12:00:00')
  const atMax  = view.year === maxDate.getFullYear() && view.month === maxDate.getMonth()

  function prevMonth() {
    if (atMin) return
    setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 })
  }
  function nextMonth() {
    if (atMax) return
    setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 })
  }

  const firstDayOfMonth = new Date(view.year, view.month, 1).getDay()
  // Monday-first offset: Sun(0)→6, Mon(1)→0, Sat(6)→5
  const offset       = (firstDayOfMonth + 6) % 7
  const daysInMonth  = new Date(view.year, view.month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function dateStr(day: number) {
    const mm = String(view.month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${view.year}-${mm}-${dd}`
  }

  function isSunday(day: number) {
    return new Date(view.year, view.month, day).getDay() === 0
  }

  function isDisabled(day: number) {
    const str = dateStr(day)
    return isSunday(day) || str < min || str > max
  }

  function handleClick(day: number) {
    if (isSunday(day)) { onSundayAttempt?.(); return }
    if (!isDisabled(day)) onChange(dateStr(day))
  }

  return (
    <div className="border border-gray-200 bg-white select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          type="button"
          onClick={prevMonth}
          disabled={atMin}
          aria-label="Previous month"
          className="w-8 h-8 flex items-center justify-center text-xl text-gray-400 hover:text-chm-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>
        <p className="font-semibold text-sm text-chm-black tracking-wide">
          {MONTHS[view.month]} {view.year}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          disabled={atMax}
          aria-label="Next month"
          className="w-8 h-8 flex items-center justify-center text-xl text-gray-400 hover:text-chm-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_LABELS.map((d, i) => (
          <div
            key={d}
            className={`py-2 text-center text-xs font-semibold uppercase tracking-wide ${
              i === 6 ? 'text-gray-200' : 'text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="py-2.5 sm:py-3" />

          const str      = dateStr(day)
          const selected = value === str
          const sun      = isSunday(day)
          const disabled = isDisabled(day)

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(day)}
              disabled={disabled && !sun}
              className={[
                'py-2.5 sm:py-3 text-sm font-medium transition-colors relative',
                selected  ? 'bg-chm-red text-white font-bold' : '',
                !selected && !disabled ? 'text-chm-black hover:bg-cream' : '',
                !selected && sun   ? 'text-gray-200 cursor-not-allowed' : '',
                !selected && disabled && !sun ? 'text-gray-200 cursor-not-allowed' : '',
              ].filter(Boolean).join(' ')}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>Closed Sundays</span>
        {value
          ? <span className="text-chm-red font-semibold">{value}</span>
          : <span>Select a date</span>
        }
      </div>
    </div>
  )
}
