# Workflow

Staged and interruptible. You are the senior engineer; the manager is your engineering manager. Stop at each checkpoint for the manager to confirm **direction** (requirements, plan, verification sign-off) — not every technical detail. Purely technical choices are yours to make. Use TodoWrite to track stages and progress.

## Stage 0: Setup

1. Read the request. If the request is empty, scan `plans/` for an existing implementation plan (e.g. `notifications-plan.md`) and ask the manager whether to work on the next pending stage or pick a specific one.
2. Check memory for prior work on this feature area.
3. Check for existing decision logs at `plans/technical-decisions.md` and `plans/design-decisions.md`. If either exists, read it and note decisions already resolved — these do not need to be re-asked.
4. Create a todo list covering all stages below.
5. Ask the manager two questions via AskUserQuestion (one call, two questions):
   - **Questioning mode**: Quick / Normal / Grill Me (see [Questioning Modes](#questioning-modes))
   - **Log Mode**: On or Off (if a decisions file already has entries for this feature, suggest On)

## Stage 1: Understand Requirements

Whether and how much to ask depends on context. **Do not mechanically fire off a long list of questions every time.**

| Scenario | Ask? |
|---|---|
| "Fix this bug: null deref at line 42" | ❌ Enough — read the code, fix |
| "Add a notifications panel" (no schema, no UX, no audience) | ✅ Ask extensively: entities, triggers, delivery channels, retention |
| "Use this ADR to add the webhooks feature" | ❌ Enough info — read the ADR and start |
| "Make the importer faster" | ⚠️ Ask only about acceptable trade-offs (memory, concurrency) |
| "Add a CLI command to re-index users" | ✅ Ask about idempotency, batch size, failure handling |
| "Refactor this module to use the new repo pattern" | ❌ Read the pattern, rewrite |

Key probes (pick as needed — no fixed count):

- **Feature intent**: user problem, trigger, success criterion, failure behavior
- **Data contract**: entities / fields / relationships; persistent vs ephemeral; authoritative source
- **API surface**: new endpoints / events / methods; callers; request/response shape; idempotent?
- **Edge cases**: empty / partial / duplicate / concurrent / failure — expected behavior per case
- **Non-functional**: latency budget (p50/p99), throughput, auth, retention, observability
- **Rollout**: feature-flagged? dark-launched? backfill? rollback?
- **Out of scope**: explicit non-goals to guard against scope creep

If the codebase can answer it, answer it yourself.

## Stage 2: Gather Code Context (by priority)

Good engineering is rooted in existing patterns. **Never start from thin air.** Priority order:

1. **Resources the manager proactively cites** (specific files, PRs, ADRs, issues) → read them thoroughly
2. **Similar features already in the codebase** → trace full implementation: schema, service, API, consumers
3. **Repo conventions** (lint config, test patterns, existing abstractions, directory layout) → extract the implicit contract
4. **Framework / stdlib idioms** → prefer built-ins over hand-rolled
5. **Starting from scratch** → tell the manager "no reference will affect the quality ceiling" and establish a temporary convention grounded in stdlib / framework idioms

> **Source ≫ Docs**: When both documentation and source exist, invest in reading the source. READMEs drift; code doesn't lie.

Launch 2–3 Explorer subagents in parallel for non-trivial features. See [agents.md](agents.md) for Explorer prompts. Read key files yourself — don't trust summaries blindly.

Present findings back to the manager: patterns discovered, abstractions to reuse, conventions to follow, follow-up questions the codebase revealed.

### When Adding to an Existing Module

Far more common than greenfield. **Understand the existing vocabulary first, then act** — think out loud so the manager can validate your reading:

- **Error handling**: throw / Result / tagged unions? How do errors propagate? Logging convention per boundary?
- **Data access**: direct ORM, repository pattern, query objects? Transaction boundaries? N+1 avoidance?
- **Dependency injection**: constructor, module-level singletons, framework-managed? Where does config land?
- **Testing style**: unit + integration, integration-heavy, snapshot-led? Mocked vs real? Fixtures or factories?
- **Observability**: structured log fields? Metrics convention? Tracing?
- **Config & feature flags**: where do flags live? How is config loaded? Naming convention?

For UI work, extract the **visual vocabulary** before writing a component:

- **Design tokens**: color, typography, spacing, radius, shadow — CSS variables, theme object, Tailwind config, hardcoded? Source of truth?
- **Component library**: which primitives exist (Button, Input, Modal, Table, Toast)? Naming, slot / composition pattern, variant API?
- **Layout patterns**: grid / flex, container widths, breakpoints, density
- **State patterns**: server state (React Query / SWR / Redux / Zustand)? Client state? Form state?
- **Routing & data loading**: loader pattern, streaming vs suspense, error boundaries, not-found
- **Feedback patterns**: success / error / loading / empty — toasts, inline banners, skeletons?
- **Motion**: used at all? Easing / duration? CSS vs library?
- **Accessibility**: ARIA conventions, keyboard nav expectations, focus management, label associations

Newly added code — backend or frontend — should be **indistinguishable from the originals**. See [frontend-craft.md](frontend-craft.md) for the full frontend context-gathering guide.

## Stage 3: Declare the Technical Plan Before Writing Code

**Before writing the first line of code**, articulate the plan in Markdown and let the manager confirm:

```markdown
Technical Plan:
- Feature intent: [one sentence]
- Data model: [new tables / columns / indexes, or "none"]
- API surface: [new routes / methods / events, with shapes]
- Modules affected: [list]
- UI surface (if any): [routes / pages / components; key states: loading/empty/error]
- Error contract: [recoverable / user-visible / internal-only]
- Test strategy: [unit / integration / e2e mix, key cases]
- Observability: [logs / metrics / traces to add]
- Feature flag: [name, default, rollout plan]
- Migration plan: [expand → migrate → contract, reversibility]
- Out of scope: [explicit non-goals]
```

For non-trivial architecture decisions, launch 2–3 Architect subagents in parallel (minimal / clean / pragmatic / bold) — see [agents.md](agents.md). Review all approaches, form your own recommendation, present trade-offs, ask which to proceed with.

**Do not skip this stage.** A 10-minute plan catches days of rework.

## Stage 4: Walking Skeleton (v0)

**Don't hold back for a big reveal.** Before filling in full logic, wire the end-to-end skeleton:

- Stub handler that parses input, returns a hardcoded response with the right shape
- Empty persistence layer with right method signatures (raising `NotImplementedError` or equivalent)
- One failing integration test that exercises the full path
- Migration scaffolded (reversible, not yet run against prod)

Goal: **let the manager course-correct early** on shape, names, and boundaries. Wrong return type or misplaced endpoint shows up in 20 min instead of 2 days. A skeleton with stubs beats a polished v1 built in the wrong direction.

## Stage 5: Full Build

**DO NOT START WITHOUT EXPLICIT MANAGER APPROVAL OF THE PLAN.** This is the hard gate: the Stage 3 technical plan — including every autonomous decision you made — must be acknowledged and approved before any implementation code is written.

Fill in the logic layer by layer. Update todos as you go. Follow [principles.md](principles.md) and the relevant shape in [feature-shapes.md](feature-shapes.md).

If an important decision point arises mid-build (library vs hand-roll, sync vs async, inline state vs context), pause and confirm — don't silently push through. Log the decision if Log Mode is on.

**UI work within this skill**: build components using existing design tokens and primitives. Cover the full state matrix — loading, empty, error, disabled, hover, focus, keyboard-only — not just the happy path. See [frontend-craft.md](frontend-craft.md).

## Stage 6: Unit Tests

Dedicated testing stage. Ideally tests are drafted alongside the Stage 5 build (TDD-adjacent: write the test, watch it fail, make it pass, refactor) — but even when written after, they ship in the same feature, not a follow-up PR.

**Coverage bar** (match the mix agreed in the Stage 3 test strategy):

- **Happy path** — one test per public entry point (endpoint, service method, component interaction)
- **One failure per error class** — validation failure, authz denial, not-found, upstream timeout, conflict — each distinct error path gets a test
- **Boundary inputs** — empty list, single item, max size, unicode / emoji, null where allowed, whitespace-only
- **Duplicate / idempotent reruns** — mutation with the same input twice does not corrupt state
- **Concurrent mutation** — if applicable, a test that two writers hitting the same row don't violate an invariant
- **Authz per resource** — not just "logged in can access" but "user A cannot read user B's data"

**Testing style rules** (from [principles.md](principles.md#test-strategy)):

- **Mock only what you own.** Don't mock the DB if the project has a real test DB pattern; don't mock an internal service that has a test double already.
- **Fixture data must be realistic.** Empty strings where real users submit emoji hide real bugs.
- **Tests that only pass because of mocking aren't testing the code.** If removing the mocks makes the test trivially green, the test is theatre — rewrite.
- **Match the codebase's existing test style.** Same runner, same helpers, same naming (`test_foo` vs `it('foos')`), same fixture / factory pattern. New tests should read like the old ones.
- **Deterministic.** No real clocks, no real randomness, no real network. Inject seams or use the codebase's existing fakes.
- **Fast.** Unit tests run in milliseconds, not seconds. If a test is slow, it's probably an integration test — label it so.

**Frontend unit tests** (when applicable): behavior, not markup snapshots. Assert on what the user sees (roles, labels, text) via Testing Library or the codebase's equivalent, not on component internals or class names. Cover the state matrix — loading, empty, error, disabled — not just the happy render.

**Out of scope for this stage**: integration tests against real systems, e2e tests, manual QA. Those belong in whatever flow the codebase already has (typically a separate `integration/` or `e2e/` directory with its own runner).

All tests must pass locally before Stage 7. A test you've written but not run is not a test.

## Stage 7: Verification

Two parts, in order:

1. **Automated quality passes** (ask user via AskUserQuestion):
   - **Simplification pass** — redundancy, DRY, complexity. Report by severity; ask what to fix now vs defer.
   - **Review pass** — 3 Reviewer subagents in parallel (simplicity / bugs / conventions & security). See [agents.md](agents.md). Surface highest-severity issues.
2. **Pre-delivery checklist** — walk [checklist.md](checklist.md) item by item.

## Stage 8: Summary

Mark all todos complete. Summarize only what matters: key decisions, files modified, migration status, feature-flag name, suggested follow-ups. If Log Mode is on, finalize the log.

---

## Questioning Modes

All modes share two rules: **every question carries your recommendation + reasoning**, and **if the codebase can answer it, answer it yourself** — don't waste manager time on lookups.

**Quick Mode** (default for experienced managers) — decide autonomously on all technical choices. Only ask about product / blast-radius decisions that genuinely need manager input. Summarize autonomous decisions in Stage 3 and ask for a single go/no-go confirmation before Stage 5.

**Normal Mode** — escalate each major decision area (data model, API shape, error handling, edge cases, rollout) as a recommendation to confirm. One AskUserQuestion at a time, always leading with "I recommend X because Y" — never a bare option list.

**Grill Me Mode** — when the manager wants to stress-test the plan. Walk every branch of the decision tree: state your recommendation, the reasoning, the alternatives you rejected and why, then ask for confirmation. Still one question at a time.

**Escalation test**: before asking, ask yourself "would a senior engineer on a real team ping their manager about this?" If not, decide it.
