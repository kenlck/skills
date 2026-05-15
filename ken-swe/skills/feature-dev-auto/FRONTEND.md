# Frontend Design Reference

Used by `feature-dev-auto` when the feature includes meaningful UI work. **Runs before the autonomous loop starts** — the loop cannot accommodate the design direction interview mid-flight, so all design decisions must be locked before Stage 4 begins.

---

## Frontend Skill Handoff

If the feature includes pages, screens, components, forms, visual redesign, layout changes, or UX polish — ask the user via AskUserQuestion (at the end of Stage 3, before approval):

- **`frontend-design`** — generates a single high-quality, opinionated frontend implementation. Best when direction is clear and you want polished, production-ready code fast. Run it now; its output becomes part of the implementation that the loop verifies.
- **Proceed without a skill** — continue with the guidance below; design decisions captured before the loop starts.

Invoke the chosen skill if selected. Either path resolves all design questions **before** Stage 4 starts. Ask only once per task unless new frontend scope is later introduced (which would itself be a Stage 3 rearch trigger).

---

## Design Direction (3 Questions)

Before writing any frontend code, lock in the design direction. Ask these 3 questions via AskUserQuestion, summarise, get explicit confirmation:

1. **Purpose & audience** — What problem does this UI solve, and who will use it? (e.g. power users who live in the app daily vs. casual visitors)
2. **Tone & aesthetic** — Choose: brutally minimal, editorial, refined, playful, brutalist, retro-futuristic, etc. Or describe how it should *feel*.
3. **Memorable differentiator** — What's the one thing users should notice or remember? What makes this not generic?

Summarise the proposed design direction in 3–5 sentences. Get explicit confirmation. Record in `plans/design-decisions.md` if log mode is on.

The locked design direction is then encoded into the goal file's verifiable goals where possible — e.g. "Goal 4: header uses display font X and accent color Y per design direction" with a check like grepping for the CSS variable.

---

## Execution Standards

**Typography** — Distinctive fonts that elevate the design. Avoid generic choices (Inter, Roboto, Arial, system fonts). Pair a display font with a refined body font.

**Color** — Cohesive palette via CSS variables. Dominant colors with sharp accents over timid, evenly-distributed palettes.

**Motion** — Animations for micro-interactions and page load reveals. CSS-only for HTML; Motion library for React when available. One well-orchestrated entrance beats scattered micro-interactions.

**Layout** — Asymmetry, overlap, generous negative space, or controlled density — not default grid-everything.

**Atmosphere** — Depth through gradients, textures, shadows, contextual effects rather than solid backgrounds.

**Never** default to generic AI aesthetics: purple gradients on white, Space Grotesk everywhere, predictable component patterns, cookie-cutter without context-specific character.

Implementation complexity matches aesthetic vision: maximalist designs need elaborate code; minimalist designs need restraint and precision.
