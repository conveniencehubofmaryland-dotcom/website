type GoogleRating = {
  rating: number
  reviewCount: number
} | null

export async function getGoogleRating(): Promise<GoogleRating> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.rating,places.userRatingCount,places.id',
      },
      body: JSON.stringify({
        textQuery: 'Convenience Hub of Maryland 904-820-0881',
      }),
    })

    if (!res.ok) {
      console.error('[googleReviews] API error:', await res.text())
      return null
    }

    const data = await res.json()
    const place = data.places?.[0]

    if (!place || typeof place.rating !== 'number') return null

    return {
      rating: place.rating,
      reviewCount: place.userRatingCount || 0,
    }
  } catch (err) {
    console.error('[googleReviews] fetch error:', err)
    return null
  }
}
