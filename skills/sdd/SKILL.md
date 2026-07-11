---
name: sdd
description: Deliver one tracker work package labeled `ready-for-seo-agent` through acceptance → delivery → evidence.
---

# SEO Delivery Discipline

SDD is the **acceptance → delivery → evidence** loop. Deliver one bounded SEO work package at a time, prove its controllable acceptance, and return the result.

Use [the shared work-package contract](../to-seo-issues/references/work-package-contract.md) as the authority for archetypes, dependencies, readiness, labels, and controllable completion.

## 1. Resolve the package

Read the assigned issue, its thesis parent, the active strategy and linked research, every dependency, and the shared contract. Inspect the named delivery surfaces and verify every readiness condition in the contract from its actual source; `ready-for-seo-agent` is a routing signal, not proof.

Choose exactly one preflight state:

- **Deliver** — the issue has one bounded, non-engineering archetype and every readiness condition passes.
- **Hold** — a readiness condition fails or cannot be verified. Name the failed condition and the exact unblock action.
- **Redirect** — the issue is a strategy or engineering handoff, crosses a split boundary, uses the wrong archetype, conflicts with the active strategy, or requests unsafe work. Diagnose the needed reclassification, decomposition, strategy review, or safe alternative. For engineering work, return `/to-issues <engineering-handoff-issue-url>`.

Treat the tracker as read-only. Return lifecycle implications to the caller who owns issue comments, fields, labels, checkboxes, assignment, closure, and dependent promotion.

**Complete when:** every required source and readiness condition has been inspected, all conflicts and unknowns are explicit, and exactly one supported preflight state follows from the evidence.

## 2. Establish the specification oracle

For every delivery-acceptance criterion, identify:

- the current observable state;
- the authoritative requirement, rubric, approved exemplar, or independent expected value;
- the smallest authorized action that could satisfy it;
- the named delivery surface and artifact destination;
- the verification method and evidence location.

For editorial judgment, use the issue's audience, rubric, constraints, authoritative references, and approved exemplars as a **specification oracle**. Map each subjective criterion to specific evidence in the deliverable. An unstated taste or required human judgment puts the package on **Hold**.

Use the destination named by the issue, then an established project convention. A persistent deliverable with neither destination puts the package on **Hold**. Repository-managed content, metadata, citation data, and other SEO artifacts remain SEO delivery; a change to executable behavior, components, tests, migrations, or build configuration is an engineering **Redirect** regardless of size.

For an external action, verify scope-specific authority for the surface, identity, recipients or targets, final action, and any batch, spending, or usage limit. Missing, ambiguous, stale, or materially changed authority puts the package on **Hold**. Obtain a fresh user checkpoint immediately before a destructive or irreversible action.

**Complete when:** every acceptance criterion has one observable oracle, authorized action, destination, verification method, and evidence location, or the run has returned the exact **Hold** or **Redirect** reason.

## 3. Deliver in acceptance slices

Read only the matching archetype section in [the execution guide](references/archetype-execution.md), then work one acceptance criterion at a time:

1. Reconstruct state from the actual delivery surface and existing artifacts.
2. Reverify satisfied criteria and select the first unmet criterion.
3. Perform its smallest bounded delivery action.
4. Verify the result through the named surface or an independent validator and preserve the evidence.
5. Repeat from the newly observed state.

Use stable identifiers derived from the issue and acceptance slice when a destination supports idempotency. Retry a transient idempotent operation at most twice while respecting provider backoff. Before repeating an external side effect, verify conclusively that the first attempt did not occur; an ambiguous result, exhausted retry, deferred rate limit, unavailable paid capacity, expired authentication, or tool limit puts the package on **Hold**.

When a new split boundary, classification error, safety problem, or strategy conflict appears, preserve completed artifacts and evidence and return **Redirect** at the exact resumable boundary.

**Complete when:** every acceptance criterion has independently observable evidence, or all completed slices are preserved and the first unmet criterion has an exact **Hold** or **Redirect** boundary.

## 4. Return delivery evidence

Return **Delivered**, **Hold**, or **Redirect**, the deliverable locations, and this manifest:

| Acceptance criterion | Verification method | Observable result | Artifact or surface |
|---|---|---|---|
| ... | ... | ... | ... |

State limitations, uncontrolled outcomes, and the resumable boundary where applicable. Rankings, traffic, citations, replies, placements, and conversions remain unclaimed until a ready outcome-review package evaluates its elapsed window.

Keep durable output to the requested deliverable and evidence artifacts required by acceptance. The conversational manifest is the run record.

**Complete when:** the status is unambiguous, every acceptance criterion appears once in the manifest, every artifact is locatable, and every limitation or remaining action has a boundary and a named or explicitly unassigned owner.
