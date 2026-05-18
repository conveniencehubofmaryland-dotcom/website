import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import type { Service } from '@/lib/types'
import ServiceEditForm from '@/components/ServiceEditForm'
import Link from 'next/link'


export default async function ServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'

  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  let service: Service | null = null
  if (!isNew) {
    const rows = await dbSelectAuth<Service>('services', token, { id: `eq.${id}` })
    service = rows[0] ?? null
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/services" className="text-xs text-gray-400 hover:text-chm-red transition-colors uppercase tracking-widest">
          ← Services
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="font-serif text-2xl text-chm-black">
          {isNew ? 'New Service' : (service?.title ?? id)}
        </h1>
      </div>
      {!isNew && !service ? (
        <p className="text-chm-red text-sm">Service not found.</p>
      ) : (
        <ServiceEditForm service={service} isNew={isNew} />
      )}
    </div>
  )
}
