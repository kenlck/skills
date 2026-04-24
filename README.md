# skills

Ken's Claude Code skill bundles.

## Bundles

### [ken-swe](./ken-swe/README.md)
Software engineering lifecycle — feature development, bug fixing, PRD writing, code review, frontend design, and polish.

| Skill | Phase | Description |
|-------|-------|-------------|
| `grill-me` | Planning | Relentlessly interview a plan until every decision branch is resolved |
| `write-a-prd` | Planning | Write a PRD with embedded design direction |
| `prd-to-plan` | Planning | Break a PRD into phased tracer-bullet vertical slices |
| `feature-dev` | Implementation | Staged feature development: requirements → exploration → architecture → implementation → review |
| `frontend-design` | Implementation | Build distinctive, production-grade frontend interfaces |
| `bug-fix` | Debugging | Structured bug fixing: reproduce → root cause → fix design → implement → regression check |
| `code-review` | Quality | Parallel multi-angle code review: simplicity, bugs, conventions & security |
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

### [ken-skills](./ken-skills/README.md)
Skill authoring toolkit — write, review, and improve Claude Code skills.

| Skill | Description |
|-------|-------------|
| `write-a-skill` | Scaffold a new skill through requirements gathering and iterative drafting |
| `review-skill` | Audit a skill against guidelines and produce a structured report |
| `enhance-skill` | Review a skill and apply improvements to structure and content quality |

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
