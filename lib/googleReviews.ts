/* eslint-disable @typescript-eslint/no-explicit-any */
export type GoogleReview = {
  author: string
  authorUrl: string | null
  rating: number
  text: string
  relativeTime: string
}

type GoogleRating = {
  rating: number
  reviewCount: number
  reviews: GoogleReview[]
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
        'X-Goog-FieldMask': 'places.rating,places.userRatingCount,places.id,places.reviews',
      },
      body: JSON.stringify({
        textQuery: 'Convenience Hub of Maryland 904-820-0881',
      }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.error('[googleReviews] API error:', await res.text())
      return null
    }

    const data = await res.json()
    const place = data.places?.[0]

    if (!place || typeof place.rating !== 'number') return null

    const reviews: GoogleReview[] = (place.reviews ?? [])
      .filter((r: any) => r?.text?.text && typeof r.rating === 'number')
      .map((r: any) => ({
        author: r.authorAttribution?.displayName || 'Google user',
        authorUrl: r.authorAttribution?.uri || null,
        rating: r.rating,
        text: r.text.text,
        relativeTime: r.relativePublishTimeDescription || '',
      }))

    return {
      rating: place.rating,
      reviewCount: place.userRatingCount || 0,
      reviews,
    }
  } catch (err) {
    console.error('[googleReviews] fetch error:', err)
    return null
  }
}
