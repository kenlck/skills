# Pre-delivery Checklist

Complete before considering the work delivered. All applicable items must pass.

## Universal

- [ ] **Tests pass** locally (unit suite from Stage 6 green; integration tests where the codebase has them)
- [ ] **Unit-test coverage matches Stage 3 plan** — happy path, one failure per error class, boundaries, duplicate inputs, authz denial; no silent gaps
- [ ] **Lint + type checks** clean — no warnings suppressed without a comment explaining why
- [ ] **No secrets** committed — check diff for API keys, tokens, passwords, connection strings
- [ ] **No dead code** — unused imports, unreachable branches, stale TODOs removed
- [ ] **No platform footguns** from [stack-footguns.md](stack-footguns.md) for the language(s) touched
- [ ] **No engineering clichés** — Factory-for-one, wrapper-around-stdlib, fabricated benchmarks, over-mocked tests, generic AI aesthetics on UI
- [ ] **Follows codebase conventions** — file layout, naming, error handling, logging, component patterns match the neighbors
- [ ] **PR description** explains the why, not just the what

## Backend (when applicable)

- [ ] **No PII in logs** — names, emails, tokens, session IDs redacted or hashed
- [ ] **Authz enforced** per action (not just per route)
- [ ] **Error paths covered** — at least one test per error class, each returns an actionable message
- [ ] **Migration reversible** — `down()` exists and has been tested
- [ ] **Feature flag wired** for risky changes, with name + default + cleanup plan documented
- [ ] **Rollback documented** — if this breaks in prod, what's the exact revert path?
- [ ] **Observability** — request ID in logs, counter + histogram metric added, trace propagated
- [ ] **Perf budget respected** — p50/p99 within target; no new N+1 queries
- [ ] **Public API changes documented** — if the surface changed, docs / changelog reflect it

## Frontend (when applicable)

- [ ] **State matrix covered** — loading, empty, error visible and tested, not just happy path
- [ ] **Keyboard navigable** — tab order logical, Escape closes modals, Enter submits forms, no keyboard traps
- [ ] **Focus management correct** — focus restored on modal close, moved to first error on form submit failure, visible focus ring present
- [ ] **Labels on every input** — associated via `for`/`id` or `aria-label`, not placeholder-as-label
- [ ] **Semantic HTML** — `<button>` for actions, `<a href>` for navigation, landmarks used; no `<div onClick>`
- [ ] **Contrast meets WCAG AA** (4.5:1 body, 3:1 large text and UI elements)
- [ ] **Responsive at target breakpoints** — mobile / tablet / desktop if supported; no horizontal overflow
- [ ] **Design tokens used** — no hardcoded colors, fonts, spacing, radii; existing primitives reused
- [ ] **No layout shift on load** — images have dimensions, skeletons match final layout
- [ ] **Bundle cost justified** for any new client-side dependency

## Framework-Specific (when applicable)

- [ ] **TanStack Start** — DB client only in `.server.ts`; `createServerFn` has `.inputValidator()`; no secrets in loaders. See [tanstack-start.md](tanstack-start.md).
- [ ] **Next.js** — DAL files have `import 'server-only'`; Server Actions re-check authn + authz; no `NEXT_PUBLIC_` on secrets; `revalidatePath`/`revalidateTag` after mutations. See [nextjs.md](nextjs.md).
