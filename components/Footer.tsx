import Link from 'next/link'

function RoseSVG() {
  return (
    <svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="currentColor">
      {/* Outer petals */}
      <path d="M32 8 C24 8 16 16 16 26 C16 30 18 34 20 36 C16 34 10 30 10 24 C10 14 20 6 32 6 C44 6 54 14 54 24 C54 30 48 34 44 36 C46 34 48 30 48 26 C48 16 40 8 32 8Z" opacity="0.6"/>
      {/* Mid petals */}
      <path d="M32 12 C26 12 20 18 20 26 C20 32 24 37 28 39 C24 37 18 33 18 27 C18 19 24 13 32 13 C40 13 46 19 46 27 C46 33 40 37 36 39 C40 37 44 32 44 26 C44 18 38 12 32 12Z" opacity="0.75"/>
      {/* Inner petals */}
      <path d="M32 16 C27 16 22 21 22 27 C22 33 27 38 32 40 C37 38 42 33 42 27 C42 21 37 16 32 16Z" opacity="0.9"/>
      {/* Center */}
      <ellipse cx="32" cy="30" rx="6" ry="7" opacity="1"/>
      {/* Stem */}
      <path d="M30 42 C30 50 29 56 30 68" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* Left leaf */}
      <path d="M29 54 C22 50 16 52 14 58 C20 58 26 57 29 54Z" opacity="0.6"/>
      {/* Right leaf */}
      <path d="M31 60 C38 56 44 58 46 64 C40 64 34 63 31 60Z" opacity="0.6"/>
    </svg>
  )
}

const contactLinks = [
  { href: 'tel:+12025792944', label: 'Call', value: '202-579-2944' },
  { href: 'sms:+12025792944', label: 'Text', value: '202-579-2944' },
  { href: 'https://wa.me/12025792944', label: 'WhatsApp', value: '202-579-2944' },
  { href: 'mailto:conveniencehubofmaryland@gmail.com', label: 'Email', value: 'conveniencehubofmaryland@gmail.com' },
]

const navLinks = [
  { href: '/services',   label: 'Services'   },
  { href: '/deals',      label: 'Deals'      },
  { href: '/deals',      label: 'Deals & Membership' },
  { href: '/reviews',    label: 'Reviews'    },
  { href: '/book',       label: 'Book Now'   },
  { href: '/contact',    label: 'Contact'    },
  { href: '/about',      label: 'About'      },
]

export default function Footer() {
  return (
    <footer className="bg-rose-100 border-t border-rose-200 relative overflow-hidden">
      {/* Botanical accent */}
      <div className="absolute right-0 top-0 opacity-[0.06] pointer-events-none text-chm-red translate-x-8 -translate-y-4">
        <RoseSVG />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-chm-red">
              <RoseSVG />
            </span>
            <div>
              <p className="text-chm-black font-semibold text-sm uppercase tracking-widest leading-tight">Convenience Hub</p>
              <p className="text-gray-400 text-xs uppercase tracking-widest">of Maryland</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed italic font-light">
            &ldquo;We simplify your routine so you can focus on what matters most.&rdquo;
          </p>
          <p className="text-gray-300 text-xs mt-4 tracking-wide uppercase">Maryland · Virginia · D.C.</p>
        </div>

        {/* Nav */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-5">Pages</p>
          <div className="flex flex-col gap-3">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-gray-500 hover:text-chm-red text-sm transition-colors tracking-wide font-light">
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-5">Contact</p>
          <div className="flex flex-col gap-3">
            {contactLinks.map(({ href, label, value }) => (
              <a key={label} href={href} className="text-sm group flex items-baseline gap-2">
                <span className="text-chm-red font-semibold text-xs uppercase w-16 shrink-0 tracking-wide">{label}</span>
                <span className="text-gray-500 group-hover:text-chm-black transition-colors font-light">{value}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-rose-200 py-5 text-center text-gray-400 text-xs tracking-wide">
        © {new Date().getFullYear()} Convenience Hub of Maryland. All rights reserved.
      </div>
    </footer>
  )
}
