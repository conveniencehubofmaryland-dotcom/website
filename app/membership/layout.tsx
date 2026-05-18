import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Membership — Priority Booking & Exclusive Deals | Convenience Hub of Maryland',
  description:
    'Join the Convenience Hub of Maryland membership for free. Get priority booking, exclusive weekly deals, and 2% off recurring services in MD, VA & DC.',
  keywords: [
    'home services membership Maryland', 'cleaning service membership DMV',
    'laundry service membership Maryland', 'home services discount DMV',
    'priority booking home services Maryland',
  ],
  alternates: { canonical: 'https://www.conveniencehubofmaryland.com/membership' },
}

export default function MembershipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
