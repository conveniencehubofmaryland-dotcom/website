import type { Metadata } from 'next'
import ManagePlan from '@/components/ManagePlan'

// Private page for a client's recurring plan. Not for search engines.
export const metadata: Metadata = {
  title: 'Manage Your Plan | Convenience Hub of Maryland',
  robots: { index: false, follow: false },
}

export default async function ManagePlanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return (
    <section className="max-w-xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl text-chm-black mb-2">Your recurring plan</h1>
      <p className="text-sm text-gray-600 mb-8">Pause, resume or cancel your plan at any time.</p>
      <ManagePlan token={token} />
    </section>
  )
}
