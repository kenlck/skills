# Templates

## SEO.md (repo root — living fact sheet)

Update generated sections in place each run. Append to Score history. Never touch the Notes section.

```markdown
# SEO Facts — <site name>

Last audited: YYYY-MM-DD by `/seo` · Latest report: [seo-reports/seo-report-YYYY-MM-DD.md](seo-reports/seo-report-YYYY-MM-DD.md)

## Site

- Deployed URL: <url or "none — codebase-only audit">
- Stack: <framework + version>
- Rendering: <SSR / SSG / CSR, per route group if mixed>
- Hosting / CDN: <if known>

## Routes

| Route / template | Indexable | Title source | Meta desc | Canonical | Schema types |
|---|---|---|---|---|---|
| / | yes | app/page.tsx metadata | yes | yes | Organization, WebSite |

## Infrastructure

- robots.txt: <source location; AI-crawler policy: which search bots allowed, which training bots blocked, or "none — undecided">
- Sitemap: <how generated, location>
- llms.txt: <present at …, or absent>
- Redirect policy: <https ✓, host policy, trailing slash>

## Content

- Content types: <blog posts in src/content/, product pages from CMS, …>
- Authorship & dates: <how authors/dates are attached, if at all>
- Target keywords / priority pages: <from the user; carry forward between runs>

## Score history

| Date | SEO | GEO | Report |
|---|---|---|---|
| YYYY-MM-DD | 62 (D) | 41 (F) | seo-reports/seo-report-YYYY-MM-DD.md |

## Notes (manually maintained — never overwritten by /seo)

<user-owned>
```

## seo-reports/seo-report-YYYY-MM-DD.md

```markdown
# SEO/GEO Audit Report — YYYY-MM-DD

Site: <url or repo name> · Stack: <framework> · Scope: <full / focus area, live checks run or skipped>

## Executive summary

- **SEO score: NN/100 (grade)** <Δ+n vs YYYY-MM-DD, if prior report>
- **GEO score: NN/100 (grade)** <Δ>
- <2–4 sentences: the site's biggest strength, its biggest blocker, and the single highest-leverage fix.>

## Scorecard

| Category | Score | Grade | Δ | Weight (SEO / GEO) |
|---|---|---|---|---|
| Crawlability & Indexation | NN | B | +5 | 20% / 10% |
| … | | | | |

## Findings

One subsection per category. Passing checks get one summary line; every `partial`/`fail` gets a row:

### <Category>

| Check | Status | Evidence | Fix |
|---|---|---|---|
| M3 canonical tags | fail | no canonical in app/layout.tsx head, absent from raw HTML | add metadata.alternates.canonical in app/layout.tsx |

## Improvement plan

Every failing check appears in exactly one tier. Each item: what to do, exact files, rubric points recovered (state headline impact via the category weight).

### Quick wins (high impact, low effort — do this week)
1. …

### Structural fixes (high impact, higher effort)
1. …

### Long-term (content & authority work)
1. …

## Not covered by this audit

<Standing limitations: CWV field data (needs PageSpeed Insights/CrUX), backlink profile, Search Console indexation data, rank tracking — plus anything skipped this run.>
```
