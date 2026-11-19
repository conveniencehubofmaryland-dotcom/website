import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { serviceHeaders } from '@/lib/supabase-keys'

// Admin: reads a product page link and returns its title, description, price and photos.
// Photos are copied into our storage so the product does not depend on the other website.
// The price found on the page is suggested as the cost only; the admin checks it before saving.

const MAX_PAGE_BYTES = 2_000_000
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_IMAGES = 4
const BUCKET = 'gallery-images'

// Normal browser headers. Many stores refuse requests that look like a script.
const PAGE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

// Thrown when the page cannot be read; the message is shown to the admin.
class ImportError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '')
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true
  // IPv6 rules only apply to real IPv6 addresses (they contain a colon). Store names such as fcstore.com are fine.
  if (h.includes(':') && (h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80'))) return true
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])]
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224
  }
  return false
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim()
}

function metaContent(html: string, key: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, 'i')
  const tag = html.match(re)?.[0]
  if (!tag) return null
  const c = tag.match(/content=["']([^"']*)["']/i)
  return c ? decode(c[1]) : null
}

type Ld = Record<string, unknown>

function productJsonLd(html: string): Ld | null {
  const blocks = Array.from(html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)).map(m => m[1])
  for (const raw of blocks) {
    try {
      const data = JSON.parse(raw)
      const items: Ld[] = Array.isArray(data) ? data : data?.['@graph'] ? data['@graph'] : [data]
      for (const item of items as Ld[]) {
        const t = item?.['@type']
        if (t === 'Product' || (Array.isArray(t) && t.includes('Product'))) return item
      }
    } catch {
      // ignore bad JSON-LD blocks
    }
  }
  return null
}

// Image links can be plain text, a list, or objects with a url.
function imageLinks(value: unknown): string[] {
  const out: string[] = []
  const add = (v: unknown) => {
    if (typeof v === 'string') out.push(v)
    else if (v && typeof v === 'object' && typeof (v as Ld).url === 'string') out.push((v as Ld).url as string)
  }
  if (Array.isArray(value)) value.forEach(add)
  else add(value)
  return out
}

async function fetchPage(url: string): Promise<{ html: string; finalUrl: string }> {
  let res: Response
  try {
    res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: PAGE_HEADERS,
    })
  } catch {
    throw new ImportError(502, 'Could not reach that page. Check the link, or fill the fields in by hand.')
  }
  if (res.status === 401 || res.status === 403 || res.status === 429 || res.status === 503) {
    throw new ImportError(502, `That store does not allow reading its page automatically (error ${res.status}). Fill the title, price and photos in by hand.`)
  }
  if (!res.ok) {
    throw new ImportError(502, `The page could not be opened (error ${res.status}). Check the link, or fill the fields in by hand.`)
  }
  const finalUrl = res.url || url
  if (isPrivateHost(new URL(finalUrl).hostname)) {
    throw new ImportError(400, 'That link cannot be used. Paste the public product page link.')
  }
  const text = await res.text()
  return { html: text.slice(0, MAX_PAGE_BYTES), finalUrl }
}

async function copyImage(src: string, sourcePage: string): Promise<string | null> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!SUPABASE_URL) return null
  try {
    const abs = new URL(src, sourcePage)
    if (!/^https?:$/.test(abs.protocol) || isPrivateHost(abs.hostname)) return null
    const res = await fetch(abs.toString(), { signal: AbortSignal.timeout(8000), redirect: 'follow', headers: PAGE_HEADERS })
    const type = res.headers.get('content-type') || ''
    if (!res.ok || !type.startsWith('image/')) return null
    const bytes = await res.arrayBuffer()
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) return null
    const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('gif') ? 'gif' : type.includes('avif') ? 'avif' : 'jpg'
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: serviceHeaders({ 'Content-Type': type }),
      body: bytes,
    })
    if (!up.ok) return null
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const body = await req.json().catch(() => null)
  let raw = typeof body?.url === 'string' ? body.url.trim() : ''
  // Links often get pasted without the "https://" part, so add it when it is missing.
  if (raw && !/^https?:\/\//i.test(raw)) raw = `https://${raw}`
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return NextResponse.json({ error: 'Paste the product page link, for example www.store.com/product-name.' }, { status: 400 })
  }
  if (!/^https?:$/.test(parsed.protocol) || isPrivateHost(parsed.hostname)) {
    return NextResponse.json({ error: 'That link cannot be used. Paste the public product page link.' }, { status: 400 })
  }

  let page: { html: string; finalUrl: string }
  try {
    page = await fetchPage(parsed.toString())
  } catch (err) {
    if (err instanceof ImportError) return NextResponse.json({ error: err.message }, { status: err.status })
    return NextResponse.json({ error: 'Could not read that page. Fill the fields in by hand.' }, { status: 502 })
  }

  const ld = productJsonLd(page.html)
  const title = (ld && typeof ld.name === 'string' ? decode(ld.name) : null)
    || metaContent(page.html, 'og:title')
    || decode(page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const description = (ld && typeof ld.description === 'string' ? decode(ld.description) : null)
    || metaContent(page.html, 'og:description')
    || metaContent(page.html, 'description')

  // Price from the page, suggested as the cost. Checked by the admin before saving.
  let cost: number | null = null
  const offers = ld?.offers as Ld | Ld[] | undefined
  const offer = Array.isArray(offers) ? offers[0] : offers
  const priceRaw = offer && (offer.price ?? offer.lowPrice ?? (offer.priceSpecification as Ld | undefined)?.price)
  if (priceRaw != null) {
    // Takes the first number, so "1,299.00" becomes 1299 and "12.99 - 15.99" becomes 12.99.
    const m = String(priceRaw).replace(/,/g, '').match(/\d+(\.\d+)?/)
    const n = m ? Number(m[0]) : NaN
    if (Number.isFinite(n) && n > 0) cost = Math.round(n * 100) / 100
  }

  // Photos: the page's main image first, then product images from the page data.
  const candidates: string[] = []
  const og = metaContent(page.html, 'og:image')
  if (og) candidates.push(og)
  candidates.push(...imageLinks(ld?.image))
  const seen = new Set<string>()
  const images: string[] = []
  for (const c of candidates) {
    if (images.length >= MAX_IMAGES) break
    if (seen.has(c)) continue
    seen.add(c)
    const copied = await copyImage(c, page.finalUrl)
    if (copied) images.push(copied)
  }

  if (!title) {
    return NextResponse.json({ error: 'The page did not show a product name. Fill the fields in by hand.' }, { status: 422 })
  }

  return NextResponse.json({
    source_url: page.finalUrl,
    title,
    description: description ?? '',
    cost,
    image_urls: images,
    found_photos: candidates.length,
  })
}
