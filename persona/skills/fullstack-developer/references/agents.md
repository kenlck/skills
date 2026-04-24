# Agent Prompts Reference

Used by `fullstack-develop` to launch general-purpose subagents via the Agent tool at Stages 2 (codebase exploration), 3 (architecture design), and 6 (code review). Customize each prompt with the actual feature name and context before launching.

Pattern: launch 2–3 in parallel for Explorer and Architect; all 3 in parallel for Reviewer.

---

## Explorer Agents (Stage 2 — Codebase Exploration)

Launch 2–3 in parallel, each targeting a different aspect. Pick the most relevant from the list below for the feature in question.

**Similar features**

> "Find features in this codebase that are similar to [feature]. Trace through their full implementation — schema, data access layer, service / business logic, handlers / API routes, and any shared utilities. Return a list of 5–10 key files and a summary of patterns, abstractions, and conventions used."

**Architecture & data layer**

> "Map the architecture and data layer for [feature area] in this codebase. Trace through how data is defined (schemas/models), queried (repositories / query builders), and consumed (services / handlers). Identify transaction boundaries and how migrations are authored. Return key files and a summary of abstractions to reuse or extend."

**Error handling & observability**

> "Identify error-handling and observability conventions in this codebase relevant to [feature]. How are errors raised, caught, and propagated across layers? What's the logging convention (structured / level / redaction)? Where are metrics and traces added? Return key files and a summary of conventions to follow."

**Testing patterns**

> "Identify testing patterns in this codebase relevant to [feature]. What's the unit / integration / e2e mix? What's mocked vs real? How are fixtures / factories structured? What's the naming convention for test files and cases? Return key files and a summary of conventions to follow."

**Extension points & integrations**

> "Identify existing extension points, hooks, middleware, event consumers, or integration patterns in this codebase that are relevant to [feature]. Look for places where the new feature can plug in cleanly rather than requiring new infrastructure. Return key files and a summary of what can be reused."

**Feature-flag & rollout infrastructure**

> "Identify feature-flag and rollout infrastructure in this codebase relevant to [feature]. How are flags declared, consumed, and cleaned up? What's the config loading pattern? Are there canary or dark-launch helpers? Return key files and a summary of conventions to follow."

---

## Architect Agents (Stage 3 — Architecture Design)

Launch 2–3 in parallel, each with a different design philosophy. The variety is the point — even if one is obviously right, seeing the alternatives sharpens the recommendation.

**Minimal changes**

> "Design an implementation approach for [feature] in this codebase that minimises the diff — maximum reuse of existing patterns, abstractions, and utilities. The goal is the smallest possible footprint. Describe the approach end-to-end: data model changes (if any), service / business logic, handler / API layer, and how it integrates with existing code. Include the test strategy and any migration / rollout steps. Note the trade-offs of this conservative approach."

**Clean architecture**

> "Design an implementation approach for [feature] in this codebase that prioritises maintainability and elegant abstractions. Identify the right seams to introduce new modules or interfaces. The goal is code that is easy to understand, test, and extend. Describe the approach end-to-end including test strategy, migration plan, and observability hooks. Note trade-offs vs. a more minimal approach."

**Pragmatic balance**

> "Design an implementation approach for [feature] in this codebase that balances speed and quality. Reuse existing patterns where it makes sense, introduce new abstractions only where they meaningfully reduce complexity. Describe the approach end-to-end including test strategy, migration plan, and rollout. Note where you made pragmatic trade-offs."

**Event-driven / async (use when the feature is naturally async or long-running)**

> "Design an implementation approach for [feature] in this codebase that treats the work as event-driven / async. Identify the event shape, producer / consumer boundaries, retry and dead-letter strategy, idempotency plan, and observability. Describe the approach end-to-end including test strategy and how this compares to a synchronous alternative."

---

## Reviewer Agents (Stage 7 — Code Review)

Launch all 3 in parallel after implementation is complete. Each has a distinct lens; together they surface different classes of issue.

**Simplicity & elegance**

> "Review the recently changed code in this codebase for simplicity and elegance. Look for: unnecessary complexity, premature abstractions, duplicated logic (DRY violations), over-engineered solutions, dead code, wrapper classes around stdlib primitives, defensive checks for unreachable branches, and anything that could be expressed more clearly. Report only high-confidence issues with specific file and line references."

**Bugs & correctness**

> "Review the recently changed code in this codebase for bugs and functional correctness. Look for: off-by-one errors, null/undefined handling, incorrect conditional logic, async/await issues, N+1 queries, missing error handling at system boundaries, race conditions, and concurrent mutation hazards. Check idempotency of mutations and bounds on retries. Report only high-confidence issues with specific file and line references."

**Conventions & security**

> "Review the recently changed code in this codebase for adherence to project conventions and security. Look for: deviations from existing patterns, inconsistent naming, missing input validation at trust boundaries, potential injection vectors (SQL / command / XSS / SSRF), exposed secrets or credentials, unredacted PII in logs, missing authorization checks, and insecure defaults. Report only high-confidence issues with specific file and line references."

**Observability & operations (optional — use for production-critical features)**

> "Review the recently changed code in this codebase for observability and operational readiness. Look for: missing request / trace IDs in logs, missing metrics for the new action, missing error-class breakdown, missing feature-flag wiring, missing kill-switch, migrations without a tested `down()`, and rollback paths that are undocumented or untested. Report only high-confidence issues with specific file and line references."
