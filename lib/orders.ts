import { sbFetch } from '@/lib/shift-eligibility'

export const ORDER_STATUSES = ['paid', 'ready', 'completed', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type OrderRow = {
  id: string
  created_at: string
  name: string
  email: string
  phone: string
  items: { id: string; sku: string; title: string; price: number; qty: number; weight_lb: number | null }[]
  total: number
  fulfillment: 'pickup' | 'ship'
  shipping_fee: number
  ship_to: { line1: string; line2: string; city: string; state: string; zip: string } | null
  note: string | null
  clover_charge_id: string | null
  status: OrderStatus
}

export async function listOrders(limit = 300): Promise<OrderRow[]> {
  const res = await sbFetch(`product_orders?select=*&order=created_at.desc&limit=${limit}`)
  if (!res.ok) throw new Error(`orders ${res.status}`)
  return (await res.json()) as OrderRow[]
}

export async function getOrder(id: string): Promise<OrderRow | null> {
  const res = await sbFetch(`product_orders?id=eq.${encodeURIComponent(id)}&select=*`)
  if (!res.ok) throw new Error(`order ${res.status}`)
  const rows = (await res.json()) as OrderRow[]
  return rows[0] ?? null
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  const res = await sbFetch(`product_orders?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status }),
  })
  return res.ok
}
