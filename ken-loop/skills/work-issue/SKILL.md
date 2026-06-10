---
name: work-issue
description: Headless executor for one loop-ready issue — read the issue, implement it with TDD against its acceptance criteria, and end in exactly one of two exits, DELIVERED (branch + PR) or BLOCKED (findings comment + needs-human label). Designed for non-interactive runs like `claude -p "/work-issue 12"`. Use when asked to work, execute, or land a specific tracker issue.
disable-model-invocation: true
---

# Work Issue

Execute exactly one issue, unattended. The issue's acceptance criteria are the contract; the human re-enters at PR review, never mid-run.

## Hard rules

1. **Never ask the user anything.** No AskUserQuestion, no "shall I…". Ambiguity and failure both route to the BLOCKED exit.
2. **Two exits only.** Every run ends in **DELIVERED** (branch pushed, PR opened, status `in-review`) or **BLOCKED** (findings commented, status `needs-human`). Never exit silently, never half-done without a comment.
3. **Never merge. Never commit to the default branch.** All work happens on `loop/issue-<n>`.
4. **One issue per run.** Don't grab follow-up work; note it in the PR description instead.
5. **Surgical scope.** Touch only what this issue requires; respect its Must-not-change list.

## Run

### 0. Preflight

- Load `.loop/config.md` for the tracker verbs. Missing → print "run /loop-setup first" and stop (nothing to comment on yet).
- `read` the issue (`$ARGUMENTS` = issue number/ref) including all comments — comments may contain human answers from a previous blocked run.
- Gate check: the issue has acceptance criteria, each with a runnable check, and the check infrastructure exists in the repo. Anything missing → **BLOCKED** with the specific gap ("criterion 3 has no check command"; "no test runner configured").

### 1. Branch

- `set-status` → in-progress.
- Fresh start: branch `loop/issue-<n>` off the up-to-date default branch.
- **Resume:** if `loop/issue-<n>` already exists, check it out and continue from its state — a previous run was blocked and a human has since answered in the issue comments. Re-read those answers before doing anything.

### 2. Explore

`.codemap/MAP.md` if present, else Glob/Grep. Read every file you expect to touch before editing it. Match existing conventions exactly.

**Ambiguity rule:** internals (naming, private structure) — use judgment, follow codebase patterns. Contracts (schema, API shapes, user-visible behavior) with materially different interpretations that the issue, its comments, and the parent PRD don't resolve — **BLOCKED** with the specific question and your recommended answer.

### 3. Implement — one criterion at a time

Vertical TDD, never horizontal: for each criterion, write/extend its check first (red), implement minimally (green), commit (`issue-<n>: <criterion summary>`). No speculative code beyond what the criteria require.

### 4. Verify

An **attempt** = running ALL acceptance-criteria checks plus the repo's standard suite (tests, typecheck, lint — whatever the repo configures).

- All green → exit **DELIVERED**.
- Any red → fix and retry. After **3 failed attempts**, stop and exit **BLOCKED** — do not keep grinding, and do not weaken a check to get green. If the same error repeats verbatim across attempts, treat attempt limits as reached early.

### Exit: DELIVERED

1. Push `loop/issue-<n>`.
2. `link-pr`: open the PR referencing the issue (`Closes #<n>`). PR body: what was built, then **per-criterion verification evidence** — each criterion with its check command and result.
3. `set-status` → in-review. `comment` the PR link on the issue.
4. Final output: one-line summary + PR URL.

### Exit: BLOCKED

1. Commit work-in-progress to `loop/issue-<n>` and push (the next run resumes from it; never discard work silently).
2. `comment` on the issue: what was attempted, the exact failing output (trimmed to the relevant lines), and the **one specific question or blocker** a human must resolve — with your recommended resolution.
3. `set-status` → needs-human (remove ready status).
4. Final output: one-line summary + the blocker.

The unblock flow is the human's: answer in an issue comment, flip status back to ready, rerun `/work-issue <n>`.
