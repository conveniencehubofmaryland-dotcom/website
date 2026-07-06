import Script from 'next/script'
import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingCTA from '@/components/FloatingCTA'
import TawkChat from '@/components/TawkChat'
import { CartProvider } from '@/lib/CartContext'

export const metadata: Metadata = {
  title: {
    default: 'Convenience Hub of Maryland | Home Services DMV',
    template: '%s | Convenience Hub of Maryland',
  },
  description:
    'Professional cleaning, laundry pickup & delivery, culinary, and care services in Maryland, Virginia, and Washington D.C. Call or text 202-579-2944.',
  metadataBase: new URL('https://www.conveniencehubofmaryland.com'),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
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
        <meta name="msvalidate.01" content="1C686130420AE6C743675F3C83831A1C" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" defer></script>
        <style>{`
  :root {
    --color-chm-red: #E8192C;
    --color-chm-black: #1A1A1A;
  }
  .bg-chm-red { background-color: #E8192C !important; }
  .text-chm-red { color: #E8192C !important; }
  .border-chm-red { border-color: #E8192C !important; }
  .bg-cream { background-color: #fce8ea !important; }
  .text-chm-black { color: #1A1A1A !important; }
  .bg-blush { background-color: #FFF5F5 !important; }
  .hover\\:bg-red-700:hover { background-color: #B91C1C !important; }
`}</style>
        {/* Google Analytics */}
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-763GL1QN0G"
  strategy="afterInteractive"
/>
<Script
  id="google-analytics"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-763GL1QN0G');
    `,
  }}
/>
      </head>
     <body className="font-sans">
        <CartProvider>
          <Navbar />
          <main className="pb-14 md:pb-0">{children}</main>
          <Footer />
          <FloatingCTA />
          <TawkChat />
        </CartProvider>
      </body>
    </html>
  )
}
