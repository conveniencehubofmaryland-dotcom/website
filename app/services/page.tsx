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

// Updated per Official Price List — 2027 pricing (cleaning +20%, all other services +15%)
const STATIC_SERVICES: Service[] = [
  {
    id: 'laundry', slug: 'laundry', sort_order: 1, active: true, created_at: '',
    title: 'Premium Laundry Pickup & Delivery',
    subtitle: 'Pickup · Wash · Dry · Fold · Deliver — Priced Per Pound',
    description: 'We pick up, wash, dry, fold, and deliver directly to your doorstep. Monday–Saturday 8 AM–10 PM EST, Sunday by appointment. 10 lb minimum order. Free pickup and delivery.',
    price_from: 'From $4.59/lb',
    pricing_details: [
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Colors', price: '$4.59', unit: '/lb' },
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Mixed Load', price: '$5.74', unit: '/lb' },
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Bedding & Linens', price: '$5.74', unit: '/lb' },
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Whites', price: '$8.04', unit: '/lb' },
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Wool & Sweaters', price: '$9.19', unit: '/lb', note: 'Hand-wash required' },
      { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Delicates', price: '$10.34', unit: '/lb', note: 'Silks, satins, lace, fine fabrics' },
      { section: 'Premium Add-Ons (Added to Base Rate)', label: 'Iron & Hang', price: '+$2.30', unit: '/lb', note: 'Professional pressing, hung on hangers' },
      { section: 'Premium Add-Ons (Added to Base Rate)', label: 'Express Iron & Press', price: '+$4.60', unit: '/lb', note: '2–3 day turnaround' },
      { section: 'Premium Add-Ons (Added to Base Rate)', label: 'Same-Day Express', price: '+$1.73–$2.30', unit: '/lb', note: 'Pickup by 10 AM, delivery after 6 PM' },
      { section: 'Folding Only', label: 'Pre-Washed Laundry', price: '$1.73', unit: '/lb', note: '10 lb minimum' },
      { section: 'Monthly Subscription Plans', label: 'Light Load', price: '$160', unit: '/month', note: 'Up to 40 lbs, weekly or bi-weekly pickup' },
      { section: 'Monthly Subscription Plans', label: 'Standard Load', price: '$290', unit: '/month', note: 'Up to 80 lbs, weekly or bi-weekly pickup' },
      { section: 'Monthly Subscription Plans', label: 'Premium Load', price: '$405', unit: '/month', note: 'Up to 120 lbs, weekly pickup' },
      { section: 'Monthly Subscription Plans', label: 'Unlimited Load', price: '$575', unit: '/month', note: 'No limit, flexible schedule. Overage: $3.44/lb' },
      { section: 'Specialty & Add-On Services', label: 'Stain Removal Treatment', price: '$12–$23', note: 'Per item, plus per-pound charge' },
      { section: 'Specialty & Add-On Services', label: 'Allergen-Free Wash Cycle', price: '+$17', unit: '/load' },
      { section: 'Specialty & Add-On Services', label: 'Hypoallergenic Detergent', price: '+$12', unit: '/load' },
      { section: 'Specialty & Add-On Services', label: 'Comforter / Duvet Cleaning', price: '$35–$58', unit: 'each' },
      { section: 'Specialty & Add-On Services', label: 'Bedding Set (full + pillowcases, pressed)', price: '$46–$69', unit: '/set' },
      { section: 'Specialty & Add-On Services', label: 'Curtain Panels', price: '$2.30–$5.75', unit: '/panel' },
      { section: 'Specialty & Add-On Services', label: 'Tablecloths', price: '$17–$29', unit: 'each' },
    ],
  },
  {
    id: 'cleaning', slug: 'cleaning', sort_order: 2, active: true, created_at: '',
    title: 'Professional Cleaning & Estate Care',
    subtitle: 'Residential · Commercial · Estate',
    description: 'Customized maintenance for residential estates, luxury apartments, and commercial operations across Maryland, Virginia, and D.C. All products are 100% eco-friendly and non-toxic.',
    price_from: 'From $120/visit',
    pricing_details: [
      { section: 'Standard Residential Cleaning', label: 'Studio (<500 sq ft)', price: '$120', unit: '/visit', note: '1–2 hrs' },
      { section: 'Standard Residential Cleaning', label: '1 Bedroom Apartment', price: '$180', unit: '/visit', note: '2–2.5 hrs' },
      { section: 'Standard Residential Cleaning', label: '2 Bedroom Home (500–1,200 sq ft)', price: '$300', unit: '/visit', note: '2.5–3 hrs' },
      { section: 'Standard Residential Cleaning', label: '3 Bedroom Home (1,200–1,800 sq ft)', price: '$420', unit: '/visit', note: '3–4 hrs' },
      { section: 'Standard Residential Cleaning', label: '4 Bedroom Home (1,800–2,500 sq ft)', price: '$540', unit: '/visit', note: '4–5 hrs' },
      { section: 'Standard Residential Cleaning', label: '5+ Bedroom Home (2,500+ sq ft)', price: '$600+', unit: '/visit', note: '5–6+ hrs. First-time customers save 15% — see Deals page' },
      { section: 'Deep Cleaning Services', label: 'Studio', price: '$300', unit: '/visit' },
      { section: 'Deep Cleaning Services', label: '1 Bedroom', price: '$360', unit: '/visit' },
      { section: 'Deep Cleaning Services', label: '2 Bedroom', price: '$420', unit: '/visit' },
      { section: 'Deep Cleaning Services', label: '3 Bedroom', price: '$540', unit: '/visit' },
      { section: 'Deep Cleaning Services', label: '4 Bedroom', price: '$720', unit: '/visit' },
      { section: 'Deep Cleaning Services', label: '5+ Bedroom', price: '$900', unit: '/visit' },
      { section: 'Move-In / Move-Out Cleaning', label: '1BR Apartment', price: '$540–$720', note: 'Good: $540 (5–6 hrs) · Poor: $720 (7–8 hrs)' },
      { section: 'Move-In / Move-Out Cleaning', label: '3BR House', price: '$720–$1,080', note: 'Good: $720 (6–8 hrs) · Poor: $1,080 (9–11 hrs)' },
      { section: 'Move-In / Move-Out Cleaning', label: '4BR House', price: '$960–$1,440', note: 'Good: $960 (7–9 hrs) · Poor: $1,440 (10–12 hrs)' },
      { section: 'Move-In / Move-Out Cleaning', label: '5BR House', price: '$1,140–$1,620', note: 'Good: $1,140 (8–10 hrs) · Poor: $1,620 (12–14 hrs). Inspection-ready certification included' },
      { section: 'Estate Care & Senior Living', label: 'Basic Maintenance', price: '$480–$720', unit: '/month', note: 'Weekly, $120–180/visit' },
      { section: 'Estate Care & Senior Living', label: 'Standard Estate Care', price: '$600–$840', unit: '/month', note: 'Every two weeks, $300–420/visit' },
      { section: 'Estate Care & Senior Living', label: 'Full Estate Care', price: '$2,880–$3,840', unit: '/month', note: 'Twice weekly, $360–480/visit' },
      { section: 'Recurring Discounts', label: 'Monthly / Bi-Weekly Service', price: '10% off', note: 'Applied to standard rate' },
      { section: 'Recurring Discounts', label: 'Weekly / Twice-Per-Week Service', price: '15% off', note: 'Applied to standard rate' },
      { section: 'Add-On Services', label: 'Carpet Shampooing & Steam Clean', price: '$180–$240', note: 'Whole house' },
      { section: 'Add-On Services', label: 'Window Cleaning (Interior Only)', price: '$90–$145' },
      { section: 'Add-On Services', label: 'Window Cleaning (Interior + Exterior)', price: '$180–$240' },
      { section: 'Add-On Services', label: 'Appliance Deep Clean (each)', price: '$120–$150' },
      { section: 'Add-On Services', label: 'Grout & Tile Scrubbing (bathroom)', price: '$210–$300' },
      { section: 'Add-On Services', label: 'Hardwood Floor Polishing (per 100 sq ft)', price: '$36–$60' },
      { section: 'Add-On Services', label: 'Upholstery & Furniture Cleaning (per piece)', price: '$90–$120' },
      { section: 'Add-On Services', label: 'Post-Construction Cleanup', price: '$0.30', unit: '/sq ft' },
      { section: 'Add-On Services', label: 'Pet Odor Elimination Treatment', price: '$150–$180' },
      { section: 'Add-On Services', label: 'Disinfection / Sanitization Upgrade', price: '+$90', unit: '/visit' },
      { section: 'Add-On Services', label: 'Organization & Decluttering', price: '$78–$102', unit: '/hr' },
      { section: 'Pet Fee', label: '1 Pet', price: '+$30–$36' },
      { section: 'Pet Fee', label: '2 Pets', price: '+$54–$66' },
      { section: 'Pet Fee', label: '3+ Pets', price: '+$84–$108' },
    ],
  },
  {
    id: 'culinary', slug: 'culinary', sort_order: 3, active: true, created_at: '',
    title: 'Culinary, Housekeeping & Household Management',
    subtitle: 'Meal Prep · Organization · Home Management · Errands',
    description: 'Complete estate support including light cooking, custom meal prep, organization, household administration, and errand running. All staff background-checked, CPR-certified, fully vaccinated.',
    price_from: 'From $345/month',
    pricing_details: [
      { section: 'Meal Prep Plans (Monthly)', label: 'Starter — 10 servings/week', price: '$345–$460', unit: '/month', note: '2–3 recipes, $35–46/meal' },
      { section: 'Meal Prep Plans (Monthly)', label: 'Standard — 20 servings/week', price: '$690–$865', unit: '/month', note: '4–5 recipes, $35–43/meal' },
      { section: 'Meal Prep Plans (Monthly)', label: 'Premium — 30 servings/week', price: '$1,035–$1,205', unit: '/month', note: '6–7 recipes, $35–40/meal' },
      { section: 'Meal Prep Plans (Monthly)', label: 'Luxury — 40+ servings/week', price: '$1,380–$1,725', unit: '/month', note: '7+ recipes, $35–43/meal' },
      { section: 'Specialty Meals (Per Serving)', label: 'Breakfast Prep', price: '$9–$14' },
      { section: 'Specialty Meals (Per Serving)', label: 'Lunch Pack', price: '$12–$17' },
      { section: 'Specialty Meals (Per Serving)', label: 'Dinner Entrée', price: '$14–$23' },
      { section: 'Specialty Meals (Per Serving)', label: 'Dessert / Baked Goods', price: '$7–$14' },
      { section: 'Dietary Modifications', label: 'Gluten-Free', price: '+15–20%' },
      { section: 'Dietary Modifications', label: 'Vegan / Vegetarian', price: '+10%' },
      { section: 'Dietary Modifications', label: 'Keto / Low-Carb', price: '+15–20%' },
      { section: 'Dietary Modifications', label: 'Allergen-Free / Medical Diets', price: 'Custom Quote' },
      { section: 'Hourly Culinary Services', label: 'Personal Chef / Meal Prep', price: '$92–$115', unit: '/hr', note: '3-hour minimum' },
      { section: 'Hourly Culinary Services', label: 'Special Event Catering Prep', price: '$86–$115', unit: '/hr', note: '4-hour minimum' },
      { section: 'Hourly Culinary Services', label: 'Kitchen Coaching & Training', price: '$104–$138', unit: '/hr', note: '2-hour minimum' },
      { section: 'Grocery Shopping', label: 'Basic Grocery Shopping', price: '$35–$58', unit: '/visit', note: 'Plus mileage & receipt reimbursement' },
      { section: 'Grocery Shopping', label: 'Premium Sourcing (specialty/organic)', price: '$58–$86', unit: '/visit' },
      { section: 'Organization & Decluttering', label: 'Room / Closet / Pantry Organization', price: '$75–$98', unit: '/hr', note: '4-hour minimum project' },
      { section: 'Organization & Decluttering', label: 'Whole-Home Decluttering', price: '$86–$109', unit: '/hr' },
      { section: 'Organization & Decluttering', label: 'Closet Overhaul (organization + styling)', price: '$92–$115', unit: '/hr' },
      { section: 'Home Management', label: 'Household Admin & Scheduling', price: '$58–$81', unit: '/hr' },
      { section: 'Home Management', label: 'Bill Payment & Expense Management', price: '$46–$69', unit: '/hr' },
      { section: 'Home Management', label: 'Vendor Coordination', price: '$69–$92', unit: '/hr' },
      { section: 'Home Management', label: 'Move Coordination & Setup', price: '$69–$98', unit: '/hr' },
      { section: 'Supervision & Errands', label: 'Home Sitting (during travel)', price: '$92–$138', unit: '/night' },
      { section: 'Supervision & Errands', label: 'House Opening/Closing (seasonal)', price: '$86–$144', unit: '/visit' },
      { section: 'Supervision & Errands', label: 'Errand Running & Concierge', price: '$1.14', unit: '/mile' },
      { section: 'Permanent Housekeeping Staff', label: '5-Day (40 hrs/week)', price: 'Custom Quote' },
      { section: 'Permanent Housekeeping Staff', label: '7-Day Live-In (full-time + room/board)', price: 'Custom Quote' },
    ],
  },
  {
    id: 'care', slug: 'care', sort_order: 4, active: true, created_at: '',
    title: 'Premium Nanny & Non-Medical Adult Care Companion Services',
    subtitle: 'Childcare · Elder Companionship · Adult Care',
    description: "Professional, background-checked, CPR-certified childcare and companion care for infants through school-age children, and seniors or adults needing support. Personnel matched to your family's specific needs.",
    price_from: 'From $32/hr',
    pricing_details: [
      { section: 'Full-Time Nanny (Monthly)', label: 'Part-Time — 15–20 hrs/week', price: '$2,760–$3,680', unit: '/month', note: '$40–52/hr' },
      { section: 'Full-Time Nanny (Monthly)', label: 'Standard — 30–35 hrs/week', price: '$5,520–$7,245', unit: '/month', note: '$35–46/hr' },
      { section: 'Full-Time Nanny (Monthly)', label: 'Premium — 40+ hrs/week', price: '$8,280–$11,500', unit: '/month', note: '$32–44/hr' },
      { section: 'Hourly Childcare', label: 'Standard Babysitting', price: '$40–$52', unit: '/hr', note: '2-hour minimum' },
      { section: 'Hourly Childcare', label: 'Overnight Care', price: '$35–$46', unit: '/hr', note: '8-hour minimum' },
      { section: 'Hourly Childcare', label: 'Nanny Plus Housekeeping', price: '$40–$52', unit: '/hr', note: '3-hour minimum' },
      { section: 'Specialized Childcare', label: 'Infant Care Specialist', price: '+$3.45–$5.75', unit: '/hr' },
      { section: 'Specialized Childcare', label: 'Special Needs Care', price: '+$5.75–$9.20', unit: '/hr' },
      { section: 'Specialized Childcare', label: 'Bilingual Nanny', price: '+$4.60–$6.90', unit: '/hr' },
      { section: 'Specialized Childcare', label: 'Tutoring / Educational Support', price: '$40–$63', unit: '/hr' },
      { section: 'Companion Care (In-Home, Monthly)', label: 'Light — 8–10 hrs/week', price: '$920–$1,150', unit: '/month', note: '$35–46/hr' },
      { section: 'Companion Care (In-Home, Monthly)', label: 'Standard — 20–25 hrs/week', price: '$2,300–$3,165', unit: '/month', note: '$35–46/hr' },
      { section: 'Companion Care (In-Home, Monthly)', label: 'Full-Time — 40+ hrs/week', price: '$4,600–$6,900', unit: '/month', note: '$32–44/hr' },
      { section: 'Companion Care (In-Home, Monthly)', label: '24-Hour Care', price: '$9,200–$13,800', unit: '/month', note: '$29–40/hr' },
      { section: 'Hourly Senior Care', label: 'Care Companion (social support)', price: '$35–$46', unit: '/hr', note: '2-hour minimum' },
      { section: 'Hourly Senior Care', label: 'Personal Care Assistant', price: '$35–$46', unit: '/hr', note: '3-hour minimum' },
      { section: 'Hourly Senior Care', label: 'Respite Care (family relief)', price: '$35–$46', unit: '/hr', note: '4-hour minimum' },
      { section: 'Specialized Senior Care', label: "Dementia / Alzheimer's Care", price: '+$4.60–$9.20', unit: '/hr' },
      { section: 'Specialized Senior Care', label: 'Post-Surgical Recovery Support', price: '+$5.75–$11.50', unit: '/hr' },
      { section: 'Specialized Senior Care', label: 'Medical Appointment Coordination', price: '$58–$86', unit: '/appointment' },
      { section: 'Specialized Senior Care', label: 'Transportation & Errands', price: '$29–$46', unit: '/hr' },
      { section: 'Adult Day Program', label: 'Social Activities Program', price: '$69–$92', unit: '/day', note: '$345–460/week' },
      { section: 'Adult Day Program', label: 'Full-Service Day Program', price: '$138–$173', unit: '/day', note: '$690–$865/week, includes transportation & meals' },
    ],
  },
  {
    id: 'commercial', slug: 'commercial', sort_order: 5, active: true, created_at: '',
    title: 'Commercial Operations & Special Projects',
    subtitle: 'Offices · Retail · Warehouses · Post-Construction',
    description: 'Corporate offices, retail spaces, warehouses, and post-construction cleaning projects. All services fully insured. Custom-quoted per project scope with volume discounts available for recurring contracts.',
    price_from: 'From $0.023/sq ft',
    pricing_details: [
      { section: 'Commercial Cleaning (Per Sq Ft)', label: 'Small Office (1,000–2,000 sq ft)', price: '$0.058', unit: '/sq ft', note: '$58–$115/visit · $750–$1,725/mo at 3x/week' },
      { section: 'Commercial Cleaning (Per Sq Ft)', label: 'Medium Office (2,000–5,000 sq ft)', price: '$0.046', unit: '/sq ft', note: '$92–$230/visit · $1,195–$3,450/mo' },
      { section: 'Commercial Cleaning (Per Sq Ft)', label: 'Large Office (5,000–10,000 sq ft)', price: '$0.035', unit: '/sq ft', note: '$175–$345/visit · $2,245–$4,600/mo' },
      { section: 'Commercial Cleaning (Per Sq Ft)', label: 'Enterprise (10,000+ sq ft)', price: '$0.023–$0.035', unit: '/sq ft', note: '$230–$460+/visit · $2,990–$5,980+/mo. Min. per visit: $115–$175' },
      { section: 'Frequency Adjustments', label: '2x Per Week', price: '+10%' },
      { section: 'Frequency Adjustments', label: 'Weekly', price: '+20%' },
      { section: 'Frequency Adjustments', label: 'Bi-Weekly', price: '+35%' },
      { section: 'Specialized Commercial', label: 'Medical / Dental Office Sanitization', price: '+15–20%' },
      { section: 'Specialized Commercial', label: 'Restaurant / Food Service Deep Clean', price: '+20–25%' },
      { section: 'Specialized Commercial', label: 'Gym / Fitness Facility Cleaning', price: '+15%' },
      { section: 'Specialized Commercial', label: 'Window Cleaning (Commercial)', price: '$1.15–$3.45', unit: '/window' },
      { section: 'Specialized Commercial', label: 'Carpet Cleaning (Commercial)', price: '$0.17–$0.29', unit: '/sq ft' },
      { section: 'Specialized Commercial', label: 'Floor Stripping & Waxing', price: '$0.35–$0.58', unit: '/sq ft' },
      { section: 'Commercial Maintenance Plans', label: 'Restroom Only (daily)', price: '$460–$805', unit: '/month' },
      { section: 'Commercial Maintenance Plans', label: 'Common Areas Only (3x/week)', price: '$690–$1,380', unit: '/month' },
      { section: 'Commercial Maintenance Plans', label: 'Comprehensive Building', price: '$2,300–$11,500+', unit: '/month' },
      { section: 'Special Projects (One-Time)', label: 'Post-Renovation Cleanup', price: '$0.29', unit: '/sq ft', note: 'Minimum $575' },
      { section: 'Special Projects (One-Time)', label: 'Hoarder / Estate Cleanup', price: '$86–$115', unit: '/hr' },
      { section: 'Special Projects (One-Time)', label: 'Junk Removal & Hauling', price: '$175–$345', unit: '/truckload' },
      { section: 'Special Projects (One-Time)', label: 'Exterior Pressure Washing', price: '$0.12–$0.23', unit: '/sq ft' },
      { section: 'Special Projects (One-Time)', label: 'Event Setup & Cleanup', price: '$290–$575' },
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
                <Link href="/book" className="inline-block bg-chm-red text-white px-6 py-2.5 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors mb-8">
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
