# Stack guide — where SEO lives per framework, and how to run live checks

## Framework detection

Detect from lockfile/dependencies and directory shape, then use the row to find each rubric item's source.

| Framework | Detect by | Titles & meta | robots / sitemap | Rendering mode |
|---|---|---|---|---|
| Next.js (App Router) | `next` dep + `app/` dir | `metadata` export / `generateMetadata` in `layout.tsx`/`page.tsx` | `app/robots.ts`, `app/sitemap.ts`, or `public/` | Server components default to SSR/SSG; `"use client"` pages still SSR the shell — check what reaches raw HTML |
| Next.js (Pages Router) | `next` dep + `pages/` dir | `next/head` per page, `_document.tsx` | `public/`, `next-sitemap` config | `getStaticProps`/`getServerSideProps` = SSG/SSR; none = static shell + hydration |
| Astro | `astro` dep | `<head>` in layouts, frontmatter props | `@astrojs/sitemap`, `public/` | Static by default; `output: 'server'` per config |
| Nuxt 3 | `nuxt` dep | `useSeoMeta`/`useHead`, `app.head` in `nuxt.config` | `@nuxtjs/sitemap` / `nuxt-simple-robots`, `public/` | SSR by default; check `ssr: false` / `routeRules` |
| SvelteKit | `@sveltejs/kit` | `<svelte:head>` per route | `static/`, custom endpoints | SSR by default; check `export const ssr/prerender` |
| Remix / React Router v7 | `@remix-run/*` or `react-router` framework mode | `meta` export per route | `public/`, resource routes | SSR |
| Gatsby | `gatsby` dep | `Head` export / react-helmet | `gatsby-plugin-sitemap`, `static/` | SSG |
| Vite SPA (React/Vue/Svelte, no meta-framework) | `vite` + no framework above | `index.html` only, or client-side head manager | `public/` | **CSR — meta/content never in raw HTML; R1 fails without prerendering. Flag this first, it caps everything** |
| Plain static HTML | `.html` files, no build | each file's `<head>` | files at web root | Static |
| Server-rendered MPA (Rails, Django, Laravel, PHP) | `Gemfile` / `manage.py` / `composer.json` | layout + view templates | framework routes or web root | SSR |
| WordPress theme repo | `wp-content/`, `style.css` header | theme `header.php` + SEO plugin | plugin-managed | SSR; schema is often plugin-injected — verify live (S5) |

Not listed → identify the closest analogue, note the assumption in the report.

## Where to look regardless of framework

- **Redirect/host policy (C6, C8)**: `vercel.json`, `netlify.toml`, `_redirects`, `next.config.*` `redirects()`, nginx/Apache conf, middleware.
- **Headers (C5 `X-Robots-Tag`, P6 caching)**: same hosting configs, middleware.
- **Content**: `content/`, `posts/`, `src/content/`, CMS fetch code — sample 3–5 real content files for E- and G-category checks.
- **llms.txt (G2)**: `public/llms.txt`, `static/llms.txt`, or web root.

## Live checks

Always fetch with a realistic crawler UA and never rely on a headless browser view — the point is what crawlers get in the raw response:

```sh
UA="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
curl -sL -A "$UA" https://site.com/ -o home.html      # raw HTML: R1, M1–M5, S5
curl -s  https://site.com/robots.txt                  # C1, C2, G1
curl -s  https://site.com/sitemap.xml | head -50      # C3, C4
curl -s  https://site.com/llms.txt                    # G2
curl -sI http://site.com/  https://www.site.com/      # C6 redirects
curl -sI https://site.com/definitely-not-a-page-xyz   # C7 soft-404
curl -s -o /dev/null -w '%{time_starttransfer}\n' https://site.com/   # P8 TTFB
grep -c 'application/ld+json' home.html               # S5
```

### The JS-injection caveat

Meta tags, JSON-LD, and content injected client-side (React `useEffect`, CMS/SEO plugins, tag managers) do **not** appear in the raw HTML fetched above. That absence is the finding: source code containing the tags while raw HTML lacks them means crawlers and AI engines don't get them — score the relevant check `partial` at best and put "server-render it" in the plan. Report "present in source, absent in raw HTML" explicitly; never report a plain "missing" when the code clearly generates it client-side.

If raw HTML is inconclusive and a browser tool is available, render the page and run `document.querySelectorAll('script[type="application/ld+json"]')` to separate "client-injected" from "truly absent".
