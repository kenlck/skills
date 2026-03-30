# Log Mode Reference

When Log Mode is enabled, all findings and decisions made during the bug-fixing session are recorded to a file in `plans/`. This creates a durable record of the investigation, root cause, and fix rationale.

---

## File Location & Naming

Save to: `plans/[bug-slug]-bugfix.md`

Example: "login button does nothing on mobile" → `plans/login-button-mobile-bugfix.md`

Create the file at the start of Stage 1 and update it incrementally as findings emerge. Never batch-write at the end — log as decisions are confirmed.

---

## File Format

```md
# Bug Fix Log: [Short Bug Description]

> Session date: [YYYY-MM-DD]
> Questioning mode: [Quick / Normal / Grill Me]
> Severity: [Critical / High / Medium / Low]

---

## Investigation Findings

What was discovered during root cause analysis.

| # | Finding | Evidence | Stage |
|---|---|---|---|
| F1 | [What was found] | [File, line, or log reference] | Stage N |
| F2 | ... | ... | ... |

### Root cause
[Clear statement of the root cause — what is wrong and exactly why.]

### Affected code paths
[List of files, functions, or modules involved in the failure.]

### Reproduction
[Steps or conditions that trigger the bug.]

---

## Fix Decisions

| # | Decision | Rationale | Stage |
|---|---|---|---|
| D1 | [What was decided] | [Why — trade-off, constraint, or preference] | Stage N |
| D2 | ... | ... | ... |

### Fix approach chosen
[Which approach was selected (minimal / clean / defensive) and why.]

### Alternatives rejected
[What other approaches were considered and why they were ruled out.]

### Regression risks
[Areas that could be affected by the fix. What to monitor.]

---

## Open Questions

Items raised but not yet resolved. Clear by end of Stage 3.

- [ ] [Question] — raised in Stage N
```

---

## What Goes Where

**Investigation Findings** — what was discovered:
- The confirmed root cause and why it causes the bug
- Files, functions, and code paths involved
- Reproduction steps and conditions
- Related tests or prior fixes found

**Fix Decisions** — what was decided:
- Which fix approach was chosen and why
- Alternatives considered and rejected (with reasons)
- Regression risks and areas to monitor
- Whether a regression test was added (and if not, why)

---

## Update Triggers

| When | What to log |
|---|---|
| End of Stage 1 | Initial bug description, expected vs actual, reproduction steps |
| End of Stage 2 | Confirmed root cause, affected files |
| End of Stage 3 | Chosen fix approach, alternatives rejected, regression risks |
| End of Stage 4 | Regression test added (or reason it was skipped) |
| End of Stage 6 | Final summary line |
