---
name: seo-strategy
description: Research and maintain an evidence-backed SEO/GEO thesis, opportunity portfolio, and execution-ready roadmap.
disable-model-invocation: true
argument-hint: "Optional: capture an idea, validate a keyword/topic, discover opportunities, compare directions, or refresh the active strategy"
---

# seo-strategy

Decide where a site should compete next. Form a defensible **thesis**, select one primary and one secondary strategic bet, and document a six-month direction with a 90-day initiative roadmap. Do not implement the roadmap.

The skill may read an existing `SEO.md` or `seo-reports/`, but an audit is optional: never invoke `/seo` or duplicate its rubric automatically. Apart from the artifacts below, remain read-only.

## Select the branch

- **Capture** — record an idea without research, then stop.
- **Validate** — challenge a supplied keyword, topic, or activity against adjacent alternatives and obvious prerequisites.
- **Discover** — survey the SEO/GEO opportunity landscape before choosing a direction.
- **Compare** — test named alternatives and add one evidence-backed challenger when appropriate.
- **Refresh** — test the active thesis against results, changed conditions, and eligible proposals.

On a bare invocation, use Refresh when `SEO-STRATEGY.md` has an active strategy; otherwise use Discover. Infer context before asking. Ask one focused question only when a missing fact would materially change the research; accept `unknown` and disclose a safe assumption when possible.

For Capture, write a `Captured` proposal using [references/templates.md](references/templates.md). Do not perform live research, form a thesis, or alter the active strategy.

## 1. Frame the decision

Read the current strategy artifacts, relevant repository files, and live site when known. Establish the branch, business outcome, valuable conversion, audience, primary market, language, and decision being made. Treat user-supplied capacity as optional.

**Complete when:** every field is known, inferred and disclosed, or explicitly `unknown`.

## 2. Build the evidence base

Follow [references/research-method.md](references/research-method.md) for the selected branch. Write a dated research snapshot from [references/templates.md](references/templates.md). Live external research is required unless the user explicitly asks for a preliminary offline pass.

**Complete when:** material claims are sourced and dated, unavailable metrics remain `unknown`, and the branch's research frontier is covered.

## 3. Form the opportunity portfolio

Apply [references/opportunity-framework.md](references/opportunity-framework.md). Evaluate every credible option or record why it was screened out. Use qualitative judgments, not an aggregate numeric score.

**Complete when:** the portfolio exposes the meaningful trade-offs and no plausible direction has disappeared without a reason.

## 4. Propose the thesis

Choose one primary and one secondary bet. State why they beat the alternatives, with separate SEO and GEO rationales, risks, dependencies, and a lightweight measurement contract for each.

**Complete when:** the recommendation connects the business outcome to the evidence, bets, and continue/adjust/stop rules.

## 5. Get the decision

Present the thesis and ask the user to approve or revise it. Never silently replace an active strategy. If approval is unavailable, preserve the proposal according to [references/opportunity-framework.md](references/opportunity-framework.md).

**Complete when:** the thesis is approved, revised, rejected, deferred, or explicitly left proposed.

## 6. Record the strategy

Use [references/templates.md](references/templates.md) to write the current strategy, proposal state, and any required history snapshot. The roadmap contains initiatives, not tickets: each initiative names its outcome, scope, deliverables, dependencies, completion evidence, measurement link, capabilities, phase, and review point.

**Complete when:** the artifacts link to one another, the current lifecycle state is unambiguous, the 90-day roadmap is execution-ready, manually maintained notes are preserved verbatim, and no implementation work was performed.
