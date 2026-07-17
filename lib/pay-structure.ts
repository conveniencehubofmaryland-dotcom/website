export type PayTier = {
  level: string
  hourly_min: number
  hourly_max: number
  weekly_min: number
  weekly_max: number
  monthly_min: number
  monthly_max: number
}

export type PositionPayStructure = {
  title: string
  tiers: PayTier[]
  bonuses?: string[]
}

export const PAY_STRUCTURE: Record<string, PositionPayStructure> = {
  'Cleaning Specialist': {
    title: 'Cleaning Specialist',
    tiers: [
      { level: 'Entry Level (0–6 mo)', hourly_min: 16.00, hourly_max: 18.00, weekly_min: 660, weekly_max: 720, monthly_min: 2858, monthly_max: 3118 },
      { level: 'Standard (6 mo–2 yr)', hourly_min: 18.00, hourly_max: 20.00, weekly_min: 740, weekly_max: 820, monthly_min: 3204, monthly_max: 3551 },
      { level: 'Senior (2+ yr)', hourly_min: 20.00, hourly_max: 23.00, weekly_min: 800, weekly_max: 940, monthly_min: 3464, monthly_max: 4070 },
      { level: 'Lead (3+ yr)', hourly_min: 23.00, hourly_max: 25.00, weekly_min: 920, weekly_max: 1120, monthly_min: 3984, monthly_max: 4850 },
    ],
    bonuses: ['5-star reviews (4+ monthly): $50–$100/month', 'Perfect attendance (quarterly): $150–$200', 'Referral: $50–$100 per client', 'Tenure: $100–$300 anniversary bonus'],
  },
  'Laundry Handler': {
    title: 'Laundry Handler',
    tiers: [
      { level: 'Entry (0–6 mo)', hourly_min: 16.00, hourly_max: 18.00, weekly_min: 660, weekly_max: 720, monthly_min: 2860, monthly_max: 3120 },
      { level: 'Standard (6 mo–2 yr)', hourly_min: 18.00, hourly_max: 20.00, weekly_min: 740, weekly_max: 840, monthly_min: 3200, monthly_max: 3640 },
      { level: 'Senior (2+ yr)', hourly_min: 20.00, hourly_max: 23.00, weekly_min: 860, weekly_max: 980, monthly_min: 3730, monthly_max: 4240 },
      { level: 'Lead (3+ yr)', hourly_min: 23.00, hourly_max: 25.00, weekly_min: 1000, weekly_max: 1120, monthly_min: 4330, monthly_max: 4850 },
    ],
    bonuses: ['Zero complaints: $50–$100', 'Referrals: $100–$150', 'Certifications: $200–$300'],
  },
  'Culinary / Chef': {
    title: 'Culinary / Chef',
    tiers: [
      { level: 'Entry (0–1 yr)', hourly_min: 20.00, hourly_max: 24.00, weekly_min: 800, weekly_max: 960, monthly_min: 3464, monthly_max: 4157 },
      { level: 'Standard (1–3 yr)', hourly_min: 24.00, hourly_max: 28.00, weekly_min: 960, weekly_max: 1120, monthly_min: 4157, monthly_max: 4850 },
      { level: 'Senior (3+ yr)', hourly_min: 28.00, hourly_max: 32.00, weekly_min: 1120, weekly_max: 1280, monthly_min: 4850, monthly_max: 5542 },
      { level: 'Executive (5+ yr)', hourly_min: 32.00, hourly_max: 40.00, weekly_min: 1280, weekly_max: 1600, monthly_min: 5542, monthly_max: 6928 },
    ],
    bonuses: ['Client reviews: $100', 'Referrals: $200', 'Event success: $300'],
  },
  'Nanny / Childcare Specialist': {
    title: 'Nanny / Childcare Specialist',
    tiers: [
      { level: 'Entry Level (0–6 mo)', hourly_min: 16.50, hourly_max: 18.00, weekly_min: 660, weekly_max: 720, monthly_min: 2858, monthly_max: 3118 },
      { level: 'Standard (6 mo–2 yr)', hourly_min: 18.00, hourly_max: 20.50, weekly_min: 740, weekly_max: 820, monthly_min: 3204, monthly_max: 3551 },
      { level: 'Senior (2+ yr)', hourly_min: 20.00, hourly_max: 23.50, weekly_min: 800, weekly_max: 940, monthly_min: 3464, monthly_max: 4070 },
      { level: 'Lead (3+ yr)', hourly_min: 23.00, hourly_max: 28.00, weekly_min: 920, weekly_max: 1200, monthly_min: 3984, monthly_max: 5196 },
    ],
    bonuses: ['Child development milestones', 'Family satisfaction', 'Certifications'],
  },
  'Care Companion (Adult/Senior)': {
    title: 'Care Companion (Adult/Senior)',
    tiers: [
      { level: 'Entry (0–6 mo)', hourly_min: 16.00, hourly_max: 18.00, weekly_min: 760, weekly_max: 880, monthly_min: 3290, monthly_max: 3810 },
      { level: 'Standard (6 mo–2 yr)', hourly_min: 18.00, hourly_max: 20.00, weekly_min: 880, weekly_max: 1040, monthly_min: 3810, monthly_max: 4500 },
      { level: 'Senior (2+ yr)', hourly_min: 20.00, hourly_max: 22.00, weekly_min: 1040, weekly_max: 1240, monthly_min: 4500, monthly_max: 5370 },
      { level: 'Premium (3+ yr)', hourly_min: 22.00, hourly_max: 25.00, weekly_min: 1240, weekly_max: 1480, monthly_min: 5370, monthly_max: 6410 },
    ],
    bonuses: ['Client/family satisfaction', 'Reliability', 'Special certifications'],
  },
  'Housekeeping Staff': {
    title: 'Housekeeping Staff',
    tiers: [
      { level: 'Entry (0–6 mo)', hourly_min: 16.00, hourly_max: 18.00, weekly_min: 680, weekly_max: 760, monthly_min: 2945, monthly_max: 3290 },
      { level: 'Standard (6 mo–2 yr)', hourly_min: 18.00, hourly_max: 20.00, weekly_min: 780, weekly_max: 900, monthly_min: 3380, monthly_max: 3900 },
      { level: 'Senior (2+ yr)', hourly_min: 20.00, hourly_max: 23.00, weekly_min: 920, weekly_max: 1060, monthly_min: 3980, monthly_max: 4590 },
      { level: 'Premium (3+ yr)', hourly_min: 23.00, hourly_max: 25.00, weekly_min: 1080, weekly_max: 1240, monthly_min: 4680, monthly_max: 5370 },
    ],
    bonuses: ['Client satisfaction', 'Reliability', 'Project completion'],
  },
}

export const POSITION_LIST = Object.keys(PAY_STRUCTURE)
