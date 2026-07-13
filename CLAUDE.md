# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Next.js dev server, bound to 0.0.0.0 (LAN-accessible) on :3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # next lint (eslint-config-next: core-web-vitals + typescript)
```

There is no test runner configured in this project.

## Environment

Copy `.env.local.example` to `.env.local`. Variables in use across the code:

- `NEXT_PUBLIC_API_URL` — Medusa backend base URL (default `http://localhost:9000`)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` — Medusa store publishable key (`pk_...`)
- `NEXT_PUBLIC_SITE_NAME` — used in email templates / metadata
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` — server-side SMTP (Truehost) for OTP + magic-link emails. Port `465` uses implicit TLS; `587` uses STARTTLS (`src/lib/mailer.ts`).
- `EMAIL_FROM` — "from" address (falls back to `SMTP_USER`)
- `SUPPORT_EMAIL_FROM` — from/to address for Contact page messages (`src/app/api/contact/route.ts`), falls back to `EMAIL_FROM` then `SMTP_USER`

`NEXT_PUBLIC_*` vars are read in the browser; the rest are server-only (API routes).

## Architecture

This is the **customer-facing + admin storefront** (Next.js 14 App Router, TypeScript strict). It is a frontend only — all commerce data lives in a separate **Medusa v2 backend** reached over HTTP. The store targets the Kenyan market (KES currency, Kenyan phone validation, M-Pesa).

### Two backends, two API clients

The app talks to the Medusa backend through **two distinct clients** — know which to use:

1. **`src/lib/sdk.ts`** — the official `@medusajs/js-sdk` (`sdk.store.*`, `sdk.auth.*`, `sdk.client.fetch`). Used for all standard storefront commerce: products, regions, carts, fulfillment, payments, customer auth, wishlists. This is the default for store-facing features.
2. **`src/lib/api.ts`** — a custom `axios` client (`api.admin.*`) hitting **non-standard `/manage/*` endpoints** on the backend (admin login, order management, product CRUD). These are a custom admin API, *not* Medusa's native admin API. Auth is a Bearer token read from the `admin_token` cookie.

`src/lib/constants.ts` also exposes `API_BASE_URL` for raw `fetch` calls (e.g. customer `/store/customers/claim`).

### Auth: three separate identity systems

- **Customer accounts** — Medusa `emailpass` auth via `src/store/customer.ts` (Zustand store). Registration uses a two-step flow: `sdk.auth.register` to get a token, then a raw `fetch` to `/store/customers/claim`.
- **Admin** — custom token in the `admin_token` cookie (`src/lib/auth.ts`). `src/middleware.ts` guards `/admin/*` (except `/admin/login`) by redirecting when the cookie is absent. The cookie is also read manually in `api.ts` to set the `Authorization` header.
- **Email verification** — two independent in-memory mechanisms (see below).

### Email verification — in-memory stores (dev-oriented)

Both `src/lib/otp-store.ts` (6-digit OTP) and `src/lib/magic-link-store.ts` (signed-token magic links) keep state in **module-global `Map`s** attached to `globalThis` to survive Next.js hot-reload and per-route module isolation. They handle their own rate-limiting (per-email and per-IP windows), expiry, and attempt-blocking. Email delivery goes through the shared SMTP transport in `src/lib/mailer.ts` (`sendEmail()`, nodemailer over Truehost), whose `Transporter` is likewise cached on `globalThis`.

> ⚠️ This state is **per-process and ephemeral** — it does not survive restarts and will not work across multiple serverless instances / horizontal scaling. Keep this in mind before deploying to a multi-instance environment.

The API routes are thin wrappers: `src/app/api/otp/{send,verify}` and `src/app/api/magic/{send,verify}`. Magic-link send enforces same-origin (`isValidOrigin`) and only allows redirect targets in the `SAFE_REDIRECTS` allowlist (`/checkout`, `/account`, `/`). `src/app/auth/magic/page.tsx` is the landing page that POSTs the token to `/api/magic/verify` and, for `register` context, completes account creation client-side.

### Checkout flow (`src/app/checkout/page.tsx`)

Builds a Medusa cart on submit (create cart → add line items → set address/email → add shipping method → initiate payment session → complete). Two payment methods:
- **M-Pesa** (`pp_intasend_intasend` provider) — initiates an STK push, then the page polls the cart until the order completes.
- **Cash on Delivery** (`pp_system_default` provider) — **requires email verification first** (OTP or magic link) before the order can be placed.

Shipping is delivery-or-pickup; flat per-city shipping costs are in `SHIPPING_COSTS` (`constants.ts`).

### Client state (Zustand)

- `src/store/cart.ts` — cart, **persisted to localStorage** (`cart-store`). Derives `totalItems`/`subtotal` on every mutation via `derive()`. Cart items snapshot the first variant's price/image.
- `src/store/customer.ts` — current Medusa customer + login/register/logout.
- `src/store/wishlist.ts` — server-backed wishlist via `sdk.client.fetch('/store/customers/me/wishlists')`.

### Stock semantics

`src/lib/stock.ts` `getStockStatus()` centralizes Medusa inventory rules: `manage_inventory: false` → infinite (`stockCount: -1`); `allow_backorder: true` → always purchasable; otherwise gated on `inventory_quantity`. Use this rather than reading variant fields directly.

### Type duality

Note two different "Product" shapes coexist:
- `HttpTypes.StoreProduct` (from `@medusajs/types`) — the real shape returned by the Medusa SDK, used in storefront/cart code.
- `src/lib/types/product.ts` `Product` — a simplified custom shape used by the **admin `/manage/*` API** and its Zod schemas (`src/lib/schemas/`). Don't confuse them.

## Conventions

- Import alias `@/*` → `src/*` (configured in `tsconfig.json`).
- UI uses **shadcn/ui** (`src/components/ui/`, style `base-nova`, Lucide icons) + Tailwind; `cn()` from `src/lib/utils.ts` merges classes. Note the checkout page deliberately uses inline `React.CSSProperties` style objects instead.
- Currency/date formatting: `formatKES()` and `formatDate()` (en-KE) in `src/lib/utils.ts` — use these for any money/date display.
- Toasts via `sonner` (`<Toaster>` mounted in root layout).
- Forms use `react-hook-form` + `zodResolver` with schemas colocated in the page or `src/lib/schemas/`.
- Regions: `src/lib/region.ts` memoizes the first Medusa region id; reuse `getRegionId()` rather than re-listing regions.
