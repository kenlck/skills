---
name: feature-dev-mini
description: Build a feature in four strict, gated steps — discovery+grill, plan, implement, validate — designed for small models (GPT-5.4/5.5 Mini, Codex) that must not code before the user approves. Use for any non-trivial feature work.
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
Search the codebase: **≥5 searches, ≥5 file reads**. Output a short findings
list with `path:line` bullets. Do NOT ask any question in this reply.

End the reply with exactly: `END OF SCAN — NEXT REPLY WILL BEGIN GRILLING`

### 1b. Grill loop (ONE question per reply) — `Current state: GRILLING`
Interview the user about every decision needed to build this, one branch of the
decision tree at a time.

- Ask **EXACTLY ONE** question per reply, then STOP and wait for the answer.
- Lead every question with: `Recommended: <your answer> — <one-line why>`.
- If the codebase can answer it, answer it yourself and DON'T ask.
- Do NOT write the discovery summary or propose a plan in the same reply as a
  question.
- End every question reply with exactly: `GRILLING`

Continue until no blocking unknowns remain (usually ≤5 questions).

### 1c. Finish discovery (one reply, only when grilling is done) — `Current state: DISCOVERY_APPROVAL`
Output:
- Feature in 2 lines
- Confirmed decisions (from the grill)
- Affected files as `path:line` bullets
- Assumptions

End the reply with exactly: `AWAITING APPROVAL: DISCOVERY`

---

## Step 2 — Plan (one reply, only after the user sends `APPROVE DISCOVERY`) — `Current state: PLAN`

Output:
- A numbered, file-by-file change list (each line: file + what changes)
- A 3-bullet test plan

No code yet. Touch no files.

End the reply with exactly: `AWAITING APPROVAL: PLAN`

---

## Step 3 — Implement (only after the user sends `APPROVE PLAN`) — `Current state: IMPLEMENT`

First, output and tick this checklist:
- [ ] `APPROVE DISCOVERY` received
- [ ] `APPROVE PLAN` received

If the approval hook is installed, remind the user to create the approval marker
now (see [hooks/README.md](../../hooks/README.md)) so edits are unblocked.

Then implement the Step 2 change list **exactly**. Touch no other files. If you
discover the plan is wrong, STOP and return to Step 2 — do not improvise a new
design.

---

## Step 4 — Validate (one reply) — `Current state: VALIDATE`

Run the tests from the Step 2 test plan. Report:
- Tests run and pass/fail
- Files changed
- Any remaining risks

---

## Example of the turn-by-turn rhythm

```
User:  build a CSV export button on the reports page
You:   Current state: DISCOVERY_SCAN
       [codebase findings as path:line bullets — no questions]
       END OF SCAN — NEXT REPLY WILL BEGIN GRILLING
User:  go on
You:   Current state: GRILLING
       Recommended: stream server-side — keeps memory flat for big reports.
       Should export run server-side or client-side?
       GRILLING
User:  server-side
You:   Current state: GRILLING
       Recommended: include filters — matches what the user sees on screen.
       Include the active filters in the export, or all rows?
       GRILLING
User:  include filters
You:   Current state: DISCOVERY_APPROVAL
       [discovery summary]
       AWAITING APPROVAL: DISCOVERY
User:  APPROVE DISCOVERY
You:   Current state: PLAN
       [file-by-file plan + test plan]
       AWAITING APPROVAL: PLAN
User:  APPROVE PLAN
You:   Current state: IMPLEMENT
       [checklist ticked, then implement]
```

---

## BOTTOM RULE — repeated on purpose

Start every reply with `Current state: …`. ONE step per reply. No file edits
until the user has sent both `APPROVE DISCOVERY` and `APPROVE PLAN`. When in
doubt, stop and ask.
