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

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Deployment:** Cloudflare Pages
- **Domain:** conveniencehubofmaryland.com
- **No backend** — contact is WhatsApp deep link + phone `tel:` link only

---

## Project Status

**Greenfield — not yet scaffolded.** Only `CLAUDE.md`, `CHM FLIER.pdf`, and `CHM LETTERHEAD.jpeg` exist. To initialize:

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Then move `components/` to the project root (Next.js scaffolds inside `src/` by default if `--no-src-dir` is omitted).

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

Single marketing site with no auth or database. All pages are static or server-rendered React components.

```
app/
  layout.tsx          # Root layout: fonts, global nav, footer
  page.tsx            # Hero + services overview (home)
  services/page.tsx   # Detailed service listings with pricing
  deals/page.tsx      # Weekly deals section
  contact/page.tsx    # WhatsApp CTA + phone + email display
components/
  Navbar.tsx
  Footer.tsx
  ServiceCard.tsx     # Reusable card for each service category
  DealsBanner.tsx     # Rotating weekly deals strip
  CTAButton.tsx       # WhatsApp / phone CTA
public/
  logo.jpeg           # copy of CHM LETTERHEAD.jpeg — red shopping cart + "Convenience Hub of Maryland" wordmark
```

---

## Services & Pricing (source of truth)

### Professional Cleaning & Estate Care
Locations: Homes, Apartments, Offices, Retail, Warehouses

| Tier | Rate |
|---|---|
| Individual Shift ≤4hrs | $54.99/hr |
| Individual Shift 5+hrs | $49.99/hr |
| Executive Residency | 5-day/week plan — custom quote |
| Weekly / Bi-weekly / Monthly | Discounted rates (custom quote) |

### Culinary & Housekeeping (6hr minimum)
Covers: light cooking, meal prep, tidying, laundry, errands, deep organization. Rates negotiable based on home size/tasks.

| Tier | Rate |
|---|---|
| Custom hourly | $50–$60/hr |
| 5-Day Specialized Support | Dedicated staff — custom quote |
| Errands & Concierge | $0.725/mile |

### Laundry Pickup & Delivery (Pickup • Wash • Dry • Fold • Deliver)

| Type | Colors | Bedding | Whites |
|---|---|---|---|
| Regular (1–3 days) | $3.99/lb | $4.99/lb | $6.99/lb |
| Same Day Express | $5.99/lb | $6.99/lb | $8.99/lb |

Minimum: 10 lbs — Mon–Sat 9am–9pm

### Nanny, Companionship; Adult & Child Care
Background checked, CPR certified & vaccinated staff. Pricing on inquiry.

**Weekly deals:**
- Monday: $20 flat for 10lb colored laundry (1-week delivery)
- Wednesday: 5% OFF for nurses, students & expectant mothers
- Weekend: 3% OFF laundry orders 100+ lbs
- Members: FREE signup + 2% OFF all recurring services

**Brand tagline (use in footer/hero):** "We simplify your routine so you can focus on what matters most."

---

## Line Thresholds

| File | Warn | Split |
|---|---|---|
| MEMORY.md | 80 | 120 |
| TODO.md | 60 | 100 |

---

## CTA Pattern

All booking CTAs use WhatsApp deep link:
```
https://wa.me/12025792944
```
Phone links use `tel:12025792944`. Never implement a custom form — the business handles all bookings via phone/WhatsApp.

---

## SEO Requirements

- Each page needs a `<title>` and `<meta description>` targeting DMV home services keywords
- OpenGraph tags for social sharing
- Schema.org `LocalBusiness` JSON-LD on the home page with service area, phone, and hours
