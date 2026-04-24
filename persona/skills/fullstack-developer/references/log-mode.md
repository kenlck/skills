# Log Mode Reference

When Log Mode is enabled, all decisions made during the feature development session are recorded to files in `plans/`. This creates a durable, reviewable record separated into technical and design decision categories.

---

## File Location & Naming

Two fixed files, shared across all features in the repo:

- `plans/technical-decisions.md` — architecture, schema, API, integrations, testing, rollout
- `plans/design-decisions.md` — UI, UX, visual language, brand (only relevant when the feature has UI scope)

Create each file on first write. Update incrementally as decisions are confirmed — never batch-write at the end. Each entry references the feature it belongs to.

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
- API contracts: route shapes, request/response formats, webhook payloads, event shapes
- Auth & authz: who can do what
- Third-party integrations: which service, which API, which SDK, which version
- Performance or scalability trade-offs (batch size, caching, connection pool)
- Testing strategy: unit / integration / e2e mix, what's mocked
- Migration strategy: expand → migrate → contract timeline, backfill plan
- Feature flag name, default, cleanup plan
- Observability: what logs / metrics / traces were added
- Concurrency / idempotency decisions

**Design Decisions** — anything about how the feature looks or feels (UI-bearing features only):

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
| End of Stage 2 | Technical decisions revealed by codebase exploration (patterns chosen to follow, conventions identified) |
| End of Stage 3 | Final architecture choice; data model, API shape, test strategy, migration plan, feature flag, observability plan |
| During Stage 5 (backend decisions) | Any non-trivial decision made during implementation — library vs hand-roll, sync vs async, transaction scope |
| During Stage 5 (frontend) | Design decisions as they are confirmed |
| End of Stage 6 (tests) | Notable testing decisions — what was left to integration vs unit, any deliberate coverage gaps with rationale |
| End of Stage 8 | Final summary line added noting what shipped |

---

## Why Log

Two reasons:

1. **Future sessions resume quickly.** Stage 0 of the next feature check the log — decisions already resolved for an area don't need re-asking.
2. **Reviewers understand the why.** The PR description covers what; the log covers why, including rejected alternatives and their reasons. Future maintainers reading `git blame` land in a place with context.
