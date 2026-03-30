---
name: enhance-skill
description: Improve an existing skill by reviewing structure, description quality, and instruction clarity, then applying fixes. Use when user wants to improve, upgrade, enhance, or refine an existing skill.
---

# Enhance Skill

Review an existing skill and apply improvements in one pass — structure, description, and content quality.

## Quick start

`/enhance-skill path/to/skill-name/` — enhance a skill by path
`/enhance-skill skill-name` — enhance an installed skill by name

## Workflow

### 1. Locate and read the skill

Find the skill folder and read all files (SKILL.md and any supporting files).

### 2. Review against guidelines

Evaluate every criterion from the write-a-skill checklist:

**Description**
- Present and under 1024 chars
- Written in third person
- First sentence states what it does
- Includes "Use when [specific triggers]"
- Triggers specific enough to distinguish from similar skills

**SKILL.md structure**
- Valid frontmatter (`name`, `description`)
- Under 100 lines
- No time-sensitive information
- Consistent terminology throughout
- Concrete examples included
- References one level deep

**File structure**
- Content split into separate files when SKILL.md > 100 lines
- Scripts only for deterministic, repeated operations
- No unnecessary files

**Content quality**
- Instructions are clear and unambiguous
- Steps are actionable, not vague
- No redundant or duplicated guidance
- Appropriate level of detail — not too terse, not over-explained
- Examples reflect real use cases

### 3. Propose improvements

Present a concise summary of all proposed changes grouped by category:

- **Must fix** — structural or description failures that affect reliability
- **Should fix** — warnings and content clarity issues
- **Optional** — style or minor readability improvements

For each item, show a brief before/after or description of the change.

Ask the user: **"Would you like a full review report before applying changes?"**
- If yes — produce the report using the format in [REPORT.md](../review-skill/REPORT.md), then ask for approval to proceed.
- If no — ask for approval to apply changes directly.

### 4. Apply changes

With user approval, rewrite the affected files in place. Do not change anything not listed in the proposal.

### 5. Confirm

Show a diff summary of what changed. Re-run the checklist and confirm all previously failing criteria now pass.
