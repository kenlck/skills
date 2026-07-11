# Issue templates

Use tracker-native parent and dependency relationships when available; otherwise preserve them as explicit body references. Use the active strategy's vocabulary. Do not copy its full research or thesis into every child issue.

## Approval preview

Show thesis creation or reuse, missing-label creation, reconciliation and supersession changes, then a numbered package list. For each package show:

- title and archetype;
- parent and hard blockers;
- parallel external bets and fallback;
- proposed labels and why it is or is not ready;
- delivery evidence or review decision;
- deferred or screened-out roadmap work.

Ask for explicit approval of this exact mutation set. After partial approval, show the recalculated graph before publishing.

## Thesis parent

**Title:** `[SEO strategy] <short thesis>`

```markdown
## Source

- Strategy: <repository link>
- Approved: <date>
- Market / language: <market> / <language>
- Research: <immutable research links>

## Thesis

<Audience, chosen direction, business outcome, and why now.>

## Objective and audience

- Business outcome:
- Valuable conversion:
- Audience:
- Assumptions / unknowns:

## Strategic bets

### Primary — <bet>
<SEO and GEO rationale, risks, and dependencies.>

### Secondary — <bet>
<Activation trigger, rationale, risks, and dependencies.>

## Six-month direction

<Intended position and outcome.>

## 90-day roadmap

<Initiative-level summary with IDs, phases, dependencies, and review points.>

## Measurement contracts

<Primary and secondary outcomes, indicators, guardrails, baselines, windows, and decision rules.>

## Risks and dependencies

- ...
```

Apply `seo-strategy`, never `ready-for-seo-agent`. Reuse a matching issue instead of publishing another.

## Delivery work package

**Title:** `<actionable deliverable>`

```markdown
## Parent

<Thesis issue reference and roadmap initiative ID>

## Work package

- Archetype: Baseline/setup | Evidence/brief | Production | Publication/change | Outreach cycle
- Outcome:
- Why this advances the strategy:
- Audience / intent: <when relevant>
- Measurement contribution:

## Deliverable

<One bounded output or state change.>

## Scope

- In:
- Non-goals:

## Inputs, access, and approvals

- Available:
- Required:
- Human decision boundary:

## Delivery acceptance

- [ ] <controllable, observable criterion>
- [ ] <controllable, observable criterion>

## Completion evidence

- <artifact, tracker record, URL, screenshot, query, or observable verification>

## Dependencies and fallback

- Hard prerequisites: <references or none>
- Parallel external bets: <references or none>
- Enhancements: <references or none>
- Fallback:
```

Apply `ready-for-seo-agent` only when the readiness contract passes.

## Outcome review

**Title:** `Review: <initiative or experiment outcome>`

```markdown
## Parent

<Thesis issue reference and roadmap initiative ID>

## Hypothesis

<The claim this review will evaluate.>

## Delivery inputs

- <completed package references>

## Observation window

- Starts when:
- Earliest valid review date:
- Review window:

## Measurement contract

- Baseline:
- Leading indicators:
- Business outcome:
- Guardrails:
- Evidence sources:

## Decision

- Continue when:
- Adjust when:
- Stop when:

## Required output

- [ ] Evidence and limitations recorded
- [ ] Continue, adjust, or stop decision recorded
- [ ] Follow-up packages or strategy-review trigger identified
```

Always apply `seo-outcome-review`. Add `ready-for-seo-agent` only after delivery prerequisites and the observation window are complete.

## Engineering handoff

**Title:** `Engineering handoff: <SEO behavior>`

```markdown
## Parent

<Thesis issue reference and roadmap initiative ID>

## SEO outcome

<Observable search or agent-facing behavior required.>

## Scope and constraints

- In:
- Non-goals:
- Technical or product constraints:

## Acceptance evidence

- [ ] <externally observable behavior>
- [ ] <validation method>

## Dependencies

- Hard prerequisites:
- Parallel SEO packages:

## Next command

`/to-issues <this-issue-url>`
```

Apply `seo-engineering-handoff`, never `ready-for-seo-agent`. Replace the placeholder with the published issue's real URL.
