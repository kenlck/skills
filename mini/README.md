# mini

Small-model-optimized feature development. A single, strict, gated skill plus an
optional hook that hard-enforces "no code before approval" — built for agents
like GPT-5.4/5.5 Mini and Codex that compress long instructions and skip stages.

## Why one skill (not five)

An earlier version split the workflow into an orchestrator + four child skills
with state files and skill-to-skill routing. On small models that made things
worse: every cross-skill hop, state-file update, and routing decision is a fresh
chance to lose the thread — exactly what weak models are worst at. This version
inlines everything into one short, linear, turn-capped document.

## Skill

| Skill | Description |
|-------|-------------|
| `feature-dev-mini` | Four gated steps — Discovery+Grill → Plan → Implement → Validate. One step per reply; no file edits until the user approves twice. |

The design principles (short, single-path, one-action steps, turn-capping,
visible gate markers, an inlined grill loop, repeated top/bottom rules) are what
keep a small model on rails. See `skills/feature-dev-mini/SKILL.md`.

## Hook (recommended)

The skill *asks* the model to wait for approval. The hook *guarantees* it: a
`PreToolUse` hook denies all file-editing tools until you create a
`.agent-approved` marker. Setup and details: [hooks/README.md](hooks/README.md).

## Install

```sh
./skills.sh link mini
```

Then install the hook into your project per [hooks/README.md](hooks/README.md).

## Usage

```text
/feature-dev-mini add a CSV export button to the reports page
```

The model runs discovery, grills you one question at a time, summarizes, and
stops for `approve`. It plans, stops for `approve` again, then implements only
the approved change list.
