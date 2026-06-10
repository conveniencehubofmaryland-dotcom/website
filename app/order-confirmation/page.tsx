import { Suspense } from 'react'
import OrderConfirmationClient from '@/components/OrderConfirmationClient'

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderConfirmationClient />
    </Suspense>
  )
}
