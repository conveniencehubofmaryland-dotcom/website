import type { Metadata } from 'next'

// Partner page for realtors. Not for search engines.
export const metadata: Metadata = {
  title: 'Realtor Partners',
  description:
    'Realtor partner portal for Convenience Hub of Maryland: create and track homebuyer referral codes for home services in MD, VA & DC.',
  robots: { index: false, follow: false },
}

export default function RealtorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
