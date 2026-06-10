# Design notes: feature-dev-next → mini

## Why `feature-dev-next` fails on small models

`feature-dev-next` is a 130+ line monolith with 7 stages × 3 presets. Tested on
GPT-5.4 Mini, it **skipped stages and jumped straight to coding** even when Deep
was selected. Small models don't disobey — they *compress* a long document to
its gist and run to the strongest attractor (write code). Every defense in
`feature-dev-next` is the kind a small model compresses away: length, branchy
presets, gates written as warnings, gates buried after context.

## First attempt (abandoned): a 5-skill state machine

The first `mini` rewrite split the flow into an orchestrator + four child skills
(`feature-discovery`, `feature-planning`, `feature-implementation`,
`feature-validation`) with `state.md` flags and skill-to-skill routing.

It made things **worse**, for two reasons:

1. **`disable-model-invocation: true` on the child skills broke routing** — the
   orchestrator could not actually invoke them, so the chain dead-ended.
2. **Indirection is the enemy of small models** — cross-skill hops, external
   state maintenance, and conditional routing are exactly what weak models fail
   at. Splitting added all three.

## Current design: one skill + one hook

`feature-dev-mini` is now a single, short, linear, turn-capped document. The
techniques that actually raise small-model compliance:

- **One path** — no presets, no branches to track.
- **One action per numbered step**, one step per reply, explicit turn-capping.
- **Visible gate markers** (`GRILLING`, `AWAITING APPROVAL: …`) instead of
  internal decisions — a token the model must emit anchors the behavior.
- **An inlined grill loop** (one question per reply, bounded to ~5) — the
  interactive pattern that worked, made deterministic.
- **The gate repeated at top and bottom** — recency and primacy both win.

Because a prompt is only a suggestion, the bundle also ships a **`PreToolUse`
hook** (`hooks/`) that denies file edits until the user creates `.agent-approved`.
That is the only true enforcement; the skill makes the model *want* to comply,
the hook makes non-compliance *impossible*.

## What was dropped from `feature-dev-next`, on purpose

| `feature-dev-next` feature | Status | Why |
|---|---|---|
| Quick/Standard/Deep presets | Removed | Branch-tracking loses small models |
| Explorer/Architect/Reviewer subagent fan-out | Removed | Synthesis + indirection too heavy |
| `AskUserQuestion`-based gates | Replaced with visible text markers | Not all harnesses provide the tool |
| `FRONTEND.md` / `LOG.md` / `AGENTS.md` | Not carried over | Out of scope for the mini path |

## Second tightening (2026-06): templates + test-first

Real runs of the single-skill version were **compliant but weak**: shallow
scans, trivial grill questions, vague plans — and the grill question was often
emitted twice in one reply, because the reply shape was described in prose the
model had to assemble itself.

The fixes, all inline and branch-free:

- **Exact reply skeletons to copy** (scan findings, grill question, plan,
  validate report) — a small model fills in a template far more reliably than
  it follows assembly rules; this also killed the question-doubling.
- **Recipe-driven scan** — five named searches (entry point, similar feature,
  conventions, existing tests + the test command, integration seams) instead
  of a bare "≥5 searches" quantity floor.
- **Grill decision-area menu** — data model, edge cases, errors, permissions,
  UX/API; at most one question per area, skip what the codebase answers.
- **Plan/test 1:1 pairing** — change item N is proven by test N.
- **Red-green per item in Step 3** — write test N, paste the FAIL line,
  implement, paste the PASS line; stop after 2 failed attempts and return to
  PLAN. Run-through (no stopping between green items) keeps turn count flat.
- **Validate = full suite + static checks + plan-drift audit** — any changed
  file not in the approved plan gets FLAGged.

The state machine is unchanged (same six states, same two approvals, same
hook); only the content of each state got prescriptive.

## Install

```sh
./skills.sh link mini
# then install the hook into your project — see hooks/README.md
```
