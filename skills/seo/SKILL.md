---
name: seo
description: Codebase-driven SEO + GEO (Generative Engine Optimization) audit. Gathers site facts into SEO.md, scores the site against a fixed rubric, and writes a dated report with a prioritized improvement plan.
disable-model-invocation: true
argument-hint: "Optional: deployed URL, or a focus area (e.g. 'structured data only')"
---

# seo

Audit this repository's SEO and GEO health from its source code, verified against the live site when a deployed URL is available. Every run produces two durable artifacts:

- **`SEO.md`** (repo root) — living fact sheet about the site's SEO, updated in place each run
- **`seo-reports/seo-report-YYYY-MM-DD.md`** — scored report and improvement plan for this run

The audit is read-only: apart from those two artifacts, touch no files unless the user accepts an offered fix in Step 6.

If the user passed a focus area as an argument, still run Step 1, then restrict Steps 2–5 to the rubric categories that match the focus, and say in the report which categories were skipped.

## Step 1 — Establish context

1. Read `SEO.md` at the repo root if it exists. It carries facts from previous runs — deployed URL, target keywords, route inventory — and a `## Notes` section that is manually maintained: preserve it verbatim.
2. Detect the stack and rendering strategy using the framework table in [references/stack-guide.md](references/stack-guide.md). Determine per route group whether HTML is server-rendered/static or client-rendered — this decides whether crawlers see content in the raw response.
3. Build the route inventory: every indexable route or page template, and where its title/meta/schema come from.
4. Resolve the deployed URL, in order: skill argument → `SEO.md` → repo config (`package.json` `homepage`, `CNAME`, `vercel.json`, `netlify.toml`, framework config `site`/`siteUrl`). If none found, ask the user once for the URL and their target keywords/pages. No URL is fine — live checks become N/A.

Done when: stack, rendering strategy per route group, route inventory, and deployed URL (or an explicit "none") are all known.

## Step 2 — Run the audit

Work through every check in [references/rubric.md](references/rubric.md), category by category. The rubric is the single source of truth for what is checked and how many points it carries; [references/stack-guide.md](references/stack-guide.md) tells you where to look per framework and how to run the live checks.

For each check record:

- **Status**: `pass` / `partial` / `fail` / `n/a`
- **Evidence**: `file:line` for codebase checks, response snippet or header for live checks. A check without evidence is `n/a` with a reason — never a guessed status.
- **Fix**: for `fail`/`partial`, the concrete change and the exact file(s) to make it in.

Codebase checks always run. Live checks run only when a deployed URL exists; otherwise mark them `n/a — no deployed URL`. Heed the JS-injection caveat in the stack guide: client-injected tags that never reach the raw HTML are a finding, not a pass.

Done when: every rubric check has a status, and every non-`n/a` status has evidence.

## Step 3 — Update SEO.md

Write the fact sheet using the SEO.md template in [references/templates.md](references/templates.md). Update in place:

- Refresh every generated section to match today's findings.
- Append (never rewrite) one row to the score history table.
- Preserve the `## Notes (manually maintained)` section exactly as found; create it empty if new.

Done when: SEO.md reflects the current audit and prior manual notes survived.

## Step 4 — Score

Compute each category score and the two headline scores (**SEO** and **GEO**) exactly as defined in the Scoring section of [references/rubric.md](references/rubric.md) — statuses map to points, `n/a` items renormalize the category, headline scores apply the fixed weights, grades come from the grade bands. If `seo-reports/` contains a previous report, compute the delta per category and per headline score.

Done when: seven category scores, two headline scores with grades, and deltas (when a prior report exists) are computed and each traces back to recorded statuses.

## Step 5 — Report and plan

Write `seo-reports/seo-report-YYYY-MM-DD.md` from the report template in [references/templates.md](references/templates.md). Findings carry their evidence; the improvement plan orders fixes by impact × effort into Quick wins / Structural fixes / Long-term, and every plan item names the exact files to change and the rubric points it recovers.

Done when: the dated report file exists and every failing check appears in exactly one plan tier.

## Step 6 — Summarize and offer

Print in chat: both headline scores with grades and deltas, the category scorecard, and the top 5 actions from the plan. Then offer to implement the quick wins (typical examples: generate `llms.txt`, add missing canonicals, add `Organization` JSON-LD, fix robots.txt AI-crawler policy). Implement only what the user accepts.

Done when: the summary is delivered and either fixes were explicitly accepted and applied, or no source file changed.
