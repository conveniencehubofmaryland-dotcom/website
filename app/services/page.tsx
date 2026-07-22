import type { Metadata } from 'next'
import AnimatedSection from '@/components/AnimatedSection'
import type { Service, PricingItem } from '@/lib/types'
import Link from 'next/link'
import CustomQuoteButton from '@/components/CustomQuoteButton'

export const metadata: Metadata = {
  title: 'Services & Pricing | Cleaning, Laundry, Nanny & More — Convenience Hub of Maryland',
  description:
    'Full pricing for professional cleaning, laundry pickup & delivery, culinary & housekeeping, nanny & care, and commercial services in Maryland, Virginia & Washington D.C. Book online or call 202-579-2944.',
  keywords: [
    'cleaning service prices Maryland', 'laundry pickup delivery prices DMV',
    'maid service prices Virginia', 'house cleaning cost Maryland',
    'nanny services Maryland pricing', 'culinary housekeeping DMV',
    'commercial cleaning Maryland', 'home services near me DMV',
    'laundry service prices near me', 'move in move out cleaning Maryland',
  ],
  alternates: { canonical: 'https://www.conveniencehubofmaryland.com/services' },
}

const SERVICE_IMAGES: Record<string, string> = {
  cleaning:   '/service-cleaning.jpg',
  culinary:   '/service-culinary.jpg',
  laundry:    '/service-laundry.jpg',
  care:       '/service-care.jpg',
  commercial: '/commercial-hero.jpg',
}

// Updated per Official Price List — corrected
const STATIC_SERVICES: Service[] = [
  {
    id: 'laundry', slug: 'laundry', sort_order: 1, active: true, created_at: '',
    title: 'Premium Laundry Pickup & Delivery',
    subtitle: 'Pickup · Wash · Dry · Fold · Deliver — Priced Per Pound',
    description: 'We pick up, wash, dry, fold, and deliver directly to your doorstep. Monday–Saturday 8 AM–10 PM EST, Sunday by appointment. 10 lb minimum order. Free pickup and delivery.',
    price_from: 'From $3.99/lb',
    pricing_details: [
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Colors', price: '$3.99', unit: '/lb' },
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Mixed Load', price: '$4.99', unit: '/lb' },
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Bedding & Linens', price: '$4.99', unit: '/lb' },
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Whites', price: '$6.99', unit: '/lb' },
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Wool & Sweaters', price: '$7.99', unit: '/lb', note: 'Hand-wash required' },
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Delicates', price: '$8.99', unit: '/lb', note: 'Silks, satins, lace, fine fabrics' },
      { section: 'Premium Add-Ons (Added to Base Rate)', label: 'Iron & Hang', price: '+$2.00', unit: '/lb', note: 'Professional pressing, hung on hangers' },
      { section: 'Premium Add-Ons (Added to Base Rate)', label: 'Express Iron & Press', price: '+$4.00', unit: '/lb', note: '2–3 day turnaround' },
      { section: 'Premium Add-Ons (Added to Base Rate)', label: 'Same-Day Express', price: '+$1.50–$2.00', unit: '/lb', note: 'Pickup by 10 AM, delivery after 6 PM' },
      { section: 'Folding Only', label: 'Pre-Washed Laundry', price: '$1.50', unit: '/lb', note: '10 lb minimum' },
      { section: 'Monthly Subscription Plans', label: 'Light Load', price: '$140', unit: '/month', note: 'Up to 40 lbs, weekly or bi-weekly pickup' },
      { section: 'Monthly Subscription Plans', label: 'Standard Load', price: '$250', unit: '/month', note: 'Up to 80 lbs, weekly or bi-weekly pickup' },
      { section: 'Monthly Subscription Plans', label: 'Premium Load', price: '$350', unit: '/month', note: 'Up to 120 lbs, weekly pickup' },
      { section: 'Monthly Subscription Plans', label: 'Unlimited Load', price: '$500', unit: '/month', note: 'No limit, flexible schedule. Overage: $2.99/lb' },
      { section: 'Specialty & Add-On Services', label: 'Stain Removal Treatment', price: '$10–$20', note: 'Per item, plus per-pound charge' },
      { section: 'Specialty & Add-On Services', label: 'Allergen-Free Wash Cycle', price: '+$15', unit: '/load' },
      { section: 'Specialty & Add-On Services', label: 'Hypoallergenic Detergent', price: '+$10', unit: '/load' },
      { section: 'Specialty & Add-On Services', label: 'Comforter / Duvet Cleaning', price: '$30–$50', unit: 'each' },
      { section: 'Specialty & Add-On Services', label: 'Bedding Set (full + pillowcases, pressed)', price: '$40–$60', unit: '/set' },
      { section: 'Specialty & Add-On Services', label: 'Curtain Panels', price: '$2–$5', unit: '/panel' },
      { section: 'Specialty & Add-On Services', label: 'Tablecloths', price: '$15–$25', unit: 'each' },
    ],
  },
  {
    id: 'cleaning', slug: 'cleaning', sort_order: 2, active: true, created_at: '',
    title: 'Professional Cleaning & Estate Care',
    subtitle: 'Residential · Commercial · Estate',
    description: 'Customized maintenance for residential estates, luxury apartments, and commercial operations across Maryland, Virginia, and D.C. All products are 100% eco-friendly and non-toxic.',
    price_from: 'From $100/visit',
    pricing_details: [
      { section: 'Standard Residential Cleaning', label: 'Studio (<500 sq ft)', price: '$100', unit: '/visit', note: '1–2 hrs' },
      { section: 'Standard Residential Cleaning', label: '1 Bedroom Apartment', price: '$150', unit: '/visit', note: '2–2.5 hrs' },
      { section: 'Standard Residential Cleaning', label: '2 Bedroom Home (500–1,200 sq ft)', price: '$250', unit: '/visit', note: '2.5–3 hrs' },
      { section: 'Standard Residential Cleaning', label: '3 Bedroom Home (1,200–1,800 sq ft)', price: '$350', unit: '/visit', note: '3–4 hrs' },
      { section: 'Standard Residential Cleaning', label: '4 Bedroom Home (1,800–2,500 sq ft)', price: '$450', unit: '/visit', note: '4–5 hrs' },
      { section: 'Standard Residential Cleaning', label: '5+ Bedroom Home (2,500+ sq ft)', price: '$500+', unit: '/visit', note: '5–6+ hrs. First-time customers save 15% — see Deals page' },
      { section: 'Deep Cleaning Services', label: 'Studio', price: '$250', unit: '/visit' },
      { section: 'Deep Cleaning Services', label: '1 Bedroom', price: '$300', unit: '/visit' },
      { section: 'Deep Cleaning Services', label: '2 Bedroom', price: '$350', unit: '/visit' },
      { section: 'Deep Cleaning Services', label: '3 Bedroom', price: '$450', unit: '/visit' },
      { section: 'Deep Cleaning Services', label: '4 Bedroom', price: '$600', unit: '/visit' },
      { section: 'Deep Cleaning Services', label: '5+ Bedroom', price: '$750', unit: '/visit' },
      { section: 'Move-In / Move-Out Cleaning', label: '1BR Apartment', price: '$450–$600', note: 'Good: $450 (5–6 hrs) · Poor: $600 (7–8 hrs)' },
      { section: 'Move-In / Move-Out Cleaning', label: '3BR House', price: '$600–$900', note: 'Good: $600 (6–8 hrs) · Poor: $900 (9–11 hrs)' },
      { section: 'Move-In / Move-Out Cleaning', label: '4BR House', price: '$800–$1,200', note: 'Good: $800 (7–9 hrs) · Poor: $1,200 (10–12 hrs)' },
      { section: 'Move-In / Move-Out Cleaning', label: '5BR House', price: '$950–$1,350', note: 'Good: $950 (8–10 hrs) · Poor: $1,350 (12–14 hrs). Inspection-ready certification included' },
      { section: 'Estate Care & Senior Living', label: 'Basic Maintenance', price: '$400–$600', unit: '/month', note: 'Weekly, $100–150/visit' },
      { section: 'Estate Care & Senior Living', label: 'Standard Estate Care', price: '$500–$700', unit: '/month', note: 'Every two weeks, $250–350/visit' },
      { section: 'Estate Care & Senior Living', label: 'Full Estate Care', price: '$2,400–$3,200', unit: '/month', note: 'Twice weekly, $300–400/visit' },
      { section: 'Recurring Discounts', label: 'Monthly / Bi-Weekly Service', price: '10% off', note: 'Applied to standard rate' },
      { section: 'Recurring Discounts', label: 'Weekly / Twice-Per-Week Service', price: '15% off', note: 'Applied to standard rate' },
      { section: 'Add-On Services', label: 'Carpet Shampooing & Steam Clean', price: '$150–$200', note: 'Whole house' },
      { section: 'Add-On Services', label: 'Window Cleaning (Interior Only)', price: '$75–$120' },
      { section: 'Add-On Services', label: 'Window Cleaning (Interior + Exterior)', price: '$150–$200' },
      { section: 'Add-On Services', label: 'Appliance Deep Clean (each)', price: '$100–$125' },
      { section: 'Add-On Services', label: 'Grout & Tile Scrubbing (bathroom)', price: '$175–$250' },
      { section: 'Add-On Services', label: 'Hardwood Floor Polishing (per 100 sq ft)', price: '$30–$50' },
      { section: 'Add-On Services', label: 'Upholstery & Furniture Cleaning (per piece)', price: '$75–$100' },
      { section: 'Add-On Services', label: 'Post-Construction Cleanup', price: '$0.25', unit: '/sq ft' },
      { section: 'Add-On Services', label: 'Pet Odor Elimination Treatment', price: '$125–$150' },
      { section: 'Add-On Services', label: 'Disinfection / Sanitization Upgrade', price: '+$75', unit: '/visit' },
      { section: 'Add-On Services', label: 'Organization & Decluttering', price: '$65–$85', unit: '/hr' },
      { section: 'Pet Fee', label: '1 Pet', price: '+$25–$30' },
      { section: 'Pet Fee', label: '2 Pets', price: '+$45–$55' },
      { section: 'Pet Fee', label: '3+ Pets', price: '+$70–$90' },
    ],
  },
  {
    id: 'culinary', slug: 'culinary', sort_order: 3, active: true, created_at: '',
    title: 'Culinary, Housekeeping & Household Management',
    subtitle: 'Meal Prep · Organization · Home Management · Errands',
    description: 'Complete estate support including light cooking, custom meal prep, organization, household administration, and errand running. All staff background-checked, CPR-certified, fully vaccinated.',
    price_from: 'From $300/month',
    pricing_details: [
      { section: 'Meal Prep Plans (Monthly)', label: 'Starter — 10 servings/week', price: '$300–$400', unit: '/month', note: '2–3 recipes, $30–40/meal' },
      { section: 'Meal Prep Plans (Monthly)', label: 'Standard — 20 servings/week', price: '$600–$750', unit: '/month', note: '4–5 recipes, $30–37.50/meal' },
      { section: 'Meal Prep Plans (Monthly)', label: 'Premium — 30 servings/week', price: '$900–$1,050', unit: '/month', note: '6–7 recipes, $30–35/meal' },
      { section: 'Meal Prep Plans (Monthly)', label: 'Luxury — 40+ servings/week', price: '$1,200–$1,500', unit: '/month', note: '7+ recipes, $30–37.50/meal' },
      { section: 'Specialty Meals (Per Serving)', label: 'Breakfast Prep', price: '$8–$12' },
      { section: 'Specialty Meals (Per Serving)', label: 'Lunch Pack', price: '$10–$15' },
      { section: 'Specialty Meals (Per Serving)', label: 'Dinner Entrée', price: '$12–$20' },
      { section: 'Specialty Meals (Per Serving)', label: 'Dessert / Baked Goods', price: '$6–$12' },
      { section: 'Dietary Modifications', label: 'Gluten-Free', price: '+15–20%' },
      { section: 'Dietary Modifications', label: 'Vegan / Vegetarian', price: '+10%' },
      { section: 'Dietary Modifications', label: 'Keto / Low-Carb', price: '+15–20%' },
      { section: 'Dietary Modifications', label: 'Allergen-Free / Medical Diets', price: 'Custom Quote' },
      { section: 'Hourly Culinary Services', label: 'Personal Chef / Meal Prep', price: '$80–$100', unit: '/hr', note: '3-hour minimum' },
      { section: 'Hourly Culinary Services', label: 'Special Event Catering Prep', price: '$75–$100', unit: '/hr', note: '4-hour minimum' },
      { section: 'Hourly Culinary Services', label: 'Kitchen Coaching & Training', price: '$90–$120', unit: '/hr', note: '2-hour minimum' },
      { section: 'Grocery Shopping', label: 'Basic Grocery Shopping', price: '$30–$50', unit: '/visit', note: 'Plus mileage & receipt reimbursement' },
      { section: 'Grocery Shopping', label: 'Premium Sourcing (specialty/organic)', price: '$50–$75', unit: '/visit' },
      { section: 'Organization & Decluttering', label: 'Room / Closet / Pantry Organization', price: '$65–$85', unit: '/hr', note: '4-hour minimum project' },
      { section: 'Organization & Decluttering', label: 'Whole-Home Decluttering', price: '$75–$95', unit: '/hr' },
      { section: 'Organization & Decluttering', label: 'Closet Overhaul (organization + styling)', price: '$80–$100', unit: '/hr' },
      { section: 'Home Management', label: 'Household Admin & Scheduling', price: '$50–$70', unit: '/hr' },
      { section: 'Home Management', label: 'Bill Payment & Expense Management', price: '$40–$60', unit: '/hr' },
      { section: 'Home Management', label: 'Vendor Coordination', price: '$60–$80', unit: '/hr' },
      { section: 'Home Management', label: 'Move Coordination & Setup', price: '$60–$85', unit: '/hr' },
      { section: 'Supervision & Errands', label: 'Home Sitting (during travel)', price: '$80–$120', unit: '/night' },
      { section: 'Supervision & Errands', label: 'House Opening/Closing (seasonal)', price: '$75–$125', unit: '/visit' },
      { section: 'Supervision & Errands', label: 'Errand Running & Concierge', price: '$0.99', unit: '/mile' },
      { section: 'Permanent Housekeeping Staff', label: '5-Day (40 hrs/week)', price: 'Custom Quote' },
      { section: 'Permanent Housekeeping Staff', label: '7-Day Live-In (full-time + room/board)', price: 'Custom Quote' },
    ],
  },
  {
    id: 'care', slug: 'care', sort_order: 4, active: true, created_at: '',
    title: 'Premium Nanny & Care Companion Services',
    subtitle: 'Childcare · Elder Companionship · Adult Care',
    description: "Professional, background-checked, CPR-certified childcare and companion care for infants through school-age children, and seniors or adults needing support. Personnel matched to your family's specific needs.",
    price_from: 'From $28/hr',
    pricing_details: [
      { section: 'Full-Time Nanny (Monthly)', label: 'Part-Time — 15–20 hrs/week', price: '$2,400–$3,200', unit: '/month', note: '$35–45/hr' },
      { section: 'Full-Time Nanny (Monthly)', label: 'Standard — 30–35 hrs/week', price: '$4,800–$6,300', unit: '/month', note: '$30–40/hr' },
      { section: 'Full-Time Nanny (Monthly)', label: 'Premium — 40+ hrs/week', price: '$7,200–$10,000', unit: '/month', note: '$28–38/hr' },
      { section: 'Hourly Childcare', label: 'Standard Babysitting', price: '$35–$45', unit: '/hr', note: '2-hour minimum' },
      { section: 'Hourly Childcare', label: 'Overnight Care', price: '$30–$40', unit: '/hr', note: '8-hour minimum' },
      { section: 'Hourly Childcare', label: 'Nanny Plus Housekeeping', price: '$35–$45', unit: '/hr', note: '3-hour minimum' },
      { section: 'Specialized Childcare', label: 'Infant Care Specialist', price: '+$3–$5', unit: '/hr' },
      { section: 'Specialized Childcare', label: 'Special Needs Care', price: '+$5–$8', unit: '/hr' },
      { section: 'Specialized Childcare', label: 'Bilingual Nanny', price: '+$4–$6', unit: '/hr' },
      { section: 'Specialized Childcare', label: 'Tutoring / Educational Support', price: '$35–$55', unit: '/hr' },
      { section: 'Companion Care (In-Home, Monthly)', label: 'Light — 8–10 hrs/week', price: '$800–$1,000', unit: '/month', note: '$30–40/hr' },
      { section: 'Companion Care (In-Home, Monthly)', label: 'Standard — 20–25 hrs/week', price: '$2,000–$2,750', unit: '/month', note: '$30–40/hr' },
      { section: 'Companion Care (In-Home, Monthly)', label: 'Full-Time — 40+ hrs/week', price: '$4,000–$6,000', unit: '/month', note: '$28–38/hr' },
      { section: 'Companion Care (In-Home, Monthly)', label: '24-Hour Care', price: '$8,000–$12,000', unit: '/month', note: '$25–35/hr' },
      { section: 'Hourly Senior Care', label: 'Care Companion (social support)', price: '$30–$40', unit: '/hr', note: '2-hour minimum' },
      { section: 'Hourly Senior Care', label: 'Personal Care Assistant', price: '$30–$40', unit: '/hr', note: '3-hour minimum' },
      { section: 'Hourly Senior Care', label: 'Respite Care (family relief)', price: '$30–$40', unit: '/hr', note: '4-hour minimum' },
      { section: 'Specialized Senior Care', label: "Dementia / Alzheimer's Care", price: '+$4–$8', unit: '/hr' },
      { section: 'Specialized Senior Care', label: 'Post-Surgical Recovery Support', price: '+$5–$10', unit: '/hr' },
      { section: 'Specialized Senior Care', label: 'Medical Appointment Coordination', price: '$50–$75', unit: '/appointment' },
      { section: 'Specialized Senior Care', label: 'Transportation & Errands', price: '$25–$40', unit: '/hr' },
      { section: 'Adult Day Program', label: 'Social Activities Program', price: '$60–$80', unit: '/day', note: '$300–400/week' },
      { section: 'Adult Day Program', label: 'Full-Service Day Program', price: '$120–$150', unit: '/day', note: '$600–750/week, includes transportation & meals' },
    ],
  },
  {
    id: 'commercial', slug: 'commercial', sort_order: 5, active: true, created_at: '',
    title: 'Commercial Operations & Special Projects',
    subtitle: 'Offices · Retail · Warehouses · Post-Construction',
    description: 'Corporate offices, retail spaces, warehouses, and post-construction cleaning projects. All services fully insured. Custom-quoted per project scope with volume discounts available for recurring contracts.',
    price_from: 'From $0.02/sq ft',
    pricing_details: [
      { section: 'Commercial Cleaning (Per Sq Ft)', label: 'Small Office (1,000–2,000 sq ft)', price: '$0.05', unit: '/sq ft', note: '$50–100/visit · $650–1,500/mo at 3x/week' },
      { section: 'Commercial Cleaning (Per Sq Ft)', label: 'Medium Office (2,000–5,000 sq ft)', price: '$0.04', unit: '/sq ft', note: '$80–200/visit · $1,040–3,000/mo' },
      { section: 'Commercial Cleaning (Per Sq Ft)', label: 'Large Office (5,000–10,000 sq ft)', price: '$0.03', unit: '/sq ft', note: '$150–300/visit · $1,950–4,000/mo' },
      { section: 'Commercial Cleaning (Per Sq Ft)', label: 'Enterprise (10,000+ sq ft)', price: '$0.02–$0.03', unit: '/sq ft', note: '$200–400+/visit · $2,600–5,200+/mo. Min. per visit: $100–150' },
      { section: 'Frequency Adjustments', label: '2x Per Week', price: '+10%' },
      { section: 'Frequency Adjustments', label: 'Weekly', price: '+20%' },
      { section: 'Frequency Adjustments', label: 'Bi-Weekly', price: '+35%' },
      { section: 'Specialized Commercial', label: 'Medical / Dental Office Sanitization', price: '+15–20%' },
      { section: 'Specialized Commercial', label: 'Restaurant / Food Service Deep Clean', price: '+20–25%' },
      { section: 'Specialized Commercial', label: 'Gym / Fitness Facility Cleaning', price: '+15%' },
      { section: 'Specialized Commercial', label: 'Window Cleaning (Commercial)', price: '$1–$3', unit: '/window' },
      { section: 'Specialized Commercial', label: 'Carpet Cleaning (Commercial)', price: '$0.15–$0.25', unit: '/sq ft' },
      { section: 'Specialized Commercial', label: 'Floor Stripping & Waxing', price: '$0.30–$0.50', unit: '/sq ft' },
      { section: 'Commercial Maintenance Plans', label: 'Restroom Only (daily)', price: '$400–$700', unit: '/month' },
      { section: 'Commercial Maintenance Plans', label: 'Common Areas Only (3x/week)', price: '$600–$1,200', unit: '/month' },
      { section: 'Commercial Maintenance Plans', label: 'Comprehensive Building', price: '$2,000–$10,000+', unit: '/month' },
      { section: 'Special Projects (One-Time)', label: 'Post-Renovation Cleanup', price: '$0.25', unit: '/sq ft', note: 'Minimum $500' },
      { section: 'Special Projects (One-Time)', label: 'Hoarder / Estate Cleanup', price: '$75–$100', unit: '/hr' },
      { section: 'Special Projects (One-Time)', label: 'Junk Removal & Hauling', price: '$150–$300', unit: '/truckload' },
      { section: 'Special Projects (One-Time)', label: 'Exterior Pressure Washing', price: '$0.10–$0.20', unit: '/sq ft' },
      { section: 'Special Projects (One-Time)', label: 'Event Setup & Cleanup', price: '$250–$500' },
      { section: 'Billing', label: 'All Commercial Work', price: 'Custom Quote', note: 'Net 30 terms available for approved accounts' },
    ],
  },
]

function groupBySections(items: PricingItem[]): { name: string; items: PricingItem[] }[] {
  const map = new Map<string, PricingItem[]>()
  for (const item of items) {
    const sec = item.section?.trim() || 'Pricing'
    if (!map.has(sec)) map.set(sec, [])
    map.get(sec)!.push(item)
  }
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }))
}

const CUSTOM_QUOTE_MAIL = (label: string) =>
  `mailto:conveniencehubofmaryland@gmail.com?subject=${encodeURIComponent(`Custom Quote Request — ${label}`)}&body=${encodeURIComponent(`Hi Convenience Hub of Maryland,\n\nI am interested in a custom quote for: ${label}\n\nPlease find my details below:\n\n- Name: \n- Phone: \n- Location (MD / VA / DC): \n- Preferred schedule or frequency: \n- Property size or special requirements: \n- Best time to reach me: \n\nThank you!`)}`

export default async function ServicesPage() {
  const services = STATIC_SERVICES

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">What We Offer</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Services &amp; Pricing
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            All services available by calling, texting, or messaging us on WhatsApp at 202-579-2944.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-16">
        {services.map((service, idx) => {
          const sections = groupBySections(service.pricing_details ?? [])
          return (
            <AnimatedSection key={service.id} delay={idx * 80}>
              <section id={service.slug ?? service.id}>
                {SERVICE_IMAGES[service.slug] && (
                  <div className="relative overflow-hidden h-64 md:h-80 mb-8">
                    <img
                      src={SERVICE_IMAGES[service.slug]}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
                  </div>
                )}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-8 h-px bg-chm-red" />
                  <span className="text-chm-red text-lg">✿</span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-chm-black mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  {service.title}
                </h2>
                {service.subtitle && (
                  <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">{service.subtitle}</p>
                )}
                {service.description && (
                 <p className="text-gray-600 text-sm mb-6 max-w-2xl leading-relaxed">{service.description}</p>
                )}
                <Link href="/quote" className="inline-block bg-chm-red text-white px-6 py-2.5 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors mb-8">
                  Get a Quote
                </Link>

                <div className="space-y-6">
                  {sections.map((sec, si) => (
                    <div key={si}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3 pb-2 border-b border-gray-100">
                        {sec.name}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
                        {sec.items.map((item, i) => (
                          <div key={i} className="bg-white p-6 hover:bg-cream transition-colors">
                            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{item.label}</p>
                            <p className="font-serif text-2xl font-bold text-chm-red" style={{ fontFamily: 'var(--font-serif)' }}>
                              {item.price === 'Custom Quote' ? (
                                 <CustomQuoteButton label={item.label} />
                                  ) : (
                                <>{item.price}{item.unit && <span className="text-base font-normal text-gray-400 ml-1">{item.unit}</span>}</>
                              )}
                            </p>
                            {item.note && <p className="text-xs text-gray-400 mt-2">{item.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </AnimatedSection>
          )
        })}

        {/* Policies */}
        <AnimatedSection>
          <div className="bg-cream border border-gray-100 p-8 space-y-6">
            <div>
              <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Policies</p>
              <h2 className="font-serif text-2xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
                Booking &amp; Operational Standards
              </h2>
              <div className="w-10 h-px bg-chm-red mt-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-600 leading-relaxed">
              <div>
                <p className="font-semibold text-chm-black mb-1">Deposits</p>
                <p>A non-refundable deposit may be required to secure single high-intensity deep cleans or move-out services.</p>
              </div>
              <div>
                <p className="font-semibold text-chm-black mb-1">Cancellations &amp; Rescheduling</p>
                <p>24-hour notice required. Late cancellations are subject to a $50 fee or up to 50% of the estimated service value.</p>
              </div>
              <div>
                <p className="font-semibold text-chm-black mb-1">Lock-Out Policy</p>
                <p>If our team cannot access the property within 30 minutes of the scheduled window, a lock-out fee equivalent to the cancellation fee applies.</p>
              </div>
              <div>
                <p className="font-semibold text-chm-black mb-1">Staff Standards</p>
                <p>Every team member is rigorously background-checked, CPR-certified, and fully vaccinated.</p>
              </div>
              <div>
                <p className="font-semibold text-chm-black mb-1">Service Hours</p>
                <p>Monday–Saturday, 8 AM–10 PM EST. Sunday by appointment only.</p>
              </div>
              <div>
                <p className="font-semibold text-chm-black mb-1">No Hidden Fees</p>
                <p>What you see is what you pay. All pricing is transparent with no surprise charges.</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="bg-cream border border-gray-100 p-5">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-chm-black">Laundry minimum:</span> 10 lbs &nbsp;•&nbsp; Mon–Sat 8 AM–10 PM EST
          </p>
        </div>

        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="font-serif text-2xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
                Ready to get started?
              </p>
              <p className="text-gray-500 text-sm mt-1">Call, text, or message us — we&apos;ll handle the rest.</p>
            </div>
            <div className="flex gap-3">
              <a href="tel:+12025792944" className="border border-chm-black/30 text-chm-black px-6 py-2.5 font-semibold text-sm uppercase tracking-wide hover:border-chm-red hover:text-chm-red transition-colors">Call</a>
              <a href="https://wa.me/12025792944" className="bg-chm-red text-white px-6 py-2.5 font-semibold text-sm uppercase tracking-wide hover:bg-red-700 transition-colors">WhatsApp</a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
