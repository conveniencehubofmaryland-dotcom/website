import { cookies } from 'next/headers'
import Link from 'next/link'
import { dbSelectAuth } from '@/lib/db'
import type { JobPosting } from '@/lib/types'
import JobPostingForm from '@/components/JobPostingForm'


export default async function JobPostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'

  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  let posting: JobPosting | null = null
  if (!isNew) {
    const rows = await dbSelectAuth<JobPosting>('job_postings', token, { id: `eq.${id}` })
    posting = rows[0] ?? null
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/careers" className="text-xs text-gray-400 hover:text-chm-red transition-colors uppercase tracking-widest">
          ← Careers
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="font-serif text-2xl text-chm-black">
          {isNew ? 'New Posting' : (posting?.title ?? id)}
        </h1>
      </div>
      {!isNew && !posting ? (
        <p className="text-chm-red text-sm">Job posting not found.</p>
      ) : (
        <JobPostingForm posting={posting} isNew={isNew} />
      )}
    </div>
  )
}
