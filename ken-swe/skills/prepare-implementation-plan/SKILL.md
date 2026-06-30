---
name: prepare-implementation-plan
description: Turn an ADO user story — or a rough idea — into a verifiable, code-grounded blueprint a TDD executor can build from. Use when the user wants work planned before coding.
---

# Prepare Implementation Plan

Produce an implementation plan whose every goal is **verifiable** (mapped to an acceptance criterion and a concrete check) and whose **files-changed** list is **derived from the actual code**, not guessed.

## Step 1 — Ingest & classify the input

Get the work to be planned. Try sources in this order; stop at the first that works:

1. **Azure DevOps MCP** — if an ADO / Azure DevOps work-item MCP tool is connected, fetch by work-item ID.
2. **`az boards` CLI** — `az boards work-item show --id <id> --output json`. For a parent feature/epic, follow its child links and pull each child's fields.
3. **What the user brings** — a story pasted in, or a rough idea in their own words. Take it as-is.

Then **classify** it — the input varies from a formed story to a half-baked spark, and the next step routes on which:

- **Formed** — acceptance criteria exist (explicit or obvious). Capture ID (if any), title, description, and the acceptance criteria **verbatim**.
- **Rough** — an idea with no acceptance criteria. Capture the spark as-is; forging the criteria is the grill's first job in Step 2, not a blocker here.

**Completion criterion:** the input is captured and classified formed-or-rough; for a formed item, its full acceptance-criteria text is captured verbatim.

## Step 2 — Ground & grill until the plan is forced

Grilling the user and grounding in the code are one interleaved gate, not two phases — each feeds the other: what the code says reshapes what you ask ("you said this writes to `orders` — but `orders` is event-sourced; do you mean emit an event?"), and what the user says tells you where to read next. Work **one thread at a time**: ask, hear the answer, follow it to the next unknown before moving on.

**No question budget.** Grill conversationally in plain chat — never batch a fixed set of questions (nor use a multiple-choice tool to do so) and then treat the requirement as settled. A tidy round of four or five questions is a sign you stopped at the surface. Grilling ends only when the completion criterion below is met, however many turns that takes.

**Ground on demand.** Open on the requirement — restate each acceptance criterion, surface its ambiguities, edge cases, and scope. Read code only when a live thread can't be settled without it, and read only what that thread needs (one file, one function), never a broad "map the surface" sweep — the surface that matters reveals itself one resolved thread at a time. If a single thread fans out across several files and the raw dumps would clog the chat, dispatch a scoped recon agent (e.g. `Explore`) for _that thread_ with a precise question.

**Route every question by intent vs. fact.** Intent (scope, priorities, which behaviour is wanted, what "done" means) goes to the user; fact (how something works, what calls what, whether a route/table exists) you go read. Asking the user what the code already settles wastes the grilling — find the answer, then bring it back as a confirmation ("the code does X — is that what you want?"), not an open question.

Grill — and ground — across these dimensions:

- **Acceptance criteria** — if the input arrived **rough**, this is the **first** thread: propose a concrete, testable set of criteria and refine with the user until they agree. If it arrived **formed**, restate each criterion until the user agrees it is unambiguous. Either way you exit with an agreed, testable definition of done.
- **Interface** — what public shape does the work expose (function signatures, API/route, CLI, types)? Pin it down against existing code conventions; the downstream TDD executor is a small model and will invent a bad one if you leave it open.
- **Edge cases & error states** — what happens off the happy path that the criteria don't mention?
- **Technical surface** — which modules, services, and integration points does this touch? Confirm against the code as each thread comes live, don't take it on faith.
- **Contract & data changes** — schema, API shape, migrations, events, config.
- **Verification** — how will each AC be _proven_? Name the test, command, or manual check, and **statically confirm its harness exists** (the script is in `package.json`/`Makefile`/CI; the test file or directory exists; the manual-check route is real). Do **not** run anything. If a named verification has no existing harness, that becomes a first-class plan item ("verification infrastructure needed"), not a silent assumption. For a criterion that's a **judgement call** rather than a crisp pass/fail, pin concrete examples with the user that **must pass** and that **must fail** — these become the executor's test fixtures.
- **Out of scope** — what are we explicitly NOT doing?
- **Dependencies, sequencing, risks** — what must land first; what could go wrong.

**Closure check (the files-changed list is done when):** every behaviour maps to at least one file in the table; every file in the table has been _opened_, not just grep'd; and a **reverse pass** has run — for each changed file, find its callers, tests, and config, and confirm each is either in the list or consciously excluded. Done means "no dangling edge," not "I read everything." For a high-fan-out change (a widely-imported hub file), cap the reverse pass at direct callers and note _"N direct callers, transitive dependents not individually enumerated"_ in Open Questions rather than enumerating hundreds.

**Completion criterion:** every acceptance criterion has an agreed, unambiguous definition of done; the public interface is pinned; the closure check passes; every unknown surfaced above is resolved or explicitly deferred; and the user confirms shared understanding. Do not advance while any criterion remains fuzzy or any planned change is ungrounded.

## Step 3 — Write the blueprint

The bar for this plan is a **blueprint**: complete enough that a small model can build from it without re-deciding — every behaviour verifiable, the interface pinned, every touched file mapped, the build ordered as vertical slices. It usually feeds a TDD executor, so write **behaviours to test, not implementation prose**. Write it to `.plan/<work-item-id>-<kebab-title>.md` (omit the `<id>-` prefix when there is no work-item ID), following the exact structure in [`reference/blueprint-template.md`](reference/blueprint-template.md). Create `.plan/` if it is missing. Then echo the full blueprint in the chat.

**Completion criterion:** the file exists under `.plan/`; every acceptance criterion maps to at least one verifiable behaviour; every file the build order implies appears in the files-changed table and passed the closure check; and the full plan is shown in the chat.
