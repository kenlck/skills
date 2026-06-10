# ken-loop

Loop engineering: plan interactively, slice the plan into machine-checkable issues, then drain the queue with **headless, one-issue-per-session** agent runs that each end in a PR.

## The model

Interactive workflows like `feature-dev-next` get their quality from human gates — grilling, plan approval. That's exactly what makes them un-loopable. ken-loop keeps the human judgment but moves it to the edges, where it batches well:

| Phase | Who | What |
|---|---|---|
| Plan | human + agent, interactive | Grill, PRD (`/grill-me`, `/ken-swe:write-a-prd` — reuse what you have) |
| Slice | human + agent, interactive | `loop-issues`: tracer-bullet slices, **criteria gate** — every criterion names a runnable check |
| Execute | agent, headless | `work-issue`: fresh session per issue, TDD against the criteria, branch + PR |
| Review | human, async | Merge PRs; unblock `needs-human` issues in batch |

Design rules this bundle holds to:

- **The loop is dumb code, not prompt.** No in-prompt state machines, evaluators, or iteration logs — those degrade over long contexts. Each issue gets a fresh session at peak attention; the tracker and git are the only state.
- **The issue is the contract.** When a run produces a bad PR, fix the issue spec or the gate — not the executor. `work-issue` stays boring.
- **Two exits, never a question.** A headless run ends DELIVERED (PR) or BLOCKED (findings comment + `needs-human` label). It never waits on input.
- **PR-only blast radius.** The agent never merges and never touches the default branch.
- **Tracker-agnostic.** Skills speak five verbs (next-ready, read, comment, set-status, link-pr) defined in `.loop/config.md` — GitHub (`gh`), GitLab (`glab`), or local files.

## Skills

| Skill | Description |
|-------|-------------|
| `loop-setup` | One-time per repo: detect tracker, create labels, write `.loop/config.md` with the five verbs |
| `loop-issues` | Slice a PRD into AFK/HITL tracer-bullet issues; enforce the criteria gate; publish in dependency order |
| `work-issue` | Headless executor for one issue: TDD against acceptance criteria, 3 bounded attempts, DELIVERED or BLOCKED |

## Usage

```sh
./skills.sh link ken-loop
```

In the target repo, once:

```text
/loop-setup
```

Per feature:

```text
# interactive session — plan as usual, then:
/loop-issues          # slice the PRD in context, gate, publish

# per issue, headless:
claude -p "/work-issue 12" --permission-mode acceptEdits
```

Review the PR. If an issue comes back `needs-human`: answer in a comment, flip it back to ready, rerun.

## Maturity ladder

1. **Manual** (now) — run `/work-issue` by hand per issue; calibrate the executor and your issue-writing.
2. **Bash loop** — `while next-ready; do claude -p "/work-issue $n"; done` with stop conditions (queue empty, N consecutive blocks, max-runs budget).
3. **Sandboxed driver** — [sandcastle](https://github.com/mattpocock/sandcastle) per issue: container isolation, worktrees, `maxIterations`, structured verdicts.
4. **Scheduled** — cron / scheduled agents fire the driver; drop issues in by day, review PRs in the morning.

Don't climb a rung until the one below is boring. HITL-labelled issues never enter the loop — route them to `/ken-swe:feature-dev-next`.

## Prerequisite worth respecting

The loop is only as good as the repo's checks. If there's no fast test/typecheck harness, acceptance criteria can't be machine-checked and the loop degrades into "agent claims it works." Make the first issue of any loop "build the check harness."

## Credits

- `loop-issues` adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `to-issues` (tracer-bullet slicing, AFK/HITL); the criteria gate and tracker verbs are the additions
- Executor design informed by `ken-swe/feature-dev-auto`'s lessons: verifiable goals as the contract, bounded retries — minus the in-prompt loop machinery
