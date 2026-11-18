import { redirect } from 'next/navigation'

// Checkout is hidden for now (the Products page is coming soon). Restore this page with the Products build.
export default function CheckoutPage() {
  redirect('/')
}
