import Link from 'next/link'

function RoseSVG() {
  return (
    <svg viewBox="-45 -50 90 120" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" stroke="currentColor">
      <circle r="6" strokeWidth="1" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse key={deg} cx="0" cy="-15" rx="5" ry="11" strokeWidth="0.8" transform={`rotate(${deg})`} />
      ))}
      {[30, 90, 150, 210, 270, 330].map((deg) => (
        <ellipse key={deg} cx="0" cy="-24" rx="7" ry="14" strokeWidth="0.6" transform={`rotate(${deg})`} />
      ))}
      <path d="M0,7 C0,28 -4,38 0,60" strokeWidth="1" />
      <ellipse cx="-13" cy="32" rx="8" ry="17" strokeWidth="0.7" transform="rotate(-28 -13 32)" />
      <ellipse cx="12" cy="46" rx="7" ry="14" strokeWidth="0.7" transform="rotate(22 12 46)" />
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
  { href: '/membership', label: 'Membership' },
  { href: '/careers',    label: 'Careers'    },
  { href: '/reviews',    label: 'Reviews'    },
  { href: '/book',       label: 'Book Now'   },
  { href: '/contact',    label: 'Contact'    },
  { href: '/about',      label: 'About'      },
]

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-gray-100 relative overflow-hidden">
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

      <div className="border-t border-gray-100 py-5 text-center text-gray-400 text-xs tracking-wide">
        © {new Date().getFullYear()} Convenience Hub of Maryland. All rights reserved.
      </div>
    </footer>
  )
}
