---
name: feature-dev-auto
description: Autonomous feature development with goal-loop verification. Front-loads all decisions through interactive stages, then drives implementation unattended against verifiable goals — re-architecting, diagnosing, and self-correcting until green or escalation thresholds hit. Use for substantial feature work with a verifiable end state ("until tests pass / type-check clean / acceptance criteria hold").
disable-model-invocation: true
---

# Feature Development (Auto)

Two-preset autonomous feature workflow. Stages 0–3 stay interactive (decisions front-loaded). Stage 4 runs as a verify-loop: implement → check → evaluator-confirm → next goal. Loop only breaks for declared escalation triggers.

For one-line tweaks or quick wins, use `feature-dev-next` (Quick preset) instead — goal-loop is overhead at that scale.

## Quick start

`/feature-dev-auto add a notifications panel`

Pick one preset (Standard / Deep). Optionally flip log mode via `--log` / `--no-log`. Everything else flows from preset defaults.

**Interrupt protocol** — any time the user says `stop`, `exit loop`, or `restart from stage X`, abort the in-flight evaluator subagent and rewind to that stage with current state preserved. The plan file at `plans/<feature>-goal.md` is canonical state.

## Presets at a glance

| Preset   | Stage 1 | Stage 2          | Stage 3            | Stage 4 (loop)                              | Stage 5                  | Iter cap | Log default |
|----------|---------|------------------|--------------------|---------------------------------------------|--------------------------|----------|-------------|
| Standard | focused | 2 Explorer agents| 2 Architect agents | run check → Evaluator confirm on goal close | invoke `/review`         | 20       | off*        |
| Deep     | grill   | 3 Explorer agents| 3 Architect agents | run check → Evaluator confirm on goal close | 3 Reviewer agents        | 40       | on          |

\*Standard auto-flips to **on** if `plans/technical-decisions.md` or `plans/design-decisions.md` already exists for this feature area.

## Core Principles

- **Front-load every decision.** Stages 0–3 drain the decision tree interactively. Once Stage 4 starts, no AskUserQuestion fires except on declared escalation triggers.
- **Verifiable goals are the contract.** Stage 3 produces 3–5 goals that each include a runnable check command, the state that must flip, and what must not change. Without these the loop has no exit condition — the goal-quality gate refuses to write the plan file until every goal meets that bar.
- **Plan file is canonical state.** `plans/<feature>-goal.md` is truth. TodoWrite mirrors it for UI but never substitutes. After every goal flip, update the plan file first.
- **Evaluator uses a different signal than the agent's check.** The Evaluator subagent reads the diff and changed files independently — it does not re-run the same test command. This catches trivial-assertion fake-passes (e.g. `expect(true).toBe(true)`).
- **Goal-driven escalation.** The loop has four declared break conditions (see Stage 4). Anything else stays inside the loop.
- **Surgical changes.** Touch only what the task requires. Scope-creep detector enforces this against the file list in the plan file — rearchitects update that list.

## Stage 0: Setup

1. Read `$ARGUMENTS`. Parse `--log` / `--no-log`.
2. **If `$ARGUMENTS` is empty** — scan `plans/` for an existing `<feature>-goal.md`. If found:
   - Read it; identify pending goals (not marked ✅ Done).
   - Ask via AskUserQuestion: resume from the **next pending goal** (Recommended) or **rewind to stage X**.
   - If resuming, skip to Stage 4 with the plan file loaded.
   - If no goal file found, ask the user what to build.
3. Detect existing `plans/technical-decisions.md` / `plans/design-decisions.md`. Note decisions already resolved for this area — those won't be re-asked.
4. Ask **one** AskUserQuestion: which preset (Standard / Deep)?
5. Apply preset defaults. `--log` / `--no-log` overrides.
6. Memory check: the auto-loaded `MEMORY.md` is already in context — review for prior work in this area. On Deep, if `claude-mem:mem-search` is available, also run it.
7. Create a todo list scaled to the preset.

## Stage 1: Discovery & Requirements

**Standard** — Focused interrogation. AskUserQuestion per major decision area (user flows, data model, edge cases, permissions, integrations). Skip obvious choices; ask preferences that affect design. Always include a recommended option, clearly labelled.

**Deep** — Relentless grill. Interrogate every branch. Never assume. One question at a time, lead with recommended answer + reasoning. If the user struggles, suggest `/grill-me` to externalise.

In both presets:
- If a question can be answered by reading code, answer it yourself.
- If a prior log exists, present already-resolved decisions, confirm they still hold, skip re-asking.
- After interrogation, summarise confirmed decisions, get explicit sign-off.
- If log mode on, write/update the log per [LOG.md](LOG.md).

## Stage 2: Codebase Exploration

**Codemap first.** If `.codemap/MAP.md` exists, read it and use `.codemap/graph.json` for targeted lookups. Otherwise silently fall back to Glob/Grep/Read — don't pause to ask. Stage 6 nudges codemap as a future speedup.

**Standard** — Launch **2** general-purpose Explorer agents in parallel using prompts from [AGENTS.md](AGENTS.md). Read every key file they cite.

**Deep** — Launch **3** Explorer agents in parallel.

After exploration:
1. Present findings: patterns, abstractions to reuse, conventions, gotchas.
2. Ask follow-ups surfaced by the codebase using the preset's questioning style.
3. If Stage 2 reveals meaningful UI scope, offer the [FRONTEND.md](FRONTEND.md) handoff once.
4. Capture the **initial in-scope file list** — directories and files implementation may touch. This becomes the scope-creep baseline in the plan file. If log mode on, update the log.

## Stage 3: Architecture Design + Goal Quality Gate

Every Stage 3 proposal must list 3–5 verifiable goals shaped per the template below. The Architect prompts in AGENTS.md enforce this.

**Standard** — Launch **2** Architect agents in parallel (minimal / pragmatic) using AGENTS.md. Review proposals, form your own recommendation, present trade-offs side-by-side. Ask the user to pick.

**Deep** — Launch **3** Architect agents in parallel (minimal / clean / pragmatic). Same recommendation + side-by-side + pick.

**Goal-quality gate** — before writing the plan file, verify each goal has:
- A runnable check command (`pnpm test path/to/file`, `tsc --noEmit`, `curl -s … | jq`, etc.) that exits 0 on success.
- A clear assertion: what observable state flips.
- A negative case: what must NOT change (files, behaviours preserved).

If any goal fails the gate, push back on the user before proceeding. Vague goals ("form submits", "looks good") are rejected.

**Plan file** — once goals pass the gate, write `plans/<feature>-goal.md`:

```md
# Goal: <feature name>

**Original request:** <verbatim $ARGUMENTS>
**Preset:** Standard | Deep
**Iter cap:** 20 | 40
**Architecture decision:** <chosen approach, 2–3 sentences>

## In-scope files
- `<path/glob>` — <purpose>
- ...

## Verifiable goals

### Goal 1: <one-line>
- **Check:** `<bash cmd>` exits 0
- **Asserts:** <observable state that flips>
- **Must-not-change:** <files / behaviours preserved>
- **Status:** ⬜ Pending

### Goal 2: ...

## Iter log
(appended during Stage 4 — see Loop telemetry)
```

**Do not start Stage 4 without explicit user approval of the plan file.** Ask via AskUserQuestion: proceed (Recommended) / adjust / abort.

## Stage 4: Implementation (the loop)

**DO NOT START WITHOUT EXPLICIT USER APPROVAL OF THE PLAN FILE.**

Frontend handoff: if the feature includes meaningful UI, run the frontend skill handoff per [FRONTEND.md](FRONTEND.md) **before** starting the loop. The autonomous loop cannot accommodate the design direction interview mid-flight.

Once design and approval are in: load plan file, mirror goals to TodoWrite, enter the loop.

### Loop body (per goal)

For the next pending goal:

1. **Implement** following the chosen architecture. Surgical changes only — every edited line traces to this goal. Read all relevant files first.
2. **Run the check** via Bash. Capture stdout/stderr verbatim into the iter log.
3. **On fail** — apply [fail policy](#fail-policy). Loop back to step 1 with the failure reason as guidance.
4. **On pass** — spawn the **Evaluator subagent** (Read + Bash, fresh context) using the prompt in [AGENTS.md](AGENTS.md). Evaluator must:
   - Read the diff between HEAD and the in-scope files.
   - Confirm the assertion isn't trivial (rejects e.g. `expect(true).toBe(true)`, stubbed implementations that always return success, tests asserting only that no error throws).
   - Verify must-not-change items are intact.
   - Output verdict: `MET` / `NOT MET` with reason.
5. **Evaluator MET** — update plan file (status ⬜ → ✅), mirror to TodoWrite, continue to next goal.
6. **Evaluator NOT MET** — treat as a fail (step 3), feed evaluator's reason as guidance.

After all goals ✅: exit loop, proceed to Stage 5.

### Fail policy

Per goal, track `fail_count` (Bash check fails) and `rearch_count` (rearchitect cycles).

| Trigger | Action |
|---|---|
| `fail_count` reaches **3** on the same goal, `rearch_count == 0` | **Silent rearchitect.** Re-run Stage 3 with an added constraint derived from the failure. Update plan file: new arch decision, refreshed in-scope file list, refreshed goals if needed. Reset `fail_count = 0`, `rearch_count = 1`. Resume loop. Do not ask the user. |
| `fail_count` reaches **3** post-rearch | **Escalate.** Pause loop. Surface failure summary + last 3 check outputs. Ask user via AskUserQuestion: adjust goal / try different fix / abort. |
| Same error string appears **twice** in a row (regardless of `fail_count`) | **Hand off to `/diagnose`.** Spawn `/diagnose` via the Agent tool with prompt "diagnose and return root cause + suggested fix; do not ask questions". Apply the returned fix as the next implementation attempt. |
| Iter count reaches preset cap (Standard 20 / Deep 40) | **Escalate.** Same as 3-fail-post-rearch. Cap is across the whole loop, not per goal. |
| Edit touches a file outside the plan file's `In-scope files` list | **Pause.** Surface the out-of-scope edit, ask user to confirm or revert. If confirmed, update the plan file's in-scope list and resume. |

### Loop telemetry

Append to the plan file's `## Iter log` after every iter:

```
- Iter N | Goal M | check=<pass|fail> | evaluator=<met|not_met|n/a> | reason=<one line>
```

This is durable state — if context compacts mid-loop, the next session can resume by reading the plan file.

### Mid-loop interrupts

If the user injects a message mid-loop ("stop", "exit", "restart from stage X", or any directive):
- Abort in-flight Evaluator/Diagnose subagent if one is running.
- Flush latest iter log entry to plan file.
- Honour the directive.

## Stage 5: Code Quality

**Standard** — Ask via AskUserQuestion: run `/code-review` now? If yes, invoke `/code-review`. Surface findings; ask what to fix now vs defer. **Findings are not auto-fixed inside the loop** — review opinions can fight the chosen architecture.

**Deep** — Ask: run the full quality pass? If yes:
1. Invoke `/simplify` (redundancy, DRY, complexity).
2. Launch **3** Reviewer agents in parallel using prompts from AGENTS.md (simplicity, bugs/correctness, conventions/security).
3. Aggregate findings by severity. Present Critical → Major → Minor. Ask what to fix now vs defer.

## Stage 6: Summary

1. Mark all todos complete. Finalise plan file: every goal ✅, summary section appended.
2. Summarise: what was built, key decisions, files modified/created, frontend choices, escalations (if any), suggested next steps.
3. **Codemap nudge** — if Stage 2 fell back to Glob/Grep, add one line: *"Tip: codemap would speed up future exploration here — run `/ts-codemap` (TS/JS) or `/codemap` (Java/Go/Python/Rust)."*
4. If log mode on, finalise log files with summary entries.
