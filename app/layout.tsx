import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingCTA from '@/components/FloatingCTA'
import TawkChat from '@/components/TawkChat'


export const metadata: Metadata = {
  title: {
    default: 'Convenience Hub of Maryland | Home Services DMV',
    template: '%s | Convenience Hub of Maryland',
  },
  description:
    'Professional cleaning, laundry pickup & delivery, culinary, and care services in Maryland, Virginia, and Washington D.C. Call or text 202-579-2944.',
  metadataBase: new URL('https://www.conveniencehubofmaryland.com'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    siteName: 'Convenience Hub of Maryland',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <Navbar />
        <main className="pb-14 md:pb-0">{children}</main>
        <Footer />
        <FloatingCTA />
        <TawkChat />
      </body>
    </html>
  )
}
