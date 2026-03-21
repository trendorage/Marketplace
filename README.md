# Next.js Starter

A production-ready Next.js 16 starter with authentication, MongoDB, Zustand state management, and shadcn/ui.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Auth | NextAuth v5 — Credentials + Google OAuth |
| Database | MongoDB via Mongoose |
| Styling | Tailwind CSS + shadcn/ui (new-york) |
| Validation | Zod + react-hook-form |
| State | Zustand (vanilla store + context) |
| Testing | Vitest |
| Linting | ESLint + import/order |
| Git hooks | Husky (pre-commit: lint, build, test) |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                        # Root layout
│   ├── globals.css                       # Global styles + Tailwind theme
│   ├── (public)/                         # Unauthenticated routes
│   │   ├── layout.tsx                    # Wraps SessionProvider + StoreProvider
│   │   ├── page.tsx                      # Landing / homepage
│   │   ├── sign-in/page.tsx              # Login page
│   │   └── sign-up/page.tsx              # Registration page
│   ├── (protected)/                      # Auth-guarded routes
│   │   ├── layout.tsx                    # Auth check + app shell
│   │   ├── error.tsx                     # Error boundary
│   │   ├── loading.tsx                   # Loading skeleton
│   │   └── dashboard/page.tsx            # Dashboard page
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts    # NextAuth handler
│       │   └── register/route.ts         # POST /api/auth/register
│       └── health/route.ts               # GET /api/health
│
├── features/                             # Feature modules (vertical slices)
│   ├── auth/
│   │   ├── schema/user.schema.ts         # Mongoose schema + model + inferred type
│   │   ├── repository/user.repository.ts # DB access (only layer using Mongoose models)
│   │   ├── service/auth.service.ts       # Business logic, returns { data, status }
│   │   ├── validations/auth.validation.ts# Zod schemas: LoginSchema, SignUpSchema
│   │   ├── types/auth.types.ts           # TypeScript types (no interfaces)
│   │   ├── store/auth-store.ts           # Zustand vanilla store factory
│   │   ├── hooks/
│   │   │   ├── useAuthStore.ts           # Store context hook
│   │   │   ├── use-login.ts              # Login action hook
│   │   │   ├── use-logout.ts             # Logout action hook
│   │   │   └── use-register.ts           # Register action hook
│   │   └── components/
│   │       ├── login-form.tsx            # Login form (react-hook-form + zod)
│   │       └── signup-form.tsx           # Sign-up form (react-hook-form + zod)
│   │
│   └── sessions/
│       ├── schema/session.schema.ts
│       ├── repository/session.repository.ts
│       ├── service/sessions.service.ts
│       ├── validations/sessions.validation.ts
│       ├── types/sessions.types.ts
│       ├── store/sessions-store.ts
│       ├── hooks/
│       │   ├── useSessionsStore.ts
│       │   └── use-sessions.ts
│       └── components/
│           ├── sessions-page.tsx
│           └── sessions-table.tsx
│
├── shared/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx                # Top navigation bar
│   │   │   └── sidebar.tsx               # Side navigation
│   │   └── ui/                           # shadcn/ui components
│   ├── hooks/
│   │   └── use-debounce.ts
│   ├── lib/
│   │   ├── auth.ts                       # NextAuth config (Credentials + Google)
│   │   ├── http.ts                       # OOP HttpClient (fetch wrapper)
│   │   ├── mongo.ts                      # OOP MongoClientManager (retry logic)
│   │   └── utils.ts                      # cn() utility
│   ├── middleware/
│   │   └── validate-body.ts              # Zod request body validator
│   ├── providers/
│   │   ├── session-provider.tsx          # NextAuth SessionProvider wrapper
│   │   └── store-provider.tsx            # All Zustand store contexts
│   ├── types/
│   │   ├── common.ts                     # ServiceResult<T> and shared types
│   │   └── http-method.ts
│   └── utils/
│       └── format.ts
│
├── proxy.ts                              # Edge route protection (replaces middleware)
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
MONGO_URI=mongodb://localhost:27017/nextjs-starter

# Optional — Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Run development server

```bash
npm run dev
```

---

## Docker

> If you already have a MongoDB URI (e.g. MongoDB Atlas), skip `docker compose` and run the app standalone:
>
> ```bash
> # Development
> npm run dev
>
> # Or build and run the image directly
> docker build -t nextjs-starter .
> docker run -p 3000:8080 --env-file .env nextjs-starter
> ```

### With docker compose (includes local MongoDB)

```bash
# Start all services (app + MongoDB)
docker compose up

# Start in background
docker compose up -d

# Rebuild after code changes
docker compose up --build

# Stop all services
docker compose down

# Stop and remove volumes (wipes MongoDB data)
docker compose down -v

# View logs
docker compose logs -f app

# Open a shell in the running container
docker compose exec app sh
```

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run test         # Run Vitest
npm run test:cov     # Run Vitest with coverage
```

---

## Key Conventions

- **API routes are thin controllers** — validate body, call service, return JSON, catch to 500
- **Services always return `{ data, status }`** — never throw for handled cases
- **Repositories are the only layer that imports Mongoose models** — call `mongo.connect()` at the top of every method
- **Zustand stores use vanilla pattern** — store factory + context + `useStore` hook (3 files per feature)
- **Forms use react-hook-form + zodResolver** — no manual form state
- **Route protection via `src/proxy.ts`** — Edge-safe, no Node.js imports

