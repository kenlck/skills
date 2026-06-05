---
name: feature-dev-mini
description: Build a feature in four strict, gated steps — discovery+grill, plan, implement, validate — designed for small models (GPT-5.4/5.5 Mini, Codex) that must not code before the user approves. Use for any non-trivial feature work.
disable-model-invocation: true
---

# Feature Dev (Mini)

## TOP RULE — read before anything else

1. Do **ONE step per reply**. After each step, STOP and wait for the user.
2. Do **NOT** call any file edit/create/write tool until the user has replied
   `approve` **twice**: once after Discovery, once after the Plan.
3. Before any file edit, re-check: *did the user approve Discovery AND the Plan?*
   If not, stop and go back.

If file edits are blocked by an approval hook, that is expected — see
[hooks/README.md](../../hooks/README.md). Tell the user to create the approval
marker once the Plan is approved.

---

## Step 1 — Discovery + Grill (no code, multiple replies)

### 1a. Scan first (one reply)
Search the codebase: **≥5 searches, ≥5 file reads**. Output a short findings
list with `path:line` bullets. Then begin grilling in your next reply.

### 1b. Grill loop (ONE question per reply)
Interview the user about every decision needed to build this, one branch of the
decision tree at a time.

- Ask **EXACTLY ONE** question per reply, then STOP and wait for the answer.
- Lead every question with: `Recommended: <your answer> — <one-line why>`.
- If the codebase can answer it, answer it yourself and DON'T ask.
- Do NOT write the discovery summary or propose a plan in the same reply as a
  question.
- End every question reply with exactly: `GRILLING`

Continue until no blocking unknowns remain (usually ≤5 questions).

### 1c. Finish discovery (one reply, only when grilling is done)
Output:
- Feature in 2 lines
- Confirmed decisions (from the grill)
- Affected files as `path:line` bullets
- Assumptions

End the reply with exactly: `AWAITING APPROVAL: DISCOVERY`

---

## Step 2 — Plan (one reply, only after the user replies `approve`)

Output:
- A numbered, file-by-file change list (each line: file + what changes)
- A 3-bullet test plan

No code yet. Touch no files.

End the reply with exactly: `AWAITING APPROVAL: PLAN`

---

## Step 3 — Implement (only after the user replies `approve` a second time)

First, output and tick this checklist:
- [ ] Discovery approved
- [ ] Plan approved

If the approval hook is installed, remind the user to create the approval marker
now (see [hooks/README.md](../../hooks/README.md)) so edits are unblocked.

Then implement the Step 2 change list **exactly**. Touch no other files. If you
discover the plan is wrong, STOP and return to Step 2 — do not improvise a new
design.

---

## Step 4 — Validate (one reply)

Run the tests from the Step 2 test plan. Report:
- Tests run and pass/fail
- Files changed
- Any remaining risks

---

## Example of the turn-by-turn rhythm

```
User:  build a CSV export button on the reports page
You:   [Step 1a — codebase findings] ... then a question:
       Recommended: stream server-side — keeps memory flat for big reports.
       Should export run server-side or client-side?
       GRILLING
User:  server-side
You:   Recommended: reuse existing /reports/:id loader ...
       One more: include filters in the export, or all rows?
       GRILLING
User:  include filters
You:   [Step 1c — discovery summary]
       AWAITING APPROVAL: DISCOVERY
User:  approve
You:   [Step 2 — file-by-file plan + test plan]
       AWAITING APPROVAL: PLAN
User:  approve
You:   [Step 3 — checklist ticked, then implement]
```

---

## BOTTOM RULE — repeated on purpose

ONE step per reply. No file edits until the user has said `approve` twice. When
in doubt, stop and ask.
