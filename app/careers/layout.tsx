import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers — Apply With Us | Convenience Hub of Maryland',
  description:
    'Join the Convenience Hub of Maryland team. We\'re hiring cleaning specialists, laundry handlers, nanny & care staff, and more in Maryland, Virginia & Washington D.C.',
  keywords: [
    'cleaning job Maryland', 'housekeeping job DMV', 'nanny job Maryland',
    'laundry job Maryland', 'home services jobs Virginia', 'care companion job DC',
    'domestic staff jobs DMV', 'cleaning specialist job near me',
  ],
  alternates: { canonical: 'https://www.conveniencehubofmaryland.com/careers' },
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
