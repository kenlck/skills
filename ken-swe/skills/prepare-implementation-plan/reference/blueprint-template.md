# Blueprint structure

The exact structure for the plan written in Step 3. Fill every section. A small model executes this — usually via a TDD skill — so spell out the behaviours and the order; do not leave decisions for the executor.

```markdown
# <title>

**Source:** <work-item ID(s) / "manual">

## Summary

<1–3 sentences: what this delivers and why.>

## Interface

<The public shape the executor must build to: function signatures, API/route, CLI, types. Pin it concretely — the executor will not redesign it.>

## Behaviours to test

Prioritized; the executor tracer-bullets #1 first, then down the list.

| #   | Behaviour              | Acceptance criterion | Verification                    |
| --- | ---------------------- | -------------------- | ------------------------------- |
| 1   | <one thing it must do> | AC-<n>               | <test / command / manual check> |

For any judgement-call behaviour, list the concrete examples that **must pass** and that **must fail** — the executor turns these into test cases verbatim.

## Files changed

| File         | Action                   | Change         | Which behaviour it serves |
| ------------ | ------------------------ | -------------- | ------------------------- |
| path/to/file | create / modify / delete | <what changes> | #<n>                      |

## Build order

Vertical slices, in sequence. Each is one behaviour from the table built test-first end-to-end — not a horizontal file-by-file pass.

1. <behaviour #N — the tracer bullet>
2. <next behaviour, …>

## Out of scope

- <explicitly excluded>

## Open questions / deferred

- <anything parked during grilling, or "none">
```
