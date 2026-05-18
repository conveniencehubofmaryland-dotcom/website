# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Convenience Hub of Maryland (CHM)** — a marketing and booking website for a DMV-area home services company.

- **Tagline:** "Reliable • Professional • One-Stop Home Services for the DMV"
- **Service area:** Maryland, Virginia, Washington D.C.
- **Contact:** 202-579-2944 (Call/Text/WhatsApp) | conveniencehubofmaryland@gmail.com
- **Brand colors:** Red (`#E8192C`), Near-black (`#1A1A1A`), White (`#FFFFFF`) — with a blue accent (`#1E6FBA`) for the logo figure only

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, edge runtime)
- **Styling:** Tailwind CSS v4
- **Deployment:** Cloudflare Pages via `@opennextjs/cloudflare`
- **Database:** Supabase (REST fetch, no SDK) — used for reviews, appointments, admin
- **Email:** Resend (`RESEND_API_KEY`) — contact form + booking confirmations
- **Live chat:** Tawk.to — `components/TawkChat.tsx` injects widget script
- **Domain:** conveniencehubofmaryland.com

---

## Commands

```bash
npm install          # install deps
npm run dev          # local dev server at http://localhost:3000
npm run build        # production build
npm run lint         # ESLint check
```

---

## Architecture

Marketing + booking site. Content pages (services, deals) are fully static. Admin panel and reviews are DB-driven (Supabase).

```
app/
  layout.tsx              # Root layout: fonts, Navbar, Footer, TawkChat, FloatingCTA
  page.tsx                # Hero + static services grid + static deals + DB reviews
  services/page.tsx       # STATIC — full pricing from STATIC_SERVICES array in file
  deals/page.tsx          # STATIC — deals from STATIC_DEALS array in file
  contact/page.tsx        # Contact form → Resend API
  book/page.tsx           # Booking form → Resend confirmation email
  reviews/page.tsx        # Public review submission
  admin/                  # Admin panel (Supabase-authenticated)
components/
  Navbar.tsx              # Sticky, transparent-on-scroll on home
  Footer.tsx
  TawkChat.tsx            # Tawk.to live chat widget (client component, no env var needed)
  FloatingCTA.tsx         # Floating WhatsApp/call button
  AnimatedSection.tsx     # Intersection Observer fade-in
lib/
  db.ts                   # Supabase REST fetch helpers (dbSelect, dbInsert, dbPatchAuth)
  types.ts                # Shared TS types
public/
  logo.jpeg               # Red shopping cart + wordmark
```

---

## Services & Pricing (source of truth)

> Keep `app/services/page.tsx` (STATIC_SERVICES) and `app/page.tsx` (STATIC_SERVICES) in sync with this.

### 1. Professional Cleaning & Estate Care

**Standard Residential** (per visit):
| Size | Price |
|---|---|
| Studio | $100–$150 |
| 1 Bed / 1 Bath | $130–$200 |
| 2 Bed / 2 Bath | $200–$250 |
| 3 Bed / 2 Bath | $250–$350 |
| 4+ Bed / Estate | $350–$450+ |

**Deep Cleaning:** +$60–$110 add-on; Full one-time deep clean $250–$450

**Move-In / Move-Out:** 1 bed $150–$250 · 2 bed $250–$350 · 3 bed $350–$450 · 4+ bed $380–$500+

**Hourly:** ≤4 hrs $54.99/hr · 5+ hrs $49.99/hr · Executive Residency & recurring → custom quote

**À La Carte Add-Ons:** Oven/Grill $25–$45 · Fridge $25–$45 · Windows & Tracks $35–$80 · Pet Hair $20–$55 · Post-Event $40–$90

### 2. Culinary, Housekeeping & Household Management
6-hour minimum. $50–$60/hr (negotiable). 5-day dedicated staff → custom quote. Errands $0.725/mile.

### 3. Premium Laundry Pickup & Delivery
Mon–Sat 9 AM–9 PM. 10 lb minimum.

| | Colors | Bedding | Whites |
|---|---|---|---|
| Regular (1–3 day) | $3.99/lb | $4.99/lb | $6.99/lb |
| Same Day Express | $5.99/lb | $6.99/lb | $8.99/lb |

### 4. Premium Nanny & Care Services
Background-checked, CPR-certified, vaccinated staff. Custom placement packages.

### 5. Commercial Operations
Custom quote per project. 60–80% project value yield structure.

**Weekly deals:**
- Monday: $20 flat for 10 lb colored laundry (1-week turnaround)
- Wednesday: 5% OFF for nurses, students & expectant mothers
- Weekend: 3% OFF bulk laundry 100+ lbs
- Members: FREE signup + 2% OFF all recurring services

**Policies:** 24-hr cancellation notice required; late cancel = $50 or 50% of service value. Lock-out fee = cancellation fee. Deposits may be required for deep cleans / move-out jobs.

**Brand tagline:** "We simplify your routine so you can focus on what matters most."

---

## Line Thresholds

| File | Warn | Split |
|---|---|---|
| MEMORY.md | 80 | 120 |
| TODO.md | 60 | 100 |

---

## CTA Pattern

All booking CTAs use WhatsApp deep link: `https://wa.me/12025792944`  
Phone links use `tel:12025792944`.  
Contact/booking forms send email via Resend (`RESEND_API_KEY`) to `conveniencehubofmaryland@gmail.com`.

---

## SEO Requirements

- Each page needs a `<title>` and `<meta description>` targeting DMV home services keywords
- OpenGraph tags for social sharing
- Schema.org `LocalBusiness` JSON-LD on the home page with service area, phone, and hours
