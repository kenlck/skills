# TanStack Start Reference

Guidance for building features in a [TanStack Start](https://tanstack.com/start/latest) codebase. Focus: the server/client boundary, `createServerFn`, and preventing server code (Drizzle, pg, env secrets, Node built-ins) from leaking into the client bundle.

This is a known, ongoing friction area in the framework. Read this before touching any file that imports a database client, filesystem module, or secret.

## Table of Contents

1. [Execution Model: Isomorphic by Default](#execution-model-isomorphic-by-default)
2. [Boundary Primitives](#boundary-primitives)
3. [File Naming & Import Protection](#file-naming--import-protection)
4. [Recommended File Structure](#recommended-file-structure)
5. [`createServerFn` API](#createserverfn-api)
6. [Preventing Server Code Leaks](#preventing-server-code-leaks)
7. [Loaders vs Server Functions](#loaders-vs-server-functions)
8. [Common Pitfalls](#common-pitfalls)
9. [Diagnosing a Leak](#diagnosing-a-leak)
10. [Pre-merge Checklist](#pre-merge-checklist)

---

## Execution Model: Isomorphic by Default

**This is the single most important thing to understand.** All code in TanStack Start is **isomorphic by default** — it runs and is bundled into **both** server and client unless explicitly constrained.

Consequences:

- A file that imports `drizzle-orm` and gets referenced from a route component will try to ship Drizzle to the browser.
- `process.env.DATABASE_URL` in a plain utility file will be inlined into the client bundle at build time (or throw at runtime).
- Route **loaders** run on the server during SSR **and again on the client** during navigation — never put secrets in a loader directly.

The fix is always the same: **make the boundary explicit** via naming (`.server.ts` / `.client.ts`), primitive wrapping (`createServerFn`), or explicit markers.

---

## Boundary Primitives

| Primitive | Purpose | Where it runs |
|---|---|---|
| `createServerFn()` | Typed RPC callable from anywhere; handler runs server-side | Handler: server. Stub shipped to client. |
| `createServerOnlyFn()` | Mark a plain function as server-only; crashes if called from client | Server only |
| `createClientOnlyFn()` | Mark a function as client-only; no-op on server | Client only |
| `createIsomorphicFn()` | Provide separate implementations per environment | Branch picked per env |
| `<ClientOnly>` component | Render children only after hydration | Client only |
| `useHydrated()` hook | Hydration-aware conditional rendering | Both, branches logic |

**Rule of thumb**: if a function touches the database, filesystem, or secrets, wrap with `createServerFn` (if called from UI) or `createServerOnlyFn` (if a shared helper).

---

## File Naming & Import Protection

TanStack Start ships a Vite plugin that enforces file-level environment boundaries:

- `**/*.server.*` — blocked from client bundle
- `**/*.client.*` — blocked from server bundle

Violations in **dev** produce a warning + mock import; violations in **build** fail hard. Use this, not hopes and prayers.

Explicit markers for files that can't use the naming convention:

```ts
// At the very top of a file that must never ship to client:
import '@tanstack/react-start/server-only'

// Or for client-only:
import '@tanstack/react-start/client-only'
```

---

## Recommended File Structure

The pattern that minimizes leaks:

```
src/features/users/
├── users.server.ts       // Drizzle queries, DB client, env access — NEVER imported from components
├── users.functions.ts    // createServerFn wrappers — SAFE to import anywhere (client gets RPC stub)
├── users.schemas.ts      // Zod schemas, shared types — isomorphic, safe in both envs
└── UsersList.tsx         // Component, imports from users.functions.ts
```

**Why three files, not two:**

- `.server.ts` — direct DB access, imports Drizzle / pg. Protected by import protection. Only imported by `.functions.ts` handlers.
- `.functions.ts` — the `createServerFn` wrappers. Called from routes, components, other server functions. The build replaces the handler body with an RPC stub on the client side.
- `.schemas.ts` — Zod or plain type definitions. Pure data, no runtime server deps. Imported by both `.functions.ts` and components for type sharing.

Don't collapse `.server.ts` + `.functions.ts` into one file — keep the DB imports out of the file that gets reached from components.

---

## `createServerFn` API

The canonical shape:

```ts
// users.functions.ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { findUserById, createUser as dbCreateUser } from './users.server'

const GetUserInput = z.object({ id: z.string().uuid() })

export const getUser = createServerFn({ method: 'GET' })
  .inputValidator(GetUserInput)
  .handler(async ({ data }) => {
    return findUserById(data.id)
  })

const CreateUserInput = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

export const createUserFn = createServerFn({ method: 'POST' })
  .inputValidator(CreateUserInput)
  .handler(async ({ data }) => {
    return dbCreateUser(data)
  })
```

Key rules:

- **Always validate input.** `.inputValidator()` is not optional — the payload is user-controlled network data. Use Zod / Valibot / similar. Raw `(data: X) => data` casts are a security hole.
- **Method matters.** `GET` for reads (idempotent, cacheable), `POST` for mutations. This maps to the HTTP layer.
- **Handler runs server-side only.** The client gets a typed RPC stub that calls over HTTP.
- **Throw for flow control**: `throw redirect({ to: '/login' })` and `throw notFound()` work as expected.
- **Static imports only.** Don't dynamically `import()` a server function — the bundler can't rewrite dynamic imports reliably, and server code may leak.

### Calling server functions

```tsx
// In a route loader:
export const Route = createFileRoute('/users/$id')({
  loader: ({ params }) => getUser({ data: { id: params.id } }),
  component: UserDetail,
})

// In a component via the hook:
import { useServerFn } from '@tanstack/react-start'
const createUser = useServerFn(createUserFn)
await createUser({ data: { email, name } })
```

---

## Preventing Server Code Leaks

Despite the framework's best efforts, **server code leaks into the client bundle are a recurring issue** — tracked across multiple upstream GitHub issues. The leaks happen when:

1. **A server-only module is transitively imported** from a file that survives client compilation. Even behind `createServerFn`, a shared helper imported from a route module can pull Drizzle or pg into the client bundle.
2. **An isomorphic file (no `.server` suffix) imports a DB client directly** instead of going through a server function wrapper.
3. **Environment variables are read in a file that gets bundled to the client** — the value gets inlined at build.
4. **`process.env`, `node:fs`, `node:path`, `node:async_hooks` appear** in the client graph, usually via a dependency that doesn't declare itself as server-only.

### Defensive rules

1. **DB client lives in one place** — `src/server/db.ts` or `src/db/db.server.ts` — and that file has `.server.` in its name OR the `import '@tanstack/react-start/server-only'` marker at the top.
2. **Never import the DB client from a file that a component imports.** Only server-function handlers and other `.server.ts` files import it.
3. **Env access (`process.env.X`) only in `.server.ts` files or inside server function handlers.** Not in shared utilities, not in loaders (loaders run on client too).
4. **Schemas and types are isomorphic**; runtime code that *uses* the DB is not. Split them.
5. **Audit the client bundle after non-trivial changes** — see [Diagnosing a Leak](#diagnosing-a-leak).

### When a dependency itself leaks

Some packages (older SDK versions, CommonJS-first libraries) pull in Node built-ins even when imported from a `.server.ts` file, because Vite's tree-shaking can't prove the import is unreachable from client code. Mitigations:

- Move the import inside a `createServerFn` handler body (local `await import()` — but still static from the handler's perspective)
- Use `optimizeDeps.exclude` in `vite.config.ts` for stubborn packages
- Wrap the package access in a thin `.server.ts` module so only one file has the offending import

---

## Loaders vs Server Functions

**Common mistake**: putting secrets or DB calls directly in a route loader.

```ts
// ❌ WRONG: loader runs on both server and client
export const Route = createFileRoute('/dashboard')({
  loader: async () => {
    const apiKey = process.env.INTERNAL_API_KEY  // inlined into client bundle!
    return fetch(`https://internal/?key=${apiKey}`)
  },
})

// ✅ RIGHT: secret-bearing logic inside a server function
// dashboard.functions.ts
export const fetchDashboardData = createServerFn({ method: 'GET' })
  .handler(async () => {
    const apiKey = process.env.INTERNAL_API_KEY  // stays on server
    return fetch(`https://internal/?key=${apiKey}`).then(r => r.json())
  })

// route:
export const Route = createFileRoute('/dashboard')({
  loader: () => fetchDashboardData(),
})
```

Loaders are isomorphic. Anything secret or server-only goes in a server function that the loader *calls*.

---

## Common Pitfalls

- **Dynamic imports of server modules.** `await import('./users.server')` from a component file will often not be rewritten correctly. Use static imports through `.functions.ts`.
- **Shared `db.ts` without a `.server.` suffix.** Works until a component accidentally imports a type from it — then the full DB client is in the client bundle.
- **Forgetting `.inputValidator()`.** The handler receives raw network data. No validator = trusting the caller. Always validate.
- **`useServerFn` vs direct call.** In components, use `useServerFn(fn)` to get a bound callable — it integrates with React's concurrent features. In loaders and other server functions, call directly.
- **Returning non-serializable values from handlers.** Handlers go over HTTP. Return plain JSON-serializable shapes (dates and maps need explicit handling).
- **Middleware that imports server-only code** without the marker. The middleware file is reached by the client bundle graph; add the `server-only` marker or use `.server.ts`.
- **Env vars in module top-level.** `const DB = drizzle(process.env.DATABASE_URL!)` at module scope runs at import time. If the module is reachable from the client graph, the env lookup runs there too (and the value ends up in the bundle). Move into a factory invoked only from server contexts.

---

## Diagnosing a Leak

When something breaks with `Buffer is not defined`, `process is not defined`, `Module "node:fs" has been externalized`, or you see Drizzle / pg in DevTools → Network → client JS:

1. **Build with the bundle analyzer** — add `rollup-plugin-visualizer` or use `vite-bundle-visualizer`. Look for server-only packages in the client chunks.
2. **Grep the build output** for `drizzle-orm`, `postgres`, `pg`, `better-sqlite3`, or whatever DB client you use. Finding it in a client chunk = leak.
3. **Trace the import graph backward** from the leaked module to a route / component. Every edge is a fix candidate; the fix is usually to rename the intermediate file to `.server.ts` or move the import inside a server function handler.
4. **Check env var inlining** — `process.env.DATABASE_URL` as a literal string in client JS means it was bundled. Move reads server-side.
5. **Verify import protection is on.** It's default in TanStack Start, but a misconfigured Vite config can disable it.

---

## Pre-merge Checklist

Before merging any feature that touches the server boundary:

- [ ] DB client (`drizzle`, `pg`, `postgres`, etc.) imported only from `.server.ts` files
- [ ] `process.env.X` read only in `.server.ts` files or inside `createServerFn` handlers — never at module top level of a shared file
- [ ] Every `createServerFn` has an `.inputValidator()` with a real schema (not `(data: X) => data`)
- [ ] New server functions are `POST` if they mutate; `GET` otherwise
- [ ] Loaders don't read secrets directly — they call server functions
- [ ] File naming: `.server.ts` for DB / secret code, `.functions.ts` for `createServerFn` wrappers, plain `.ts` for isomorphic types/schemas
- [ ] Bundle analyzer run on the production build; no DB client, no `node:*` modules, no env values in client chunks
- [ ] No dynamic `import()` of server modules from client-reachable code
- [ ] Middleware files have `.server.` suffix or the `import '@tanstack/react-start/server-only'` marker

---

## Upstream Issues Worth Knowing

Several long-running upstream issues in `TanStack/router` track variants of server-code-leaking-into-client. Symptoms include `Buffer is not defined`, `node:fs` externalization warnings, and server function handler bodies appearing in client chunks. Fixes tend to land in framework releases — if you hit one, **pin your `@tanstack/react-start` version** and check the issue tracker before upgrading.

When in doubt, treat the boundary as fragile: the more explicit you are (file names, markers, no shared intermediate modules), the less surface area the bundler has to get wrong.
