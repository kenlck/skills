---
name: loop-issues
description: Slice a PRD or plan into independently-grabbable tracer-bullet issues, force every acceptance criterion through a machine-checkability gate, and publish them through the tracker verbs in .loop/config.md. Use when the user wants to turn a PRD into loop-ready issues, slice work for AFK agents, or mentions "loop issues".
disable-model-invocation: true
---

# Loop Issues

Break a PRD into issues an unattended agent can land. The slicing follows tracer-bullet vertical slices (after mattpocock's `to-issues`); the addition that makes the loop work is the **criteria gate**: no issue is published until every acceptance criterion names a runnable check. Decisions are drained here, while the human is in the room — `work-issue` never asks.

Requires `.loop/config.md` — if missing, stop and point the user to `/loop-setup`.

## Process

### 1. Gather context

Work from the PRD or plan already in conversation. If the user passes a file path or issue reference, read/fetch it in full (body and comments).

### 2. Explore the codebase

If not already explored: check `.codemap/MAP.md` first, else Glob/Grep. Two goals — use the project's existing vocabulary in issue titles/bodies, and learn **what check infrastructure exists** (test runner, typecheck, lint, e2e). The gate in step 4 depends on knowing this.

### 3. Draft vertical slices

Each issue is a thin **tracer bullet** through all layers (schema, API, UI, tests) — never a horizontal slice of one layer.

- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
- No file paths or code snippets in issue bodies — they go stale (exception: a prototype snippet that encodes a decision — schema, state machine, type shape — trimmed to the decision-rich part)
- Mark each slice **AFK** (agent can land it unattended) or **HITL** (needs a human decision or design review mid-flight). Prefer AFK; a slice that is HITL only because its spec is vague should be re-specced, not re-labelled

### 4. Criteria gate — the load-bearing step

For every acceptance criterion of every AFK slice, require all three:

1. **Behavior** — observable from outside, in domain vocabulary
2. **Check** — a runnable command that exits 0 when the criterion holds (`pnpm test path/to/spec`, `tsc --noEmit`, `curl -s … | jq -e …`, a script)
3. **Must-not-change** — per slice, what existing behavior/files stay intact

Reject vague criteria ("works", "looks good", "form submits correctly") — rewrite until checkable.

If a criterion *cannot* be machine-checked:
- the check harness doesn't exist yet → create a **preceding harness issue** ("set up Playwright + one smoke test") and block on it
- it's inherently judgment-based (visual polish, copy tone) → mark the slice **HITL**

### 5. Quiz the user

Present the breakdown as a numbered list — per slice: **Title**, **Type** (AFK/HITL), **Blocked by**, **User stories covered**, **Criteria** (with checks). Ask:

- Granularity right? (too coarse / too fine)
- Dependencies correct?
- AFK/HITL marking correct?
- Any gate rewrites that changed intent?

Iterate until approved. Do not publish without approval.

### 6. Publish

Publish via the `.loop/config.md` verbs, in dependency order (blockers first) so blocked-by fields reference real issue numbers. AFK slices get status `ready` (e.g. label `ready-for-agent`); HITL slices get the `hitl` label and **no** ready status — they route to an interactive workflow like `feature-dev-next` instead.

Issue body template:

```md
## What to build

End-to-end behavior of this slice, in domain vocabulary. No file paths.

## Acceptance criteria

- [ ] <behavior> — check: `<command>`
- [ ] <behavior> — check: `<command>`

## Must not change

- <existing behavior/area that stays intact>

## Blocked by

- #<n> / "None — can start immediately"

## Parent

<PRD reference, if any>
```

Do not close or modify the parent PRD issue.
