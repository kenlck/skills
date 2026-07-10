# skills

Ken's Claude Code skills repo.

## Bundled skills

### [ken-swe](./ken-swe/README.md)
Software engineering workflow skills for planning, implementation, debugging, and quality.

| Skill | Phase | Description |
|-------|-------|-------------|
| `karpathy-guidelines` | Foundation | Behavioral guardrails: surface assumptions, simplicity first, surgical changes, goal-driven execution |
| `ts-codemap` | Foundation | Build a persistent `.codemap/` index for TS/JS repos via ts-morph |
| `codemap` | Foundation | Build a persistent `.codemap/` index for Java/Go/Python/Rust repos via tree-sitter |
| `grill-me` | Planning | Relentlessly interview a plan until every decision branch is resolved |
| `grill-with-docs` | Planning | Grill a plan against existing CONTEXT.md / ADRs |
| `grill-me-standards` | Planning | Extract coding standards grounded in the codebase |
| `write-a-prd` | Planning | Write a PRD with embedded design direction |
| `prd-to-plan` | Planning | Break a PRD into phased tracer-bullet vertical slices |
| `prepare-implementation-plan` | Planning | Turn stories and acceptance criteria into a verifiable implementation plan |
| `feature-dev` | Implementation | Staged feature development |
| `feature-dev-next` | Implementation | Right-sized feature development with Quick / Standard / Deep presets |
| `feature-dev-auto` | Implementation | Autonomous goal-loop implementation flow |
| `frontend-design` | Implementation | Build distinctive, production-grade frontend interfaces |
| `bug-fix` | Debugging | Structured bug fixing: reproduce → root cause → fix → regression check |
| `diagnose` | Debugging | Diagnosis loop for hard bugs and regressions |
| `code-review` | Quality | Parallel multi-angle code review |
| `code-review-parallel` | Quality | Review multiple PRs/MRs in parallel |
| `simplify` | Quality | Simplify and refine recently changed code |
| `polish-ui` | Quality | Final UI quality pass before shipping |

## Standalone skills

These live in [`./skills`](./skills) and are not currently managed by `skills.sh`.

| Skill | Description |
|-------|-------------|
| `tdd` | Test-driven development reference: seams, loop rules, mocking, and test quality |
| `to-prd` | Turn the current conversation into a PRD and publish it to the issue tracker |
| `to-issues` | Break a plan or PRD into independently grabbable vertical-slice issues |
| `seo` | Codebase-driven SEO + GEO audit: SEO.md fact sheet, scored report, prioritized improvement plan |
| `seo-audit` | Audit a site for technical and on-page SEO issues |
| `handoff` | Compact the current conversation into a handoff document for another agent |

## Usage

```sh
# List bundled skills
./skills.sh list

# Scaffold a new bundled skill
./skills.sh new ken-swe <skill-name>

# Symlink bundled skills into ~/.claude/skills/
./skills.sh link

# Link only ken-swe
./skills.sh link ken-swe

# Remove symlinks
./skills.sh unlink [bundle]
```

## Notes

- `skills.sh` currently works with plugin-style bundles such as `ken-swe`.
- Top-level skills in `./skills` are tracked in this repo but are not linked by `skills.sh`.

## Credits

- `ken-swe/karpathy-guidelines` sourced from [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) (MIT)
- `ken-swe/grill-with-docs` sourced from [mattpocock/skills](https://github.com/mattpocock/skills)
- `skills/to-issues` adapted from [mattpocock/skills](https://github.com/mattpocock/skills)
