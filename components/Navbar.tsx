'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/about',      label: 'About'      },
  { href: '/services',   label: 'Services'   },
  { href: '/deals',      label: 'Deals'      },
  { href: '/membership', label: 'Membership' },
  { href: '/careers',    label: 'Careers'    },
  { href: '/reviews',    label: 'Reviews'    },
  { href: '/contact',    label: 'Contact'    },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    if (!isHome) { setScrolled(true); return }
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  const solid = scrolled || open || !isHome

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${
      solid
        ? 'bg-white shadow-sm border-b border-gray-100'
        : 'bg-cream/80 backdrop-blur-sm border-b border-gray-100/60'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 md:h-28 flex items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)}>
          {/* Mobile logo */}
          <div className="overflow-hidden md:hidden" style={{ height: '40px', width: '200px' }}>
            <img
              src="/logo.jpeg"
              alt="Convenience Hub of Maryland"
              style={{ height: '200px', width: 'auto', marginTop: '-74px', mixBlendMode: 'multiply' }}
            />
          </div>
          {/* Desktop logo */}
          <div className="overflow-hidden hidden md:block" style={{ height: '80px', width: '420px' }}>
            <img
              src="/logo.jpeg"
              alt="Convenience Hub of Maryland"
              style={{ height: '420px', width: 'auto', marginTop: '-155px', mixBlendMode: 'multiply' }}
            />
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-medium transition-colors text-xs tracking-[0.2em] uppercase text-chm-black/70 hover:text-chm-red"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/book"
            className="bg-chm-red text-white px-6 py-2 font-semibold text-xs tracking-widest uppercase hover:bg-red-700 transition-colors"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            href="/book"
            className="bg-chm-red text-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
          >
            Book Now
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="text-2xl leading-none transition-colors text-chm-black"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-5 flex flex-col gap-5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="font-medium text-chm-black hover:text-chm-red uppercase tracking-widest text-xs"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
