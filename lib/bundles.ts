export interface BundleService {
  name: string
  frequency?: string
}

export interface Bundle {
  id: string
  category: 'residential' | 'family' | 'senior' | 'commercial'
  name: string
  price: number
  savingsPercent: number
  services: BundleService[]
  description: string
  highlighted?: boolean
}

export const BUNDLES: Bundle[] = [
  // Residential
  {
    id: 'res-starter',
    category: 'residential',
    name: 'Starter',
    price: 800,
    savingsPercent: 15,
    description: 'Perfect for basic cleaning maintenance',
    services: [
      { name: 'Weekly Standard Cleaning', frequency: 'Weekly' },
    ],
  },
  {
    id: 'res-essentials',
    category: 'residential',
    name: 'Essentials',
    price: 1200,
    savingsPercent: 20,
    description: 'Cleaning + laundry for busy professionals',
    highlighted: true,
    services: [
      { name: 'Weekly Cleaning', frequency: 'Weekly' },
      { name: 'Bi-Weekly Laundry Pickup & Delivery', frequency: 'Bi-Weekly' },
    ],
  },
  {
    id: 'res-professional',
    category: 'residential',
    name: 'Professional',
    price: 2100,
    savingsPercent: 18,
    description: 'Comprehensive home management solution',
    services: [
      { name: 'Bi-Weekly Cleaning', frequency: 'Bi-Weekly' },
      { name: 'Weekly Meal Prep', frequency: 'Weekly' },
      { name: 'Monthly Laundry Organization', frequency: 'Monthly' },
    ],
  },
  {
    id: 'res-complete',
    category: 'residential',
    name: 'Complete Living',
    price: 3600,
    savingsPercent: 22,
    description: 'Full-service luxury home care package',
    services: [
      { name: 'Weekly Cleaning', frequency: 'Weekly' },
      { name: 'Bi-Weekly Laundry Pickup & Delivery', frequency: 'Bi-Weekly' },
      { name: 'Weekly Meal Prep', frequency: 'Weekly' },
      { name: 'Monthly Organization & Decluttering', frequency: 'Monthly' },
    ],
  },

  // Family with Children
  {
    id: 'fam-essentials',
    category: 'family',
    name: 'Family Essentials',
    price: 2400,
    savingsPercent: 16,
    description: 'Home + childcare support for growing families',
    services: [
      { name: 'Bi-Weekly Cleaning', frequency: 'Bi-Weekly' },
      { name: 'Weekly Meal Prep', frequency: 'Weekly' },
      { name: 'Bi-Weekly Childcare', frequency: '8 hours/week' },
    ],
  },
  {
    id: 'fam-care',
    category: 'family',
    name: 'Family Care',
    price: 4050,
    savingsPercent: 10,
    description: 'Comprehensive family support with full childcare',
    highlighted: true,
    services: [
      { name: 'Weekly Cleaning', frequency: 'Weekly' },
      { name: 'Bi-Weekly Childcare', frequency: '16 hours/week' },
      { name: 'Weekly Meal Prep', frequency: 'Weekly' },
      { name: 'Monthly Organization', frequency: 'Monthly' },
    ],
  },

  // Senior Care
  {
    id: 'senior-companion',
    category: 'senior',
    name: 'Senior Companion',
    price: 2700,
    savingsPercent: 14,
    description: 'Home care with companion support',
    services: [
      { name: 'Weekly Cleaning', frequency: 'Weekly' },
      { name: 'Companion Care', frequency: '10 hours/week' },
      { name: 'Weekly Meal Prep', frequency: 'Weekly' },
    ],
  },
  {
    id: 'senior-premium',
    category: 'senior',
    name: 'Senior Care Premium',
    price: 4500,
    savingsPercent: 10,
    description: 'Premium senior living support package',
    highlighted: true,
    services: [
      { name: 'Weekly Cleaning', frequency: 'Weekly' },
      { name: 'Companion Care', frequency: '20 hours/week' },
      { name: 'Weekly Meal Prep', frequency: 'Weekly' },
      { name: 'Monthly Organization & Medication Management', frequency: 'Monthly' },
    ],
  },

  // Commercial
  {
    id: 'com-small',
    category: 'commercial',
    name: 'Small Office Complete',
    price: 2700,
    savingsPercent: 0,
    description: 'Professional cleaning for small offices',
    services: [
      { name: 'Janitorial Service', frequency: '3x per week' },
      { name: 'Restroom & Kitchen Sanitization', frequency: '3x per week' },
    ],
  },
  {
    id: 'com-medium',
    category: 'commercial',
    name: 'Medium Office Premium',
    price: 4500,
    savingsPercent: 0,
    description: 'Comprehensive service for growing offices',
    services: [
      { name: 'Janitorial Service', frequency: '5x per week' },
      { name: 'Restroom & Kitchen Sanitization', frequency: '5x per week' },
      { name: 'Floor Maintenance & Waxing', frequency: 'Monthly' },
    ],
  },
  {
    id: 'com-enterprise',
    category: 'commercial',
    name: 'Enterprise Comprehensive',
    price: 0,
    savingsPercent: 0,
    description: 'Custom enterprise solutions (call for pricing)',
    services: [
      { name: 'Daily Janitorial Service' },
      { name: 'Deep Cleaning & Maintenance' },
      { name: 'Custom Services & Special Projects' },
      { name: 'Dedicated Account Manager' },
    ],
  },
]

export const getBundlesByCategory = (category: Bundle['category']) => {
  return BUNDLES.filter(b => b.category === category)
}

export const formatPrice = (price: number) => {
  if (price === 0) return 'Custom Quote'
  return `$${price.toLocaleString()}/mo`
}
