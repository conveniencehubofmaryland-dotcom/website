import Link from 'next/link'

const contactLinks = [
  { href: 'tel:+12025792944', label: 'Call', value: '202-579-2944' },
  { href: 'sms:+12025792944', label: 'Text', value: '202-579-2944' },
  { href: 'https://wa.me/12025792944', label: 'WhatsApp', value: '202-579-2944' },
  { href: 'mailto:conveniencehubofmaryland@gmail.com', label: 'Email', value: 'conveniencehubofmaryland@gmail.com' },
]

const navLinks = [
  { href: '/services', label: 'Services' },
  { href: '/deals', label: 'Deals' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="bg-chm-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <p className="text-chm-red font-bold text-lg uppercase tracking-widest">Convenience Hub</p>
          <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">of Maryland</p>
          <p className="text-gray-400 text-sm mt-4 leading-relaxed">
            "We simplify your routine so you can focus on what matters most."
          </p>
          <p className="text-gray-500 text-xs mt-4">Maryland • Virginia • Washington D.C.</p>
        </div>

        {/* Nav */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Pages</p>
          <div className="flex flex-col gap-3">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-gray-300 hover:text-chm-red text-sm transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Contact</p>
          <div className="flex flex-col gap-3">
            {contactLinks.map(({ href, label, value }) => (
              <a key={label} href={href} className="text-sm group flex items-baseline gap-2">
                <span className="text-chm-red font-semibold text-xs uppercase w-16 shrink-0">{label}</span>
                <span className="text-gray-300 group-hover:text-white transition-colors">{value}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-gray-600 text-xs">
        © {new Date().getFullYear()} Convenience Hub of Maryland. All rights reserved.
      </div>
    </footer>
  )
}
