---
name: prepare-implementation-plan
description: Turn user stories and acceptance criteria into a verifiable, code-grounded implementation plan. Use when the user wants work planned before coding.
---

# Prepare Implementation Plan

Produce an implementation plan whose every goal is **verifiable** (mapped to an acceptance criterion and a concrete check) and whose **files-changed** list is **derived from the actual code**, not guessed. Run the three steps in order.

## Step 1 — Ingest the work items

Get the user story (or stories) and its acceptance criteria. Try sources in this order; stop at the first that works:

1. **Azure DevOps MCP** — if an ADO / Azure DevOps work-item MCP tool is connected, fetch by work-item ID.
2. **`az boards` CLI** — `rtk az boards work-item show --id <id> --output json`. For a parent feature/epic, follow its child links and pull each child's fields.
3. **Manual paste** — ask the user to paste the story and acceptance criteria.

Capture for each item: ID (if any), title, description, and the acceptance criteria verbatim.

**Completion criterion:** the title, description, and full acceptance-criteria text are captured for every work item in scope.

## Step 2 — Ground & grill until the plan is forced

Grilling and codebase grounding are one interleaved gate, not two phases. Grill the user relentlessly _and_ read the actual code, letting each feed the other: what the code says reshapes what you ask ("you said this writes to `orders` — but `orders` is event-sourced, no direct writes; do you mean emit an event?"), and what the user says tells you where to read next. Work one thread at a time; follow each answer to its next unknown before moving on.

**Start with the requirement, not the code.** Open by grilling the user on what the story actually means — restate each acceptance criterion, surface the ambiguities, edge cases, and scope. Do **not** read code until a specific thread needs a specific fact to resolve.

**Grounding is demand-driven.** Read code only when a live grilling thread can't be settled without it, and read only what that thread needs (a single file, a specific function), not the surrounding area "for context." Each read should be answering a question you can name. If — and only if — a thread has fanned out into several files at once and the raw dumps would clog the grilling, dispatch a scoped recon agent (e.g. `Explore`) for _that thread_ with a precise question, so the file contents stay out of context. Never open with a broad "map the whole technical surface" sweep; the surface that matters reveals itself one resolved thread at a time.

Grill — and ground — across these dimensions:

- **AC ambiguity** — for each acceptance criterion, what exactly counts as "done"? Restate it until the user agrees it is unambiguous.
- **Edge cases & error states** — what happens off the happy path that the AC doesn't mention?
- **Technical surface** — which modules, services, and integration points does this touch? Confirm against the code, don't take it on faith.
- **Contract & data changes** — schema, API shape, migrations, events, config.
- **Verification** — how will each AC be _proven_? Name the test, command, or manual check, and **statically confirm its harness exists** (the script is in `package.json`/`Makefile`/CI; the test file or directory exists; the manual-check route is real). Do **not** run anything. If a named verification has no existing harness, that becomes a first-class plan item ("verification infrastructure needed"), not a silent assumption.
- **Out of scope** — what are we explicitly NOT doing?
- **Dependencies, sequencing, risks** — what must land first; what could go wrong.

**Closure check (the files-changed list is done when):** every implementation step maps to a file in the table; every file in the table has been _opened_, not just grep'd; and a **reverse pass** has run — for each changed file, find its callers, tests, and config, and confirm each is either in the list or consciously excluded. Done means "no dangling edge," not "I read everything." For a high-fan-out change (a widely-imported hub file), cap the reverse pass at direct callers and note _"N direct callers, transitive dependents not individually enumerated"_ in Open Questions rather than enumerating hundreds.

**Completion criterion:** every acceptance criterion has an agreed, unambiguous definition of done; the closure check passes; every unknown surfaced above is resolved or explicitly deferred; and the user confirms shared understanding. Do not advance while any criterion remains fuzzy or any planned change is ungrounded.

## Step 3 — Write the blueprint

The bar for this plan is a **blueprint**: complete enough to build from without re-deciding — every goal verifiable, every touched file listed, every step ordered. Write it to `.plan/<work-item-id>-<kebab-title>.md` (omit the `<id>-` prefix when there is no work-item ID), following the exact structure in [`reference/blueprint-template.md`](reference/blueprint-template.md). Create `.plan/` if it is missing. Then echo the full blueprint in the chat.

**Completion criterion:** the file exists under `.plan/`; every acceptance criterion maps to at least one verifiable goal; every file the steps imply appears in the files-changed table and passed the closure check; and the full plan is shown in the chat.
