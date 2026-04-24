# Engineering Principles

## Respect the Existing Stack

Before introducing anything — library, pattern, file layout — check if the codebase already has it. "I'll just pull in lodash" is wrong if the project has been deliberately stdlib-only for three years.

## Language-Level Hard Rules

Per-language footguns collected in [stack-footguns.md](stack-footguns.md). Read the relevant section before writing code in a language you haven't touched in this codebase yet. Highlights:

- **No swallowed exceptions.** `try: ... except: pass` is almost always wrong.
- **No N+1 queries.** ORM inside a loop → step back and bulk it.
- **No shared mutable state across async boundaries.** Any value crossing an `await` is potentially stale.
- **No secrets in logs.** Not even at debug. Redact at the logging layer.
- **No unbounded retries.** Every retry loop has max attempts *and* max total duration.

These have each shipped production incidents somewhere. Treat as invariants.

## File Management

- **Co-locate by feature, not by type.** New feature → new directory; don't scatter across `controllers/` `services/` `models/`.
- **Split when cohesion drops, not at a line count.** 800-line files that do one thing are fine; 200-line files that do three aren't.
- **Append-only migrations.** Never edit a migration that has run against any shared environment.
- **Feature flags over forked files.** Toggle with a flag; don't create `handler_v2.py`.
- **No dead code.** Git preserves history; your repo shouldn't.

---

## Aim to Bore

Correctness and readability dominate. Cleverness is a liability. If two approaches solve the problem and one is more boring, pick that. The reviewer next week (possibly you) will thank you.

## Avoid Engineering Clichés

- **Premature Factory / Strategy / Builder** for a single concrete implementation. Ship the concrete thing; abstract on the third use.
- **Wrapper classes around stdlib primitives** that add no behavior. `class MyLogger: def log(self, m): logging.info(m)` is negative value.
- **Defensive null checks for unreachable branches.** Tells the reader "I don't understand this code."
- **`console.log` / `print` debug noise.** Remove before commit. Use real logging with levels.
- **Fabricated metrics / benchmarks in comments.** "~5× faster" with no measurement is a lie you'll regret.
- **Placeholder TODOs with no issue link.** `# TODO(#1234): handle partial batch` is actionable; bare `# TODO` rots.
- **Over-mocked tests** that pass regardless of code behavior. If mocking everything makes the test green, it isn't testing anything.
- **Versioned names in-source** (`UserServiceV2`, `handlerNew`). Rename, delete, or keep one name.
- **Catch-all error handlers that log-and-swallow.** Propagate or handle with intent.

## Comment Rules

**No comments by default.** Only when the WHY is non-obvious: hidden constraint, subtle invariant, workaround for a specific bug, surprising behavior.

- ❌ Explaining WHAT the code does — identifiers already do that
- ❌ "Added for the webhooks flow" — belongs in the PR description
- ✅ "Deliberately retry on 429 without backoff — rate limiter replies with Retry-After" — a WHY not in the code
- ✅ "Must run before `migrate_users_batch` — see incident 2026-02-14" — non-obvious ordering invariant

## Fail Loudly > Silent Stub

When a component isn't implemented, crash fast with a clear message. A silent dummy return is worse than a stack trace.

- Missing impl → `raise NotImplementedError("X not implemented for Y case")`
- External call that might fail → propagate; don't swallow into a sentinel
- Config missing → fail at startup, not mid-request with a confusing `None`
- Unknown enum variant → exhaustive match that raises on unknowns
- Migration without rollback → forbidden. Every migration has `down()`.

A loud failure signals real work needed and gets caught in CI/staging. A silent stub ships to prod.

## Appropriate Complexity

| Context | Minimum Structure |
|---|---|
| Throwaway script | 1 file, inline config, `print` is fine |
| Internal tool | Lint + tests + simple CLI |
| Shared library | Stable public API, semver, documented edge cases |
| Production service | Layered (handler / service / repo), observability, flags, rollback |
| Multi-tenant SaaS | All of above + tenant isolation, rate limiting, audit logs |

Match complexity to context. Neither throwaway-gold-plating nor service-corner-cutting.

## Content Principles

- **No filler code.** Every abstraction must earn its place.
- **Three uses before abstracting.** Two similar things are fine.
- **Don't design for hypothetical future requirements.** YAGNI.
- **Delete aggressively.** Unused imports, dead branches, stale TODOs.
- **Trust internal code.** Validate at boundaries; don't re-validate what the type system enforces.

---

## Cross-Cutting Concerns

Apply to nearly every feature. Decide posture in Stage 3, revisit in Stage 7.

### Test Strategy

- Pick the mix: unit (fast, isolated), integration (real seams you own), e2e (full stack, sparingly). Integration catches most real bugs; unit catches most regressions.
- **Mock only what you own.** Mocking the DB usually lies; mocking a third-party HTTP boundary is fine.
- Cover: happy path, one failure per error class, empty / boundary / duplicate inputs, authz denial, concurrent mutation if applicable.
- Fixture data ≠ fabricated data. Realistic shapes — empty strings where users submit emoji hide real bugs.
- Tests only passing because of mocking aren't testing the code.

### Migration & Compatibility

- **Expand → migrate → contract**: add new column/table, dual-write, backfill, cut reads over, remove old.
- Every migration has `down()`. Untested downs aren't reversible — verify in staging.
- Zero-downtime requires old code to keep working mid-migration. No breaking schema changes without a dual-write window.
- Long backfills run out-of-band, not in the migration transaction.

### Security

- Validate / sanitize at the trust boundary (HTTP handler, message consumer, CLI arg parse). Internal code trusts internal code.
- Authz *per action*, not per endpoint. "Logged-in" ≠ "allowed to do this".
- Secrets via env or secret manager; never hardcoded, never in logs.
- Parameterized queries always. String-interpolated SQL is never acceptable.
- CVE scan before new dep. Pin versions; review lockfile diff on upgrade.

### Observability

- Structured logs with request/trace ID, user/tenant ID (hashed if sensitive), feature flag state. Enough context to debug without a repro.
- Metrics: counter for the action + histogram for duration. Error-class breakdown on anything that fails.
- Traces across service boundaries. A single request should be followable end-to-end.
- Alert on user-visible symptoms (error rate, latency), not internals (CPU) unless they directly cause symptoms.

### Rollout

- Feature-flag anything risky. Flag name in the Stage 3 plan; kill-switch documented.
- Canary: small % → monitor error rate + latency → expand. Rollback trigger defined *before* launch.
- Dark-launch mutations (write new path, read old) when correctness > speed.
- Flag cleanup has an owner and a date. Stale flags are debt that compounds.

### Concurrency & Consistency

- Idempotency keys on all non-trivial mutations. At-least-once is reality — design for reruns.
- Transaction boundaries explicit. Long tx lock rows and hurt throughput; short tx risk lost-update — pick deliberately.
- Race windows: name them. "Between check and write there's a 5ms window where X can happen" — shrink with an atomic op or accept with documented reconciliation.
- Distributed locks are usually wrong. Ask whether the data model can absorb the conflict (unique constraints, optimistic locking, CRDTs, event sourcing).

### Error Contract

Define per feature:

- What's **recoverable** (retried by caller / job system)
- What's **terminal** (surfaced to user with actionable message)
- What's **internal-only** (logged with full context, user sees generic 500)

Good error contract = user always gets actionable message, operators always have enough context to debug, retries are never silent or infinite.

---

## Variant Exploration (Stage 3 Architecture Options)

Explore 2–3 approaches that differ on a real axis — don't generate trivial variants for show:

1. **Minimal-diff / pragmatic** — smallest footprint, maximum reuse of existing patterns
2. **Clean / principled** — new module boundary, clearer seams, higher ceiling but more code
3. **Bold / novel** — different paradigm (event-sourced, stream-based, state machine) where it genuinely fits

**Present trade-offs, recommend one.** The manager wants your reasoning and one clear recommendation — not a blind pick between N options. Architect subagent prompts in [agents.md](agents.md).

---

## Feature Flags

Use flags to expose risky or variant behavior rather than forking files. Default: kill-switch for anything touching shared state or external systems.

- Name: `feature.<area>.<thing>` — searchable, hierarchical
- Default: the *safe* behavior (usually off)
- Type: boolean for kill-switches, enum for strategy, percentage for canary
- Document in the plan: name, default, rollout plan, cleanup owner + date
- Every flag has a death date. "Temporary" flags that live two years are a smell.

Flags exist to **reduce blast radius**, not to showcase alternatives. Don't add one for every trivial choice — each is a conditional to test, monitor, and eventually clean up.

---

## Dependency Discipline

**Default: use what's already in the codebase.** A new dependency must pay rent.

Before adding a library, ask:

1. Is there already a dep that does this? (Search the lockfile, not memory.)
2. Can stdlib / framework do this acceptably?
3. Is the library actively maintained? License compatible? Last release in last 12 months?
4. What's the transitive closure? A 5KB library pulling 40MB of deps is not a 5KB library.
5. CVE posture? Any known issues in recent versions?

Reject libraries for one-liner needs. `left-pad` is the canonical warning. When justified, pin the version exactly and review the lockfile diff on upgrade — transitive surprises live there.

---

## Working with the Manager

The user is your engineering manager. You are the senior engineer on the task. That means:

- **You own technical decisions — but they land in the plan for approval, not straight into code.** Library choice, file layout, test mix, error-type shape, internal abstractions — decide and document them in the Stage 3 technical plan. The manager approves the plan as a whole before Stage 5. Never skip the plan-approval gate because "it's just technical."
- **Escalate product and blast-radius decisions**, not engineering ones. "Should this field be nullable?" has product implications; "should this repo method return `Result<T, E>` or throw?" usually doesn't.
- **Every question carries a recommendation.** Format: "I recommend X because Y. Confirm or override?" — not open-ended "which do you prefer?". A manager answering a bare option list is a sign you didn't do your job.
- **Push back when the manager is technically wrong.** State the risk in their terms (delivery time, rollback cost, blast radius, maintenance burden). Propose the alternative. If they still want it after hearing the risk, defer and document the decision.
- **Show WIP early.** Walking skeleton with stubs + failing tests beats a polished v1 — managers course-correct on shape, not syntax.
- **Explain in engineering language** ("split the tx boundary to keep writes under 10ms"), not buzzwords. Managers read specifics.
- **Ambiguous feedback** → ask one pointed clarifying question with your best guess attached. Don't ping-pong a list.
- **Summarize like a standup update**: decisions made, files touched, risks remaining, next step. The diff speaks for itself — don't recap line-by-line.

---

## Frontend Engineering (core rules)

Product UI inside an existing codebase. Component that looks like the rest of the app and behaves correctly in every state. Full patterns in [frontend-craft.md](frontend-craft.md).

### Match the Existing Visual Vocabulary

Before the first line of JSX / HTML:

- **Use existing design tokens** (CSS vars, theme, Tailwind config). Don't hardcode colors, fonts, spacing, radii, shadows.
- **Reuse existing primitives** (Button, Input, Modal, Table). Don't rebuild Button because you didn't look.
- **Copy layout conventions** from an adjacent page.
- **Follow the motion convention** — or the absence of one.

A new component that looks nicer than the rest of the app is as wrong as one that looks worse.

### State Matrix Coverage

Every interactive component ships with all applicable states:

- **Default** — nothing happening
- **Loading** — skeleton / spinner / disabled input
- **Empty** — informative empty state, not a blank box
- **Error** — actionable message with recovery path
- **Hover / focus / active / disabled** — works with mouse and keyboard
- **Partial / stale** — optimistic update in flight; old data still showing

Write states in that order. Happy path is the easy part.

### Accessibility Is Not Optional

- **Every input has a label** via `for`/`id` or `aria-label`. Placeholder ≠ label.
- **Keyboard nav works.** Logical tab order, Escape closes modals, Enter submits forms, focus trapped in modals and restored on close.
- **Focus is visible.** Don't remove the ring without replacing it.
- **Color is not the only signal.** Error states use text + icon, not just red.
- **Semantic HTML first.** `<button>` for actions, `<a href>` for navigation, landmarks. `<div onClick>` is almost always wrong.
- **Contrast meets WCAG AA** (4.5:1 body, 3:1 large text and UI elements).

### Performance Hygiene

- **No layout shift on load.** Reserve image dims, skeletons match real layout.
- **No waterfalls.** Parallelize independent fetches; server-render / prefetch where possible.
- **Debounce / throttle** user-driven effects (search, resize, scroll).
- **Memoize deliberately, not reflexively.** `useMemo` on cheap computations is negative value; use to fix measured re-render hotspots.
- **Bundle size matters.** Check bundlephobia before adding a client-side lib.

### Avoid Frontend Clichés

- **Generic AI aesthetics** (purple-pink gradients, Inter everywhere) when the host has a real identity
- **Scroll-jacking, aggressive animations, unnecessary parallax** in a product UI
- **Icon-only buttons without accessible names**
- **Modals stacked three deep** — reconsider the flow
- **Fake skeletons** that flash for 50ms — either fast enough to skip, or match final layout
- **Custom dropdowns / date pickers** when the native element works — custom must justify itself
- **Sticky everything** — leaves no content
