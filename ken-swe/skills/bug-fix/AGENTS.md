# Agent Prompts Reference

Used by `bug-fix` to launch general-purpose agents via the Agent tool. Customise each prompt with the actual bug description and context before launching.

---

## Tracer Agents (Stage 2 — Root Cause Analysis)

Launch 2–3 in parallel, each tracing a different angle of the failure.

**Execution path trace**
> "Trace the execution path for [action/flow] where the bug occurs in this codebase. Start from the entry point (e.g. the route handler, event listener, or function call), follow through every layer, and identify exactly where the failure could originate. Return the key files involved and a summary of what each layer does."

**Data / state flow trace**
> "Trace how [data/state] flows through [component/module] involved in this bug. Follow where it is created, transformed, passed, and consumed. Look for places where it could be mutated unexpectedly, lost, or incorrect. Return key files and a summary of the data path."

**Historical & test context**
> "Search this codebase for: (1) any tests covering [affected area], (2) recent changes or commits touching [affected files], and (3) any similar bugs or defensive patterns already in place around [affected area]. Return key files and a summary of what context exists."

---

## Fixer Agents (Stage 3 — Fix Design)

Launch 2–3 in parallel, each with a different fix philosophy.

**Minimal patch**
> "Design the smallest targeted fix for this bug in [affected area]: [root cause summary]. The goal is the minimum change that correctly addresses the root cause with the lowest possible blast radius. No refactoring unless strictly necessary. Describe the fix end-to-end and note its trade-offs and regression risks."

**Clean fix**
> "Design a clean fix for this bug in [affected area]: [root cause summary]. Address the root cause properly — you may refactor or improve surrounding code if it directly contributes to correctness or prevents the same bug recurring. Describe the fix end-to-end and note trade-offs vs. a more minimal approach."

**Defensive fix**
> "Design a defensive fix for this bug in [affected area]: [root cause summary]. Fix the root cause and add safeguards — input validation, guard clauses, better error handling — to prevent similar bugs nearby. Describe the fix end-to-end and note trade-offs vs. a simpler approach."

---

## Regression Agents (Stage 5 — Regression Risk)

Launch all 3 in parallel after implementation to assess what else might break.

**Call site audit**
> "Find all call sites and usages of [changed function/component/module] across this codebase. For each, assess whether the behavior change introduced by the fix could affect it. Return a list of at-risk locations with a brief explanation of the risk."

**Test coverage check**
> "Identify all existing tests (unit, integration, e2e) that cover the changed code or closely related code paths in this codebase. List which tests should be run to validate the fix and flag any gaps in coverage that could hide regressions."

**Similar pattern audit**
> "Search this codebase for other code that relies on the same behavior that was changed, or that has the same bug pattern as [root cause summary]. List any locations that might have the same issue or could break due to the fix."

---

## Reviewer Agents (Stage 5 — Quality Review)

Launch all 3 in parallel after implementation.

**Correctness**
> "Review the recently changed code in this codebase for correctness. Does the fix actually address the root cause? Are there edge cases it misses? Could the fix fail under certain inputs or conditions? Report only high-confidence issues with specific file and line references."

**Side effects & regressions**
> "Review the recently changed code in this codebase for unintended side effects and regressions. Does the fix change behavior in unexpected ways beyond the bug being fixed? Does it introduce new failure modes? Report only high-confidence issues with specific file and line references."

**Conventions & quality**
> "Review the recently changed code in this codebase for adherence to project conventions and quality standards. Look for: style inconsistencies, missing error handling, security concerns, and deviations from existing patterns. Report only high-confidence issues with specific file and line references."
