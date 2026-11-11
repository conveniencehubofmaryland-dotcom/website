// Business hours. Each time is a start time; the last start time is one hour before closing.
// Mon–Sat 7 AM–11 PM, Sunday 9 AM–9 PM.
const WEEKDAY = { open: 7, close: 23 }
const SUNDAY = { open: 9, close: 21 }

export function slotsForDate(dateStr: string): string[] {
  if (!dateStr) return []
  const day = new Date(dateStr + 'T12:00:00').getDay()
  const { open, close } = day === 0 ? SUNDAY : WEEKDAY
  const slots: string[] = []
  for (let h = open; h < close; h++) {
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 === 0 ? 12 : h % 12
    slots.push(`${hour12}:00 ${ampm}`)
  }
  return slots
}
