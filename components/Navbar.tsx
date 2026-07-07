'use client'
import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { href: '/about',      label: 'About'      },
  { href: '/services',   label: 'Services'   },
  { href: '/quote',      label: 'Get a Quote' },
  { href: '/deals',      label: 'Deals'      },
  { href: '/membership', label: 'Membership' },
  { href: '/careers',    label: 'Careers'    },
  { href: '/reviews',    label: 'Reviews'    },
  { href: '/contact',    label: 'Contact'    },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex-shrink-0">
            <img src="/logo.jpeg" alt="CHM Logo" className="h-52 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-gray-700 hover:text-chm-red text-sm font-semibold transition">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/book" className="bg-chm-red text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition">
              BOOK NOW
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-2xl">
            ☰
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="block px-4 py-2 text-gray-700 hover:text-chm-red hover:bg-gray-100 rounded transition" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/book" className="block px-4 py-2 bg-chm-red text-white font-bold rounded text-center hover:bg-red-700 transition" onClick={() => setMobileMenuOpen(false)}>
              BOOK NOW
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
