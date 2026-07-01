export type PricingItem = {
  section?: string
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
  state: string | null
  service_id: string | null
  appointment_date: string
  time_slot: string
  status: 'pending' | 'confirmed' | 'cancelled'
  notes: string | null
  created_at: string
  services?: Pick<Service, 'id' | 'title' | 'slug'>
}

export type Member = {
  id: string
  name: string
  phone: string
  email: string
  state: string
  address: string | null
  preferred_services: string[] | null
  service_frequency: string | null
  recurring: boolean
  active: boolean
  joined_at: string
  created_at: string
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

export type JobPosting = {
  id: string
  title: string
  service_category: string | null
  description: string | null
  active: boolean
  created_at: string
}

export type JobApplication = {
  id: string
  name: string
  phone: string
  email: string
  address: string | null
  city: string | null
  state: string
  gender: string | null
  has_license: string | null
  has_insured_car: string | null
  positions: string[] | null
  days: string[] | null
  hours: string | null
  experience: string | null
  resume_url: string | null
  status: 'new' | 'reviewed' | 'contacted' | 'hired' | 'rejected'
  created_at: string
}
export type Product = {
  id: string
  sku: string
  title: string
  category: string
  description: string | null
  price: number | null
  image_url: string | null
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
export type TrainingModule = {
  id: string
  title: string
  description: string
  position: string
  content: string
  quiz_questions: QuizQuestion[]
  created_at: string
}

export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correct_answer: string
}

export type StaffModuleProgress = {
  id: string
  staff_name: string
  staff_phone: string
  position: string
  module_id: string
  status: 'in_progress' | 'completed' | 'failed'
  quiz_score: number | null
  completed_at: string | null
  created_at: string
}
