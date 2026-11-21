import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isAdminToken } from '@/lib/admin-auth'
import { getOrder } from '@/lib/orders'
import OrderStatusControl from '@/components/OrderStatusControl'
import OrderShipControl from '@/components/OrderShipControl'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const money = (v: number) => `$${Number(v).toFixed(2)}`

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  if (!(await isAdminToken(cookieStore.get('chm_admin')?.value ?? ''))) redirect('/admin')

  const { id } = await params
  if (!UUID.test(id)) notFound()
  const order = await getOrder(id)
  if (!order) notFound()

  const itemsTotal = order.items.reduce((s, i) => s + Number(i.price) * i.qty, 0)

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-xs uppercase tracking-widest text-gray-500 hover:text-chm-black">← All orders</Link>
      <h1 className="font-serif text-3xl text-chm-black mt-4">Order {order.id.slice(0, 8).toUpperCase()}</h1>
      <p className="text-sm text-gray-400 mt-1">Placed {new Date(order.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>

      <section className="mt-8">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">Status</h2>
        <OrderStatusControl orderId={order.id} status={order.status} />
      </section>

      {order.fulfillment === 'ship' && order.status !== 'cancelled' && (
        <section className="mt-8">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">Shipping</h2>
          <OrderShipControl orderId={order.id} tracking={order.tracking_number} />
        </section>
      )}

      <section className="mt-8 grid sm:grid-cols-2 gap-6 text-sm">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Customer</h2>
          <p className="font-semibold text-chm-black">{order.name}</p>
          <p className="text-gray-600">{order.phone}</p>
          <p className="text-gray-600">{order.email}</p>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{order.fulfillment === 'ship' ? 'Ship to' : 'Pickup'}</h2>
          {order.fulfillment === 'ship' && order.ship_to ? (
            <p className="text-gray-600">
              {order.ship_to.line1}{order.ship_to.line2 ? `, ${order.ship_to.line2}` : ''}<br />
              {order.ship_to.city}, {order.ship_to.state} {order.ship_to.zip}
            </p>
          ) : (
            <p className="text-gray-600 whitespace-pre-line">{order.note || 'Customer will call to arrange pickup.'}</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">Items</h2>
        <table className="min-w-full text-sm">
          <tbody>
            {order.items.map((it, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-2 pr-4"><span className="font-mono text-xs text-gray-400 mr-2">{it.sku}</span>{it.title}{(it.colour || it.size) && <span className="text-gray-500"> — {[it.colour, it.size].filter(Boolean).join(', ')}</span>}</td>
                <td className="py-2 pr-4 text-gray-600">× {it.qty}</td>
                <td className="py-2 text-right">{money(Number(it.price) * it.qty)}</td>
              </tr>
            ))}
            <tr><td className="py-2 pr-4 text-gray-500" colSpan={2}>Items subtotal</td><td className="py-2 text-right">{money(itemsTotal)}</td></tr>
            <tr><td className="py-2 pr-4 text-gray-500" colSpan={2}>Shipping</td><td className="py-2 text-right">{money(Number(order.shipping_fee ?? 0))}</td></tr>
            <tr className="font-semibold"><td className="py-2 pr-4" colSpan={2}>Total charged</td><td className="py-2 text-right">{money(Number(order.total))}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="mt-8 text-xs text-gray-400">
        Clover charge ID: {order.clover_charge_id || '—'}
      </section>
    </div>
  )
}
