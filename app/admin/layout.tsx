import Link from 'next/link'
import AdminLogoutButton from '@/components/AdminLogoutButton'


const adminLinks = [
  { href: '/admin/appointments', label: 'Appointments' },
  { href: '/admin/reviews',      label: 'Reviews'      },
  { href: '/admin/services',     label: 'Services'     },
  { href: '/admin/deals',        label: 'Deals'        },
  { href: '/admin/members',     label: 'Members'      },
  { href: '/admin/careers',     label: 'Careers'      },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Admin top bar — sits below public Navbar */}
      <div className="bg-chm-black text-white px-6 py-3 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-6 shrink-0">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-chm-red">Admin</span>
          {adminLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs uppercase tracking-widest text-gray-300 hover:text-white transition-colors whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </div>
        <AdminLogoutButton />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </div>
    </div>
  )
}
