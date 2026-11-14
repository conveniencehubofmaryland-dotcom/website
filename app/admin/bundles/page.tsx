import { redirect } from 'next/navigation'

// Bundles and membership now live on the Deals page. Old links still work.
export default function AdminBundlesPage() {
  redirect('/admin/deals')
}
