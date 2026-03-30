# Agent Prompts Reference

Used by `feature-dev` to launch general-purpose agents via the Agent tool. Customise each prompt with the actual feature name and context before launching.

---

## Explorer Agents (Stage 2 — Codebase Exploration)

Launch 2–3 in parallel, each targeting a different aspect. Pick the most relevant from the list below.

**Similar features**
> "Find features in this codebase that are similar to [feature]. Trace through their full implementation — schema, server functions/API layer, UI components, and any shared utilities. Return a list of 5–10 key files and a summary of patterns, abstractions, and conventions used."

**Architecture & data layer**
> "Map the architecture and data layer for [feature area] in this codebase. Trace through how data is defined (schema/models), queried (server functions or API routes), and consumed (state management or component props). Return key files and a summary of abstractions to reuse or extend."

**UI & testing patterns**
> "Identify UI component patterns, styling conventions, and testing approaches in this codebase relevant to [feature]. Look at how similar components are structured, how styles are applied (CSS modules, Tailwind, etc.), and what testing patterns exist. Return key files and a summary of conventions to follow."

**Extension points & integrations**
> "Identify existing extension points, hooks, middleware, or integration patterns in this codebase that are relevant to [feature]. Look for places where the new feature can plug in cleanly rather than requiring new infrastructure. Return key files and a summary of what can be reused."

---

## Architect Agents (Stage 3 — Architecture Design)

Launch 2–3 in parallel, each with a different design philosophy.

**Minimal changes**
> "Design an implementation approach for [feature] in this codebase that minimises the diff — maximum reuse of existing patterns, abstractions, and utilities. The goal is the smallest possible footprint. Describe the approach end-to-end: schema changes (if any), API/server layer, UI layer, and how it integrates with existing code. Note any trade-offs of this conservative approach."

**Clean architecture**
> "Design an implementation approach for [feature] in this codebase that prioritises maintainability and elegant abstractions. Identify the right seams to introduce new modules or abstractions. The goal is code that is easy to understand, test, and extend. Describe the approach end-to-end and note trade-offs vs. a more minimal approach."

**Pragmatic balance**
> "Design an implementation approach for [feature] in this codebase that balances speed and quality. Reuse existing patterns where it makes sense, introduce new abstractions only where they meaningfully reduce complexity. Describe the approach end-to-end and note where you made pragmatic trade-offs."

---

## Reviewer Agents (Stage 5 — Code Quality)

Launch all 3 in parallel after implementation is complete.

**Simplicity & elegance**
> "Review the recently changed code in this codebase for simplicity and elegance. Look for: unnecessary complexity, premature abstractions, duplicated logic (DRY violations), over-engineered solutions, dead code, and anything that could be expressed more clearly. Report only high-confidence issues with specific file and line references."

**Bugs & correctness**
> "Review the recently changed code in this codebase for bugs and functional correctness. Look for: off-by-one errors, null/undefined handling, incorrect conditional logic, async/await issues, missing error handling at system boundaries, and race conditions. Report only high-confidence issues with specific file and line references."

**Conventions & security**
> "Review the recently changed code in this codebase for adherence to project conventions and security. Look for: deviations from existing patterns, inconsistent naming, missing input validation at system boundaries, potential injection vectors, exposed secrets or credentials, and insecure defaults. Report only high-confidence issues with specific file and line references."
