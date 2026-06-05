---
name: feature-planning
description: Converts an approved mini discovery report into a scoped implementation plan and waits for exact plan approval. Use when discovery is approved and the mini workflow enters PLANNING.
disable-model-invocation: true
---

# Feature Planning

## Activation Contract

Perform PLANNING only.

Allowed writes:

- `plans/feature-dev-mini/<slug>/state.md`
- `plans/feature-dev-mini/<slug>/plan.md`

Forbidden:

- implementation
- code changes outside the state directory
- new discovery grilling
- scope expansion beyond approved discovery

## Prerequisites

Read `state.md` and `discovery.md`.

Stop unless:

```text
Discovery Complete: yes
Discovery Approved: yes
```

Exact approval must be recorded from user text `APPROVE DISCOVERY`.

## Workflow

1. Derive the plan from approved `discovery.md`.
2. Create a single recommended implementation path.
3. Include brief alternatives considered.
4. Write `plan.md`.
5. Set `Plan Complete: yes`.
6. End with `WAITING FOR APPROVAL: PLAN`.

## Plan Report

Write `plan.md` with:

```text
# Plan: <feature>

Discovery Source:
Recommended Approach:
Alternatives Considered:
Execution Steps:
File-by-File Change List:
Testing Strategy:
Rollback Strategy:
Risks and Mitigations:
Out of Scope:
```

Do not continue to implementation.

Final response must end exactly:

```text
WAITING FOR APPROVAL: PLAN
```
