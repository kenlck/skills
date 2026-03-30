---
name: write-a-prd
description: Create a PRD with an embedded Design Direction section through user interview, codebase exploration, and design intent capture. Use when building or revamping any feature with frontend or UI work — landing pages, components, UI redesigns — where design intent needs to be locked in before implementation. Extends write-a-prd with structured design thinking: audience, tone, aesthetic direction, and the one memorable differentiator.
disable-model-invocation: true
---

# Write a PRD with Design Direction

Extends the standard PRD process with a dedicated design direction phase. Every PRD produced by this skill includes a locked-in Design Direction section so that `feature-dev` and `frontend-design` all receive the design context they need at implementation time.

## Quick start

`/write-a-prd redesign the landing page`

## Process

### Step 1: Problem description

Ask the user for a detailed description of the problem they want to solve and any initial solution ideas.

### Step 2: Codebase exploration

Explore the repo to verify their assertions and understand the current state — existing components, design system, tech stack (framework, CSS approach, component library). Note patterns already in use.

### Step 3: Feature interview

Interview the user about every aspect of the plan — user flows, data model, edge cases, integrations, modules to build or modify. Resolve one branch at a time. If a question can be answered by reading the codebase, answer it yourself.

Identify which modules should be deep (encapsulate a lot behind a simple, testable interface) vs shallow.

### Step 4: Design direction interview

For any feature with frontend or UI work, ask these 4 questions (one AskUserQuestion call):

1. **Audience & context** — Who uses this, and what's their mental state when they arrive? (e.g. skeptical dev scanning for credibility, first-time visitor deciding to sign up, power user who lives in the app daily)
2. **Tone & aesthetic** — Pick a direction or describe how it should _feel_. See [DESIGN-REFERENCE.md](DESIGN-REFERENCE.md) for vocabulary.
3. **Memorable differentiator** — What's the one thing a user should notice or remember? What makes this not a template?
4. **Design constraints** — Existing pages to stay consistent with, component library (shadcn/ui, Tailwind?), anything to explicitly avoid.

Summarize the design direction in 2–3 sentences and confirm before writing the PRD.

If the feature has no frontend work, skip this step.

### Step 5: Write the PRD

Use the template below. Save to `plans/prd-[feature].md` — ask the user which they prefer.

---

## PRD Template

```
## Problem Statement
[The problem from the user's perspective]

## Solution
[The solution from the user's perspective]

## User Stories
1. As a [actor], I want [feature], so that [benefit]
[Extensive numbered list covering all aspects]

## Implementation Decisions
[Modules to build/modify, interfaces, architectural decisions, schema changes, API contracts]
[No file paths or code snippets]

## Design Direction
- **Audience**: [who + mental state when they arrive]
- **Tone**: [aesthetic direction — e.g. editorial/refined, brutally minimal, luxury]
- **Memorable**: [the one differentiator, what users should feel or notice]
- **Stack**: [framework, CSS library, component library]
- **Constraints**: [pages to match, things to avoid]
- **Skill**: [/frontend-design | inline]

## Testing Decisions
[What makes a good test, which modules to test, prior art in the codebase]

## Out of Scope
[What this PRD does not cover]

## Further Notes
[Anything else relevant]
```

---

## Skill selection guide (for the Design Direction → Skill field)

- **`/frontend-design`** — individual components, creative UI pieces, bold one-off work where aesthetic direction is the primary goal, landing pages, full-page revamps, dashboards
- **Inline** — minor styling tweaks, copy changes, small UI adjustments that don't warrant a full skill invocation
