import WelcomeCenterForm from '@/components/WelcomeCenterForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Welcome to CHM - Onboarding',
  description: 'Complete your profile to start your onboarding with Convenience Hub of Maryland',
}

export default function WelcomeCenterPage() {
  return <WelcomeCenterForm />
}
