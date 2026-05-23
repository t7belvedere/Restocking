# Test Credentials — Restocking Landing Site

There are **no user accounts** in this landing-page-only build.
The site is in pre-launch / waitlist mode and Supabase auth is intentionally
disabled (the production Supabase environment will be wired by the user).

## What can be tested

| Capability | How |
|---|---|
| Marketing pages | Visit `/`, `/how-it-works`, `/retailers`, `/pricing`, `/faq`, `/manifesto` |
| Locale switch | Click the `fr` / `en` pills in the header, content updates instantly |
| Waitlist signup | Submit any email on the hero form — stored via `POST /api/waitlist` |
| Live counter | Renders `GET /api/waitlist/stats` count (base offset + DB count) |
| Pricing toggle | Toggle "Monthly / Annual · -30%" updates Pro plan price |
| FAQ accordion | Click rows to expand/collapse |
| Mobile nav | Burger menu on mobile viewport |

## Backend endpoints (FastAPI fallback, MongoDB-backed)

- `GET  /api/health` — service health
- `POST /api/waitlist` — body `{ "email": "x@y.z", "locale": "fr|en", "referrer": "..." }`
- `GET  /api/waitlist/stats` — `{ "total": n }`

All endpoints are reachable through `${REACT_APP_BACKEND_URL:-NEXT_PUBLIC_BACKEND_URL}` and the
preview ingress that routes `/api/*` to port 8001.

## Auth (legacy dashboard / login pages)

Old Supabase-backed `/login`, `/signup`, `/dashboard`, `/upgrade` files still exist
under `app/(auth)` and `app/(dashboard)` but are **not linked from the landing nav**
and require Supabase env vars to render. They are intentionally out of scope for the
landing-page release.
