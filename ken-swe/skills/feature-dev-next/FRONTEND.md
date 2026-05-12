# Frontend Design Reference

Used by `feature-dev` during Stage 4 when the feature includes meaningful UI work.

---

## Frontend Skill Handoff

If the feature includes pages, screens, components, forms, visual redesign, layout changes, or UX polish — ask the user which approach they want using AskUserQuestion:

- **`frontend-design`** — generates a single high-quality, opinionated frontend implementation. Best when you have a clear direction and want polished, production-ready code fast.
- **Proceed without a skill** — continue with the guidance below.

Invoke the chosen skill if selected, then continue the feature workflow. Ask only once per task unless new frontend scope is introduced later.

---

## Design Direction (3 Questions)

Before writing any frontend code, lock in the design direction. Ask these 3 questions using AskUserQuestion, then summarize and confirm before proceeding:

1. **Purpose & audience** — What problem does this UI solve, and who will use it? (e.g. power users who live in the app daily vs. casual visitors)
2. **Tone & aesthetic** — Choose a direction: brutally minimal, editorial, refined, playful, brutalist, retro-futuristic, etc. Or describe how you want it to *feel*.
3. **Memorable differentiator** — What's the one thing users should notice or remember? What makes this not generic?

Summarize the proposed design direction in 3–5 sentences and ask for explicit confirmation before writing code.

---

## Execution Standards

**Typography** — Choose distinctive fonts that elevate the design. Avoid generic choices (Inter, Roboto, Arial, system fonts). Pair a display font with a refined body font.

**Color** — Commit to a cohesive palette using CSS variables. Dominant colors with sharp accents over timid, evenly-distributed palettes.

**Motion** — Use animations for micro-interactions and page load reveals. CSS-only for HTML; Motion library for React when available. One well-orchestrated entrance beats scattered micro-interactions.

**Layout** — Use asymmetry, overlap, generous negative space, or controlled density — not default grid-everything layouts.

**Atmosphere** — Add depth through gradients, textures, shadows, or contextual effects rather than solid backgrounds.

**Never** default to generic AI aesthetics: purple gradients on white, Space Grotesk everywhere, predictable component patterns, cookie-cutter designs without context-specific character.

The implementation complexity should match the aesthetic vision: maximalist designs need elaborate code; minimalist designs need restraint and precision.
