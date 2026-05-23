# PRD — restocking.app

> Single source of truth for the **restocking.app** product. This file grows over time as we ship.

---

## 1. Original problem statement (verbatim, FR)

> Je veux absolument que tu bosses sur la landing page de mon site. Aussi fait plusieurs pages, pas juste une seule ou on scroll stp.
>
> **restocking.app — Alertes de retour en stock, taille-spécifiques, pour les acheteurs de mode EU.**

Detailed product PRD (worker, dashboard, Stripe…) lives in `/app/frontend/PRD.md`. This file scopes the **landing site identity** delivered in iteration 1.

## 2. User personas

| Persona | Goals on the landing site |
|---|---|
| 22–38 EU shopper, mobile-first, has missed an item in their size | Understand the value in <10s, join waitlist |
| Founder / journalist scanning the project | Read manifesto, pricing, FAQ in <2 min |
| Power user / reseller curious about coverage | Inspect supported stores + roadmap |

## 3. User choices (iteration 1)

- Visual style: **playful / vibrant** (Notion / Duolingo energy, fashion-credible)
- Languages: **Bilingual FR / EN** with header switcher
- Logo: **stylized "restocking" wordmark** (orange ping dot over the second `o`, accent period)
- Multi-page architecture (no single long-scroll)

## 4. Architecture (iteration 1)

| Layer | Stack | Where |
|---|---|---|
| Frontend | Next.js 16 (App Router) · TypeScript · Tailwind v4 (oklch theme) · shadcn/ui · Bricolage Grotesque + DM Sans | `/app/frontend` |
| Backend (preview) | FastAPI + Motor (Mongo) — `POST /api/waitlist`, `GET /api/waitlist/stats`, `GET /api/health` | `/app/backend/server.py` |
| Production backend | Supabase Postgres + Auth + Stripe (already running on the user side — to be wired) | external |

## 5. Routes shipped

| Route | Description | data-testid (page-level) |
|---|---|---|
| `/` | Hero, waitlist form, live counter, restock ticker, stats, social proof, dark CTA | `home-page` |
| `/how-it-works` | Bento 3-step explainer + "Under the hood" details | `how-it-works-page` |
| `/retailers` | Dense brutalist grid of 12 stores with live/beta/soon status + "suggest a store" | `retailers-page` |
| `/pricing` | Monthly/Annual toggle, Free vs Pro cards, billing FAQ link | `pricing-page` |
| `/faq` | 7-item accordion, first item open by default | `faq-page` |
| `/manifesto` | Editorial layout with drop cap + restocked stamp | `manifesto-page` |
| `/not-found` | Distinctive 404 ("Lost in the wardrobe") | — |

## 6. What's been implemented

### Iteration 1 — Landing identity (2026-01)
- Multi-page Next.js 16 site with App Router (`/`, `/how-it-works`, `/retailers`, `/pricing`, `/faq`, `/manifesto`, 404).
- **Brutalist-playful design system**: oklch palette (warm cream background, vibrant orange / electric blue / acid lime / ink), hard offset shadows (`shadow-brutal-*`), Bricolage Grotesque + DM Sans typography.
- **Wordmark logo** "restocking" with an orange "ping" dot ringed in ink over the second `o`, plus a punctuation accent.
- **Bilingual FR/EN** via a React context, persisted in `localStorage` (`restocking.locale`), header switcher with `data-testid=locale-fr | locale-en`. ~280 lines of message catalog covering every page.
- **Waitlist signup** in the hero, the big-CTA section, How-it-works CTA, Retailers CTA — wired to a FastAPI `POST /api/waitlist` endpoint that:
  - validates the email,
  - dedupes on second submit (returns `already_registered: true`),
  - returns the position number for fresh signups,
  - stores `{email, locale, source, referrer, created_at}` in `MongoDB` (`restocking_landing.waitlist`).
- **Live counter** that polls `/api/waitlist/stats` every 20s with a base offset of +137 so the early launch never reads "0", animated pulse dot.
- **Restock ticker** marquee with brand/variant lines that change wording per locale.
- **Mock product card + notification mockup** in the hero (CSS only, no JS animation).
- **Pricing toggle** (Monthly / Annual · -30%) — annual default — with rotated "Most loved 🔥" badge on Pro card.
- **FAQ accordion** (7 items), opens index 0 by default, single-open behavior.
- **Editorial Manifesto** page with drop-cap on first paragraph and a spinning restocked stamp.
- **Responsive header** with burger menu + mobile drawer (390x844 viewport supported).
- **Dark footer** with product / legal / contact columns and dotted texture.
- All interactive elements carry `data-testid` per spec.

### Backend
- `GET /api/health` → service status
- `POST /api/waitlist` → idempotent signup, returns position + localized success message
- `GET /api/waitlist/stats` → DB count

### Testing
- `testing_agent_v3` iteration 1: **100% backend, 100% frontend**, no critical or minor issues.

## 7. Backlog

### P0 — required before public beta
- Wire the waitlist form to the real Supabase project (user already has it running) — drop the FastAPI fallback once the env vars are populated.
- Legal pages `/privacy`, `/terms`, `/cookies` (currently the footer links exist but routes 404).
- Custom OG image + Twitter card (currently text-only metadata).
- Favicon + Apple touch icon using the wordmark dot.

### P1 — nice to have
- Animated stagger on hero with Motion / Framer (currently CSS-only stagger).
- Cookie consent banner (EU compliance).
- Replace stock Unsplash hero photo with a brand-owned shoot.
- Add "as seen on Reddit" social-proof bar with real subreddit thread links.
- A11y pass: focus-visible rings, `aria-current` on active nav.

### P2 — post-launch
- Add a `/changelog` page that pulls from Notion or markdown.
- Press kit at `/press`.
- Newsletter archive at `/news`.
- Public dashboard `/stats` with anonymized restock count.

## 8. Files of note

| Path | Purpose |
|---|---|
| `frontend/app/layout.tsx` | Root layout, fonts, locale provider, header/footer |
| `frontend/app/page.tsx` | Home page |
| `frontend/app/how-it-works/page.tsx` | Bento steps |
| `frontend/app/retailers/page.tsx` | Brutalist store grid |
| `frontend/app/pricing/page.tsx` | Plans + toggle |
| `frontend/app/faq/page.tsx` | Accordion |
| `frontend/app/manifesto/page.tsx` | Editorial page |
| `frontend/components/site/header.tsx` | Sticky nav + locale switcher + mobile drawer |
| `frontend/components/site/footer.tsx` | Dark footer |
| `frontend/components/site/logo.tsx` | Wordmark with ping dot |
| `frontend/components/site/waitlist-form.tsx` | Reusable email form (4 instances on the site) |
| `frontend/components/site/live-counter.tsx` | Polls `/api/waitlist/stats` |
| `frontend/components/site/ticker.tsx` | CSS marquee |
| `frontend/components/site/product-demo.tsx` | Mock product card + iOS-style notification |
| `frontend/components/site/locale-provider.tsx` | React context, persists in localStorage |
| `frontend/lib/i18n/messages.ts` | Full FR/EN message catalog |
| `backend/server.py` | FastAPI waitlist API |

## 9. Decisions logged

- **Locale routing strategy**: chose a single set of routes with a client-side context (not `/fr/*` `/en/*` prefixed routes), because the landing site is short and we wanted instant toggle without a hard navigation. We can migrate to URL-based i18n once Supabase auth + dashboard ship.
- **Backend in iteration 1**: kept FastAPI/Mongo as a fallback so the waitlist works in the Emergent preview environment today; the user's Supabase will replace it before public launch.
- **No third-party CMS**: copy lives in TypeScript (`lib/i18n/messages.ts`) for now — a single PR keeps both languages in sync.
- **Design**: explicitly avoided AI-slop patterns (no purple gradients, no centered Inter, no neutral cards). Went brutalist-playful with hard shadows, vibrant flat colors, expressive typography.
