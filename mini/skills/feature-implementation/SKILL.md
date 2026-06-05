---
name: feature-implementation
description: Executes an approved mini feature plan without redesigning architecture or expanding scope. Use when the mini workflow has an exact approved plan and enters IMPLEMENTATION.
disable-model-invocation: true
---

# Feature Implementation

## Activation Contract

Implement the approved plan only.

Forbidden:

- redesigning architecture
- expanding scope
- skipping planned files or tests without reporting why
- changing unrelated files

## Prerequisites

Read `state.md`, `discovery.md`, and `plan.md`.

Stop unless:

```text
Discovery Approved: yes
Plan Complete: yes
Plan Approved: yes
```

Exact plan approval must be recorded from user text `APPROVE PLAN`.

## Workflow

1. Restate the approved plan in one short paragraph.
2. Implement the file-by-file change list.
3. Update progress as work proceeds.
4. If a deviation changes scope or architecture, stop and return to planning.
5. Run checks needed during implementation.
6. Set `Implementation Complete: yes`.
7. Set `Current State: VALIDATION`.
8. Route to `/mini:feature-validation`.

## Deviation Rule

Allowed deviation:

- minor file path or naming adjustment that preserves the approved plan

Forbidden deviation:

- new architecture
- new feature behavior
- removed requirement
- changed testing strategy without reason

Report every deviation in the final implementation summary.

## Fallback

After implementation, print:

```text
NEXT REQUIRED SKILL: /mini:feature-validation
STOP IF THAT SKILL IS NOT ACTIVE.
```
