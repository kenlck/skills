# Skill Review Report Format

Use this format when reporting findings from a skill review.

---

## Template

```
# Skill Review: <skill-name>

**Path**: <path to skill folder>
**Files reviewed**: <list of files read>
**Score**: <X/Y criteria passed>

---

## Summary

<1–2 sentences on overall quality. Is it ready to use, needs minor fixes, or needs significant work?>

---

## Findings

### ❌ Fails
Issues that must be fixed.

| # | Criterion | Issue | Fix |
|---|-----------|-------|-----|
| 1 | Description triggers | No "Use when" clause | Add: "Use when user asks to X, Y, or mentions Z." |
| 2 | SKILL.md length | 143 lines (limit: 100) | Move advanced sections to REFERENCE.md |

### ⚠️ Warnings
Issues that should be fixed but aren't blockers.

| # | Criterion | Issue | Fix |
|---|-----------|-------|-----|
| 1 | Time-sensitive info | References v1.2.3 which may change | Remove version pin or note it may be outdated |

### ✅ Passes
Criteria met — no action needed.

- Description under 1024 chars
- Valid frontmatter (name, description)
- Consistent terminology
- Concrete examples included
- References one level deep

---

## Recommended actions

1. <Most important fix>
2. <Second fix>
3. <Optional improvement>
```

---

## Severity guide

| Symbol | Meaning | Action |
|--------|---------|--------|
| ❌ Fail | Criterion not met | Must fix before skill is reliable |
| ⚠️ Warn | Partially met or at risk | Should fix; degrades over time if ignored |
| ✅ Pass | Criterion met | No action needed |

## Score interpretation

| Score | Verdict |
|-------|---------|
| 100% | Ship it |
| 80–99% | Minor fixes needed |
| 60–79% | Needs work before use |
| < 60% | Significant rework required |
