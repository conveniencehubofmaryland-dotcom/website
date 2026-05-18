import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingCTA from '@/components/FloatingCTA'
import TawkChat from '@/components/TawkChat'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })

export const runtime = 'edge'

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
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Navbar />
        <main className="pb-14 md:pb-0">{children}</main>
        <Footer />
        <FloatingCTA />
        <TawkChat />
      </body>
    </html>
  )
}
