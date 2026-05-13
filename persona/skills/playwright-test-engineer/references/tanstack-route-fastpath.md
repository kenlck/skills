# Fast Path: Single Route → Playwright Spec

For the narrow ask "write a Playwright spec for this one route" — TanStack Start, Next.js, or Remix — skip the full Workflow and run this. Read the route file, derive the spec from real code, confirm before writing.

This bypasses Steps 1–4 of the main Workflow. Hard Rules and Push Back triggers still apply.

---

## Step 1: Resolve the route file

The user passes a route path or file path:

| Input | Resolution |
|---|---|
| `/dashboard` or `dashboard` | search `app/routes/**/*dashboard*`, `app/**/dashboard/page.{ts,tsx}`, `pages/dashboard.{ts,tsx}` |
| `app/routes/dashboard.tsx` | use directly |
| No argument | ask which route to target |

For TanStack Start, also check flat-route conventions: `_layout.dashboard.tsx`, `dashboard/index.tsx`, `dashboard/route.tsx`.

If multiple matches, list them and ask the manager to pick.

---

## Step 2: Read the route file

Read it fully. Extract:

**Framework-agnostic markers:**
- The URL path (from `createFileRoute('...')`, the file's location in `app/`, or `pages/`)
- Auth/redirect logic (loader, middleware, `<RequireAuth>` wrappers)
- The main rendered UI component
- Error boundaries / `errorComponent`

**In the component, identify:**
- Form elements: `<form>`, controlled inputs, `useForm`, `react-hook-form`
- Interactive elements: buttons, links, modals, dialogs
- Conditional rendering: empty states, loading states, auth-gated content
- Navigation: `<Link>` and `useNavigate` calls — what flows can fire from here

---

## Step 3: Read imported components (one level deep)

For each local import in the route file (starts with `./`, `../`, or `~/`), read it if it renders UI. **Skip:**

- UI primitive libraries: `@/components/ui/`, shadcn, Radix, Headless UI
- Third-party packages
- Pure utility/helper files

From each component, extract the same surface: form fields, buttons, server-fn calls.

---

## Step 4: Find server functions / route handlers

This is the single best source for what to test.

**TanStack Start:** look for `createServerFn` — same file or `app/server/[feature].ts`. For each:
- `.inputValidator()` reveals form field shapes + constraints (required, regex, etc.)
- Explicit `throw` or `try/catch` reveals error states to test
- Mutation (POST-like) vs. read

> TanStack Start always uses `.inputValidator()` — never `.validator()`. If you encounter `.validator()`, flag it as a bug.

**Next.js (app router):** look for `app/api/**/route.ts` and server actions (`'use server'` directives).

**Remix:** the route file's `action` and `loader` exports.

The validator schema → form fields. Error paths → edge cases to test.

---

## Step 5: Generate the spec

Always include:

1. **Page renders** — navigate and verify key headings/elements are visible
2. **Happy path** — if there's a form or primary action, test the full flow: fill → submit → verify outcome

Include when the code signals it:

3. **Empty state** — if the page renders a list/dashboard that can be empty
4. **Form validation** — if the validator schema has required fields or constraints
5. **Error state** — if server fns have explicit error handling, test that the UI surfaces it

**Spec template:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('[Route name]', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/[path]');
  });

  test('renders the page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '...' })).toBeVisible();
  });

  test('happy path: [main action]', async ({ page }) => {
    // fill form → submit → assert outcome
  });
});
```

Selector hierarchy (from Hard Rule #4): `getByRole` > `getByLabel` > `getByText` > `getByTestId` > CSS.

If Playwright MCP is available, prefer `browser_navigate` + `browser_snapshot` over guessing names from component source — see SKILL.md Step 5 for the pattern.

---

## Step 6: Confirm before writing

Show the full generated spec, then ask:

> Write this to `e2e/[route-name].spec.ts` (or wherever the project's specs live)? (yes/no)

If they want changes, revise first. Only write on confirmation.

If the project has a `tests/coverage-map.md`, also add the row for this route.

---

## When to bail out of the fast path

Exit and run the full Workflow if the ask escalates:

- "Now do the whole checkout flow across 5 routes" → full Workflow, coverage map
- "Audit our test suite" → Step 2 (Auto-detect)
- "Set up Playwright in this repo" → Greenfield mode
- The route depends on global setup (auth, seeded data) that doesn't exist yet → declare strategy first
