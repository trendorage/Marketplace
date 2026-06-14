# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## პროექტი

**Trendora** (`trendora.ge`) — მარკეტფლეისი. Auth: Google OAuth + Email/Password. ადმინი მართავს პროდუქტებს dashboard-იდან. მომხმარებლები Browse + Cart + Order.

დაგეგმილი features: `products`, `categories`, `cart`, `orders`.

## Commands

```bash
npm run dev          # localhost:3000
npm run build
npm run lint:fix
npm run typecheck
npm run test:run
npx vitest run src/features/auth/service/auth.service.spec.ts
```

Husky pre-commit: `lint → build → test` — ერთი ჩავარდნა = commit დაბლოკილი.

## Request Flow

```
Client → http.post('/api/...', body)        # singleton @ src/shared/lib/http.ts, baseUrl='/api'
  → API Route: validateBody(req, ZodSchema) # → 400 თუ invalid
  → Service: returns ServiceResult<T>       # ბიზნეს ლოგიკა, არასოდეს throws
  → Repository: mongo.connect() + query     # ერთადერთი Mongoose ფენა
```

`ServiceResult<T>` — `src/shared/types/common.ts`. Service ყოველთვის აბრუნებს `{ data, status }`, არასოდეს throws.

## Auth

- JWT sessions — NextAuth v5 (`src/shared/lib/auth.ts`)
- Google OAuth + Credentials provider
- SHA-256 password (`src/shared/utils/password.ts`) — არა bcrypt
- `jwt` callback — **ყოველ** request-ზე DB query (`role`/`avatar` სინქრონი)
- OAuth upsert — `upsertOAuthUserService`; `passwordHash: ''`
- **არ შევქმნათ `next-auth.d.ts`** — inline cast:
  ```ts
  type SessionUser = { id: string; role: 'admin' | 'user'; avatar?: string | null };
  ```

## Middleware

`src/proxy.ts` = Edge middleware (cookie check, redirects). გასააქტიურებლად:
```ts
// src/middleware.ts
export { proxy as default, config } from '@/proxy';
```
`proxy.ts`-ში DB/Node imports აკრძალულია — Edge runtime.

`(protected)/layout.tsx` — server-side double-check: `auth()` + `role === 'admin'` → redirect. ორივე route group-ს აქვს `SessionProvider + StoreProvider`.

## UI / Styling

Tailwind v4 + shadcn/ui. ფერები OKLCh CSS vars (`src/app/globals.css`):
- `--primary` = წითელი (`oklch(0.52 0.233 25)` ≈ `#dd3327`) — buttons, badges, accents
- `--secondary` = მუქი (`oklch(0.12 0 0)` ≈ `#111111`) — header bg, nav bar
- `--accent` = ღია coral tint (`oklch(0.90 0.05 20)` ≈ `#FFD2CF`) — hover states

Header 3-row: utility bar (desktop only) → logo+search → category nav (19 კატეგორია scrollable).
Mobile: hamburger → auth buttons + category list (`max-h-72 overflow-y-auto`).
Logo component: `src/shared/components/layout/logo.tsx` — SVG cart + TRENDORA text. გამოიყენება header და footer-ში.
`scrollbar-hide` utility defined in `globals.css`.

## ფაილების სტრუქტურა

```
src/features/<feature>/
  schema/        Mongoose schema + InferSchemaType
  repository/    mongo.connect() + raw queries only
  service/       ბიზნეს ლოგიკა → ServiceResult<T>
  store/         Zustand vanilla store
  hooks/         useXStore.ts + use-action.ts — ცალ-ცალკე
  components/    feature UI
  validations/   Zod schemas + inferred types
  types/         TypeScript types

src/shared/
  const/         <name>.const.ts — ყველა static data
  lib/           singletons (http, mongo, auth) + .spec.ts
  middleware/    validateBody (Zod → 400)
  types/         ServiceResult<T>, PaginatedResult<T>
```

Marketplace constants: `home.const.ts` (Product, ServiceProp, placeholder data), `navigation.const.ts` (MARKET_CATEGORIES — 19 items).

## წესები

**Types:** `type` ყოველთვის, `interface` არასოდეს. `unknown` cast არასოდეს.

**Styling:** მხოლოდ Tailwind classes. `style={{}}` და arbitrary values (`text-[10px]`) — აკრძალულია. `page.tsx`-ში raw HTML tags (`<header>`, `<footer>`) — არა, components გამოიყენე.

**Imports:** `@/` cross-directory. `./` same folder only.

**Constants:** `src/shared/const/<name>.const.ts`. Page-ში inline data — არა.

**Zustand:** 3 ფაილი — store factory + `useXStore.ts` hook + `store-provider.tsx`.

**API Routes:** `validateBody` → service → `Response.json()`. Catch → 500.

**Repository:** `await mongo.connect()` ყოველ method-ში. `.lean<T>()` reads-ზე.

**ObjectId validation:** `z.string().min(24).max(24)`.

**Naming:** files `kebab-case`, components `PascalCase`, functions `camelCase`, constants `UPPER_SNAKE_CASE`.

**Tests:** `.spec.ts` co-located. Service tests — mock at repository layer: `vi.mock('@/features/.../repository/...')`.
