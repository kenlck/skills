# Log Mode Reference

When Log Mode is enabled, all decisions made during the feature development session are recorded to a file in `plans/`. This creates a durable, reviewable record separated into technical and design decision categories.

---

## File Location & Naming

Two fixed files, shared across all features:

- `plans/technical-decisions.md` — architecture, schema, API, integrations
- `plans/design-decisions.md` — UI, UX, visual language, brand

Create each file on first write. Update incrementally as decisions are confirmed — never batch-write at the end. Each entry should reference the feature it belongs to in the Rationale or a Feature column.

---

## File Format

**`plans/technical-decisions.md`**

```md
# Technical Decisions

| # | Feature | Decision | Rationale | Stage |
|---|---|---|---|---|
| T1 | [Feature name] | [What was decided] | [Why — constraint, preference, or trade-off] | Stage N |
| T2 | ... | ... | ... | ... |

## Open Questions

- [ ] [Question] — [Feature] Stage N
```

**`plans/design-decisions.md`**

```md
# Design Decisions

| # | Feature | Decision | Rationale | Stage |
|---|---|---|---|---|
| D1 | [Feature name] | [What was decided] | [Why] | Stage N |
| D2 | ... | ... | ... | ... |

## Open Questions

- [ ] [Question] — [Feature] Stage N
```

---

## What Goes Where

**Technical Decisions** — anything about how the system works:
- Architecture approach chosen (and why alternatives were rejected)
- Schema: new tables, columns, constraints, indexes
- API contracts: route shapes, request/response formats, webhook payloads
- Auth & permissions: who can do what
- Third-party integrations: which service, which API, which SDK
- Performance or scalability trade-offs
- Testing strategy

**Design Decisions** — anything about how the feature looks or feels:
- Visual tone and aesthetic direction
- Typography and color palette
- Motion and animation style
- Layout philosophy (dense vs spacious, asymmetric vs grid)
- UX flows and interaction patterns
- Accessibility choices
- Brand alignment notes

---

## Update Triggers

Log a decision immediately after it is confirmed at these points:

| When | What to log |
|---|---|
| End of Stage 1 | All requirement decisions; open questions |
| End of Stage 2 | Technical decisions revealed by codebase exploration |
| End of Stage 3 | Final architecture choice and schema decisions |
| During Stage 4 (frontend) | Design decisions as they are confirmed |
| End of Stage 6 | Final summary line added to the file |
