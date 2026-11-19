import { salePrice } from '@/lib/shop-pricing'

export type ProductRow = Record<string, unknown>

const MAX_PHOTOS = 8

function num(v: unknown): number | null | undefined {
  if (v === undefined) return undefined
  if (v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}

// Checks what the admin form sends and builds the database row. The sale price is always calculated here
// from cost and markup, so the price cannot drift from its inputs.
export function productFields(
  body: unknown,
  opts: { isNew: boolean }
): { ok: true; row: ProductRow } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid product details.' }
  const b = body as Record<string, unknown>
  const row: ProductRow = {}

  if (opts.isNew) {
    const sku = typeof b.sku === 'string' ? b.sku.trim() : ''
    if (!sku) return { ok: false, error: 'SKU is required.' }
    row.sku = sku
  }
  if (b.title !== undefined) {
    const title = typeof b.title === 'string' ? b.title.trim() : ''
    if (!title) return { ok: false, error: 'Title is required.' }
    row.title = title
  }
  if (b.category !== undefined) {
    const category = typeof b.category === 'string' ? b.category.trim() : ''
    if (!category) return { ok: false, error: 'Category is required.' }
    row.category = category
  }
  if (b.description !== undefined) {
    row.description = typeof b.description === 'string' && b.description.trim() ? b.description.trim() : null
  }
  if (b.sort_order !== undefined) {
    const n = Number(b.sort_order)
    row.sort_order = Number.isInteger(n) ? n : 0
  }

  // Cost, markup and weight.
  const cost = num(b.cost)
  const markup = num(b.markup_percent)
  const weight = num(b.weight_lb)
  if (Number.isNaN(cost) || (cost != null && cost < 0)) return { ok: false, error: 'Cost must be a number of 0 or more.' }
  if (Number.isNaN(markup) || (markup != null && markup < 0)) return { ok: false, error: 'Markup must be a number of 0 or more.' }
  if (Number.isNaN(weight) || (weight != null && weight < 0)) return { ok: false, error: 'Weight must be a number of 0 or more.' }
  if (cost !== undefined) row.cost = cost
  if (markup !== undefined) row.markup_percent = markup
  if (weight !== undefined) row.weight_lb = weight

  if (cost !== undefined || markup !== undefined) {
    if (cost == null) {
      row.price = null
    } else {
      row.price = salePrice(cost, markup ?? 0)
    }
  }

  if (Array.isArray(b.image_urls)) {
    const urls = b.image_urls
      .filter((u): u is string => typeof u === 'string' && /^https?:\/\//.test(u.trim()))
      .map(u => u.trim())
      .slice(0, MAX_PHOTOS)
    row.image_urls = urls
    row.image_url = urls[0] ?? null
  }

  if (b.active !== undefined) row.active = !!b.active
  if (row.active === true) {
    const price = row.price
    if (price === undefined && opts.isNew) return { ok: false, error: 'Enter the cost to set the price before making this product available.' }
    if (price === null) return { ok: false, error: 'Enter the cost to set the price before making this product available.' }
  }

  return { ok: true, row }
}
