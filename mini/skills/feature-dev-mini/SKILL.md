---
name: feature-dev-mini
description: Routes feature work through a strict mini-model state machine with discovery, planning, implementation, and validation skills. Use when building a feature with GPT-5.4/5.5 Mini, Codex, or any agent that must not code before approved discovery and plan.
disable-model-invocation: true
---

# Feature Dev Mini

## Activation Contract

When this skill is active:

1. Route workflow only.
2. Do not perform discovery, planning, coding, or validation here.
3. Do not modify project files except the state directory.
4. Enforce exact approvals.
5. If routing fails, print the fallback stop line.

Violation is workflow failure.

## State

State belongs in the target project:

```text
plans/feature-dev-mini/<feature-slug>/
  state.md
  discovery.md
  plan.md
  validation.md
```

Choose `<feature-slug>` from 3-6 lowercase kebab-case words from the request.

`state.md` must track:

```text
Feature:
Slug:
Current State:
Discovery Complete: yes/no
Discovery Approved: yes/no
Plan Complete: yes/no
Plan Approved: yes/no
Implementation Complete: yes/no
Validation Complete: yes/no
```

## Approval Rules

Only these exact user messages count:

- `APPROVE DISCOVERY`
- `APPROVE PLAN`

Anything else is a question, correction, or change request.

## Routing

Before every action, read `state.md` if it exists.

If no state exists:

1. Create the state directory.
2. Set `Current State: DISCOVERY`.
3. Set every completion and approval flag to `no`.
4. Route to `/mini:feature-discovery`.

If `Discovery Complete: no`, route to `/mini:feature-discovery`.

If `Discovery Complete: yes` and `Discovery Approved: no`:

- If the current user message is exactly `APPROVE DISCOVERY`, set `Discovery Approved: yes`, set `Current State: PLANNING`, then route to `/mini:feature-planning`.
- Otherwise stop and ask for exact approval.

If `Plan Complete: no`, route to `/mini:feature-planning`.

If `Plan Complete: yes` and `Plan Approved: no`:

- If the current user message is exactly `APPROVE PLAN`, set `Plan Approved: yes`, set `Current State: IMPLEMENTATION`, then route to `/mini:feature-implementation`.
- Otherwise stop and ask for exact approval.

If `Plan Approved: yes` and `Implementation Complete: no`, route to `/mini:feature-implementation`.

If `Implementation Complete: yes` and `Validation Complete: no`, route to `/mini:feature-validation`.

If all flags are complete, summarize the artifact paths.

## Fallback

When routing, print:

```text
NEXT REQUIRED SKILL: /mini:<skill-name>
STOP IF THAT SKILL IS NOT ACTIVE.
```

Then continue only if that child skill is active.
