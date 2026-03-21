# CLAUDE.md - Project Conventions

## 1. Project Overview

A production-ready Next.js 15 starter using the App Router with TypeScript, Tailwind CSS, shadcn/ui, NextAuth v5, Mongoose, Zustand, and Zod.

Tech stack:
- Framework: Next.js 15 (App Router)
- Auth: NextAuth v5 (Credentials, JWT sessions)
- Styling: Tailwind CSS + shadcn/ui
- Database: Mongoose (MongoDB ODM)
- Validation: Zod + react-hook-form + @hookform/resolvers
- State: Zustand (vanilla store + context pattern)
- Testing: Vitest
- Language: TypeScript (strict mode)

## 2. Folder Conventions

Features own all their domain code under `src/features/<feature>/`:
- `schema/` - Mongoose schema, model, inferred type
- `repository/` - DB access layer (only layer that imports Mongoose models)
- `service/` - business logic, always returns `{ data, status }`
- `store/` - Zustand vanilla store factory
- `hooks/` - store hook (e.g., `useAuthStore.ts`) + action hooks (e.g., `use-login.ts`)
- `components/` - feature-specific React components
- `validations/` - Zod schemas and inferred types
- `types/` - TypeScript types for this feature

Shared code lives in `src/shared/`.

## 3. Type Rule

Never use `interface`. Always use `type`.

```ts
// correct
type User = { id: string; name: string };

// wrong
interface User { id: string; name: string }
```

Mongoose schema types use `InferSchemaType`:
```ts
export type UserDocument = InferSchemaType<typeof UserSchema>;
```

## 4. Schema Rule

Each feature defines its Mongoose schema, model, and inferred type in `features/<feature>/schema/<name>.schema.ts`.

```ts
import mongoose, { Schema, InferSchemaType } from 'mongoose';

const UserSchema = new Schema({ name: { type: String, required: true } }, { timestamps: true });
export type UserDocument = InferSchemaType<typeof UserSchema>;
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
```

## 5. Route Protection

Route protection uses `src/proxy.ts` (not `middleware.ts`). It runs in the Edge Runtime and must NOT import any Node.js modules (`crypto`, `mongoose`, etc.) or the auth config. It only inspects the session cookie (`authjs.session-token` / `__Secure-authjs.session-token`) and redirects unauthenticated requests to `/`.

## 6. API Route Rules

API routes are thin controllers only. Rules:
- Always use `validateBody` from `@/shared/middleware/validate-body`
- Call the service, return JSON
- Always catch errors to 500

```ts
export async function POST(req: NextRequest) {
  try {
    const validated = await validateBody(req, SomeSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await someService(validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
```

## 6. Service Rules

- Always return `{ data, status }` (type: `ServiceResult<T>` from `@/shared/types/common`)
- Never throw for handled cases, return error objects
- Call repository only. Never import Mongoose models directly in services.

```ts
export async function myService(input: InputType): Promise<ServiceResult<OutputType>> {
  const item = await repository.findById(input.id);
  if (!item) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: item, status: 200 };
}
```

## 7. Repository Rules

- Only layer that imports Mongoose models.
- Call `await mongo.connect()` at the start of every method.
- Use `.lean()` for read operations.

```ts
import { mongo } from '@/shared/lib/mongo';
import { UserModel } from '../schema/user.schema';

export const userRepository = {
  async findById(id: string) {
    await mongo.connect();
    return UserModel.findById(id).lean();
  },
};
```

## 8. Validation Rules

Zod schemas live in `features/<feature>/validations/<feature>.validation.ts`. Export the schema and inferred type.

```ts
import { z } from 'zod';
export const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
export type LoginType = z.infer<typeof LoginSchema>;
```

## 9. Zustand Pattern

Three files per feature store:
1. `features/<feature>/store/<feature>-store.ts` - vanilla store factory using `createStore` from `zustand/vanilla`
2. `features/<feature>/hooks/use<Feature>Store.ts` - context + `useStore` hook
3. `shared/providers/store-provider.tsx` - combines all store contexts

All three files are required for each feature store.

## 10. Hook Rules

Store hooks and action hooks are separate files:
- `useAuthStore.ts` - reads/writes to store via context
- `use-login.ts` - action hook: handles async logic, updates store state

Never put async action logic in the store hook file.

## 11. Form Rule

Use `react-hook-form` with `zodResolver`. Never use manual state for forms.

```ts
const form = useForm<LoginType>({
  resolver: zodResolver(LoginSchema),
  defaultValues: { email: '', password: '' },
});
```

## 12. OOP Lib Rule

All classes in `shared/lib/` must use class syntax and export a singleton instance.

```ts
class MongoClientManager { ... }
export const mongo = new MongoClientManager();
```

## 13. Test Conventions

- Test files use `.spec.ts` extension and are co-located with the source file.
- In service tests, mock at the repository boundary. Never mock Mongoose models directly.
- Use `vi.mock('../repository/my.repository')` at the top of service specs.

## 14. Naming Conventions

- Files: kebab-case (`use-login.ts`, `auth-store.ts`)
- Components: PascalCase (`LoginForm`, `Header`)
- Functions: camelCase (`loginService`, `fetchSessions`)
- Store hook files: PascalCase prefix (`useAuthStore.ts`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)

## 15. Zod ObjectId Constraint

For MongoDB ObjectId fields in Zod schemas, use `.min(24).max(24)`:

```ts
userId: z.string().min(24).max(24)
```
