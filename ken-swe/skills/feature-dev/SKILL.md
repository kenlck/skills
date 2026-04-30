---
name: feature-dev
description: Optimized guided feature development with deep requirement drilling, codebase understanding, and design-quality frontend implementation. Use this skill whenever the user wants to build or implement a feature — whether they say "let's build X", "add feature Y", "implement Z", "I want to create", "can we add", or any variation. This is the go-to skill for any non-trivial software feature work. Prefer this over a plain coding response whenever the feature has more than one moving part.
disable-model-invocation: true
---

# Feature Development

Rigorous, staged feature development: interrogate requirements → understand the codebase → design architecture → implement → review quality.

## Quick start

Invoke with a feature request: `/feature-dev add a notifications panel`

Claude will ask your questioning mode (Quick / Normal / Grill Me) and whether to enable Log Mode, then proceed stage by stage — stopping for approval before implementation.

## Core Principles

- **Understand before acting** — read existing patterns before designing anything
- **Design-quality frontend** — any UI work gets full aesthetic intention; see [FRONTEND.md](FRONTEND.md)
- **Simple and elegant** — readable, maintainable, architecturally sound. Minimum code that solves the problem; nothing speculative. No features beyond what was asked, no abstractions for single-use code, no error handling for impossible scenarios. If you wrote 200 lines and it could be 50, rewrite.
- **Surgical changes** — touch only what the task requires. Don't "improve" adjacent code, comments, or formatting. Match existing style even if you'd do it differently. Remove imports/variables your changes orphan; don't delete pre-existing dead code unless asked. Every changed line should trace directly to the request.
- **Surface assumptions, don't hide them** — if multiple plausible interpretations exist with materially different implementations, present them; don't pick silently. If something is unclear, name what's confusing and ask. Hidden confusion turns into rework.
- **Goal-driven execution** — transform tasks into verifiable goals before coding. "Add validation" → "tests for invalid inputs, then make them pass". "Fix the bug" → "test that reproduces it, then make it pass". Strong success criteria let you loop independently; weak ones ("make it work") force constant clarification.
- **Track everything** — use TodoWrite to track all stages and progress
- **Log decisions** — when Log Mode is on, record decisions to `plans/` per [LOG.md](LOG.md)

## Stage 0: Setup

1. Read the request: `$ARGUMENTS`
2. **If `$ARGUMENTS` is empty** — scan `plans/` for an existing implementation plan (e.g. `car-fleet-plan.md`). If one is found:
   - Read the plan and identify all pending stages (not marked ✅ Done).
   - Ask the user via AskUserQuestion: work on the **next pending stage** (Recommended) or **pick a specific stage** from the list.
   - Once a stage is selected, use that as the feature scope and proceed. Skip to the relevant stage in the workflow.
   - If no plan is found, ask the user what they want to build.
3. Create a todo list covering all stages.
4. Check memory for prior work on this feature area.
5. Check for existing decision logs: `plans/technical-decisions.md` and `plans/design-decisions.md`. If either exists, read it and note decisions already resolved for this feature — these do not need to be re-asked in Stage 1.
6. Ask the user two questions via AskUserQuestion (one call, two questions):
   - **Questioning mode**: Quick / Normal / Grill Me (see modes below)
   - **Log Mode**: On or Off (if either decisions file exists with entries for this feature, suggest On as recommended)

## Questioning Modes

**Quick Mode** — make obvious decisions autonomously. Only ask when a choice is genuinely ambiguous and different answers lead to meaningfully different implementations. Summarize all autonomous decisions and ask for a single go/no-go confirmation before proceeding.

**Normal Mode** — ask focused questions for each major decision area (user flows, data model, edge cases, permissions, integrations). Use AskUserQuestion one at a time. Skip obvious choices but ask about preferences that affect the design. Always include a recommended option, clearly labelled (e.g. "Yes, keep it simple (Recommended)").

**Grill Me Mode** — interrogate every branch of the decision tree relentlessly. Never make assumptions. One AskUserQuestion at a time. Always lead with your recommended answer and reasoning before asking for confirmation.

In all modes: if a question can be answered by reading the codebase, answer it yourself.

## Stage 1: Discovery & Requirements

1. If a prior log was found in Stage 0, briefly present the already-resolved decisions and confirm they still stand before continuing. Skip re-asking any question that is already answered in the log.
2. Interrogate remaining open requirements using the chosen mode.
3. Summarize all confirmed decisions. Get explicit sign-off before proceeding.
4. If Log Mode is on, write or update the log file per [LOG.md](LOG.md).

## Stage 2: Codebase Exploration & Clarification

**Codemap first.** Before using Glob/Grep/Read, check if `.codemap/MAP.md` exists in the target repo. If yes, read it and use `.codemap/graph.json` for targeted symbol/edge lookups. Fall back to Glob/Grep/Read only for details the map doesn't cover. If the repo is TS/JS and the map is missing or stale, suggest `/ken-swe:codemap` (build or update) before continuing.

1. Launch 2–3 general-purpose agents in parallel using Explorer prompts from [AGENTS.md](AGENTS.md).
2. Read all key files the agents identify.
3. Present findings: patterns discovered, abstractions to reuse, conventions to follow.
4. Ask any follow-up questions the codebase revealed, using the active questioning mode.
5. If Log Mode is on, update the log with any new technical decisions.

## Stage 3: Architecture Design

1. Launch 2–3 general-purpose agents in parallel using Architect prompts from [AGENTS.md](AGENTS.md).
2. Review all approaches and form your own recommendation.
3. Present: brief summary of each approach, trade-off comparison, your recommendation with reasoning.
4. Ask the user which approach they prefer (AskUserQuestion).
5. If Log Mode is on, record the architecture decision to the log.

## Stage 4: Implementation

**DO NOT START WITHOUT EXPLICIT USER APPROVAL.**

1. Wait for approval on the chosen architecture.
2. Read all relevant files identified in previous stages.
3. Break the work into sub-tasks, each phrased as a verifiable goal (failing test, type check, observable behavior). Loop on each: write the verification, make it pass, move on. Don't ask for check-ins between green sub-tasks.
4. Implement following the chosen architecture and codebase conventions. Keep changes surgical — every edited line traces to the task. Update todos as you go.
5. **Frontend work**: If the feature includes meaningful UI — pages, components, layouts, forms, visual changes — follow [FRONTEND.md](FRONTEND.md). Ask the user whether to use `frontend-design` or proceed inline. If Log Mode is on, record design decisions to the log.

## Stage 5: Code Quality

1. Ask the user if they want automated quality passes (AskUserQuestion).
2. If yes: run a **simplification pass** (redundancy, DRY, complexity) then a **review pass** (bugs, security, conventions). Report by severity. Ask what to fix now vs defer.
3. Launch 3 general-purpose agents in parallel using Reviewer prompts from [AGENTS.md](AGENTS.md).
4. Surface highest-severity issues. Address based on user decision.

## Stage 6: Summary

1. Mark all todos complete.
2. Summarize: what was built, key decisions, files modified/created, frontend choices, suggested next steps.
3. If Log Mode is on, finalize the log file with a summary section.
