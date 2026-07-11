# Artifact templates

Use paths relative to the repository being analyzed:

```text
SEO-STRATEGY.md
seo-strategy/
├── proposals/
├── research/
└── history/
```

Use `YYYY-MM-DD-short-slug.md`; add a numeric suffix when the name already exists. Research and history files are immutable. Preserve `## Notes (manually maintained)` in `SEO-STRATEGY.md` verbatim.

Preserve `Tracker issue` when refreshing the same strategy. Set it to `not published` for a new or materially replaced strategy; `/to-seo-issues` replaces that value after publishing the approved thesis issue.

## Current strategy

```markdown
# SEO/GEO Strategy — <site>

- Status: Proposed | Active
- Approved: YYYY-MM-DD | not yet
- Last reviewed: YYYY-MM-DD
- Next review: YYYY-MM-DD
- Market / language: <primary market> / <language>
- Tracker issue: <reference> | not published
- Research: [<label>](seo-strategy/research/<file>.md)
- Previous strategy: [<label>](seo-strategy/history/<file>.md) | none

## Thesis

<Audience + market + chosen direction + business outcome + why now.>

## Objective and audience

- Business outcome:
- Valuable conversion:
- Audience:
- Assumptions / unknowns:

## Strategic bets

### Primary — <bet>

- Market / language:
- SEO rationale:
- GEO rationale:
- Why it wins:
- Risks and dependencies:

### Secondary — <bet>

- Market / language:
- Activation trigger:
- SEO rationale:
- GEO rationale:
- Risks and dependencies:

## Six-month direction

<The intended position and outcome, not a six-month task list.>

## 90-day roadmap

### <Initiative ID> — <outcome-oriented name>

- Outcome:
- Why this advances the thesis:
- Scope:
- Non-goals:
- Deliverables:
- Dependencies:
- Completion evidence:
- Measurement link: Primary | Secondary
- Required capabilities:
- Effort: Small | Medium | Large
- Phase: Now | Next | Later
- Review point:

## Measurement contracts

### Primary bet

- Business outcome:
- Leading indicators:
- Guardrails:
- Baseline: known | unknown | must be established
- Review window:
- Continue when:
- Adjust when:
- Stop when:

### Secondary bet

<same fields>

## Risks and dependencies

- ...

## Decision log

| Date | Decision | Reason | Evidence |
|---|---|---|---|

## Notes (manually maintained)

<user-owned>
```

## Research snapshot

```markdown
# SEO/GEO Strategy Research — <decision> — YYYY-MM-DD

- Branch: Validate | Discover | Compare | Refresh
- Site:
- Market / language:
- Decision:
- Existing strategy:

## Frame

- Business outcome and conversion:
- Audience:
- Material assumptions and unknowns:

## Method and sources

<Queries/prompts, tools or datasets, observation context, dated links, and limitations.>

## Evidence

### Demand and intent
### Competitive landscape
### Site fit
### Off-site authority
### GEO
### Performance evidence

For each claim distinguish **Observation**, **Inference**, or **Hypothesis**.

## Opportunity portfolio

| Opportunity | Business value | Intent fit | Evidence | Attainability | Site fit | Complexity | Time to signal | Durability | SEO | GEO |
|---|---|---|---|---|---|---|---|---|---|---|

## Screened out

| Direction | Reason |
|---|---|

## Proposed thesis

- Primary bet:
- Secondary bet and activation trigger:
- Why these beat the alternatives:
- Confidence and what could change the decision:
```

## Proposal

```markdown
# SEO/GEO Proposal — <idea>

- Status: Captured | Validated | Deferred | Rejected | Promoted
- Created: YYYY-MM-DD
- Last decision: YYYY-MM-DD
- Revisit: <date, trigger, or none>
- Research: <link or "not researched">
- Active strategy: <link or none>

## Idea

<Keyword, topic, activity, audience, and intended value as known.>

## Assumptions and evidence

- ...

## Decision record

| Date | Status | Reason | Evidence |
|---|---|---|---|
```

## History snapshot

Before a material replacement, copy the complete Active `SEO-STRATEGY.md` to `seo-strategy/history/YYYY-MM-DD-short-thesis.md`, change its status to `Superseded`, and add:

```markdown
- Superseded: YYYY-MM-DD
- Replaced by: [SEO-STRATEGY.md](../../SEO-STRATEGY.md)
- Replacement decision: [research](../research/<file>.md)
```

Then update the living strategy. Never edit the history snapshot again.
