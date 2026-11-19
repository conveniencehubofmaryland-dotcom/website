// What customers see. Only Available products with stock left are returned. Cost, markup and stock counts never leave the server.

export type ProductDbRow = {
  id: string
  sku: string
  title: string
  category: string
  description: string | null
  price: number | string | null
  image_url: string | null
  image_urls: string[] | null
  weight_lb: number | string | null
  sort_order: number
  status: string
  stock_qty: number | null
  sold_qty: number | null
}

export type PublicProduct = {
  id: string
  sku: string
  title: string
  category: string
  description: string | null
  price: number | null
  image_url: string | null
  image_urls: string[]
  weight_lb: number | null
  sort_order: number
}

export function isOnSale(row: ProductDbRow): boolean {
  if (row.status !== 'available') return false
  if (row.stock_qty == null) return true
  return row.stock_qty - Number(row.sold_qty ?? 0) > 0
}

export function toPublic(rows: ProductDbRow[]): PublicProduct[] {
  return rows
    .filter(isOnSale)
    .map(r => ({
      id: r.id,
      sku: r.sku,
      title: r.title,
      category: r.category,
      description: r.description,
      price: r.price == null ? null : Number(r.price),
      image_url: r.image_url,
      image_urls: r.image_urls ?? (r.image_url ? [r.image_url] : []),
      weight_lb: r.weight_lb == null ? null : Number(r.weight_lb),
      sort_order: r.sort_order,
    }))
}

export const PUBLIC_PRODUCT_SELECT = 'id,sku,title,category,description,price,image_url,image_urls,weight_lb,sort_order,status,stock_qty,sold_qty'
