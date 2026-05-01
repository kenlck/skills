---
name: bug-fix
description: Structured bug fixing with reproduction, root cause analysis, fix design, regression risk analysis, and quality review. Only invoke this skill when the user explicitly asks to use it by name (e.g. "use bug-fix", "run bug-fix") or clearly requests a structured/systematic bug fixing process. Do not invoke for general bug reports, error messages, or broken behavior — handle those directly without this skill.
disable-model-invocation: true
---

# Bug Fix

Rigorous, staged bug fixing: understand the bug → trace root cause → design fix → implement → verify & regression check.

## Quick start

Invoke with a bug report: `/bug-fix the login button does nothing on mobile`

Claude will ask your questioning mode and whether to enable Log Mode, then work through each stage — stopping for approval before applying any fix.

## Core Principles

- **Reproduce before fixing** — never write a fix for a bug you haven't understood
- **Trace to root cause** — fix the cause, not the symptom
- **Minimal, targeted fixes** — prefer the smallest change that correctly addresses the root cause
- **Regression safety** — every fix can break something else; always verify it doesn't
- **Track everything** — use TodoWrite to track all stages and progress
- **Log decisions** — when Log Mode is on, record findings to `plans/` per [LOG.md](LOG.md)

## Stage 0: Setup

1. Create a todo list covering all stages.
2. Read the report: `$ARGUMENTS`
3. Check memory for related prior bugs or known issues in this area.
4. Ask the user two questions via AskUserQuestion (one call, two questions):
   - **Questioning mode**: Quick / Normal / Grill Me (see modes below)
   - **Log Mode**: On or Off

## Questioning Modes

**Quick Mode** — for obvious bugs with a clear cause. Confirm the suspected root cause and fix approach, then proceed with minimal questions.

**Normal Mode** — ask focused questions: expected vs actual behavior, steps to reproduce, when it started, any recent related changes. Use AskUserQuestion one at a time.

**Grill Me Mode** — interrogate every detail: exact error messages, reproduction conditions, environment, edge cases, recent changes, related symptoms. One AskUserQuestion at a time. Never assume.

In all modes: if a question can be answered by reading the codebase or error output, answer it yourself.

## Stage 1: Bug Intake & Reproduction

1. Using the chosen mode, clarify: expected behavior, actual behavior, steps to reproduce, severity/impact.
2. Read relevant files and trace the code path from the reported entry point.
3. Confirm your reproduction understanding: document where and why the failure occurs.
4. If Log Mode is on, write initial findings to the log per [LOG.md](LOG.md).

## Stage 2: Root Cause Analysis

**Codemap first.** If `.codemap/MAP.md` exists, read it before grepping. Use `.codemap/graph.json` edges to trace callers/callees of the suspect symbol (`type: "calls"`, `type: "imports"`) instead of grepping for usages. Fall back to Glob/Grep/Read for details the map doesn't cover. If the map is missing or stale, suggest the right builder: `/ken-swe:ts-codemap` for TS/JS, `/ken-swe:codemap` for Java/Go/Python/Rust.

1. Launch 2–3 general-purpose agents in parallel using Tracer prompts from [AGENTS.md](AGENTS.md).
2. Read all files the agents identify.
3. Present findings: confirmed root cause, exact failure point, all code paths affected.
4. Ask any follow-up questions using the active questioning mode.
5. If Log Mode is on, record the root cause to the log.

## Stage 3: Fix Design

1. Launch 2–3 general-purpose agents in parallel using Fixer prompts from [AGENTS.md](AGENTS.md).
2. Review all approaches and form your own recommendation.
3. Present: summary of each approach, trade-offs + regression risk per approach, your recommendation with reasoning.
4. Ask the user which approach they prefer (AskUserQuestion).
5. If Log Mode is on, record the fix decision to the log.

## Stage 4: Implementation

**DO NOT START WITHOUT EXPLICIT USER APPROVAL.**

1. Wait for approval on the chosen fix.
2. Read all relevant files identified in previous stages.
3. Apply the fix following codebase conventions. Update todos as you go.
4. **Regression test**: if a test framework exists, write a test that would have caught this bug. If none exists, ask the user whether to proceed without one.

## Stage 5: Regression & Quality Check

1. Ask the user if they want automated quality passes (AskUserQuestion).
2. If yes: run a **review pass** on the changed code (correctness, side effects, conventions). Report by severity. Ask what to fix now vs defer.
3. Launch agents in parallel using Regression and Reviewer prompts from [AGENTS.md](AGENTS.md).
4. Surface any regressions or new issues introduced. Address based on user decision.

## Stage 6: Summary

1. Mark all todos complete.
2. Summarize: the bug, root cause, fix applied, regression test added, files changed, regression risks, suggested follow-up.
3. If Log Mode is on, finalize the log with a summary section.
