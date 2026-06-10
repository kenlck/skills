---
name: feature-dev-mini
description: Build a feature in four strict, gated steps — discovery+grill, plan, test-first implement, validate — designed for small models (GPT-5.4/5.5 Mini, Codex) that must not code before the user approves. Use for any non-trivial feature work.
disable-model-invocation: true
---

# Feature Dev (Mini)

## TOP RULE — read before anything else

1. **Begin every reply** with one line: `Current state: <STATE>` where `<STATE>`
   is one of `DISCOVERY_SCAN | GRILLING | DISCOVERY_APPROVAL | PLAN | IMPLEMENT | VALIDATE`.
2. Do **ONE step per reply**. After each step, STOP and wait for the user.
3. Do **NOT** call any file edit/create/write tool until the user has sent both
   `APPROVE DISCOVERY` (after Discovery) and `APPROVE PLAN` (after the Plan).
4. Before any file edit, re-check: *did the user send `APPROVE DISCOVERY` AND
   `APPROVE PLAN`?* If not, stop and go back.

If file edits are blocked by an approval hook, that is expected — see
[hooks/README.md](../../hooks/README.md). Tell the user to create the approval
marker once the Plan is approved.

---

## Step 1 — Discovery + Grill (no code, multiple replies)

### 1a. Scan first (one reply) — `Current state: DISCOVERY_SCAN`

Run these **five searches**, in order, reading the files each one surfaces:

1. **Entry point** — where does this feature hook into the app? (route, command,
   screen, handler)
2. **Nearest similar feature** — the one existing feature closest to the request;
   read its full implementation.
3. **Conventions** — naming, file layout, and patterns used by that similar feature.
4. **Existing tests** — the tests for the similar feature AND the exact command
   that runs them (e.g. `npm test`, `pytest`).
5. **Integration seams** — shared utilities, middleware, or extension points the
   feature can plug into.

Output findings in exactly this shape:

```
Current state: DISCOVERY_SCAN
Entry point: <path:line — one line>
Similar feature: <path:line — one line>
Conventions: <bullets with path:line>
Existing tests: <path:line> — test command: `<command>`
Integration seams: <bullets with path:line>
END OF SCAN — NEXT REPLY WILL BEGIN GRILLING
```

The **test command is a required finding** — Step 3 cannot run without it. If
you cannot find one, say so; that becomes your first grill question. Do NOT ask
any other question in this reply.

### 1b. Grill loop (ONE question per reply) — `Current state: GRILLING`

Walk this decision-area menu, in order, **at most one question per area**. Skip
an area when the codebase or the request already answers it:

1. **Data model** — what is stored or changed, and where?
2. **Edge cases** — empty, huge, duplicate, concurrent?
3. **Error handling** — what happens when it fails?
4. **Permissions/auth** — who is allowed to do this?
5. **UX or API surface** — what exactly does the user/caller see?

Every question reply is this skeleton, **emitted exactly once — nothing before
it, nothing between the lines, nothing after it**:

```
Current state: GRILLING
Recommended: <your answer> — <one-line why>
Q: <the single question>
GRILLING
```

Then STOP and wait for the answer. Do NOT write the discovery summary or
propose a plan in the same reply as a question.

### 1c. Finish discovery (one reply, only when the menu is exhausted) — `Current state: DISCOVERY_APPROVAL`

Output:
- Feature in 2 lines
- Confirmed decisions (from the grill)
- Affected files as `path:line` bullets
- Test command: `<command>`
- Assumptions

End the reply with exactly: `AWAITING APPROVAL: DISCOVERY`

---

## Step 2 — Plan (one reply, only after the user sends `APPROVE DISCOVERY`) — `Current state: PLAN`

Output two numbered lists that pair 1:1 — change item N is proven by test N:

```
Changes:
1. <file> — <exact change in one line>
2. ...

Tests (one per change, same numbers):
1. <test file> — <test name>: asserts <expected behaviour>
2. ...
```

"Update handler" is not an exact change — name the function, the field, the
route. No code yet. Touch no files.

End the reply with exactly: `AWAITING APPROVAL: PLAN`

---

## Step 3 — Implement, test-first (only after the user sends `APPROVE PLAN`) — `Current state: IMPLEMENT`

First, output and tick this checklist:
- [ ] `APPROVE DISCOVERY` received
- [ ] `APPROVE PLAN` received

If the approval hook is installed, remind the user to create the approval marker
now (see [hooks/README.md](../../hooks/README.md)) so edits are unblocked.

Then loop over the Plan **item by item, in order**. For each item N:

1. Write test N (from the Step 2 test list). Run it with the test command.
   Output: `ITEM N: RED — <pasted FAIL line>`
2. Implement **only** what makes test N pass. Touch no other files.
3. Run it again. Output: `ITEM N: GREEN — <pasted PASS line>`

A test that passes on first run is NOT red — fix the test until it fails for
the right reason before implementing.

Do not stop between green items. Stop early only if:
- a test will not go green after **2** implementation attempts — output
  `STUCK ON ITEM N — RETURNING TO PLAN` and go back to Step 2;
- the plan turns out to be wrong or new scope appears — same: back to Step 2.
  Never improvise a new design mid-implement.

After the last item: one refactor pass (no behaviour change), then re-run ALL
tests. Output: `REFACTOR — <suite summary>`.

---

## Step 4 — Validate (one reply) — `Current state: VALIDATE`

Run three checks and report in exactly this shape:

```
Current state: VALIDATE
1. Full suite: <passed/failed counts>
2. Static checks: <typecheck/lint results, or "none in repo">
3. Plan audit:
   planned: <each Step 2 file — changed ✓ / not changed ✗>
   unplanned: <any changed file NOT in the Step 2 list — FLAG it>
Remaining risks: <bullets, or "none">
```

A FLAGged file means drift — explain why it was touched, or revert it.

---

## Example of the turn-by-turn rhythm

```
User:  build a CSV export button on the reports page
You:   Current state: DISCOVERY_SCAN
       Entry point: src/pages/reports.tsx:88 — toolbar actions
       Similar feature: src/features/pdf-export/index.ts:1 — closest export flow
       Conventions: feature folder + colocated tests (src/features/*)
       Existing tests: src/features/pdf-export/export.test.ts:1 — test command: `npm test`
       Integration seams: src/server/stream.ts:12 — shared streaming helper
       END OF SCAN — NEXT REPLY WILL BEGIN GRILLING
User:  go on
You:   Current state: GRILLING
       Recommended: stream server-side — keeps memory flat for big reports.
       Q: Should export run server-side or client-side?
       GRILLING
User:  server-side
You:   Current state: GRILLING
       Recommended: include filters — matches what the user sees on screen.
       Q: Include the active filters in the export, or all rows?
       GRILLING
User:  include filters
You:   Current state: DISCOVERY_APPROVAL
       [discovery summary incl. test command]
       AWAITING APPROVAL: DISCOVERY
User:  APPROVE DISCOVERY
You:   Current state: PLAN
       Changes:
       1. src/server/export.ts — add exportCsv(filters) streaming endpoint
       2. src/pages/reports.tsx — add Export button calling it
       Tests (one per change, same numbers):
       1. src/server/export.test.ts — exportCsv: streams filtered rows as CSV
       2. src/pages/reports.test.tsx — Export button: downloads with active filters
       AWAITING APPROVAL: PLAN
User:  APPROVE PLAN
You:   Current state: IMPLEMENT
       [checklist ticked]
       ITEM 1: RED — FAIL src/server/export.test.ts (1 failed)
       ITEM 1: GREEN — PASS src/server/export.test.ts (1 passed)
       ITEM 2: RED — FAIL src/pages/reports.test.tsx (1 failed)
       ITEM 2: GREEN — PASS src/pages/reports.test.tsx (1 passed)
       REFACTOR — 48 passed / 0 failed
```

---

## BOTTOM RULE — repeated on purpose

Start every reply with `Current state: …`. ONE step per reply. No file edits
until the user has sent both `APPROVE DISCOVERY` and `APPROVE PLAN`. In
IMPLEMENT: test first, paste RED, then code, paste GREEN — item by item, in
plan order. When in doubt, stop and ask.
