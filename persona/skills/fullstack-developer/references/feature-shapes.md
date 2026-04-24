# Feature Shapes Reference

Different feature shapes have different invariants. Identify the shape first; the shape dictates the rules. Most non-trivial features touch multiple shapes — apply each relevant section. A full-stack feature often combines, e.g., CRUD Endpoint + Page + Form + Data Table.

## Table of Contents

**Backend:**
1. [CRUD Endpoint](#crud-endpoint)
2. [Background Job](#background-job)
3. [Data Model + Migration](#data-model--migration)
4. [External Integration](#external-integration)
5. [CLI Command](#cli-command)
6. [Library Public API](#library-public-api)
7. [Event Producer / Consumer](#event-producer--consumer)

**Frontend:**
8. [Page / Route](#page--route)
9. [Form](#form)
10. [Data Table / List](#data-table--list)
11. [Modal / Drawer / Dialog](#modal--drawer--dialog)
12. [Toast / Notification](#toast--notification)
13. [Dashboard / Data Viz](#dashboard--data-viz)

---

## CRUD Endpoint

Typical shape: HTTP handler → validation → authz → service → repository → DB.

**Must have:**

- **Input validation at the boundary** — schema validation (Pydantic / Zod / struct tags) on raw input before anything else runs. Reject malformed input with 400 + actionable message.
- **Authz per action**, not per route. `can_user_do(action, resource)` not `is_logged_in`.
- **Explicit transaction scope.** Start / commit / rollback visible in the service layer. Don't rely on an ORM's implicit auto-commit.
- **Idempotency on mutations** — either natural (PUT replacing a resource by ID) or explicit (idempotency key header). At-least-once delivery is reality.
- **Stable response shape** — document it, test it, version it if it ever changes.
- **Proper HTTP semantics**: 201 for created, 204 for no-content-delete, 409 for conflict, 422 for unprocessable, 429 for rate-limited, 5xx only for actual server failures.
- **No leak of internal errors** — user-facing message is actionable, internal detail logged with request ID.

**Avoid:**
- Business logic in the handler (belongs in the service layer)
- N+1 queries (bulk-load or join at the repository)
- Swallowed exceptions that return 200 with a success-shaped body on actual failure

---

## Background Job

Typical shape: queue consumer → parse message → do work → ack / retry / dead-letter.

**Must have:**

- **Idempotent by design.** Reruns are safe. If the job has already done its work, re-running produces the same final state (or explicitly no-ops).
- **Bounded retries with exponential backoff + jitter.** No retries-forever. After max attempts, dead-letter with full context.
- **Observable progress.** Counter for jobs-in / jobs-succeeded / jobs-failed, histogram for duration, log line per job with job ID and result.
- **Graceful shutdown.** On SIGTERM, finish the current job, don't start new ones, then exit. Long-running jobs have checkpoint-and-resume if the cost of redoing work is high.
- **Poison-message handling.** A message that crashes the worker must not take down the queue. Catch parse errors specifically, dead-letter the message, continue.

**Avoid:**
- Reading request-scoped state (no HTTP request context in a job)
- Unbounded memory use (stream / paginate rather than loading all records)
- Dependence on wall-clock ordering between jobs — if order matters, the queue needs FIFO guarantees or the job needs its own ordering logic

---

## Data Model + Migration

Typical shape: alembic / prisma / goose / sqlx migration → code change → deploy → backfill → cleanup.

**Must have:**

- **Expand → migrate → contract pattern** for any breaking change:
  1. *Expand*: add new column / table / index, nullable or defaulted so old code still works
  2. *Migrate*: dual-write new + old, backfill old rows in batches
  3. *Contract*: cut reads over to new, remove old column / table
- **Every migration reversible.** `down()` exists and has been executed in staging. A migration without a working down is a migration that's never fully tested.
- **Backfills out-of-band.** Large data rewrites run as a background job, not inside the migration transaction. A migration holding a table lock for 20 minutes is an outage.
- **No code change in the same PR as a breaking schema change.** Ship the expand migration, deploy. Then ship the code that uses it. Reverting the code doesn't break the DB.
- **Indexes before queries that need them.** Add the index in an earlier migration, deploy, *then* merge the query that relies on it.

**Avoid:**
- Editing a migration that has already run against any shared environment (stage / prod). Write a new one.
- Dropping a column while old code still reads it
- Assuming `NOT NULL` can be added in one step on a big table (it can't — default, backfill, then enforce)

---

## External Integration

Typical shape: call to a third-party HTTP API / SDK / webhook receiver.

**Must have:**

- **Explicit timeouts.** Connect timeout + read timeout, never infinite. Upstream hangs should not hang your service.
- **Retries with exponential backoff + jitter** on 5xx and idempotent operations. Respect `Retry-After`. Max attempts *and* max total duration.
- **Circuit breaker** when the upstream is persistently failing — trip, fail fast, half-open probe, recover. Prevents cascading failure.
- **Idempotency keys on mutations** — use the provider's mechanism if it has one (Stripe-style), or fabricate one from a request ID.
- **Separate config from code.** Endpoints, keys, timeouts in config. Switching to sandbox / prod is a config change.
- **Error mapping.** Translate provider-specific errors to your error contract at the boundary. Callers shouldn't know what the provider's error format is.
- **Graceful degradation.** If the integration is non-critical, the feature should degrade when the upstream is down, not 500.

**Avoid:**
- Hardcoded URLs, keys, or timeouts
- Blocking calls on hot paths (queue the work)
- Retrying non-idempotent operations without an idempotency key
- Trusting provider-sent webhooks without signature verification

---

## CLI Command

Typical shape: argv → parsing → validation → do work → exit.

**Must have:**

- **Clear exit codes.** 0 = success, non-zero = specific failure class. Document in `--help`.
- **Stdout for data, stderr for messages.** Piping `my-cmd | less` should show the data, not the progress bar.
- **`--help` that actually helps.** Synopsis, options with types and defaults, examples, exit codes. Not just the argparse auto-output.
- **`--dry-run` for destructive operations.** Show what would happen without doing it. Default to interactive confirmation when not in a pipe.
- **Sensible defaults.** Flags should not be required unless there's no reasonable default.
- **Readable when piped, human-friendly when tty.** Detect `isatty` — colors and progress bars off when piped.

**Avoid:**
- Silent success when nothing was done (print a summary: "0 records affected")
- Interactive prompts that hang in non-interactive contexts
- Reading config from ambient environment without documenting it

---

## Library Public API

Typical shape: a package other code depends on — internal shared library or external SDK.

**Must have:**

- **Stable surface.** Once public, breaking changes cost. Be conservative about what you expose. Prefer smaller surface area.
- **Semver discipline.** Breaking change = major. New behavior = minor. Fix = patch. Adhere even if nobody checks.
- **Documented edge cases.** What happens on empty input? On concurrent use? On network failure? Write it in the docstring, not just the code.
- **Deprecation before removal.** Mark deprecated in version N, warn at runtime in N+1, remove in N+2. Never silent removal.
- **No reaching into internals.** Clear public / private separation — prefix-underscore in Python, lowercase in Go, `_` or `#private` in TS, `pub(crate)` in Rust.
- **Thread / async safety documented.** Is this safe to call from multiple threads / tasks? State it explicitly.

**Avoid:**
- Exposing framework types in the public API (callers now depend on your framework choice)
- Changing parameter order in a minor version (add, don't rearrange)
- Silent behavior changes — if output changes, it's breaking

---

## Event Producer / Consumer

Typical shape: produce events to a topic / queue; consume events from a topic / queue.

**Must have:**

- **Event schema versioning.** Add fields, don't rename. Old consumers ignore new fields. Introduce new event types rather than breaking existing ones.
- **At-least-once semantics.** Consumers must be idempotent (or use an inbox table / dedup store with TTL).
- **Schema registry or shared contract.** Producer and consumer agree on the shape via code (shared types, protobuf, avro) not docs.
- **Poison-message handling** — see Background Job.
- **Dead-letter queue.** Everything has a terminal failure destination; nothing vanishes.
- **Consumer lag metric.** Monitor how far behind the consumer is. Sustained lag = outage.

**Avoid:**
- Consumers with side effects that can't be re-applied safely
- Mixing multiple event types on one topic without a type discriminator
- Relying on exactly-once delivery — it's a harder distributed systems problem than it looks

---

## Page / Route

Typical shape: route → data loading → layout → components → interactions.

**Must have:**

- **Data loading strategy** chosen deliberately: SSR / streaming / client-side. Match the framework's primary pattern (Next.js loaders, Remix loaders, TanStack Query).
- **Error boundary** — a route-level boundary that catches data-loading and render errors with a recovery path.
- **Not-found handling** — 404 for missing resources is a proper status and a user-facing page, not a crash.
- **Head / meta** — title, description, canonical URL, OpenGraph for shareable pages. Framework-appropriate (metadata export, Helmet, Head).
- **Initial loading state** — skeleton matching the final layout, not a generic spinner. No layout shift when data arrives.
- **Authz** — gate the route on both client (redirect) and server (enforce). Never trust client-side alone.
- **Keyboard-navigable** from landing — focus goes to a sensible target (first input, main heading, skip-to-content link).

**Avoid:**
- `useEffect` for initial data loading when the framework has a loader pattern
- Rendering the page before auth has resolved (flash of unauthorized content)
- Client-side route transitions that feel slower than a hard navigation — if it's slower, fix it or let the browser do it

---

## Form

Typical shape: fields → client validation → submit → server validation → success / error feedback.

**Must have:**

- **Client + server validation** with matching rules and messages. Client is UX; server is truth.
- **Disabled submit in-flight** with progress indicator. No double-submits.
- **Error feedback next to the offending field**, not just a banner. Scroll first error into view, focus it.
- **Success feedback** — decide the post-submit action (toast, redirect, inline confirm) and do it.
- **Label on every input**, associated via `htmlFor`/`id` or wrap. Placeholder ≠ label.
- **Autocomplete attributes** — `autocomplete="email"` / `"current-password"` / `"new-password"`. Essential for password managers.
- **Mobile keyboard hints** — `type="email"`, `inputMode="numeric"`, `enterKeyHint`.
- **Keyboard submit (Enter)** works from any field.
- **Required fields marked** with text + color, not just asterisk color.
- **Draft preservation** for long forms — localStorage or `beforeunload` warning.

**Avoid:**
- Validating on every keystroke (validate on blur + on submit)
- Generic error messages ("Invalid") — say what's wrong and how to fix
- Clearing the form on error (user loses their input)
- Custom date / select pickers when native works on target browsers

---

## Data Table / List

Typical shape: paginated / virtualized list of records with sort, filter, row actions.

**Must have:**

- **Pagination strategy** — cursor-based for large / frequently-changing datasets; offset for small / stable; infinite scroll only when navigation isn't needed.
- **Sort + filter in URL state** — shareable, bookmarkable, survives refresh. Use search params or framework-appropriate equivalent.
- **Loading state** with skeleton rows matching final row height. No layout shift when data arrives.
- **Empty state** — actionable message: "No results. Try adjusting filters." or "No X yet. [Create one]."
- **Error state** with retry.
- **Row actions** — consistent placement (right-aligned), keyboard accessible.
- **Keyboard row navigation** if the table is interactive (arrow keys move focus between rows, Enter opens).
- **Virtualization** (react-window, tanstack-virtual) when rendering > 200 rows.

**Avoid:**
- Loading all rows at once without pagination or virtualization
- Offset pagination on a dataset that changes frequently (page 2 misses inserted rows)
- Row action triggers that require hover to discover — make them visible or consistently placed

---

## Modal / Drawer / Dialog

Typical shape: overlay with focused content, blocks interaction with the page.

**Must have:**

- **Focus trap** — Tab cycles within the modal; doesn't escape to the page behind.
- **Focus restoration** — on close, focus returns to the trigger element.
- **Escape to close** (for non-critical modals; critical confirmations may ignore Esc).
- **Scroll lock** on body while open, so the modal isn't scrolling the page behind.
- **`aria-labelledby`** pointing at the title element; `aria-describedby` for the body if relevant.
- **`role="dialog"` + `aria-modal="true"`**.
- **Click outside to close** (non-critical only) AND a visible close button for clarity.
- **No nested modals.** If a modal spawns another, the flow is wrong — redesign.

**Use a primitive library** (Radix Dialog, React Aria Dialog, native `<dialog>`) rather than rolling your own — keyboard + focus + ARIA are too easy to get subtly wrong.

---

## Toast / Notification

Typical shape: transient message appearing in a corner, auto-dismissing.

**Must have:**

- **Auto-dismiss** with sensible duration (4–6s for info, 8s+ for error, manual-only for critical).
- **Pause on hover** so users have time to read.
- **Dismissible manually** with a visible close button.
- **Screen-reader announcement** via `role="status"` (non-urgent) or `role="alert"` (urgent). `aria-live` wrappers at the container.
- **Action slot** — optional button for undo / retry.
- **Stacking behavior** — new toasts don't cover old; old toasts dismiss or scroll when full.
- **Placement convention** matches the app (usually bottom-right, sometimes top).

**Avoid:**
- Toast as a replacement for form validation feedback (toast is transient; validation belongs inline)
- More than 3 visible at once (cascading failure floods the screen)
- Critical actions confirmed only by toast (a confirmation modal is often better for destructive ops)

---

## Dashboard / Data Viz

Typical shape: page of metrics, charts, and tables showing a system's state.

**Must have:**

- **Clear information hierarchy** — key metrics first (large, bold), supporting detail secondary.
- **Time range selector** with sensible defaults (last 24h / 7d / 30d / custom) and URL state.
- **Loading states per widget**, not one spinner for the whole page — users can read what's loaded while the rest catches up.
- **Empty and error states per widget** — one failing chart doesn't break the dashboard.
- **Chart library** that the codebase already uses (Recharts, Chart.js, Visx, D3). Don't introduce a second.
- **Color encoding semantic, not decorative** — up/down / category / severity, not rainbow gradients.
- **Accessible charts** — title, description, and ideally a data-table fallback for screen readers.
- **Responsive containers** — charts resize with their container, not hardcoded widths.
- **Data-ink ratio** — remove unnecessary gridlines, 3D effects, and decorative shadows. Let the data speak.
- **Export / download** if users will share numbers (CSV at minimum).

**Avoid:**
- Animating every chart update (jarring on refresh)
- Three-letter metric abbreviations without a tooltip explaining them
- Pie charts with more than 5 slices (use a bar chart)
- Stat cards showing "∞" or "NaN" on empty data — handle those cases
