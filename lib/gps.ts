// GPS clock-in helpers: site location lookup and distance check.
import { sbFetch } from '@/lib/shift-eligibility'
export const CLOCK_RADIUS_M = 500

export type ClockFlag = 'ok' | 'outside_radius' | 'no_gps' | 'no_site_location'

export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(a)))
}

// Converts a job address to map coordinates. Google first, OpenStreetMap as a fallback.
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const query = address.trim()
  if (!query) return null

  const key = process.env.GOOGLE_PLACES_API_KEY
  if (key) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${key}`
      )
      const data = await res.json()
      const loc = data?.results?.[0]?.geometry?.location
      if (data?.status === 'OK' && loc) return { lat: loc.lat, lng: loc.lng }
      console.error('[gps] Google geocode status:', data?.status)
    } catch (err) {
      console.error('[gps] Google geocode error:', err)
    }
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { 'User-Agent': 'conveniencehubofmaryland.com staff-clock-in' } }
    )
    const rows = await res.json()
    if (Array.isArray(rows) && rows[0]) return { lat: Number(rows[0].lat), lng: Number(rows[0].lon) }
  } catch (err) {
    console.error('[gps] OpenStreetMap geocode error:', err)
  }
  return null
}

// Checks where the staff member is compared with the job site. Never blocks; the result is flagged for admin.
export async function checkSiteDistance(
  shift: { id: string; location: string; location_lat?: number | null; location_lng?: number | null },
  lat: unknown,
  lng: unknown,
): Promise<{ distance: number | null; flag: ClockFlag }> {
  // Look up the job site once, then keep it on the shift.
  let siteLat = shift.location_lat ?? null
  let siteLng = shift.location_lng ?? null
  if (siteLat == null || siteLng == null) {
    const site = await geocodeAddress(shift.location)
    if (site) {
      siteLat = site.lat
      siteLng = site.lng
      await sbFetch(`shifts?id=eq.${encodeURIComponent(shift.id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ location_lat: siteLat, location_lng: siteLng }),
      })
    }
  }
  if (siteLat == null || siteLng == null) return { distance: null, flag: 'no_site_location' }

  if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { distance: null, flag: 'no_gps' }
  }
  const distance = distanceMeters(siteLat, siteLng, lat, lng)
  return { distance, flag: distance > CLOCK_RADIUS_M ? 'outside_radius' : 'ok' }
}
