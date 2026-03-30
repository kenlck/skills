# skills

Ken's Claude Code skill bundles.

## Bundles

### [ken-swe](./ken-swe/README.md)
Software engineering lifecycle — feature development, bug fixing, PRD writing, code review, frontend design, and polish.

| Skill | Description |
|-------|-------------|
| `feature-dev` | Staged feature development: requirements → exploration → architecture → implementation → review |
| `bug-fix` | Structured bug fixing: reproduce → root cause → fix design → implement → regression check |
| `write-a-prd` | Write a PRD with embedded design direction |
| `prd-to-plan` | Break a PRD into phased tracer-bullet vertical slices |
| `grill-me` | Relentlessly interview a plan until every decision branch is resolved |
| `code-review` | Parallel multi-angle code review: simplicity, bugs, conventions & security |
| `frontend-design` | Build distinctive, production-grade frontend interfaces |
| `simplify` | Simplify and refine recently changed code |
| `polish` | Final quality pass before shipping |

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
