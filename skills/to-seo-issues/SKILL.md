---
name: to-seo-issues
description: Convert an approved SEO/GEO strategy into independently executable tracker work packages.
disable-model-invocation: true
argument-hint: "Optional: one or more roadmap initiative IDs"
---

# To SEO Issues

Convert an approved strategy into bounded **work packages**, obtain approval, then publish them to the project issue tracker. A work package is complete on controllable delivery evidence; delayed organic outcomes belong to a separate review.

The issue tracker and label vocabulary should be configured. If they are missing, show `/setup-matt-pocock-skills` and stop before tracker mutations.

## 1. Establish the source and scope

Read `SEO-STRATEGY.md` and the linked research. Use the strategy schema in [the SEO strategy templates](../seo-strategy/references/templates.md). Require `Status: Active` and an approval date; never convert a Proposed strategy or a proposal/research file by itself.

When initiative IDs are supplied, select only those. Otherwise select eligible `Now` initiatives. List `Next` and `Later` initiatives with their activation conditions, but do not create issues for them.

Inspect tracker context, existing strategy and child issues, repository capabilities, and known access or approval constraints. Infer before asking; ask only when an unresolved choice would change the package graph.

**Complete when:** the authoritative strategy, selected initiatives, existing tracker state, and material execution constraints are known or explicitly unknown.

## 2. Reconcile the active strategy

Find the thesis issue through the strategy's `Tracker issue` metadata or a unique match on strategy identity. Reuse it; never duplicate it. If none exists, propose a thesis parent using [the issue templates](references/issue-templates.md).

Inspect existing child issues. Propose adding or removing `ready-for-seo-agent` when access, approvals, package definition, or review dates have changed; represent changed hard prerequisites as dependency-graph updates, never as label changes. Propose adding the label to any existing package that was withheld only because a dependency was open. A failed parallel external bet never removes readiness from otherwise executable work.

If the active strategy replaces a prior one, propose commenting on the old thesis with the replacement, marking it superseded using existing tracker vocabulary, and closing it. Never apply that transition silently.

**Complete when:** every proposed tracker mutation is identified and no thesis or work package would be duplicated.

## 3. Draft work packages

Apply [the work-package contract](references/work-package-contract.md) to every selected initiative. Give each package one archetype and split at every deliverable, capability, access, approval, dependency, verification, or measurement-window boundary.

Create outcome-review packages up front. Route code-heavy work to an Engineering handoff; do not invoke `to-issues`. Classify dependencies, keep external uncertainty off the hard path where a valid fallback exists, and withhold readiness only from packages that require unstated authority or inputs — never from packages whose only gap is an open hard prerequisite.

**Complete when:** every selected initiative has a complete delivery-and-review graph, every package is bounded and independently verifiable, and all uncontrolled dependencies have a fallback or a justified hard-prerequisite classification.

## 4. Get approval

Present the complete proposed breakdown in conversation using [the preview format](references/issue-templates.md). Include titles, archetypes, dependencies, labels, fallbacks, deferred initiatives, thesis creation or reuse, label creation, reconciliation, and supersession changes. Do not write a local draft or mutate the tracker.

Allow individual packages to be approved, revised, deferred, or removed. Recalculate coverage, dependencies, and readiness after partial approval; flag any omission that invalidates the initiative or its measurement contract.

**Complete when:** the user has explicitly approved the exact issue set and every ancillary tracker or strategy-file mutation.

## 5. Publish the approved graph

Create approved missing labels first, then publish or reuse the thesis parent. After successful thesis publication, add `Tracker issue: <reference>` to `SEO-STRATEGY.md` without changing its strategy content or manually maintained notes.

Publish work packages in dependency order, link them to the thesis parent, and record every hard prerequisite as a tracker-native blocking relationship. Apply `ready-for-seo-agent` to every package that passes the labeling contract even while its blockers are open — the SEO executor checks the dependency graph at claim time and stops on open blockers. Apply `seo-outcome-review` to every outcome review and `seo-engineering-handoff` to every engineering handoff. Put this copyable command in each published engineering handoff and in the final summary:

```text
/to-issues <engineering-handoff-issue-url>
```

Apply only approved reconciliation and supersession changes. Do not close or modify unrelated issues.

**Complete when:** every approved issue exists once, every hard prerequisite is a resolvable blocking relationship, labels reflect the labeling contract, the strategy backlink resolves, and every engineering command contains its real issue URL.

## 6. Hand off execution

Report created, reused, reconciled, deferred, and blocked items. Separate packages ready for an SEO agent from human actions and engineering handoffs. Do not claim strategy outcomes or wait for review windows.

**Complete when:** the user can dispatch every currently actionable package without reconstructing context or commands.
