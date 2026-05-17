export type PricingItem = {
  label: string
  price: string
  unit?: string
  note?: string
}

export type Service = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  price_from: string | null
  pricing_details: PricingItem[]
  sort_order: number
  active: boolean
  created_at: string
}

export type Deal = {
  id: string
  badge: string
  headline: string
  detail: string | null
  sort_order: number
  active: boolean
  created_at: string
}

export type BusinessHour = {
  id: string
  day_name: string
  day_order: number
  open_time: string | null
  close_time: string | null
  is_open: boolean
}

export type ContactInfo = {
  id: string
  key: string
  label: string
  value: string
  href: string
  sort_order: number
}

export type Review = {
  id: string
  customer_name: string
  rating: number
  body: string
  service_mentioned: string | null
  approved: boolean
  created_at: string
}

export type Appointment = {
  id: string
  customer_name: string
  phone: string
  email: string | null
  service_id: string | null
  appointment_date: string
  time_slot: string
  status: 'pending' | 'confirmed' | 'cancelled'
  notes: string | null
  created_at: string
  services?: Pick<Service, 'id' | 'title' | 'slug'>
}

export type Availability = {
  id: string
  day_of_week: number
  time_slot: string
  is_available: boolean
}

export type BlockedDate = {
  id: string
  blocked_date: string
  reason: string | null
}
