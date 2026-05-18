import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default function AdminPage() {
  redirect('/admin/appointments')
}
