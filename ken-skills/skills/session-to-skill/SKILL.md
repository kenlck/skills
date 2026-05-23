---
name: session-to-skill
description: Capture the workflow performed in the current session and turn it into a reusable skill. Use when the user wants to save, distill, or "skill-ify" what was just done so it can be repeated later — e.g. "turn this session into a skill", "make a skill out of this", "capture this workflow".
disable-model-invocation: true
---

# Session to Skill

Distill the workflow of the current session into a durable, reusable skill.

Capture the *repeatable procedure* — the steps, commands, decisions, and
pitfalls — and write it out as a proper skill that can run the same workflow
again later.

## Quick start

`/session-to-skill` — capture the main workflow from this session
`/session-to-skill <focus>` — capture a specific workflow (e.g. "the deploy steps")

## Workflow

### 1. Identify the workflow worth capturing

Look back over the session and find the repeatable procedure that was carried
out: the task accomplished and the ordered steps used to do it. If the session
covered several unrelated tasks, ask the user which one to capture.

State the workflow you intend to capture in 1-2 sentences and confirm with the
user before extracting.

### 2. Extract the durable workflow from session specifics

This is the core transformation. From the transcript, pull out:

- **Ordered steps** — what was done, in sequence.
- **Commands & tool calls that worked** — exact invocations worth reusing.
- **Decision points** — branches and the heuristic for each ("if X, do Y").
- **Pitfalls** — failures hit and how they were resolved, so they're avoided next time.
- **Success criteria** — how you knew the task was done.

Then generalize: replace one-off details (specific filenames, values, repo or
branch names) with parameters or placeholders. Redact secrets, credentials, and
personal data. Drop dead-ends that didn't inform the final approach and any
narrative chatter.

**Confirm the workflow with the user before moving on.** Present the extracted
steps as an ordered outline (steps + order, what's generalized vs. kept
specific), then ask via AskUserQuestion: proceed (Recommended) / adjust / abort.

**Approval gate** — resolve the AskUserQuestion outcome before doing anything else:

- *proceed* — the only outcome that advances to step 3.
- *adjust* (or any request for changes) — treat it as a request to revise, **not**
  as approval. Revise the outline, re-present the full updated workflow, and ask
  again (proceed / adjust / abort). Repeat until the user **explicitly** approves.
  Stating *what* to change is never permission to advance.
- *abort* — stop here. Offer to recapture a different workflow or end.

### 3. Gather skill metadata

Confirm with the user:

- **Name** — kebab-case skill/folder name.
- **Location** — which bundle or skills directory it belongs in.
- **Triggers** — when the skill should activate (keywords, contexts, file types).

### 4. Draft and write the skill

Follow the conventions in [write-a-skill](../write-a-skill/SKILL.md): valid
frontmatter (`name`, `description` with "Use when [triggers]"), SKILL.md under
100 lines, Quick start, and a Workflow section built from the steps in step 2.

Bundle a script only if the session repeated a deterministic command sequence
worth saving as code. Split into reference files only if SKILL.md would exceed
100 lines.

Create the skill folder at the chosen location and write the files.

### 5. Review with user

Present the draft and highlight: does it capture the workflow completely, are the
generalized parameters right, is any step over-/under-explained? Then ask via
AskUserQuestion: proceed (Recommended) / adjust / abort.

**Approval gate** — resolve the outcome before finishing:

- *proceed* — the skill is done. Optionally suggest running
  [review-skill](../review-skill/SKILL.md) to validate against the checklist.
- *adjust* (or any request for changes) — revise the draft, re-present it in full,
  and ask again. Repeat until the user **explicitly** approves. Stating *what* to
  change is never permission to finish.
- *abort* — stop here.
