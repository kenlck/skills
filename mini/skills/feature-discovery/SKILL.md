---
name: feature-discovery
description: Produces codebase-first discovery reports and grills unresolved decisions before planning. Use when the mini feature workflow enters DISCOVERY or the orchestrator routes to discovery.
disable-model-invocation: true
---

# Feature Discovery

## Activation Contract

Perform DISCOVERY only.

Allowed writes:

- `plans/feature-dev-mini/<slug>/state.md`
- `plans/feature-dev-mini/<slug>/discovery.md`

Forbidden:

- implementation
- code changes
- project file modifications outside the state directory
- planning the solution

## Workflow

1. Read or create `state.md`.
2. Confirm `Current State: DISCOVERY`.
3. Inspect the codebase before asking questions.
4. Run the mandatory grill loop.
5. Write `discovery.md`.
6. Set `Discovery Complete: yes`.
7. End with `WAITING FOR APPROVAL: DISCOVERY`.

## Codebase-First Checklist

Before finalizing discovery, inspect:

- similar feature or nearest equivalent
- entry points: route, command, page, API, or event
- data model and persistence
- shared services, utilities, hooks, or components
- tests or validation patterns
- config, auth, permissions, integrations, and side effects

Use at least 5 targeted searches and 5 relevant file reads unless the repo is too small. Cite `path:line` for every affected-file claim, or write `not found`.

Trace one relevant path from entry point to downstream dependency. If no path exists, say why.

## Mandatory Grill Loop

After codebase inspection:

1. Identify unresolved decision branches.
2. If code can answer a question, answer it yourself.
3. Ask only one question at a time.
4. Include your recommended answer and why.
5. Continue until blocking decisions are resolved or marked as assumptions.

Do not write final `discovery.md` while a blocking question is unanswered.

## Discovery Report

Write `discovery.md` with:

```text
# Discovery: <feature>

Feature Slug:
Feature Understanding:
Evidence Inspected:
Similar Feature Trace:
Affected Modules:
Affected Files:
Dependencies:
Risks:
Assumptions:
Open Questions:
Planning Readiness:
```

Final response must end exactly:

```text
WAITING FOR APPROVAL: DISCOVERY
```
