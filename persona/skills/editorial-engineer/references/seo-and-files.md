# SEO Pass + File Management

Companion reference to `SKILL.md`. Read during Step 7 (SEO pass) and Step 8 (save).

---

## SEO Pass — Full Detail

The goal is discoverability, not keyword stuffing. Run this pass **after** prose quality is strong (Step 6), not before — keyword optimisation should refine a good post, not rescue a weak one.

### Title

- **Length**: 50–60 characters. Google truncates longer titles in search results around 60–65 chars.
- **Primary keyword position**: near the front. "Sarcopenia: A Physio's Guide" beats "A Physio's Guide to Sarcopenia" for SEO.
- **Compelling vs. descriptive**: a topic label is not a title. Give the reader a reason to click.
  - ❌ "Sarcopenia: What It Is" (label)
  - ✅ "Is Your Ageing Parent Losing Muscle? A Physio Explains" (reason to click)
- **Specificity**: numbers, audience, or stakes increase click-through. "5 signs", "for runners over 40", "what your GP won't tell you".
- **No clickbait that the post doesn't deliver.** If the title promises "the truth about X", the post must actually deliver a non-obvious truth.

### Excerpt / meta description

- **Length**: 140–160 characters. Google truncates around 155–160.
- **Primary keyword**: appears naturally, ideally in the first half.
- **Job**: answer "why should I read this?" without giving the answer away. Hint at the value.
- **Don't open with the brand or author name**: "Felicia Tung explains…" wastes prime real estate. Start with the hook.
- **Avoid generic phrasing**: "Read this post to learn more about X" is dead weight.

### Headings (H2s)

- **Coverage**: at least one H2 should include or closely relate to the primary keyword.
- **Variety**: H2s should not repeat the title's phrasing. Use semantic variants.
- **Standalone story**: read just the H2s in sequence — do they tell the post's argument? If they read like a random list, restructure.
- **Sentence-style vs. label-style**: prefer sentence-style ("Why morning back pain often isn't a back problem") over label-style ("Causes") — better engagement, better featured-snippet eligibility.
- **Question-style for FAQs**: questions readers actually search for ("How long does sciatica take to heal?") perform well in featured snippets.

### Keyword placement

- **First 100 words**: primary keyword must appear naturally.
- **Density**: 3–5 occurrences across ~700 words, including semantic variants. Higher than that risks reading as stuffed; lower risks losing topical signal.
- **Variants**: use semantic variants liberally. For "sarcopenia": also "muscle loss", "muscle wasting", "age-related muscle decline". For "lower back pain": also "lumbar pain", "low back ache", "back discomfort". Search engines reward semantic richness.
- **Natural placement test**: if you can read the keyword sentence aloud and it doesn't sound forced, it's fine. If it sounds wedged in, rewrite.

### Internal links

- **Scan existing posts in the repo's blog folder.** Look for topical adjacency.
- **In-text, not at the bottom.** Links inside the body get clicked; "related posts" lists at the end mostly don't.
- **1–2 per post** is a healthy default. More is fine if every link genuinely serves the reader.
- **Anchor text**: descriptive, not "click here". The anchor text tells the reader and the search engine what the linked page is about.

### Slug

- **Kebab-case**, lowercase, ASCII.
- **Keyword-forward**: lead with the primary keyword.
- **Length**: under ~60 characters. URL slugs are not the place for full sentences.
- **No stop words unless meaningful**: "sarcopenia-elderly-strength" beats "what-is-sarcopenia-in-the-elderly".

### Image alt text

- **Inline images** must have descriptive alt text.
- **Keyword-relevant where natural**, not forced. "Physiotherapist guiding elderly patient through balance exercise" is good. "Sarcopenia muscle loss elderly therapy" is keyword soup.
- **Featured images** typically don't have alt text in frontmatter — check the project's convention.

### After the pass

If title, slug, or excerpt changed during the SEO pass, update the frontmatter accordingly.

---

## File Management

### Finding the blog directory

Projects store blog posts differently. Detect the location before saving — never assume.

**Check these locations in order:**

1. `src/content/blog/`
2. `src/content/posts/`
3. `content/blog/`
4. `content/posts/`
5. `_posts/` (Jekyll)
6. `app/blog/` or `app/(blog)/` (Next.js app router)
7. `posts/`
8. `blog/`
9. `data/blog/`

If found, use it. Also peek inside for the **frontmatter convention** used by existing posts and match it exactly — field names, casing, date format, image-URL pattern.

If multiple candidates exist, ask the user which is current.

If none found, ask: "Where should blog posts be saved in this project?"

### Frontmatter — default template

Match the project's existing convention first. If starting completely fresh, this is a reasonable default:

```markdown
---
title: "Final Post Title"
slug: "kebab-case-slug"
excerpt: "140–160 character meta description"
featuredImage: "[URL or placeholder]"
authorName: "[from brand context — never invented]"
authorTitle: "[from brand context]"
category: "[from project's category convention]"
tags: ["..."]
publishedAt: "YYYY-MM-DD"
updatedAt: "YYYY-MM-DD"
---
```

**Never invent author names, titles, or categories.** Pull from existing posts, the brand voice doc, or ask the user.

### Plan file format

Plans live in `plan/<slug>.md` at project root. Create the folder if missing.

```markdown
---
title: "Working Title Here"
slug: "kebab-case-slug"
category: "..."
status: pending
created: YYYY-MM-DD
---

## Topic Overview

[One paragraph: the post's angle, audience, and core claim.]

## Key Points to Cover

- Point 1
- Point 2
- Point 3

## Research Notes

[Relevant findings from the planning research agents — the raw material the writer will draw on.]

## Target Keywords

[2–4 keywords/phrases this post should rank for. Mark the primary keyword.]

## Suggested Angle

[Which framing from the variant exploration was chosen, and why.]
```

Status lifecycle: `pending` → `in-progress` (when writer starts) → `complete` (with `completedAt: YYYY-MM-DD` added).

### Image sourcing

If the project convention includes a featured image, source one — don't skip and don't fabricate.

**Priority order:**

1. **User-provided images** — if the user has supplied images for this post, use those. Copy them into the project's image folder before referencing.
2. **Project's existing image library** — if the project has a folder of brand-approved or previously-used images, check for a fit.
3. **Free-license stock** — Unsplash, Pexels, or similar that the user has specified. Prefer real photos: natural light, real people in context, not posed-model-with-clipboard. Use the direct CDN URL with size + quality params.
4. **Placeholder URL with flag** — if no source is available or the topic is hard to illustrate, use a placeholder and tell the user the image needs to be replaced.

**Unsplash-specific workflow** (if Unsplash is the project's chosen source):

- Search: `https://unsplash.com/s/photos/<keywords>`
- Pick 2–3 candidates from results page
- Extract photo ID from URL (the segment after `/photos/`)
- Construct CDN URL: `https://images.unsplash.com/photo-<id>?w=1200&q=80`
- Prefer: active/movement shots over passive; real practitioners over models; natural light; demographic diversity where relevant

**Never hotlink user assets from their local machine.** Copy into the project's image folder first.

### After save

Tell the user:
- The save path (so they can verify location)
- Final title and excerpt (so they can sanity-check the SEO surface)
- Image source used (so they can verify it looks right)
- Any internal links added (so they can verify the targets)
- Any unresolved placeholders that need editor attention before publish
