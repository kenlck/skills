---
name: feature-dev-next
description: Right-sized guided feature development with three presets (Quick / Standard / Deep) covering everything from one-line tweaks to risky new modules. Invoke for any non-trivial feature work.
disable-model-invocation: true
---

# Feature Development (Next)

Three-preset feature workflow: pick a preset, get only the stages you need. Quick = ship a tweak. Standard = build a normal feature. Deep = design something risky.

## Quick start

`/ken-swe:feature-dev-next add a notifications panel`

You'll pick **one preset** and (optionally) flip log mode via `--log` / `--no-log` in `$ARGUMENTS`. Everything else flows from that choice.

**Interrupt protocol** — at any time, say `restart from stage X` to rewind to that stage with current state preserved.

## Presets at a glance

| Preset   | Stage 1 | Stage 2          | Stage 3            | Stage 4     | Stage 5                  | Log default |
|----------|---------|------------------|--------------------|-------------|--------------------------|-------------|
| Quick    | skip    | solo Glob/Grep   | 1–2 sentence plan  | inline TDD  | skip                     | off         |
| Standard | focused | 2 Explorer agents| 2 Architect agents | inline TDD  | invoke `/review`         | off*        |
| Deep     | grill   | 3 Explorer agents| 3 Architect agents | inline TDD or `/tdd` | 3 Reviewer agents | on          |

\*Standard auto-flips to **on** if `plans/technical-decisions.md` or `plans/design-decisions.md` already exists for this feature area.

## Core Principles

- **Understand before acting** — read existing patterns before designing.
- **Design-quality frontend** — any UI work gets full aesthetic intention; see [FRONTEND.md](FRONTEND.md). Frontend handoff is **re-entrant** — any stage that surfaces UI scope can offer the `frontend-design` invocation.
- **Simple and elegant** — minimum code that solves the problem; nothing speculative. If you wrote 200 lines and it could be 50, rewrite.
- **Surgical changes** — touch only what the task requires. Match existing style. Every changed line traces directly to the request.
- **Surface assumptions, don't hide them** — if multiple plausible interpretations exist with materially different implementations, present them.
- **Goal-driven execution** — every architecture proposal includes 3–5 verifiable goals (failing tests, type checks, observable behaviour). These become Stage 4's pass criteria.
- **Track everything** — use TodoWrite (or TaskCreate) for stages and progress.
- **Log decisions** — when log mode is on, record decisions to `plans/` per [LOG.md](LOG.md).

## Stage 0: Setup

1. Read `$ARGUMENTS`. Parse `--log` / `--no-log` flag if present.
2. **If `$ARGUMENTS` is empty (after stripping flags)** — scan `plans/` for an existing implementation plan (e.g. `car-fleet-plan.md`). If found:
   - Read it; identify pending stages (not marked ✅ Done).
   - Ask via AskUserQuestion: work on the **next pending stage** (recommended) or **pick a specific stage**.
   - Use the chosen stage as feature scope; skip to its workflow point.
   - If no plan found, ask the user what they want to build.
3. Detect existing `plans/technical-decisions.md` and `plans/design-decisions.md`. Note any decisions already resolved for this feature area — those won't be re-asked in Stage 1.
4. Ask **one** AskUserQuestion: which preset (Quick / Standard / Deep)?
5. Apply preset defaults:
   - **Log mode**: derived per preset table. `--log` / `--no-log` overrides.
   - **Memory check** (Standard/Deep only): the auto-loaded `MEMORY.md` is already in context — review it for prior work in this area. On Deep, if `claude-mem:mem-search` is in the available skills, also run it for richer cross-session lookup.
6. Create a todo list scaled to the preset (skip stages the preset omits).

## Stage 1: Discovery & Requirements

**Quick** — Skip. If `$ARGUMENTS` is genuinely ambiguous (multiple incompatible interpretations), ask **one** clarifying question, then proceed.

**Standard** — Focused interrogation. Use AskUserQuestion per major decision area (user flows, data model, edge cases, permissions, integrations). Skip obvious choices but ask preferences that affect the design. Always include a recommended option, clearly labelled.

**Deep** — Relentless grill. Interrogate every branch of the decision tree. Never make assumptions. One AskUserQuestion at a time. Always lead with your recommended answer and reasoning. If the user struggles to answer, suggest invoking `/grill-me` to externalise the interrogation.

In all presets:
- If a question can be answered by reading the codebase, answer it yourself.
- If a prior log was found in Stage 0, briefly present already-resolved decisions and confirm they still stand. Skip re-asking.
- After interrogation, summarise confirmed decisions and get explicit sign-off.
- If log mode is on, write or update the log per [LOG.md](LOG.md).

## Stage 2: Codebase Exploration

**Codemap first.** Check if `.codemap/MAP.md` exists in the target repo. If yes, read it and use `.codemap/graph.json` for targeted symbol/edge lookups. If absent or stale, **silently fall back** to Glob/Grep/Read — do not pause to ask about tooling. Stage 6's summary will mention codemap as a future-speedup nudge if it would have helped.

**Quick** — Solo. Glob/Grep/Read against 2–3 obvious targets. No agents launched.

**Standard** — Launch **2** general-purpose Explorer agents in parallel using prompts from [AGENTS.md](AGENTS.md). Read all key files the agents identify.

**Deep** — Launch **3** Explorer agents in parallel.

After exploration:
1. Present findings: patterns discovered, abstractions to reuse, conventions to follow.
2. Ask any follow-up questions the codebase revealed (using preset's questioning style).
3. If Stage 2 surfaced meaningful UI scope and it wasn't already flagged, offer the `frontend-design` handoff once.
4. If log mode is on, update the log with new technical decisions.

## Stage 3: Architecture Design

Every Stage 3 proposal — across all presets — **must list 3–5 verifiable goals/tests** alongside the design. These become Stage 4's pass criteria. The Architect prompts in AGENTS.md enforce this for the agent-driven presets.

**Quick** — Write a 1–2 sentence inline plan **plus** a 1–3 line verifiable-goals list. Ask via AskUserQuestion: proceed (Recommended) / adjust / abort. **Do not start Stage 4 without explicit approval.**

**Standard** — Launch **2** Architect agents in parallel using prompts from [AGENTS.md](AGENTS.md). Review proposals, form your own recommendation, present trade-offs side-by-side. Ask user to pick an approach. **Do not start Stage 4 without explicit approval.**

**Deep** — Launch **3** Architect agents in parallel (minimal / clean / pragmatic). Same recommendation + side-by-side presentation + AskUserQuestion. **Do not start Stage 4 without explicit approval.**

If log mode is on, record the architecture decision and verifiable goals to the log.

## Stage 4: Implementation

**DO NOT START WITHOUT EXPLICIT USER APPROVAL FROM STAGE 3.**

1. Wait for approval.
2. Read all relevant files identified in previous stages.
3. Break work into sub-tasks. Each sub-task is a verifiable goal from Stage 3 (failing test, type check, observable behaviour). Loop on each: write the verification, make it pass, move on. Don't ask for check-ins between green sub-tasks.
4. Implement following the chosen architecture and codebase conventions. Keep changes surgical — every edited line traces to the task. Update todos as you go.
5. **Frontend work** — if the feature includes meaningful UI (pages, components, layouts, forms, visual changes), follow [FRONTEND.md](FRONTEND.md). Ask the user whether to invoke `frontend-design` or proceed inline. If log mode is on, record design decisions to the log.
6. **TDD on Deep (optional)** — at the start of Stage 4, ask once: "Use `/tdd` for full red-green-refactor on this implementation? (Recommended for risky/algorithmic work)". If yes, hand off; otherwise inline TDD-lite continues.
7. **If a stubborn bug surfaces mid-implementation** — hand off to `/ken-swe:diagnose` rather than trying to debug inline. The diagnose skill enforces a feedback-loop discipline that catches bugs faster than ad-hoc inspection.

## Stage 5: Code Quality

**Quick** — Skip entirely.

**Standard** — Ask the user via AskUserQuestion: run `/review` now? If yes, invoke `/review`. Surface findings; ask what to fix now vs defer.

**Deep** — Ask the user via AskUserQuestion: run the full quality pass? If yes, run in this order:
1. Invoke `/simplify` (redundancy, DRY, complexity).
2. Launch **3** Reviewer agents in parallel using prompts from [AGENTS.md](AGENTS.md): simplicity, bugs/correctness, conventions/security.
3. Aggregate findings by severity. Present Critical → Major → Minor. Ask what to fix now vs defer.

## Stage 6: Summary

1. Mark all todos complete.
2. Summarise: what was built, key decisions, files modified/created, frontend choices, suggested next steps.
3. **Codemap nudge** — if Stage 2 fell back to Glob/Grep because `.codemap/` was missing, add one line: *"Tip: codemap would speed up future exploration in this repo — run `/ken-swe:ts-codemap` (TS/JS) or `/ken-swe:codemap` (Java/Go/Python/Rust)."*
4. If log mode is on, finalise the log file with a summary section.
