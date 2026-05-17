'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const navLinks = [
  { href: '/services', label: 'Services' },
  { href: '/deals', label: 'Deals' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-chm-red">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)}>
          <Image
            src="/logo.jpeg"
            alt="Convenience Hub of Maryland"
            width={200}
            height={67}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-chm-black hover:text-chm-red font-medium transition-colors text-sm tracking-wide uppercase"
            >
              {label}
            </Link>
          ))}
          <a
            href="https://wa.me/12025792944"
            className="bg-chm-red text-white px-6 py-2 font-semibold text-sm tracking-wide uppercase hover:bg-red-700 transition-colors"
          >
            Book Now
          </a>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <a
            href="https://wa.me/12025792944"
            className="bg-chm-red text-white px-4 py-1.5 text-sm font-semibold uppercase"
          >
            Book Now
          </a>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="text-chm-black text-2xl leading-none"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="font-medium text-chm-black hover:text-chm-red uppercase tracking-wide text-sm"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
