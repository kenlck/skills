---
name: loop-setup
description: One-time per-repo setup for the loop-engineering workflow. Detects the issue tracker (GitHub via gh, GitLab via glab, or local files) and writes .loop/config.md defining the five tracker verbs that loop-issues and work-issue use. Use when the user wants to set up loop engineering in a repo, initialise .loop/, or mentions "loop setup".
disable-model-invocation: true
---

# Loop Setup

Write `.loop/config.md` — the tracker adapter every other ken-loop skill reads. The other skills never call `gh`/`glab` directly; they read this file and use its five verbs. That is what keeps the workflow tracker-agnostic.

## Process

### 1. Detect the tracker

- `git remote get-url origin` → github.com host + `gh auth status` OK → **github**
- gitlab host + `glab auth status` OK → **gitlab**
- No remote, no CLI, or auth missing → offer **local** (or print the auth fix command and let the user choose)

Confirm the detected choice with the user before writing anything.

### 2. Prepare the backend

**github / gitlab** — ensure the workflow labels exist (create any that are missing):

```sh
gh label create ready-for-agent --description "Specced, gated, grabbable by an agent" --color 0E8A16
gh label create needs-human --description "Agent blocked; human input required" --color D93F0B
gh label create hitl --description "Requires human collaboration to implement" --color FBCA04
```

(glab equivalent: `glab label create ...`)

**local** — create `.loop/issues/` and note in the config that issue files are named `NNN-<slug>.md` with frontmatter:

```yaml
---
status: ready | in-progress | in-review | needs-human | done
type: AFK | HITL
blocked_by: []   # issue numbers
branch: null     # set when work starts
---
```

Comments are sections appended under `## Log`, each headed `### <date> — <author>`.

### 3. Write `.loop/config.md`

Use this structure, filling each verb with **concrete runnable commands** for the chosen backend:

```md
# Loop tracker config

Backend: github | gitlab | local
Default branch: <main>
Statuses: ready → in-progress → in-review → done, escape: needs-human

## Verb: next-ready
How to find the next grabbable issue: list open issues with status/label
`ready-for-agent`, exclude any whose blocked-by references are not yet done,
pick the lowest number.
<command(s)>

## Verb: read
Fetch an issue's full body and all comments by number.
<command>

## Verb: comment
Append a comment to an issue.
<command>

## Verb: set-status
Move an issue between statuses (label add/remove, close for done, or
frontmatter edit for local).
<command(s) per transition>

## Verb: link-pr
Publish the work for review: push branch + open PR/MR referencing the issue
(github/gitlab), or record the branch in the issue frontmatter (local).
<command>
```

Reference commands per backend:

| Verb | github | gitlab | local |
|---|---|---|---|
| next-ready | `gh issue list --label ready-for-agent --state open --json number,title,body` then filter blockers via `gh issue view <ref> --json state` | `glab issue list --label ready-for-agent` + per-issue view | scan `.loop/issues/*.md` frontmatter |
| read | `gh issue view <n> --comments` | `glab issue view <n> --comments` | read the file |
| comment | `gh issue comment <n> --body-file -` | `glab issue note <n> -m` | append under `## Log` |
| set-status | `gh issue edit <n> --add-label X --remove-label Y`; done = `gh issue close <n>` | `glab issue update` / `glab issue close` | edit frontmatter |
| link-pr | `gh pr create --head <branch> --title <t> --body <b>` (body contains `Closes #<n>`) | `glab mr create` | set `branch:` in frontmatter |

### 4. Verify

Run the read-only verbs (`next-ready`, `read` on any existing issue) to prove the config works. Fix the config if they fail — do not leave a config that hasn't been exercised.

### 5. Report

Tell the user: backend chosen, labels/dirs created, config path, and that `loop-issues` (slice a PRD) and `work-issue` (execute one issue) are now usable in this repo.
