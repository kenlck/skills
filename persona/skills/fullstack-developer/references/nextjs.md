# Next.js (App Router) Reference

Guidance for building features in a Next.js App Router codebase. Focus: the Server/Client Component boundary, Server Actions, the Data Access Layer pattern, and preventing server code / data leaks to the client.

Next.js security posture is **very different from a traditional client-server app**. The same file can render on the server and ship to the browser. The same function can execute on either side. The failure mode is not "broken" — it's "silently exposes secrets." Read this before writing any data-touching code.

## Table of Contents

1. [Execution Model](#execution-model)
2. [The `'use client'` Boundary](#the-use-client-boundary)
3. [Composition Patterns](#composition-patterns)
4. [Preventing Environment Poisoning](#preventing-environment-poisoning)
5. [Data Access Layer (DAL)](#data-access-layer-dal)
6. [Data Fetching](#data-fetching)
7. [Streaming](#streaming)
8. [Server Actions](#server-actions)
9. [Server Action Security Rules](#server-action-security-rules)
10. [Revalidation & Caching](#revalidation--caching)
11. [Common Pitfalls](#common-pitfalls)
12. [Pre-merge Checklist](#pre-merge-checklist)

---

## Execution Model

**Server Components are the default.** Layouts, pages, and plain `.tsx` files run on the server unless explicitly marked otherwise. They can:

- Fetch from databases and APIs directly (no client HTTP trip)
- Read secrets from `process.env`
- Be `async` (top-level `await` is fine)
- Import server-only packages

**Client Components** opt in via `'use client'` at the top of the file. They:

- Can use `useState`, `useEffect`, event handlers, browser APIs
- Run on the server during prerender **and** in the browser after hydration
- **Must not** import server-only code or read server-only env vars
- Must follow browser security assumptions for all data they touch

**Shared module code** (no `'use client'`, no `'use server'`) is isomorphic — it can be pulled into either side by whoever imports it. That's the leak risk.

---

## The `'use client'` Boundary

`'use client'` marks a **boundary in the module graph**, not just a single component. Once a file declares `'use client'`:

- That file and **all its transitive imports** become part of the client bundle
- Children rendered by that component (unless passed as `children` / slots) become client-rendered
- You do **not** need to add `'use client'` to every descendant

**Practical consequence**: minimize `'use client'` to small leaf components. Don't drop it at the top of a big file — every imported module follows it into the bundle.

```tsx
// ❌ Wrong — pulls everything it imports into client bundle
// app/dashboard/page.tsx
'use client'
import { db } from '@/lib/db'  // DB client will leak (or the non-NEXT_PUBLIC env vars it reads will silently become empty strings)
import Chart from './chart'
import Table from './table'
// ...

// ✅ Right — server component stays server, only the interactive leaves are client
// app/dashboard/page.tsx  (no directive → server component)
import { getDashboardData } from '@/data/dashboard'
import Chart from './chart'      // 'use client' inside this file
import Table from './table'      // may stay server, only sub-parts are client

export default async function Page() {
  const data = await getDashboardData()
  return <><Chart data={data.chart} /><Table rows={data.rows} /></>
}
```

---

## Composition Patterns

### Passing data down

Server Components pass props to Client Components. Props must be **React-serializable** (plain objects, arrays, strings, numbers, booleans, `Date`, `Map`, `Set`, some more — not class instances, not functions except server-function references, not `Symbol`).

**Critical**: props you pass to a Client Component are visible in the page source / RSC payload. Never pass raw DB records — strip to a DTO first.

### Server Components inside Client Components (slot pattern)

A Client Component **cannot import** a Server Component directly. But it can receive one as `children` / props. This is the primary way to nest server-rendered UI inside a client-rendered wrapper (e.g. modal, tabs).

```tsx
// client modal
'use client'
export default function Modal({ children }) { return <div>{children}</div> }

// server page
import Modal from './modal'
import Cart from './cart' // server component
export default function Page() {
  return <Modal><Cart /></Modal>   // Cart renders on server, Modal wraps on client
}
```

### Context providers

React context only works in Client Components. Wrap a provider in a `'use client'` component and render it as close to where it's needed as possible — not wrapping the whole `<html>`, which forces everything below to re-render unnecessarily.

### Third-party components

Libraries that use `useState` / `useEffect` without a `'use client'` directive will error when imported from a Server Component. Wrap them in a thin `'use client'` re-export.

---

## Preventing Environment Poisoning

This is the #1 subtle foot-gun:

- **Env vars not prefixed with `NEXT_PUBLIC_` are replaced with an empty string in client bundles**, not "undefined". So `process.env.API_KEY` becomes `""` on the client — no error, just silent breakage.
- A `getData()` function that reads a secret env var can be imported into a Client Component; it compiles without error; at runtime the fetch fails mysteriously.

**Defenses:**

1. **`import 'server-only'`** at the top of any module that must stay server-side. Produces a build-time error if imported from a Client Component. Install the `server-only` npm package (Next.js handles the error messages internally; the package itself is a marker).
   ```ts
   // lib/data.ts
   import 'server-only'
   export async function getData() {
     return fetch(..., { headers: { authorization: process.env.API_KEY! } })
   }
   ```
2. **`import 'client-only'`** for modules that must stay client-side (e.g. use `window`).
3. **React Taint APIs** (`experimental_taintObjectReference`, `experimental_taintUniqueValue`) as an extra layer — mark data that should never cross to the client, enabled via `experimental.taint: true` in `next.config.js`.
4. **Don't prefix secrets with `NEXT_PUBLIC_`**. Ever. Even "just for testing."

---

## Data Access Layer (DAL)

For new projects, concentrate all data reads and writes in a single `data/` directory with these rules:

- **`import 'server-only'`** at the top of every file
- **Authorize inside the DAL**, not at the call site — callers forget
- **Return DTOs** (only the fields the UI needs), not raw DB records
- **Only the DAL reads `process.env`** for DB credentials / secrets — keeps env access auditable
- Use `cache()` from React for per-request memoization of things like `getCurrentUser()`

```ts
// data/user.ts
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { db } from './db'

export const getCurrentUser = cache(async () => {
  const token = cookies().get('AUTH_TOKEN')?.value
  if (!token) return null
  return decryptAndValidate(token) // returns a User class instance
})

export async function getProfileDTO(slug: string) {
  const viewer = await getCurrentUser()
  const [row] = await db.sql`SELECT * FROM users WHERE slug = ${slug}`
  return {
    // Only fields the UI may see, after authz decisions
    name: row.name,
    phone: viewer?.isAdmin ? row.phone : null,
  }
}
```

This pattern **centralizes authorization decisions**, which is what audits actually look for.

---

## Data Fetching

### In Server Components (preferred)

Just `await`. `fetch` is memoized per-render-tree — you can call it multiple times for the same URL without duplicate network calls.

```tsx
export default async function Page() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  return <List posts={posts} />
}
```

`fetch` is **not cached by default** in modern Next.js — use the `use cache` directive or `{ next: { revalidate: N } }` to opt in.

### Parallel vs sequential

Sequential awaits block:
```ts
const a = await getA()           // ← waits
const b = await getB()           // ← then waits
```

Parallel with `Promise.all`:
```ts
const aP = getA()                // ← starts
const bP = getB()                // ← starts
const [a, b] = await Promise.all([aP, bP])   // ← both run in parallel
```

Use `Promise.allSettled` when one failure shouldn't kill the rest.

### In Client Components

Use React's `use()` with a promise passed from a Server Component (cleanest), or SWR / TanStack Query if you need cache coherence, optimistic updates, mutation invalidation, etc. Don't fetch in `useEffect` unless you have a good reason.

---

## Streaming

Two mechanisms to avoid blocking the whole page on slow data:

1. **`loading.js`** next to `page.js` — wraps the page in a `<Suspense>` boundary with that loading UI. Good for "whole page loads slowly."
2. **`<Suspense>`** directly — granular control, different fallbacks per slow region.

Place `<Suspense>` close to the async data access, not at the root — it controls what gets streamed in and what renders immediately.

---

## Server Actions

Server-side mutation functions callable from forms and Client Components. Declared with `'use server'` — either file-level (all exports are actions) or inline (function-level).

```ts
// app/actions.ts
'use server'
import { auth } from '@/lib/auth'
import { deletePost as dalDeletePost } from '@/data/posts'
import { revalidatePath } from 'next/cache'

export async function deletePostAction(postId: string) {
  await dalDeletePost(postId)  // DAL handles authn + authz
  revalidatePath('/posts')
}
```

Calling an action:

```tsx
// From a form (progressive enhancement works without JS)
<form action={deletePostAction}>
  <input type="hidden" name="postId" value={post.id} />
  <button>Delete</button>
</form>

// From a Client Component
'use client'
import { deletePostAction } from '@/app/actions'
async function onClick() { await deletePostAction(id) }
```

Actions callable from Client Components are imported like any other module — the bundler replaces the body with an RPC stub.

---

## Server Action Security Rules

Read these as a list of things that **will** ship vulnerable if ignored. A Server Action is **a public HTTP endpoint**, not "just a function":

1. **Authenticate inside every action.** Page-level auth checks do **not** protect actions — an attacker can call the action directly via POST. `auth()` / session check inside every action body, without exception.

2. **Authorize per resource (IDOR prevention).** "Logged in" ≠ "allowed to delete this post." Every action that touches a resource by ID verifies the caller owns or can act on that specific resource.

3. **Validate all inputs.** `formData.get('x')` returns unknown data. Parse with Zod / Valibot / similar. Never trust `searchParams`, `params`, `headers`, or form fields.

4. **Control return values.** Returns are serialized to the client. Return minimal DTOs, never raw DB rows — you'll leak internal fields you forgot existed.

5. **Move logic to the DAL.** Keep `'use server'` files thin — auth + validate + delegate to DAL, revalidate + return. The DAL does the real authz + DB work with `import 'server-only'`.

6. **Rate-limit expensive actions.** Email sends, payment triggers, file uploads. An unprotected action is a free amplification.

7. **Don't rely on closure encryption for secrets.** Closed-over variables are sent to the client and back, encrypted with a per-build key. They're recoverable in practice — don't put secrets there.

8. **Configure `allowedOrigins` behind reverse proxies.** Next.js checks Origin vs Host by default for CSRF. If your production domain differs from the Host header (common with proxies), set `experimental.serverActions.allowedOrigins` in `next.config.js` or requests will be rejected — or worse, let through if misconfigured.

9. **Never mutate during render.** Don't set cookies or call `revalidatePath` from a Server Component's render path. Mutations go in actions. Next.js explicitly blocks this to prevent accidental CSRF-via-GET.

10. **Unused actions are dead-code-eliminated.** Good. But "unused" means "not referenced anywhere" — if an action is imported but never actually called, it still ships as a public endpoint. Delete dead actions.

---

## Revalidation & Caching

- `revalidatePath('/posts')` — invalidate all cached data for a route
- `revalidateTag('tag-name')` — invalidate fetches tagged with a matching tag (set via `fetch(url, { next: { tags: ['tag-name'] } })`)
- `redirect('/path')` — throw from a Server Action or Server Component to redirect; must be thrown, not returned
- `cookies()` / `headers()` — request-scoped; available only on the server; using them makes the route dynamic (uncached)

Call `revalidate*` **after** the mutation in the action, before returning. Before → you revalidate stale data.

---

## Common Pitfalls

- **Passing the full DB record as a prop to a Client Component** → all fields end up in the RSC payload, readable in browser dev tools. Strip to DTO.
- **Using `process.env.API_KEY` in a module imported by a Client Component** → becomes `""` at build; fetch fails at runtime with no clear error.
- **Adding `'use client'` at the top of a big page** → everything it imports joins the client bundle. Keep the directive on leaf interactive components.
- **Missing auth in a Server Action** because "the page already checked" → actions are separately callable. Re-check in the action body.
- **Missing IDOR check** → `deletePost(id)` that only checks login, not ownership. Anyone with an account can delete anyone's post.
- **Trusting `searchParams`** directly for authz decisions (`?isAdmin=true`). Never. Re-derive from the session.
- **Mutations in render** → setting cookies or revalidating from a Server Component's render body. Use actions.
- **Context providers wrapping `<html>`** → forces whole document to re-render on provider state change. Wrap around `{children}` instead.
- **`fetch` not cached when you thought it was** → fetch is uncached by default in current Next.js; opt in explicitly via `use cache` or `next.revalidate`.
- **Dynamic vs static rendering confusion** → using `cookies()` / `headers()` / uncached `fetch` makes a route dynamic. Surprise dynamic rendering = production cost spike. Use `<Suspense>` to isolate dynamic regions.
- **Third-party client-only component imported into a Server Component** → crashes. Wrap in a `'use client'` re-export module.
- **Action return value accidentally serializes a Prisma / Drizzle class instance** → fails silently or leaks internals. Return plain objects.

---

## Pre-merge Checklist

Before merging any feature that touches data or server-side logic:

- [ ] **Server-only modules marked** — data files have `import 'server-only'` at the top
- [ ] **Every Server Action authenticates** inside its body (not relying on page-level auth)
- [ ] **Every Server Action authorizes** per-resource (ownership / role check for the specific ID)
- [ ] **Every Server Action validates** inputs with a real schema (Zod / Valibot), not raw casts
- [ ] **Return values scrubbed** — actions and DAL return DTOs, not full DB records
- [ ] **No secrets passed as props** to Client Components
- [ ] **No `process.env` in files reachable from Client Components** (only in DAL / `'use server'` / `'use cache'` modules)
- [ ] **No `NEXT_PUBLIC_` prefix on secrets** — check recently added env vars
- [ ] **`'use client'` placed on smallest possible leaves** — not at the top of pages / large layouts
- [ ] **Context providers wrap `{children}`**, not the `<html>` shell
- [ ] **`searchParams` / dynamic route `params` validated** before use in auth decisions or DB queries
- [ ] **`revalidatePath` / `revalidateTag` called** after mutations
- [ ] **Dynamic routes intentional** — know which routes use `cookies()` / `headers()` / uncached fetch
- [ ] **No mutations in render** — cookies set and cache invalidated only in actions
- [ ] **`allowedOrigins` configured** if deployment uses a reverse proxy
- [ ] **Dead actions deleted** — unused exports in `'use server'` files ship as public endpoints if referenced anywhere

---

## Auditing Quick Reference

When reviewing a Next.js PR:

- **`'use server'` files**: Is auth checked inside each action? Authz per resource? Inputs validated? Return values scrubbed? Delegates to a `server-only` DAL?
- **`'use client'` files**: Are prop types overly broad (accepting full records)? Does it receive secrets-shaped values?
- **`app/[param]/...`**: Are dynamic route params validated before use?
- **`route.ts` and `middleware.ts` / `proxy.ts`**: High-privilege surfaces — spend extra time here.
- **`data/` or DAL directory**: Is `import 'server-only'` at the top? Is `process.env` contained here?
