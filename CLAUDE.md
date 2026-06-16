# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## პროექტი

**Trendora** (`trendora.ge`) — მარკეტფლეისი. Auth: Google OAuth + Email/Password. ადმინი მართავს dashboard-იდან.

განხორციელებული features: `products`, `categories`, `ai-assistant`.
დაგეგმილი: `cart`, `orders`.

## Commands

```bash
npm run dev          # localhost:3000
npm run build
npm run lint:fix
npm run typecheck
npm run test:run
npx vitest run src/features/auth/service/auth.service.spec.ts   # single test file
```

Husky pre-commit: `lint → build → test` — ერთი ჩავარდნა = commit დაბლოკილი.

## Environment Variables

`.env.local` (gitignored):
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secret>
MONGO_URI=mongodb+srv://...
SEED_EMAIL=...
SEED_PASSWORD=...
GOOGLE_CLIENT_ID=...              # optional — Google OAuth გამორთულია თუ არ არის
GOOGLE_CLIENT_SECRET=...
OPENROUTER_API_KEY=...            # AI ასისტენტი — openrouter.ai
BLOB_READ_WRITE_TOKEN=...         # @vercel/blob — სურათების ატვირთვა (Vercel dashboard-ზე შეიქმნება)
```

Vercel-ზე: `AUTH_SECRET` (v5 primary), `MONGO_URI` **production + preview + development** targets-ზე.
`MONGO_URI` development-only → production-ში auth `Configuration` error.

## Request Flow

```
Client → http.post('/api/...', body)        # singleton @ src/shared/lib/http.ts, baseUrl='/api'
  → API Route: validateBody(req, ZodSchema) # → 400 თუ invalid
  → Service: returns ServiceResult<T>       # ბიზნეს ლოგიკა, არასოდეს throws
  → Repository: mongo.connect() + query     # ერთადერთი Mongoose ფენა
```

`ServiceResult<T>` — `src/shared/types/common.ts`:
```ts
type ServiceResult<T> = { data: T | { error: string }; status: number };
```
Error check: `'error' in data`. Service არასოდეს throws.

## Route Groups

```
src/app/
  layout.tsx                     — root layout (fonts only)
  (public)/layout.tsx            — SessionProvider + StoreProvider + AiWidget (floating)
  (public)/page.tsx              — home
  (public)/sign-in/page.tsx
  (public)/sign-up/page.tsx
  (protected)/layout.tsx         — auth() server-side check → admin only → DashboardShell
  (protected)/dashboard/         — 12 dashboard pages (products, categories, ai, orders, ...)

src/app/api/
  products/route.ts              — GET (public list), POST (admin create)
  products/upload/route.ts       — POST (admin, @vercel/blob upload, 5MB limit)
  categories/route.ts            — GET (public), POST (admin create), PUT (admin seed defaults)
  categories/[id]/route.ts       — DELETE (admin)
  ai/chat/route.ts               — POST (admin-only, SSE stream → OpenRouter)
  ai/widget/route.ts             — POST (public, SSE stream → OpenRouter, last 10 msgs)
```

`(protected)/layout.tsx` double-check: `auth()` → `role === 'admin'` → redirect `/`.
Edge middleware (`proxy.ts`) does cookie-only pre-check.

## Auth

- JWT sessions — NextAuth v5 (`src/shared/lib/auth.ts`)
- Google OAuth provider — conditional init (crashes if env vars absent)
- SHA-256 password (`src/shared/utils/password.ts`) — არა bcrypt
- `jwt` callback — **ყოველ** request-ზე DB query (`role`/`avatar` სინქრონი)
- OAuth upsert — `upsertOAuthUserService`; `passwordHash: ''`
- **არ შევქმნათ `next-auth.d.ts`** — inline cast:
  ```ts
  type SessionUser = { id: string; role: 'admin' | 'user'; avatar?: string | null };
  ```
- Login hook — `signIn('credentials', { redirect: false })` → `getSession()` → `window.location.href`

## Middleware

`src/proxy.ts` = Edge middleware (cookie check, redirects). გასააქტიურებლად შევქმნათ `src/middleware.ts`:
```ts
export { proxy as default, config } from '@/proxy';
```
`proxy.ts`-ში DB/Node imports აკრძალულია — Edge runtime.
Cookie names: `authjs.session-token` / `__Secure-authjs.session-token`.

## UI / Styling

Tailwind v4 + shadcn/ui. ფერები OKLCh CSS vars (`src/app/globals.css`):
- `--primary` = წითელი (`oklch(0.52 0.233 25)` ≈ `#dd3327`) — buttons, badges, accents
- `--secondary` = მუქი (`oklch(0.12 0 0)` ≈ `#111111`) — header bg, nav bar
- `--accent` = ღია coral tint (`oklch(0.90 0.05 20)` ≈ `#FFD2CF`) — hover states

Header 3-row: utility bar (desktop only) → logo+search → category nav.
Mobile: hamburger → auth buttons + category list (`max-h-72 overflow-y-auto`).
Logo: `src/shared/components/layout/logo.tsx` — SVG cart + TRENDORA text.
`scrollbar-hide` utility defined in `globals.css`.

AI widget: `src/features/ai/components/ai-widget.tsx` — `fixed bottom-6 right-6 z-50`, rendered in `(public)/layout.tsx`. Streaming SSE via `/api/ai/widget`.

## Dashboard Sidebar

`src/shared/components/layout/dashboard-sidebar.tsx` — `ICON_MAP` maps string keys → lucide icons.
`src/features/dashboard/const/dashboard.const.ts` — `DASHBOARD_NAV_SECTIONS` nav items + `DASHBOARD_PAGE_TITLES`.

ახალი sidebar item დასამატებლად:
1. `ICON_MAP`-ში დაამატე icon (sidebar.tsx)
2. `DASHBOARD_NAV_SECTIONS`-ში დაამატე `{ href, label, icon }` (dashboard.const.ts)
3. `DASHBOARD_PAGE_TITLES`-ში დაამატე entry

## Products & Categories

**Products** (`src/features/products/`):
- `status`: `'active' | 'draft' | 'out_of_stock' | 'pending'`
- category ველი — `z.string().min(1)`, dynamic from DB with fallback to `MARKET_CATEGORIES`
- Form number inputs — `z.number()` (არა `z.coerce.number()`) + `onChange={(e) => field.onChange(+e.target.value)}`
  `z.coerce.number()` causes TS type mismatch with `@hookform/resolvers` v5 + Zod v4.

**Categories** (`src/features/categories/`):
- DB-ში ინახება (Mongoose). `GET /api/categories` returns empty array if none seeded.
- `PUT /api/categories` — seeds 19 default `MARKET_CATEGORIES` (skips duplicates).
- `key` field unique, URL-safe (`/^[a-z0-9-]+$/`).
- Product form fetches categories from `/api/categories`, falls back to `MARKET_CATEGORIES` const if empty.

## AI Assistant

Model: `nex-agi/nex-n2-pro:free` via OpenRouter.

- `/api/ai/chat` — admin-only, full conversation history
- `/api/ai/widget` — public, last 10 messages for context
- System prompt: Georgian-only responses, marketplace topics only, off-topic refusal
- Streaming: SSE `text/event-stream`, parse `data: {...}` chunks, stop on `[DONE]`
- `src/features/ai/components/ai-chat.tsx` — dashboard full-page chat
- `src/features/ai/components/ai-widget.tsx` — public floating widget

## ფაილების სტრუქტურა

```
src/features/<feature>/
  schema/        Mongoose schema + InferSchemaType
  repository/    mongo.connect() + raw queries only
  service/       ბიზნეს ლოგიკა → ServiceResult<T>
  store/         Zustand vanilla store (createStore)
  hooks/         useXStore.ts + use-action.ts — ცალ-ცალკე
  components/    feature UI
  validations/   Zod schemas + inferred types
  types/         TypeScript types
```

Constants:
- `src/shared/const/home.const.ts` — placeholder product/service data
- `src/shared/const/navigation.const.ts` — `MARKET_CATEGORIES` (19 items)
- `src/shared/const/routes.const.ts` — `AUTH_ROUTES`, `PROTECTED_ROUTES`
- `src/features/dashboard/const/dashboard.const.ts` — KPIs, charts, sidebar nav, page titles

## წესები

**Types:** `type` ყოველთვის, `interface` არასოდეს. `unknown` cast არასოდეს.

**Styling:** მხოლოდ Tailwind classes. `style={{}}` და arbitrary values (`text-[10px]`) — აკრძალულია.
`page.tsx`-ში raw HTML tags (`<header>`, `<footer>`) — არა, components გამოიყენე.

**Imports:** `@/` cross-directory. `./` same folder only.

**Constants:** `src/shared/const/<name>.const.ts`. Page-ში inline data — არა.

**Zustand:** 3 ფაილი — store factory (`createStore`) + `useXStore.ts` hook + `store-provider.tsx`.

**API Routes:** `validateBody` → service → `Response.json()`. Catch → 500.
Admin check pattern:
```ts
type SessionUser = { role?: 'admin' | 'user' };
const session = await auth();
const user = session?.user as SessionUser | undefined;
if (!session || user?.role !== 'admin') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
```

**Repository:** `await mongo.connect()` ყოველ method-ში. `.lean<T>()` reads-ზე.

**Next.js 15+ dynamic params:** Promise-ებია — `{ params }: { params: Promise<{ id: string }> }` → `const { id } = await params`.

**ObjectId validation:** `z.string().min(24).max(24)`.

**Naming:** files `kebab-case`, components `PascalCase`, functions `camelCase`, constants `UPPER_SNAKE_CASE`.

**Tests:** `.spec.ts` co-located. Service tests — mock at repository layer: `vi.mock('@/features/.../repository/...')`.

**ESLint overrides** (`eslint.config.mjs`):
- `max-lines: off` — `**/const/**`, `**/dashboard/**`, `**/features/products/**`, `**/features/categories/**`, `**/features/ai/**`
- `max-lines: off`, `max-len: off` — `**/components/ui/**`, test files
- `no-console: off` — `**/mongo.ts`, `**/redis.ts`
