---
name: code-review
description: Review changed code for bugs, simplicity, security, and convention adherence using parallel reviewer agents. Use when the user asks to review code, review a PR, check quality, or wants a second pair of eyes before merging.
---

# Code Review

Parallel, multi-angle code review: simplicity & elegance, bugs & correctness, conventions & security. Reports only high-confidence issues, grouped by severity.

## Quick start

`/code-review` — reviews recently changed code (unstaged + staged changes)
`/code-review src/auth/` — reviews a specific directory
`/code-review #123` — reviews a pull request by number

## Process

### Step 1: Identify scope

Determine what to review:

1. **If a PR number is given** — fetch the diff with `gh pr diff`.
2. **If a path is given** — read the files at that path.
3. **If no argument** — run `git diff HEAD` to find recently changed code. If no changes, ask the user what to review.

Read all files in scope. Understand the surrounding context — don't review lines in isolation.

### Step 2: Understand conventions

Before flagging anything, understand the project's standards:

1. Read `CLAUDE.md` if it exists — note coding standards, patterns, and preferences.
2. Scan surrounding code for established patterns (naming, error handling, structure).
3. Only flag convention violations that deviate from what the project actually does, not from abstract best practices.

### Step 3: Parallel review

Launch 3 general-purpose agents in parallel, each with a different review lens:

**Simplicity & elegance**
> "Review the following changed code for simplicity and elegance. Look for: unnecessary complexity, premature abstractions, duplicated logic (DRY violations), over-engineered solutions, dead code, and anything that could be expressed more clearly. Report only high-confidence issues with specific file and line references."

**Bugs & correctness**
> "Review the following changed code for bugs and functional correctness. Look for: off-by-one errors, null/undefined handling, incorrect conditional logic, async/await issues, missing error handling at system boundaries, and race conditions. Report only high-confidence issues with specific file and line references."

**Conventions & security**
> "Review the following changed code for adherence to project conventions and security. Look for: deviations from existing patterns, inconsistent naming, missing input validation at system boundaries, potential injection vectors, exposed secrets or credentials, and insecure defaults. Report only high-confidence issues with specific file and line references."

Provide each agent with the full diff/code and any relevant context from CLAUDE.md.

### Step 4: Consolidate & report

1. Collect all findings from the 3 agents.
2. Deduplicate — if multiple agents flag the same issue, merge into one.
3. Classify each issue by severity:
   - **Critical** — bugs, security vulnerabilities, data loss risks
   - **High** — logic errors, missing edge cases, correctness issues
   - **Medium** — simplicity improvements, convention violations
   - **Low** — style nits, minor readability suggestions
4. Drop anything below medium confidence — no speculative findings.
5. Present the report grouped by severity, with specific file:line references and a brief explanation of each issue.

### Step 5: Act on findings

Ask the user via AskUserQuestion:
- **Fix all** — apply all suggested fixes
- **Fix critical/high only** — apply only the important ones
- **Just report** — don't change anything, the report is enough
- **Cherry-pick** — let me choose which to fix

Apply the chosen fixes. For each fix, explain what changed and why in a one-line comment in your output.

## Principles

- **High signal, low noise** — only report issues you're confident about. A review with 3 real issues beats one with 15 maybes.
- **Context matters** — understand patterns before flagging. If the whole codebase uses a pattern, don't flag it as wrong.
- **Actionable** — every issue should have a clear fix. "This could be better" is not a finding.
- **Proportional** — match review depth to the scope. A 5-line change doesn't need an architecture critique.
