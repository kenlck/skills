---
name: review-skill
description: Review an existing skill against the write-a-skill guidelines, checking structure, description quality, file size, and review checklist. Use when user wants to audit, improve, or validate a skill they've written or installed.
---

# Review Skill

Audit an existing skill against the write-a-skill guidelines and report issues with suggested fixes.

## Quick start

`/review-skill path/to/skill-name/` — review a skill by path
`/review-skill skill-name` — review an installed skill by name

## Workflow

### 1. Locate the skill

If a path is given, read the files there. If a name is given, search `~/.claude/skills/` and installed plugin directories for a matching skill folder.

### 2. Read all skill files

Read `SKILL.md` and any accompanying files (`REFERENCE.md`, `EXAMPLES.md`, scripts, etc.).

### 3. Evaluate against guidelines

Check each criterion and mark pass/fail:

**Description**
- [ ] Present and under 1024 chars
- [ ] Written in third person
- [ ] First sentence states what it does
- [ ] Includes "Use when [specific triggers]"
- [ ] Triggers are specific enough to distinguish from similar skills

**SKILL.md structure**
- [ ] Has valid frontmatter (`name`, `description`)
- [ ] Under 100 lines
- [ ] No time-sensitive information (dates, versions, URLs that may rot)
- [ ] Consistent terminology throughout
- [ ] Concrete examples included
- [ ] References to other files are one level deep (no deep nesting)

**File structure**
- [ ] Additional content split into separate files when SKILL.md > 100 lines
- [ ] Scripts present only for deterministic, repeated operations
- [ ] No unnecessary files

### 4. Report findings

Use the report format from [REPORT.md](REPORT.md).

### 5. Offer to fix

Ask the user: apply suggested fixes automatically, or just report?
