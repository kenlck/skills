# Migration: feature-dev-next to mini

## Revised Architecture

`feature-dev-next` is a monolithic staged workflow. `mini` splits the workflow into one orchestrator and four focused stage skills:

```text
feature-dev-mini
  -> feature-discovery
  -> feature-planning
  -> feature-implementation
  -> feature-validation
```

The orchestrator contains routing logic only. Stage instructions live only in child skills.

## What Moves Where

| `feature-dev-next` section | New location | Notes |
|---|---|---|
| Stage 0 setup | `feature-dev-mini` | Reduced to slug/state setup and routing |
| Presets | Removed | Single Deep-style path, no Quick/Standard/Deep branching |
| Stage 1 discovery | `feature-discovery` | Codebase-first, mandatory grill loop, exact approval gate |
| Stage 2 exploration | `feature-discovery` | Single-agent evidence checklist instead of Explorer subagents |
| Stage 3 architecture | `feature-planning` | Single-agent plan with alternatives considered |
| Stage 4 implementation | `feature-implementation` | Executes only approved plan |
| Stage 5 quality | `feature-validation` | Reviewer subagents removed for determinism |
| Stage 6 summary | `feature-validation` | Final state and validation summary |
| `FRONTEND.md` | Not migrated | Frontend design is outside this workflow |
| `LOG.md` | Replaced by state files | Per-feature state/artifacts are canonical |
| `AGENTS.md` | Not migrated | Subagent fan-out is removed for mini compliance |

## Sections Causing Stage Skipping

- Presets create multiple paths and skipped stages.
- Approval gates appear after long contextual guidance.
- Architecture and implementation instructions live in the same file.
- Subagent fan-out requires synthesis and increases state drift.
- Discovery and exploration are separate stages, letting models treat discovery as optional.

## State Passing

Each feature writes durable state in the target project:

```text
plans/feature-dev-mini/<feature-slug>/state.md
plans/feature-dev-mini/<feature-slug>/discovery.md
plans/feature-dev-mini/<feature-slug>/plan.md
plans/feature-dev-mini/<feature-slug>/validation.md
```

The orchestrator reads `state.md` first and routes by exact flags:

- `Discovery Complete`
- `Discovery Approved`
- `Plan Complete`
- `Plan Approved`
- `Implementation Complete`
- `Validation Complete`

Only exact user messages count as approvals:

- `APPROVE DISCOVERY`
- `APPROVE PLAN`

## Migration Plan

1. Add `mini/` as a standalone top-level bundle.
2. Install or link the bundle with `./skills.sh link mini`.
3. Use `/mini:feature-dev-mini <feature request>` for new feature work.
4. Keep `/ken-swe:feature-dev-next` available while testing the mini workflow.
5. After repeated successful runs, decide whether to deprecate `feature-dev-next` or keep it for larger models.

## Future Split Consideration

The new bundle already uses separate stage skills. If mini models still skip routing, stop invoking the orchestrator and require users to call each child skill directly:

```text
/mini:feature-discovery
/mini:feature-planning
/mini:feature-implementation
/mini:feature-validation
```
