---
name: code-review-parallel
description: Review multiple pull/merge requests across GitHub, GitLab, and Azure DevOps in parallel. Thin orchestrator over the single-PR code-review skill — one agent per PR, consolidated summary, optional PR comments. Use when the user wants to review several PRs/MRs at once (release sweep, multi-repo audit, batch review).
---

# Code Review — Parallel (Multi-PR, Multi-Platform)

Thin orchestrator: fan out the [code-review](../code-review/SKILL.md) pipeline across many PRs/MRs in parallel. Supports GitHub (`gh`), GitLab (`glab`), and Azure DevOps (`az repos pr`). Read-only — does **not** apply fixes (PR branches differ; cross-checkout is out of scope, use single-PR `code-review` for that).

## Quick start

```
/code-review-parallel <url> [<url> ...]
/code-review-parallel --gh 123 --gl 45 --ado 67
/code-review-parallel --file prs.txt
cat prs.txt | /code-review-parallel -
```

Input forms (mix freely):

- **URL** — `https://github.com/o/r/pull/123`, `https://gitlab.com/g/r/-/merge_requests/45`, `https://dev.azure.com/o/p/_git/r/pullrequest/67`
- **Flags** — `--gh <id>`, `--gl <id>`, `--ado <id>` (resolved against current repo's `origin` remote; rejected if host doesn't match)
- **List file / stdin** — one URL per line, `#` comments allowed

Shell-safe flags chosen over `gh#123` / `gl!45` shorthand (the `!` triggers history expansion in bash without quoting).

## Process

### Step 1: Parse refs

Build `prs[]` of `{platform, host, owner, repo, id, url}`. Deduplicate by URL.

### Step 2: Auth preflight (detect + guide)

For each unique platform, verify CLI is installed and authenticated. If anything is missing, print the exact fix commands and **stop before spawning any agents**.

| Platform | Install check | Auth check | Fix |
|---|---|---|---|
| GitHub | `command -v gh` | `gh auth status` | `gh auth login` |
| GitLab | `command -v glab` | `glab auth status` | `glab auth login` |
| Azure DevOps | `command -v az && az extension show -n azure-devops` | `az account show` | `az login && az extension add --name azure-devops` |

### Step 3: Fetch metadata, filter by state

Fetch metadata for each PR in parallel. Auto-skip and report:

- **merged** or **closed** → skip silently (note in summary)
- **draft** → list them and ask once whether to include

Required metadata: `title`, `state`, `isDraft`, `baseRefName`, `headRefName`, `url`, file list, additions/deletions.

| Platform | Metadata command |
|---|---|
| GitHub | `gh pr view <id> --repo <o/r> --json title,state,isDraft,baseRefName,headRefName,url,files,additions,deletions` |
| GitLab | `glab mr view <id> --repo <o/r> -F json` |
| Azure DevOps | `az repos pr show --id <id> -o json` |

### Step 4: Fetch diffs + per-repo CLAUDE.md

For each surviving PR, fetch the diff and the PR repo's `CLAUDE.md` (if it exists). Do **not** use the local cwd's `CLAUDE.md` — it may not match the PR's repo.

| Platform | Diff | CLAUDE.md at head ref |
|---|---|---|
| GitHub | `gh pr diff <id> --repo <o/r>` | `gh api repos/<o>/<r>/contents/CLAUDE.md?ref=<head> -H 'Accept: application/vnd.github.raw'` |
| GitLab | `glab mr diff <id> --repo <o/r>` | `glab api "projects/<urlencoded o/r>/repository/files/CLAUDE.md/raw?ref=<head>"` |
| Azure DevOps | `az repos pr show --id <id> --query 'lastMergeSourceCommit'` then `git diff <base>..<head>` (clone shallow if needed) | `az repos show ... items?path=/CLAUDE.md&versionDescriptor.version=<head>` |

**Diff noise filter** before measuring size: drop lockfiles (`*.lock`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `Gemfile.lock`, `Cargo.lock`, `go.sum`, `poetry.lock`), `vendor/`, `node_modules/`, `dist/`, `build/`, and `.generated.*` paths. If the filtered diff is empty, mark "no reviewable changes" and skip. If still > 10k lines after filtering, list affected paths and ask user to scope (e.g. `--only src/`).

### Step 5: Parallel review (one agent per PR)

Spawn one **general-purpose** Agent per PR. Run in **rounds of 5 concurrent** (single message, parallel tool calls per round) — no hard PR cap. Print round progress (`Round 2/4 — reviewing 5 PRs...`).

Each agent prompt (verbatim template):

```
You are reviewing PR <url> (<title>) on <platform>.

Apply the code-review skill at ../code-review/SKILL.md, starting from
its Step 2 (Understand conventions) and continuing through Step 4
(Consolidate & report). Skip Step 1 (scope) — the diff is already fetched
and provided below. Skip Step 5 (Act on findings) — do not propose fixes,
only report. Use code-review's severity definitions (Critical / High /
Medium / Low) and its medium-confidence floor.

Treat the CLAUDE.md content below (if any) as the project conventions
for this PR's repo. If empty, note "no project conventions available" and
review against general best practice only.

Return ONLY this markdown section, exactly:

## <owner/repo>#<id> — <title>
<url>

### Critical
- `path/to/file.ts:42` — <issue>. Fix: <one-line action>.

### High
- ...

### Medium
- ...

### Low
- ...

Omit any severity heading with no findings. If nothing to report, write
"No high-confidence findings." under the H2.

--- DIFF ---
<filtered diff>

--- CLAUDE.md (from <owner/repo>@<head>) ---
<contents or empty>

--- METADATA ---
<json>
```

Tunable: `CRP_CONCURRENCY` env var overrides the round size of 5.

### Step 6: Consolidate & write outputs

Write **per-PR files** to `.claude/reviews/<YYYYMMDD-HHMMSS>/<platform>-<owner>-<repo>-<id>.md`, plus an `index.md` linking them. Use `.claude/reviews/` (commonly gitignored); if not, warn once. Print the absolute path.

**Inline chat output** — keep tight:

1. **Summary table** for every PR:
   ```
   | PR | Title | C | H | M | L | State | File |
   |---|---|---|---|---|---|---|---|
   | [o/r#123](url) | refactor auth | 1 | 2 | 0 | 1 | open | reviews/.../gh-o-r-123.md |
   ```
2. **Critical + High findings only** inline, grouped under each PR's H2. Medium/Low live only in the file.
3. Skipped PRs (merged/closed/no-changes) appended as a one-liner list at the end.

This keeps the chat scannable for 20+ PR batches.

### Step 7: Act on findings

Ask via AskUserQuestion:

- **Done** — report only, no posting.
- **Post summary comment to each PR** — see below. Asks which PRs to include.

No fix option. Multi-PR fixes require per-branch checkout, which this skill deliberately doesn't do — for that, run single-PR `/code-review` against an already-checked-out branch.

**Post summary comment**: post the per-PR markdown file's contents as a PR comment, wrapped so it's collapsible by severity:

```
<details><summary>Critical (N)</summary>

...findings...
</details>

<details><summary>High (N)</summary>
...
</details>
```

| Platform | Post command |
|---|---|
| GitHub | `gh pr comment <id> --repo <o/r> --body-file <path>` |
| GitLab | `glab mr note <id> --repo <o/r> -F <path>` |
| Azure DevOps | `az repos pr comment create --pull-request-id <id> --content "$(cat <path>)"` |

**Always preview the exact body and confirm once** before posting — comments fire notifications to PR authors and reviewers.

## Principles

- **Thin orchestrator** — defer to the canonical [code-review](../code-review/SKILL.md) for the actual review pipeline. Don't duplicate severity rules or lens prompts; if they need to change, change them there.
- **One agent per PR, isolated context** — small PRs don't get drowned out by large ones; each agent's window stays scoped.
- **Read-only by design** — no fix mode, no branch switching. Use single-PR `code-review` if you want fixes.
- **Per-repo conventions** — fetch CLAUDE.md from each PR's own repo, never from local cwd.
- **Fail fast on auth** — never spawn agents until every required CLI is ready.
- **Confirm before external writes** — posting comments is visible to others and triggers notifications.

## Push back

- Diff > 10k lines after noise filter → ask user to scope before reviewing.
- All PRs are drafts → confirm intent before burning agent budget.
- Mixed platforms with comment-post request → fine, posts per platform. But confirm once with full preview.
- User asks for fixes → explain this skill is read-only; suggest checking out the target PR locally and running `/code-review`.
