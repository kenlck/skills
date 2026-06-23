# skills

Ken's Claude Code skill bundles.

## Bundles

### [ken-swe](./ken-swe/README.md)
Software engineering lifecycle — feature development, bug fixing, PRD writing, code review, frontend design, and polish.

| Skill | Phase | Description |
|-------|-------|-------------|
| `karpathy-guidelines` | Foundation | Behavioral guardrails: surface assumptions, simplicity first, surgical changes, goal-driven execution |
| `ts-codemap` | Foundation | Build a persistent `.codemap/` index for TS/JS repos via ts-morph (path aliases, re-exports, JSX) |
| `codemap` | Foundation | Build a persistent `.codemap/` index for Java/Go/Python/Rust repos via tree-sitter (same schema as ts-codemap) |
| `grill-me` | Planning | Relentlessly interview a plan until every decision branch is resolved |
| `grill-with-docs` | Planning | Grill a plan against existing CONTEXT.md / ADRs; sharpen terminology and update docs inline |
| `grill-me-standards` | Planning | Interview the user to extract coding standards grounded in what the codebase already does |
| `write-a-prd` | Planning | Write a PRD with embedded design direction |
| `prd-to-plan` | Planning | Break a PRD into phased tracer-bullet vertical slices |
| `prepare-implementation-plan` | Planning | Turn user stories and acceptance criteria into a verifiable, code-grounded implementation plan |
| `feature-dev` | Implementation | Staged feature development: requirements → exploration → architecture → implementation → review |
| `feature-dev-next` | Implementation | Right-sized feature development with three presets (Quick / Standard / Deep) and hard approval gates |
| `feature-dev-auto` | Implementation | Autonomous goal-loop variant: front-load decisions, then implement unattended against verifiable goals |
| `frontend-design` | Implementation | Build distinctive, production-grade frontend interfaces |
| `bug-fix` | Debugging | Structured bug fixing: reproduce → root cause → fix design → implement → regression check |
| `diagnose` | Debugging | Disciplined diagnosis loop for hard bugs: build a feedback loop → reproduce → hypothesise → fix → regression-test |
| `code-review` | Quality | Parallel multi-angle code review: simplicity, bugs, conventions & security |
| `code-review-parallel` | Quality | Review multiple PRs/MRs in parallel across GitHub, GitLab, and Azure DevOps |
| `simplify` | Quality | Simplify and refine recently changed code |
| `polish-ui` | Quality | Final quality pass before shipping |

### [persona](./persona/)
Role-based personas — activate a specialist mindset for engineering, design, fullstack work, and testing.

| Skill | Description |
|-------|-------------|
| `software-engineer` | Senior engineer persona: clean architecture, SOLID principles, pragmatic problem-solving |
| `web-design-engineer` | Web design engineer persona: distinctive, production-grade UI with HTML/CSS/JS |
| `fullstack-developer` | Fullstack developer persona: end-to-end thinking across frontend, backend, and data layer |
| `playwright-test-engineer` | Playwright test engineer persona: robust, maintainable E2E test coverage |
| `editorial-engineer` | Senior content engineer persona: plan, research, write, and edit blog posts end-to-end |
| `seo-engineer` | Senior SEO engineer persona: technical SEO, on-page, content strategy, GEO/AEO, and agent-readiness |

### [ken-skills](./ken-skills/README.md)
Skill authoring toolkit — write, review, and improve Claude Code skills.

| Skill | Description |
|-------|-------------|
| `write-a-skill` | Scaffold a new skill through requirements gathering and iterative drafting |
| `review-skill` | Audit a skill against guidelines and produce a structured report |
| `enhance-skill` | Review a skill and apply improvements to structure and content quality |
| `session-to-skill` | Capture the workflow of the current session and distill it into a reusable skill |

### [ken-loop](./ken-loop/README.md)
Loop engineering — plan interactively, slice into machine-checkable issues, then drain the queue with headless one-issue-per-session agent runs that end in PRs.

| Skill | Description |
|-------|-------------|
| `loop-setup` | One-time per repo: detect the tracker (GitHub / GitLab / local), write `.loop/config.md` with the five tracker verbs |
| `loop-issues` | Slice a PRD into AFK/HITL tracer-bullet issues; enforce the machine-checkability criteria gate; publish in dependency order |
| `work-issue` | Headless executor for one issue: TDD against acceptance criteria, bounded retries, exits DELIVERED (PR) or BLOCKED (needs-human) |

### [mini](./mini/README.md)
Small-model-optimized feature development: a single strict, gated skill plus an optional hook that hard-enforces "no code before approval".

| Skill | Description |
|-------|-------------|
| `feature-dev-mini` | Four gated steps — Discovery+Grill → Plan → Implement → Validate. One step per reply; no file edits until the user approves twice |

## Installation

```sh
npx skills add kenlck/skills
```

## Usage

```sh
# List all bundles and skills (shows which are linked)
./skills.sh list

# Scaffold a new skill in a bundle
./skills.sh new <bundle> <skill-name>

# Symlink all skills into ~/.claude/skills/
./skills.sh link

# Link a specific bundle only
./skills.sh link ken-swe

# Remove symlinks
./skills.sh unlink [bundle]
```

## Credits

- `persona/web-design-engineer` inspired by [ConardLi/web-design-skill](https://github.com/ConardLi/web-design-skill)
- `ken-swe/karpathy-guidelines` sourced from [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) (MIT)
- `ken-swe/grill-with-docs` sourced from [mattpocock/skills](https://github.com/mattpocock/skills)
- `ken-skills/session-to-skill` inspired by the `handoff` skill from [mattpocock/skills](https://github.com/mattpocock/skills)
- `ken-loop/loop-issues` adapted from the `to-issues` skill in [mattpocock/skills](https://github.com/mattpocock/skills)
