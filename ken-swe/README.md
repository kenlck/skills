# ken-swe

Ken's software engineering skill suite. Covers the full development lifecycle — from planning and feature work to bug fixing, frontend design, and code quality.

## Skills

| Skill | Invoke | Phase | Description |
|-------|--------|-------|-------------|
| `karpathy-guidelines` | `/ken-swe:karpathy-guidelines` | Foundation | Behavioral guardrails for any coding task: surface assumptions, simplicity first, surgical changes, goal-driven execution |
| `ts-codemap` | `/ken-swe:ts-codemap` | Foundation | Build a persistent `.codemap/` index for TS/JS repos via ts-morph: path aliases, re-export flattening, JSX |
| `codemap` | `/ken-swe:codemap` | Foundation | Build a persistent `.codemap/` index for Java/Go/Python/Rust repos via tree-sitter; same schema as ts-codemap |
| `grill-me` | `/ken-swe:grill-me` | Planning | Relentlessly interview a plan or design until every decision branch is resolved |
| `grill-with-docs` | `/ken-swe:grill-with-docs` | Planning | Grill a plan against the project's CONTEXT.md and ADRs; sharpen terminology, update docs inline |
| `grill-me-standards` | `/ken-swe:grill-me-standards` | Planning | Interview the user to extract coding standards and project context from an existing codebase into a CLAUDE.md / CODING_STANDARDS.md |
| `write-a-prd` | `/ken-swe:write-a-prd` | Planning | Write a PRD with embedded design direction through codebase exploration and user interview |
| `prd-to-plan` | `/ken-swe:prd-to-plan` | Planning | Break a PRD into phased tracer-bullet vertical slices, saved as a plan file |
| `feature-dev` | `/ken-swe:feature-dev` | Implementation | Staged feature development: requirements → codebase exploration → architecture → implementation → review |
| `feature-dev-next` | `/ken-swe:feature-dev-next` | Implementation | Right-sized feature development with three presets (Quick / Standard / Deep). Testbed for the next iteration of `feature-dev` |
| `feature-dev-auto` | `/ken-swe:feature-dev-auto` | Implementation | Autonomous feature development (Standard / Deep): front-loads decisions interactively, then drives a goal-loop unattended until goals verify or an escalation triggers |
| `frontend-design` | `/ken-swe:frontend-design` | Implementation | Build distinctive, production-grade frontend interfaces with high aesthetic intention |
| `bug-fix` | `/ken-swe:bug-fix` | Debugging | Structured bug fixing: reproduce → root cause → fix design → implement → regression check |
| `diagnose` | `/ken-swe:diagnose` | Debugging | Disciplined diagnosis loop for hard bugs and performance regressions: feedback loop → reproduce → hypothesise → instrument → fix → regression test |
| `code-review` | `/ken-swe:code-review` | Quality | Parallel multi-angle code review: simplicity, bugs, conventions & security |
| `code-review-parallel` | `/ken-swe:code-review-parallel` | Quality | Review multiple PRs/MRs in parallel across GitHub, GitLab, Azure DevOps; consolidated report, optional PR comments |
| `simplify` | `/ken-swe:simplify` | Quality | Simplify and refine recently changed code for clarity and maintainability |
| `polish-ui` | `/ken-swe:polish-ui` | Quality | Final quality pass: alignment, spacing, interaction states, copy, edge cases |

## Install

```sh
./skills.sh link ken-swe
```
