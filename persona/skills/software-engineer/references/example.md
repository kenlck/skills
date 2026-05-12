# Worked Example: `/users/:id/notifications` Endpoint

A walk-through of Stages 0–7 for a representative backend feature in an existing Node.js + Express + Drizzle + Postgres codebase. The codebase already has a `users` table, an authenticated session middleware, and an established `services/` + `repositories/` + `handlers/` pattern. There is no notifications system yet.

The manager's request:

> "Let's add an endpoint that returns a user's recent in-app notifications. List view only for now — read/dismiss can be a follow-up."

Pencil through how the workflow plays. Time annotations are rough order-of-magnitude.

---

## Stage 0: Setup (≈ 3 min)

1. **Load TodoWrite** via ToolSearch.
2. **Check memory**: `mem-search "notifications"` returns nothing relevant — first time touching notifications.
3. **Resume check**: `git status` clean; no `plans/notifications-plan.md` exists. Fresh start.
4. **Decision logs**: `plans/technical-decisions.md` exists with entries for unrelated features. Skim to confirm error-handling and observability conventions.
5. **Todo list** created: 8 stages, plus a "sync .claude copy" tail item.
6. **AskUserQuestion** (one call):
   - **Questioning mode**: "I recommend **Normal** because this is greenfield in this codebase — schema, API shape, and read semantics are all open. Confirm or override?" → Manager confirms Normal.
   - **Log Mode**: "Decisions file already has entries — suggest **On**." → Manager confirms On.

## Stage 1: Understand Requirements (≈ 8 min)

Stage 1 table check: greenfield feature, no schema, no UX. **Full gates**, not soft-gate lane.

Probes via three sequential AskUserQuestion turns (Normal mode = one decision area per question, each leading with a recommendation):

**Q1 — Data shape**: "I recommend a single `notifications` table keyed on `user_id`, with `id`, `user_id`, `kind`, `payload jsonb`, `read_at timestamptz null`, `created_at`. Index on `(user_id, created_at desc)`. Confirm or override?" → Manager: "Yes, add a `seen_at` separate from `read_at` — we may want a 'seen but not read' state."

**Q2 — Source of notifications**: "I recommend an internal `notify(user_id, kind, payload)` service function callable from any handler. No external producers yet. Confirm?" → Manager: "Yes."

**Q3 — Pagination + retention**: "I recommend cursor pagination on `created_at desc`, default limit 50, max 200; soft-delete after 90 days via background job (out of scope for this PR). Confirm?" → Manager: "Yes, but skip the retention job for now — note as follow-up."

Out-of-scope explicitly captured: read/dismiss endpoints, retention job, push delivery, email fallback.

**At close of Stage 1**, write `plans/notifications-plan.md`:

```markdown
# Notifications — In-App List

## Requirements
### Intent
Return a user's recent in-app notifications for the authenticated user.

### Data
notifications table: id, user_id, kind, payload jsonb, seen_at, read_at, created_at.
Index (user_id, created_at desc).

### API
GET /users/:id/notifications — cursor pagination, default 50, max 200.

### Edge cases
Empty list, unauthorized cross-user access, malformed cursor.

### Non-functional
p99 < 100ms (single indexed query).

### Rollout
N/A — additive feature, flag for safety: feature.notifications.enabled.

### Out of scope
Read/dismiss endpoints, retention job, push/email, notify() integration into existing handlers.
```

Log Mode entry appended to `plans/technical-decisions.md`: data model + `seen_at` decision.

## Stage 2: Gather Code Context (≈ 15 min)

1. **Codemap first**: `/ts-codemap` returns a structural index. Identifies `repositories/userRepository.ts`, `services/userService.ts`, `handlers/users.ts`, `db/schema.ts`, `middleware/auth.ts`. Notes Drizzle migrations live in `db/migrations/`.

2. **Specialized agents**: `feature-dev:code-explorer` not present in this env. Falls back to two parallel general-purpose Agent calls using prompts from `references/agents.md`:
   - **Similar features**: explorer reports the `comments` feature is the closest analog (per-user listing with cursor pagination, soft-delete, `created_at` index).
   - **Architecture & data layer**: explorer reports the repository pattern uses Drizzle query builders; transactions begin in service-layer methods via `db.transaction()`.

3. Read `comments` handler / service / repo end-to-end (3 files, ~250 lines). Pattern is clear.

Present findings to the manager:

> "Closest analog is `comments`. Repo pattern: Drizzle queries in `repositories/notificationRepository.ts`; service in `services/notificationService.ts`; handler in `handlers/notifications.ts`. Cursor pagination uses base64-encoded `{created_at, id}`. Errors are Result-typed (`Result<T, AppError>`). Logs via the project's structured logger. Tests are integration-heavy against a real test DB."

Manager confirms direction.

## Stage 3: Technical Plan + Hard Gate (≈ 10 min)

No need for Architect subagents — feature reuses an existing module pattern, no new module boundary, schema change is additive.

Plan appended to `plans/notifications-plan.md`:

```markdown
## Plan
### Feature intent
Authenticated user fetches their own recent notifications.

### Data model
New table `notifications` (cols above). New migration `0042_add_notifications.sql`.

### API surface
GET /users/:id/notifications?cursor=&limit=
Response: { items: Notification[], nextCursor: string | null }
401 if unauthenticated, 403 if user.id ≠ :id, 200 otherwise.

### Modules affected
- db/schema.ts (add table def)
- db/migrations/0042_add_notifications.sql
- repositories/notificationRepository.ts (new)
- services/notificationService.ts (new)
- handlers/notifications.ts (new)
- router.ts (mount route)

### UI surface
N/A: backend only.

### Error contract
- Unauthenticated → 401, generic message
- Cross-user access → 403, "not authorized"
- Malformed cursor → 400, "invalid cursor"
- DB failure → 500, internal-only log with request ID

### Test strategy
Integration tests against test DB:
- happy path: 0, 1, N items, cursor traversal
- authz: 401 (no session), 403 (other user's id)
- malformed cursor returns 400

### Observability
- Structured log per request with userId hash, item count, duration
- counter notifications_list_total, histogram notifications_list_duration_ms
- 5xx rate alerts via existing infra

### Feature flag
feature.notifications.enabled, default off. Cleanup owner: manager, date: +30 days.

### Migration plan
Additive only. New table, no backfill. Reversible: DROP TABLE notifications.
Expand → migrate (no contract needed; nothing reads the table before this PR).

### Out of scope
notify() producer integration, read/dismiss, retention job, push/email.

### Engineer objections
None.
```

**Hard gate**: present plan section-by-section in Normal mode. Manager confirms each. Approval granted.

Log Mode entry: feature-flag scheme decision.

## Stage 4: Walking Skeleton (≈ 20 min)

Feature adds a new external seam (endpoint) → walking skeleton path.

- `notificationRepository.ts` with `findByUser(userId, cursor, limit)` → returns hardcoded empty array
- `notificationService.ts` with `listForUser(userId, cursor, limit)` → calls repo, returns hardcoded shape
- `handlers/notifications.ts` with the GET route, authz check, calls service, returns hardcoded JSON
- Router mount + flag gate
- Migration file scaffolded with table def + reversible `down()`
- One failing integration test: `GET /users/:id/notifications` returns 200 with the hardcoded shape

`npm test` → integration test passes. Manager sees the shape, confirms.

## Stage 5: Full Build (≈ 45 min)

Fill in layer by layer:

1. Run migration against local DB. Verify with `\d notifications` in psql.
2. Repository: real Drizzle query with cursor + limit. Index hit verified by `EXPLAIN`.
3. Service: cursor encode/decode helpers, authz check moved to handler.
4. Handler: validates `:id`, checks `session.userId === params.id`, calls service, returns `{ items, nextCursor }`.
5. Wire structured log + metric.

**Mid-build pause** at trigger #2: while writing the repo, realize `created_at` collisions break the cursor on bulk-inserted rows. Pause:

> "Plan said cursor = `{created_at, id}`. Hit a case where two rows can have identical `created_at` (microsecond truncation in seed data). I recommend using `(created_at desc, id desc)` as the compound cursor — stable tiebreaker. One-line plan amendment. Confirm or override?"

Manager confirms. Plan amended. Log Mode entry.

Tests filled in: happy path, 0/1/N items, cursor walk, 401, 403, 400 on bad cursor. All green.

## Stage 6: Verification (≈ 15 min)

**Phase 1**:

AskUserQuestion: "Run `/simplify` and `/code-review` now, or defer?" → Manager: "Run them."

`/simplify` reports: one cursor-encoding helper duplicates a util in `comments`. Fix: extract to `utils/cursor.ts` and reuse. ~5 min.

`/code-review` reports two findings:
- **Medium**: handler returns 403 with a body that leaks "user X" — replace with generic "not authorized."
- **Low**: missing index hint on the `EXPLAIN` for `created_at desc` (correct, but worth a comment).

Both addressed.

**Phase 2** — pre-delivery checklist:

- [x] Migration `down()` tested against a local snapshot
- [x] Authz enforced per action (handler-level session check)
- [x] Error paths covered (401, 403, 400, 500 all tested)
- [x] Feature flag has cleanup owner + date in plan
- [x] Rollback documented in plan
- [x] No PII in logs — userId is hashed via existing helper
- [N/A] Focus / WCAG / labels / contrast — backend feature
- [x] No new N+1 queries — single indexed query

## Stage 7: Summary & Handoff (≈ 5 min)

Append to `plans/notifications-plan.md`:

```markdown
## As-built
### Deviations
- Compound cursor (created_at desc, id desc) — handled identical-timestamp tiebreak.
- Cursor helper extracted to utils/cursor.ts, shared with comments.

### Files modified
- db/schema.ts
- db/migrations/0042_add_notifications.sql
- repositories/notificationRepository.ts (new)
- services/notificationService.ts (new)
- handlers/notifications.ts (new)
- router.ts
- utils/cursor.ts (extracted)
- tests/notifications.spec.ts (new)

### Flag
feature.notifications.enabled — default off; cleanup +30 days, manager-owned.

### Migration
0042_add_notifications.sql; reversible; not yet run in prod.

### Follow-ups
- POST /users/:id/notifications/:id/read
- POST /users/:id/notifications/:id/dismiss
- Retention background job (90 days)
- notify() service producer + wire into existing handlers
```

PR description drafted:

```markdown
## Summary
- Adds GET /users/:id/notifications behind feature.notifications.enabled flag (default off)
- New notifications table + migration; additive, reversible
- Cursor pagination, integration-tested

## Test plan
- [x] Integration tests green locally
- [ ] CI green
- [ ] Manual smoke on staging behind flag
- [ ] Confirm migration runs cleanly on staging snapshot

## Rollback
1. Set feature.notifications.enabled=false (kill switch)
2. If schema must revert: `npm run migrate:down -- 0042`

## Flag
feature.notifications.enabled — default off; cleanup +30 days (owner: manager)
```

Log Mode entries finalized in `plans/technical-decisions.md`.

Chat summary (one paragraph):

> Shipped GET /users/:id/notifications behind a flag. Schema additive (0042), reversible. Cursor pagination with compound `(created_at, id)` tiebreaker — caught mid-build. Cursor helper extracted to shared util. All checklist items pass. PR ready to push; follow-ups for read/dismiss/retention/producer.

Todos all marked complete.

---

## What this example anchors

- **Soft-gate vs full-gate**: greenfield triggered full gates per Stage 1 table.
- **Plan as a single artifact**: Stage 1 reqs → Stage 3 plan → Stage 7 As-built all live in one `plans/notifications-plan.md`.
- **One hard gate**: the Stage 3 plan approval. No second gate before Stage 5.
- **Walking skeleton**: 20 minutes of stubs returning the right shape, caught the response contract before 45 minutes of real logic was wasted.
- **Mid-build pause trigger #2**: data-model shape needed to change (cursor design). Paused, amended plan, logged decision. Did not silently push through.
- **Ecosystem handoff**: `/simplify` and `/code-review` ran the Stage 6 phase 1, not inline subagents.
- **Trimmed checklist**: only items lint / CI don't catch.
