'use client'
import Link from 'next/link'
import { useCart } from '@/lib/CartContext'
import { useState } from 'react'

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
  const { items } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/logo.jpeg" alt="CHM Logo" className="h-52 w-auto" />
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-chm-red text-sm font-semibold transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart Icon + Book Now */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <Link 
              href="/cart"
              className="relative flex items-center gap-2 text-chm-red hover:text-red-700 font-bold text-sm transition"
            >
              🛒 CART
              {items.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-chm-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Book Now Button - Hide on mobile */}
            <Link
              href="/book"
              className="hidden sm:block bg-chm-red text-white px-4 py-2 rounded font-bold text-sm hover:bg-red-700 transition whitespace-nowrap"
            >
              BOOK NOW
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-chm-red hover:text-red-700 transition"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-gray-700 hover:text-chm-red hover:bg-gray-100 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/book"
              className="block px-4 py-2 bg-chm-red text-white font-bold rounded text-center hover:bg-red-700 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              BOOK NOW
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
