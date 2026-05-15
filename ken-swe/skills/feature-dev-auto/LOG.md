# Log Mode Reference

When Log Mode is enabled, decisions from the feature-dev-auto session are recorded to shared `plans/` files alongside the per-feature `plans/<feature>-goal.md` (which is always written, log mode or not).

The goal file is canonical per-feature state. The shared decision logs below are cross-feature history.

---

## File Location & Naming

Three files involved:

- `plans/<feature>-goal.md` — **always written** in Stage 3, regardless of log mode. Plan + iter log + status. See SKILL.md for the format.
- `plans/technical-decisions.md` — log-mode only. Architecture, schema, API, integrations across features.
- `plans/design-decisions.md` — log-mode only. UI, UX, visual language, brand across features.

Create the shared files on first write. Update incrementally as decisions are confirmed — never batch-write at the end. Each entry references the feature.

---

## Shared File Format

**`plans/technical-decisions.md`**

```md
# Technical Decisions

| # | Feature | Decision | Rationale | Stage |
|---|---|---|---|---|
| T1 | [Feature name] | [What was decided] | [Why — constraint, preference, or trade-off] | Stage N |

## Open Questions

- [ ] [Question] — [Feature] Stage N
```

**`plans/design-decisions.md`**

```md
# Design Decisions

| # | Feature | Decision | Rationale | Stage |
|---|---|---|---|---|
| D1 | [Feature name] | [What was decided] | [Why] | Stage N |

## Open Questions

- [ ] [Question] — [Feature] Stage N
```

---

## What Goes Where

**Technical Decisions** — system mechanics:
- Architecture approach (and why alternatives rejected)
- Schema: tables, columns, constraints, indexes
- API contracts: routes, request/response, webhooks
- Auth & permissions
- Third-party integrations
- Performance / scalability trade-offs
- Testing strategy

**Design Decisions** — look and feel:
- Visual tone, aesthetic direction
- Typography, color palette
- Motion, animation style
- Layout philosophy
- UX flows, interaction patterns
- Accessibility choices
- Brand alignment notes

---

## Update Triggers

Log a decision immediately after confirmation at these points:

| When | What to log |
|---|---|
| End of Stage 1 | Requirement decisions; open questions |
| End of Stage 2 | Technical decisions revealed by exploration |
| End of Stage 3 | Final architecture choice and schema decisions |
| During Stage 4 frontend handoff | Design decisions as confirmed |
| Rearchitect mid-loop | New architecture decision with "rearch" marker in Rationale |
| End of Stage 6 | Final summary line |

The per-feature `plans/<feature>-goal.md` is updated more often — see SKILL.md's Loop telemetry section.
