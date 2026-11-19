import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdminToken } from '@/lib/admin-auth'
import { listOrders } from '@/lib/orders'

const money = (v: number) => `$${Number(v).toFixed(2)}`
const when = (iso: string) => new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export default async function AdminOrdersPage() {
  const cookieStore = await cookies()
  if (!(await isAdminToken(cookieStore.get('chm_admin')?.value ?? ''))) redirect('/admin')

  const orders = await listOrders()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-chm-black">Orders</h1>
        <p className="text-sm text-gray-400 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}, newest first</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                {['Date', 'Customer', 'Items', 'Total', 'Delivery', 'Status', ''].map((h, i) => (
                  <th key={i} className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{when(o.created_at)}</td>
                  <td className="py-3 px-4"><span className="font-semibold text-chm-black">{o.name}</span><br /><span className="text-xs text-gray-400">{o.phone}</span></td>
                  <td className="py-3 px-4 text-gray-600">{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                  <td className="py-3 px-4 font-semibold">{money(o.total)}</td>
                  <td className="py-3 px-4 text-gray-600">{o.fulfillment === 'ship' ? 'Ship' : 'Pickup'}</td>
                  <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 uppercase tracking-widest">{o.status}</span></td>
                  <td className="py-3 px-4"><Link href={`/admin/orders/${o.id}`} className="text-xs text-chm-red hover:underline underline-offset-4">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
