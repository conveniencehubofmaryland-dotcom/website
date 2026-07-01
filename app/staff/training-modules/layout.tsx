import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Training Modules — Get Certified | Convenience Hub of Maryland',
  description: 'Complete professional training modules and earn your certification with CHM.',
}

export default function TrainingModulesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
