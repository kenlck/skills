# mini

Mini-model optimized skill bundle. These skills use short instructions, explicit state files, exact approval gates, and single-responsibility workflow stages.

## Skills

| Skill | Phase | Description |
|-------|-------|-------------|
| `feature-dev-mini` | Orchestration | Routes feature work through discovery, planning, implementation, and validation without containing stage instructions |
| `feature-discovery` | Discovery | Codebase-first discovery plus mandatory grill loop before planning |
| `feature-planning` | Planning | Converts approved discovery into an implementation plan and waits for exact plan approval |
| `feature-implementation` | Implementation | Executes the approved plan without redesigning or expanding scope |
| `feature-validation` | Validation | Runs validation, records results, and closes the workflow |

## State Files

Each feature stores state in the target project:

```text
plans/feature-dev-mini/<feature-slug>/
  state.md
  discovery.md
  plan.md
  validation.md
```

## Install

```sh
./skills.sh link mini
```
