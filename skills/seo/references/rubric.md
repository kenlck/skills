# Audit rubric — checks and scoring

Single source of truth for what the audit checks and how scores are computed. Each check lists how to verify it (**Code** = static analysis, **Live** = against the deployed URL). Where both are listed, code shows intent and live confirms delivery — a live failure overrides a code pass.

## Scoring rules

- `pass` = full points, `partial` = half points, `fail` = 0, `n/a` = check excluded.
- Category score = round(earned ÷ points-of-applicable-checks × 100). If every check in a category is `n/a`, the category itself is N/A and its headline weight redistributes proportionally across the remaining categories.
- A status without evidence is invalid — record `n/a` with a reason instead.

### Headline scores

| Category | SEO weight | GEO weight |
|---|---|---|
| 1. Crawlability & Indexation | 20% | 10% |
| 2. Rendering & Technical | 20% | 15% |
| 3. On-Page Meta | 15% | — |
| 4. Structured Data | 10% | 20% |
| 5. Content & E-E-A-T | 15% | 20% |
| 6. GEO Readiness | 5% | 35% |
| 7. Performance Signals | 15% | — |

### Grade bands

A ≥ 90 · B 80–89 · C 70–79 · D 60–69 · F < 60

## 1. Crawlability & Indexation (100 pts)

| ID | Pts | Check | Verify |
|---|---|---|---|
| C1 | 15 | robots.txt exists and does not block indexable routes | Code: static file or framework robots source. Live: `GET /robots.txt` |
| C2 | 5 | robots.txt references the sitemap URL | Code + Live: `Sitemap:` line present |
| C3 | 15 | XML sitemap is generated (static, build-time, or dynamic) and covers all indexable routes | Code: sitemap source/config vs route inventory. Live: `GET /sitemap.xml` |
| C4 | 10 | Sitemap contains only canonical, indexable, 200-status URLs | Live: sample sitemap URLs; Code: exclusion of noindex/redirect routes |
| C5 | 15 | No unintended `noindex`/`nofollow` on indexable routes | Code: meta robots / `X-Robots-Tag` sources. Live: spot-check key pages |
| C6 | 15 | One canonical origin enforced by redirect: https, single host (www policy), consistent trailing slash | Live: `curl -I` on http://, www/non-www, slash variants. Code: redirect config |
| C7 | 10 | Unknown paths return HTTP 404/410, not a 200 "soft 404" | Live: `curl -I` a nonsense path. Code: framework 404 handling |
| C8 | 10 | No redirect chains; permanent moves use 301/308 | Code: redirect config. Live: follow legacy URLs with `curl -IL` |
| C9 | 5 | No orphan pages — every indexable route is reachable through internal links | Code: cross-reference route inventory against internal `<a>`/Link usage |

## 2. Rendering & Technical (100 pts)

| ID | Pts | Check | Verify |
|---|---|---|---|
| R1 | 30 | Indexable content and meta tags are in the raw HTML response (SSR/SSG), not client-injected | Code: rendering mode per route. Live: `curl` raw HTML and confirm title/content present |
| R2 | 10 | HTTPS everywhere, no mixed-content references | Code: grep for `http://` asset URLs. Live: certificate + redirect |
| R3 | 10 | Viewport meta present, responsive layout | Code: layout/head source |
| R4 | 10 | Clean URLs: lowercase, hyphen-separated, no gratuitous parameters or file extensions | Code: route definitions |
| R5 | 10 | Multi-language sites: correct `hreflang` + `lang`; single-language: `lang` set (else n/a beyond that) | Code: i18n config, html attributes |
| R6 | 10 | Pagination and faceted/filter navigation don't create duplicate indexable URLs | Code: param handling, canonical/noindex on filtered views |
| R7 | 10 | Error and empty states never return 200 with thin placeholder content | Code: error boundaries/handlers. Live: spot-check |
| R8 | 10 | No fragment-based routing (`#/…`) for indexable content | Code: router config |

## 3. On-Page Meta (100 pts)

| ID | Pts | Check | Verify |
|---|---|---|---|
| M1 | 20 | Unique title per route, ~50–60 chars, primary topic early | Code: title sources per template. Live: sample pages |
| M2 | 15 | Unique meta description per route, ~150–160 chars, states the page's value | Code + Live |
| M3 | 15 | Self-referencing canonical tag on every indexable page, absolute URL | Code + Live |
| M4 | 10 | Open Graph + Twitter Card tags with an absolute image URL | Code + Live |
| M5 | 15 | Exactly one H1 per page, aligned with the title/topic | Code: templates. Live: sample |
| M6 | 10 | Logical heading hierarchy — no levels skipped, no headings used purely for styling | Code: templates/components |
| M7 | 10 | URL slug aligned with title/H1 | Code: route inventory |
| M8 | 5 | Per-route meta robots matches intent (drafts/previews/internal noindexed) | Code |

## 4. Structured Data (100 pts)

| ID | Pts | Check | Verify |
|---|---|---|---|
| S1 | 25 | `Organization` + `WebSite` JSON-LD site-wide | Code: layout/head. Live: `ld+json` in raw HTML of homepage |
| S2 | 25 | Entity-appropriate type on each content template (`Article`/`BlogPosting`, `Product` + `Offer`, `FAQPage`, `Event`, `SoftwareApplication`, …) | Code: per-template schema source |
| S3 | 15 | Required + recommended properties populated: `author`, `datePublished`, `dateModified`, `image` on articles; `price`, `availability` on products | Code + Live |
| S4 | 10 | `BreadcrumbList` on hierarchical pages | Code + Live |
| S5 | 15 | JSON-LD is server-rendered into raw HTML — not injected client-side by JS/CMS plugins | Live: grep raw `curl` output for `application/ld+json`. Code pass alone = `partial` |
| S6 | 10 | Markup describes visible page content only (no invisible/inflated schema) | Code: compare schema fields to rendered content |

## 5. Content & E-E-A-T (100 pts)

| ID | Pts | Check | Verify |
|---|---|---|---|
| E1 | 15 | Author attribution with credentials/bio on editorial content (author pages linked) | Code: content templates/frontmatter |
| E2 | 15 | Visible published + updated dates, consistent with schema dates | Code + Live |
| E3 | 15 | Claims cited to sources; original data, examples, or first-hand experience evident | Code: sample content files |
| E4 | 10 | About, Contact, and Privacy/Terms pages exist and are linked site-wide | Code: routes + footer/nav |
| E5 | 20 | Pages satisfy their search intent with sufficient depth — no thin, doorway, or near-duplicate pages | Code: sample rendered content per template |
| E6 | 15 | Descriptive internal anchor text; related content interlinked in topic clusters | Code: content + components |
| E7 | 10 | Images have descriptive alt text | Code: grep `<img`/Image usage for missing or empty `alt` |

## 6. GEO Readiness (100 pts)

| ID | Pts | Check | Verify |
|---|---|---|---|
| G1 | 25 | Deliberate AI-crawler policy in robots.txt: answer/search bots (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`) allowed so the site stays citation-eligible; training bots (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`) explicitly allowed or blocked as a documented choice. No policy at all = `fail`; default-allow with the choice documented in SEO.md = `pass` | Code + Live: robots.txt |
| G2 | 15 | `llms.txt` present, linking the site's most authoritative pages with one-line descriptions | Code + Live: `GET /llms.txt` |
| G3 | 20 | Answer-first structure: sections open with a direct answer then expand; clean H2/H3 per subtopic so passages are quotable in isolation | Code: sample content files |
| G4 | 10 | High-intent questions covered as explicit Q&A (FAQ content, `FAQPage` schema where fitting) | Code |
| G5 | 15 | Facts in extractable form: lists, tables, definitions, statistics with dates | Code: sample content |
| G6 | 15 | Entity consistency: one canonical brand name everywhere; `Organization.sameAs` links to social/authority profiles | Code + Live |

## 7. Performance Signals (100 pts)

Static proxies for Core Web Vitals — field data needs PageSpeed Insights/CrUX, which is out of scope; note that in the report.

| ID | Pts | Check | Verify |
|---|---|---|---|
| P1 | 20 | Images: modern formats (WebP/AVIF) or framework image optimization; explicit `width`/`height` (CLS) | Code: asset formats, image component usage |
| P2 | 15 | Below-fold images lazy-loaded; LCP/hero image NOT lazy-loaded and preloaded or priority-hinted | Code |
| P3 | 10 | Font strategy: self-hosted or preconnected, `font-display: swap` or framework font optimization | Code |
| P4 | 15 | Scripts deferred/async; no render-blocking third-party scripts in `<head>` | Code: layout/head, script tags |
| P5 | 10 | Code splitting — content pages don't ship one monolithic bundle | Code: build config, dynamic imports |
| P6 | 10 | Cache headers / CDN configuration for static assets | Code: hosting config. Live: `curl -I` an asset |
| P7 | 5 | `preconnect`/`dns-prefetch` for critical third-party origins | Code |
| P8 | 15 | TTFB on key pages < 800 ms | Live only: `curl -w '%{time_starttransfer}'`; n/a without URL |
