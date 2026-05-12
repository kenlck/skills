# Agent Prompts Reference

Used by `feature-dev-next` to launch general-purpose agents via the Agent tool. Customise each prompt with the actual feature name and context before launching. Every prompt enforces a strict output budget — keep total agent output predictable and triage-ready.

---

## Explorer Agents (Stage 2 — Codebase Exploration)

Launch the count specified by preset. Pick the most relevant variants from the list below.

**Output budget for every Explorer prompt — append verbatim:**

> **Format requirements:** Report under **400 words**. Use bulleted findings only. Every finding cites `file:line`. No code blocks. Lead with a one-line summary, then bullets grouped under: Patterns / Reusable abstractions / Conventions / Gotchas. Cite no more than 10 files total.

**Similar features**
> "Find features in this codebase similar to [feature]. Trace through their full implementation — schema, server functions/API layer, UI components, and shared utilities. Identify patterns, abstractions, and conventions used. [append output budget]"

**Architecture & data layer**
> "Map the architecture and data layer for [feature area] in this codebase. Trace how data is defined (schema/models), queried (server functions or API routes), and consumed (state management or component props). Identify abstractions to reuse or extend. [append output budget]"

**UI & testing patterns**
> "Identify UI component patterns, styling conventions, and testing approaches in this codebase relevant to [feature]. Look at how similar components are structured, how styles are applied (CSS modules, Tailwind, etc.), and what testing patterns exist. [append output budget]"

**Extension points & integrations**
> "Identify existing extension points, hooks, middleware, or integration patterns in this codebase relevant to [feature]. Look for places where the new feature can plug in cleanly rather than requiring new infrastructure. [append output budget]"

---

## Architect Agents (Stage 3 — Architecture Design)

Launch the count specified by preset. Each agent uses a different design philosophy.

**Output budget for every Architect prompt — append verbatim:**

> **Format requirements:** Report under **500 words**. No code blocks. Structure exactly as:
>
> **Approach** — 2–4 sentences describing the end-to-end shape (schema, API/server, UI, integration).
>
> **Files to create / modify** — bulleted list with one-line purpose each. Max 12 entries.
>
> **Verifiable goals** — 3–5 bullets, each phrased as a failing test, type check, or observable behaviour the implementation must satisfy. These become Stage 4's success criteria.
>
> **Trade-offs** — 2–4 bullets covering what this approach buys and what it costs vs alternatives.

**Minimal changes**
> "Design an implementation approach for [feature] in this codebase that minimises the diff — maximum reuse of existing patterns, abstractions, and utilities. Goal: smallest possible footprint. [append output budget]"

**Clean architecture**
> "Design an implementation approach for [feature] in this codebase that prioritises maintainability and elegant abstractions. Identify the right seams to introduce new modules. Goal: code that is easy to understand, test, and extend. [append output budget]"

**Pragmatic balance**
> "Design an implementation approach for [feature] in this codebase that balances speed and quality. Reuse existing patterns where it makes sense; introduce new abstractions only where they meaningfully reduce complexity. [append output budget]"

---

## Reviewer Agents (Stage 5 — Code Quality, Deep preset only)

Launch all 3 in parallel after implementation is complete. Standard preset uses `/review` directly instead of these.

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
