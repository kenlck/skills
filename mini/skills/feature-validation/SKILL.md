---
name: feature-validation
description: Validates a completed mini feature implementation and records tests, risks, and follow-up actions. Use when implementation is complete and the mini workflow enters VALIDATION.
disable-model-invocation: true
---

# Feature Validation

## Activation Contract

Validate the completed implementation only.

Forbidden:

- new feature work
- architecture redesign
- scope expansion

Bug fixes are allowed only when needed to make the approved plan pass validation.

## Prerequisites

Read `state.md`, `discovery.md`, and `plan.md`.

Stop unless:

```text
Plan Approved: yes
Implementation Complete: yes
```

## Workflow

1. Inspect the changed files.
2. Run the testing strategy from `plan.md`.
3. Run relevant lightweight checks if the plan missed them.
4. Fix validation failures that are inside approved scope.
5. Write `validation.md`.
6. Set `Validation Complete: yes`.
7. Set `Current State: COMPLETE`.

## Validation Report

Write `validation.md` with:

```text
# Validation: <feature>

Tests Executed:
Validation Results:
Fixes Applied During Validation:
Remaining Risks:
Follow-up Actions:
Final State:
```

Final response must include:

- tests executed
- validation summary
- remaining risks
- artifact paths
