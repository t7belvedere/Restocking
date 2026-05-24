# Onboarding Signup — Design Spec

## Summary

Transform the signup page from a cold email/password form into a conversational onboarding flow. Questions-first (pattern B), signup at the end to "save preferences."

## Flow

| Step | Title | Type | Data |
|------|-------|------|------|
| 1 | Tu suis quelles marques ? | Multi-select pills | `preferred_brands: string[]` |
| 2 | Ta taille habituelle ? | Single-select pills (EU + letter) | `preferred_size: string` |
| 3 | On t'appelle comment ? | Text input | `first_name: string` |
| 4 | Un produit en tête ? (optionnel) | URL input + skip | `missed_product_url: string?` |
| 5 | On enregistre tout ça | Google OAuth + email/password | Account creation |
| — | Success → redirect /dashboard | — | — |

Steps 1-4 are client-side only (data held in localStorage). Step 5 is the actual Supabase signup.

## Components

### `OnboardingFlow` (new)
Client component. Owns step state, localStorage persistence, and transition animations.

States:
- `step: 1..5` — current step index
- `answers: OnboardingAnswers` — accumulated data
- `signupState: SignupState` — reused from existing actions
- `busy: boolean` — during signup submission

Data model:
```ts
type OnboardingAnswers = {
  preferred_brands: string[];
  preferred_size: string | null;
  first_name: string;
  missed_product_url: string | null;
};
```

### Step components (new, internal to OnboardingFlow)
Each step renders one question:
- **BrandStep** — brand pills (multi-select), grid layout, "Continuer" CTA
- **SizeStep** — EU sizes row + letter sizes row, "Continuer" CTA
- **NameStep** — text input, "Presque fini" CTA
- **ProductStep** — URL input + "Plutôt passer" skip link, "Créer l'alerte" CTA
- **SignupStep** — Google button + separator + email/password form (reuses existing SignupForm logic adapted for the card context)
- **SuccessStep** — celebration + "Ajouter ma première alerte" CTA → /dashboard/add

### Modified files
- `app/(auth)/signup/page.tsx` — replace layout with `OnboardingFlow`
- `app/(auth)/signup/signup-heading.tsx` — removed (no longer needed)
- `app/(auth)/signup/signup-form.tsx` — logic extracted into SignupStep, can be simplified or removed
- `app/(auth)/signup/actions.ts` — extended to accept + persist onboarding answers

### New files
- `components/auth/onboarding-flow.tsx` — main flow orchestrator
- `components/auth/onboarding-steps.tsx` — step components

## Visual design

Neo-brutalist, consistent with restocking identity:
- Each step: white card (`rounded-3xl border-2 border-ink bg-paper shadow-brutal-xl p-8`)
- Progress bar: 5-segment pill bar at top
- Brand/size pills: `rounded-full border-2`, selected state = `bg-ink text-cream`
- CTA button: orange (`bg-[var(--brand-orange)]`), rounded-full, `shadow-brutal hover-press`
- Step transitions: fade + slight slide using CSS `stagger-in` pattern
- Product step has a visible "skip" option — not hidden
- Dot paper background, stamp element (like existing signup page)

Card max-width ~420px, centered on mobile, right column on desktop (keeping existing 2-col layout).

## Data persistence

On signup success (email or Google):
1. Call `supabase.auth.updateUser({ data: onboardingAnswers })` to store in `user_metadata`
2. If `missed_product_url` is provided, call `analyzeUrl` + `createWatch` after signup
3. Redirect to `/dashboard` (or `/dashboard/add` if watch was created)

The `signupAction` server action is extended to accept the onboarding payload and update user metadata after signup. For Google sign-in, onboarding answers are passed via a cookie or URL param since the OAuth redirect breaks client state.

**Google OAuth flow**: Onboarding answers are stored in a short-lived cookie before redirecting to Google. On callback (`/auth/callback`), the route handler reads the cookie, updates user metadata, and clears it. Cookie name: `onboarding_answers`, JSON-serialized, httpOnly, sameSite=lax, expires in 10 minutes.

## Brand & size lists

**Brands** (from retailers config): Zara, COS, Aritzia, Sézane, Uniqlo, Mango, Arket, Ganni, Massimo Dutti, & Other Stories, Weekday, Monki, Bershka, Pull&Bear, Stradivarius, ASOS. Displayed as multi-select pills in a flex-wrap grid.

**Sizes**: Two rows — EU: 34, 36, 38, 40, 42, 44, 46 / Letter: XXS, XS, S, M, L, XL, XXL. Single-select across both rows.

## i18n

All UI strings added to `lib/i18n/messages.ts` under `auth.onboarding.*` for fr/en.

## Edge cases

- **User refreshes mid-flow**: localStorage preserves answers; flow resumes at step 1 (we don't persist step index — they restart but answers are pre-filled)
- **User has existing account**: If Google email matches existing user, onboarding answers are still applied on the callback route
- **Empty brand selection**: Allowed — user can proceed without selecting brands
- **Invalid URL in product step**: Show inline validation error, don't block skip
- **Network error on signup**: Show toast, keep step 5 open for retry
- **Email already exists**: Existing error handling from signupAction applies
