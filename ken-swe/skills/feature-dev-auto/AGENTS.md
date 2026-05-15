# Agent Prompts Reference

Used by `feature-dev-auto` to launch general-purpose agents via the Agent tool. Customise each prompt with the actual feature name and context before launching. Every prompt enforces a strict output budget — keep total agent output predictable and triage-ready.

---

## Explorer Agents (Stage 2 — Codebase Exploration)

Launch the count specified by preset. Pick the most relevant variants.

**Output budget for every Explorer prompt — append verbatim:**

> **Format requirements:** Report under **400 words**. Use bulleted findings only. Every finding cites `file:line`. No code blocks. Lead with a one-line summary, then bullets grouped under: Patterns / Reusable abstractions / Conventions / Gotchas. Cite no more than 10 files total.

**Similar features**
> "Find features in this codebase similar to [feature]. Trace through their full implementation — schema, server functions/API layer, UI components, and shared utilities. Identify patterns, abstractions, and conventions used. [append output budget]"

**Architecture & data layer**
> "Map the architecture and data layer for [feature area] in this codebase. Trace how data is defined (schema/models), queried (server functions or API routes), and consumed (state management or component props). Identify abstractions to reuse or extend. [append output budget]"

**UI & testing patterns**
> "Identify UI component patterns, styling conventions, and testing approaches in this codebase relevant to [feature]. Look at how similar components are structured, how styles are applied, and what testing patterns exist. [append output budget]"

**Extension points & integrations**
> "Identify existing extension points, hooks, middleware, or integration patterns in this codebase relevant to [feature]. Look for places where the new feature can plug in cleanly rather than requiring new infrastructure. [append output budget]"

---

## Architect Agents (Stage 3 — Architecture Design)

Launch the count specified by preset. Each agent uses a different design philosophy.

**Output budget for every Architect prompt — append verbatim:**

> **Format requirements:** Report under **600 words**. No code blocks. Structure exactly as:
>
> **Approach** — 2–4 sentences describing the end-to-end shape (schema, API/server, UI, integration).
>
> **Files to create / modify** — bulleted list with one-line purpose each. Max 12 entries. This list defines the in-scope file set for the autonomous loop's scope-creep detector.
>
> **Verifiable goals** — 3–5 bullets. Each goal MUST include all four fields:
>
> - **Goal:** <one-line description>
> - **Check:** `<runnable bash command>` exits 0
> - **Asserts:** <observable state that flips from current to desired>
> - **Must-not-change:** <files / behaviours preserved>
>
> Reject goals like "feature works" or "form submits" — they have no runnable check. Goals must be the kind of thing a fresh evaluator can confirm by reading the diff + running the check.
>
> **Trade-offs** — 2–4 bullets covering what this approach buys and what it costs vs alternatives.

**Minimal changes**
> "Design an implementation approach for [feature] in this codebase that minimises the diff — maximum reuse of existing patterns, abstractions, and utilities. Goal: smallest possible footprint. [append output budget]"

**Clean architecture** (Deep preset only)
> "Design an implementation approach for [feature] in this codebase that prioritises maintainability and elegant abstractions. Identify the right seams to introduce new modules. Goal: code easy to understand, test, and extend. [append output budget]"

**Pragmatic balance**
> "Design an implementation approach for [feature] in this codebase that balances speed and quality. Reuse existing patterns where it makes sense; introduce new abstractions only where they meaningfully reduce complexity. [append output budget]"

---

## Rearchitect Agent (Stage 4 — fail policy 3-fail trigger)

When the loop's fail-policy triggers a silent rearchitect, launch **one** Architect agent with this overriding prompt:

> "An autonomous implementation loop has hit 3 consecutive failures on the goal '[goal text]' under the current architecture. Failures so far: [list last 3 check outputs verbatim, capped at 50 lines each].
>
> Constraint added: [derived from failure — e.g. 'avoid touching foo.ts which keeps regressing', 'use library X instead of hand-rolling']. The original feature request was: [verbatim $ARGUMENTS]. The current in-scope file list is: [paste from plan file].
>
> Redesign the approach to honour the new constraint. Output in the same format as a Stage 3 Architect agent. Updated in-scope file list and verifiable goals are required — the loop's scope-creep detector reads from this list. [append Architect output budget]"

---

## Evaluator Agent (Stage 4 — goal-pass confirmation)

Spawn after a goal's Bash check passes, before marking the goal ✅. Use the general-purpose agent with Read + Bash tools. The Evaluator's job is to use a **different signal** than the agent's check command — it must not just re-run the same command and accept the result.

**Evaluator prompt template:**

> "Confirm whether an autonomous implementation has truly met goal '[goal text]' from feature '[feature name]'.
>
> The implementing agent claims the goal is met based on its check command `[check cmd]` exiting 0. Your job is to independently verify this is not a fake-pass.
>
> **Do this, in order:**
>
> 1. Run `git diff HEAD -- [in-scope files from plan file]` (or `git diff --staged` if changes are staged). Read the diff.
> 2. Read the changed files in full.
> 3. Verify the assertion '[asserts text from goal]' is genuinely satisfied by the diff — not by a stubbed return, a trivial assertion (e.g. `expect(true).toBe(true)`, asserting only that no error throws), a disabled test, or a hard-coded happy path that ignores inputs.
> 4. Verify the must-not-change items '[must-not-change from goal]' are intact. If files are listed, read them and confirm. If behaviours are listed, search for tests covering them and confirm those tests still exist.
> 5. Re-run the check command yourself: `[check cmd]`. Confirm it exits 0.
>
> **Output exactly one of:**
>
> - `MET — <one-sentence reason citing what in the diff satisfies the assertion>`
> - `NOT MET — <one-sentence reason: what's missing, stubbed, or fake>`
>
> Be conservative. If anything looks suspicious, output NOT MET. Do not output anything else. [Format requirements: under 150 words total.]"

---

## Reviewer Agents (Stage 5 — Code Quality, Deep preset only)

Launch all 3 in parallel after implementation. Standard preset uses `/code-review` directly instead.

**Output budget for every Reviewer prompt — append verbatim:**

> **Format requirements:** Report under **300 words**. No code blocks. Findings only — no preamble, no summary. One bullet per finding in the form:
>
> `[SEVERITY] file:line — issue. Fix: <one sentence>.`
>
> Severities: **Critical** (data loss, security, broken core flow) / **Major** (incorrect behaviour, missed edge case) / **Minor** (style, polish). Skip anything you are not high-confidence on. If nothing found in your category, output exactly: `No findings.`

**Simplicity & elegance**
> "Review the recently changed code in this codebase for simplicity and elegance. Look for: unnecessary complexity, premature abstractions, duplicated logic (DRY violations), over-engineered solutions, dead code, and anything expressible more clearly. [append output budget]"

**Bugs & correctness**
> "Review the recently changed code in this codebase for bugs and functional correctness. Look for: off-by-one errors, null/undefined handling, incorrect conditional logic, async/await issues, missing error handling at system boundaries, and race conditions. [append output budget]"

**Conventions & security**
> "Review the recently changed code in this codebase for adherence to project conventions and security. Look for: deviations from existing patterns, inconsistent naming, missing input validation at system boundaries, potential injection vectors, exposed secrets or credentials, and insecure defaults. [append output budget]"
