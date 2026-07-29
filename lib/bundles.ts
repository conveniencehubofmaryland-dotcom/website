export type Bundle = {
  id: string
  name: string
  category: 'residential' | 'family' | 'senior' | 'commercial'
  services: string[]
  regularPrice: number
  bundlePrice: number
  savingsPercent: number
  description?: string
}

export const bundles: Bundle[] = [
  // Residential Bundles
  {
    id: 'essentials',
    name: 'The Essentials Bundle',
    category: 'residential',
    services: ['Weekly Standard Cleaning', 'Bi-Weekly Laundry'],
    regularPrice: 1500,
    bundlePrice: 1200,
    savingsPercent: 20,
    description: 'Perfect for busy professionals'
  },
  {
    id: 'comfort',
    name: 'The Comfort Bundle',
    category: 'residential',
    services: ['Bi-Weekly Cleaning', 'Weekly Meal Prep', 'Monthly Organization'],
    regularPrice: 3000,
    bundlePrice: 2700,
    savingsPercent: 10,
    description: 'Balanced comfort and care'
  },
  {
    id: 'luxury',
    name: 'The Luxury Bundle',
    category: 'residential',
    services: ['Weekly Cleaning', 'Bi-Weekly Laundry', '3x/Week Meal Prep', 'Bi-Weekly Nanny', 'Monthly Organization'],
    regularPrice: 6000,
    bundlePrice: 5400,
    savingsPercent: 10,
    description: 'Complete luxury home management'
  },
  // Family Care Bundle
  {
    id: 'family-care',
    name: 'Family Care Bundle',
    category: 'family',
    services: ['Weekly Cleaning', 'Bi-Weekly Childcare (16 hrs)', 'Weekly Meal Prep', 'Monthly Organization'],
    regularPrice: 4500,
    bundlePrice: 4050,
    savingsPercent: 10,
    description: 'Everything you need for growing families'
  },
  // Senior Care Bundle
  {
    id: 'senior-care',
    name: 'Senior Care Bundle',
    category: 'senior',
    services: ['Weekly Cleaning', '20 hrs/week Companion Care', 'Weekly Meal Prep', 'Monthly Organization'],
    regularPrice: 5000,
    bundlePrice: 4500,
    savingsPercent: 10,
    description: 'Compassionate care for elderly parents'
  },
  // Commercial Bundles
  {
    id: 'small-office',
    name: 'Small Office Complete',
    category: 'commercial',
    services: ['3x/week Janitorial', 'Weekly Window Cleaning', 'Monthly Floor Maintenance'],
    regularPrice: 3000,
    bundlePrice: 2700,
    savingsPercent: 10,
    description: 'Perfect for startup offices'
  },
  {
    id: 'medium-office',
    name: 'Medium Office Premium',
    category: 'commercial',
    services: ['5x/week Janitorial', '2x/week Windows', '2x/month Deep Clean', 'Monthly Floor Maintenance'],
    regularPrice: 5000,
    bundlePrice: 4500,
    savingsPercent: 10,
    description: 'Comprehensive office management'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Comprehensive',
    category: 'commercial',
    services: ['Daily Janitorial', 'Weekly Specialized Services', 'Monthly Floor Care', 'Quarterly Deep Clean'],
    regularPrice: 0, // Custom quote
    bundlePrice: 0,
    savingsPercent: 0,
    description: 'Custom enterprise solutions'
  },
]

export function getBundlesByCategory(category: Bundle['category']): Bundle[] {
  return bundles.filter(b => b.category === category)
}

export function getBundlesByService(service: string): Bundle[] {
  return bundles.filter(b => b.services.some(s => s.toLowerCase().includes(service.toLowerCase())))
}
