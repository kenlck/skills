---
name: grill-me-standards
description: Interview the user to extract coding standards and project context, grounded in what the codebase already does. Use when user wants to generate a CLAUDE.md, CODING_STANDARDS.md, or otherwise capture conventions from an existing codebase.
disable-model-invocation: true
---

Interview the user to produce a coding-standards document grounded in the current codebase. For each question, first explore the code to find the existing pattern, propose that pattern as the recommended answer, and only ask the user to confirm or override.

Ask questions one at a time, waiting for feedback before continuing. Skip any section where the codebase has no signal — do not invent standards the code does not support.

## Output target

Default to appending to `CLAUDE.md` at the repo root so Claude picks it up automatically. If the user prefers a separate doc, use `CODING_STANDARDS.md`. Confirm the target at session start.

Write inline as decisions are made. Do not batch — capture each standard the moment the user confirms it.

## Workflow

1. **Confirm target file** — `CLAUDE.md` (default) or `CODING_STANDARDS.md`.
2. **Warm-up** — ask: "Before we dive in, anything you specifically want to make sure we capture?" Note any topics raised; cover them with extra care when the checklist reaches them, or in the open discussion round if off-checklist.
3. **Scan the codebase** — get a feel for languages, frameworks, test setup, file layout. Note signals you will use to pre-fill answers.
4. **Walk the checklist below** — for each topic with codebase signal:
   - State what you observed (with file paths as evidence).
   - Propose the standard.
   - Ask the user to confirm, refine, or override.
   - Write the confirmed standard to the target file before moving on.
5. **Open discussion round** — once the checklist is done, ask: "Anything else you want captured — team conventions, gotchas, things you keep correcting in PRs?" Keep grilling on whatever they raise until exhausted.
6. **Final review** — show the resulting document and ask for last edits.

## Checklist

Skip any item where the codebase gives no signal. Domain glossary and ADRs are out of scope — those belong to the `grill-with-docs` skill.

- **Project overview** — one to three lines: what this repo is, the key top-level directories
- **Common commands** — dev server, test, lint, typecheck, build, format
- **Languages & runtimes** — versions, package manager, lockfile policy
- **File & directory layout** — where new modules go, colocation rules
- **Naming** — files, components, functions, variables, constants, test files
- **Imports** — ordering, aliases, relative vs absolute, barrel files
- **Types** — strictness, `any` policy, inference vs explicit annotations
- **Error handling** — throw vs result types, where errors are caught, logging
- **Async patterns** — promises vs async/await, cancellation, concurrency limits
- **Data layer** — schema/models location, query patterns, migration workflow
- **API conventions** — request/response shape, validation at boundaries, route layout
- **State management** — for frontend: store choice, where state lives
- **Styling** — for frontend: CSS approach, design tokens, component library
- **Accessibility** — for frontend: semantic HTML, keyboard nav, ARIA expectations
- **Performance** — caching, memoization, query batching, bundle/perf budgets
- **Security & secrets** — secrets handling, input validation, auth patterns, what never gets logged
- **Configuration & environment** — `.env` layout, env var naming, config loading
- **Testing** — framework, file location, naming, what's required vs optional
- **Comments & docs** — when to comment, JSDoc/docstring policy
- **Logging & observability** — logger, levels, structured fields
- **Dependencies** — adding a new dep, version pinning, audit policy
- **Refactor & cleanup policy** — when to refactor, rules on touching adjacent code, dead-code policy
- **Forbidden / restricted areas** — paths that need explicit approval before editing (e.g. `infra/`, `.github/workflows/`, generated files)
- **Git & PR** — branch naming, commit style, PR size, review expectations
- **Build & CI** — required checks, formatter, linter

## Grilling rules

- **Evidence-first** — every proposed standard cites at least one file. "I see `src/auth/login.ts:12` uses `Result<T, E>` for error returns — should that be the convention?"
- **Surface contradictions** — if the code is inconsistent, name it: "Half the components use `.tsx` colocated tests, half use `__tests__/`. Which is the standard going forward?"
- **One question at a time** — wait for the answer before moving on.
- **Recommend, don't just ask** — always provide your recommended answer based on what the code does or what's idiomatic.
- **Don't invent** — if there's no signal and no preference from the user, skip rather than guess.

## Writing format

Use short, declarative rules grouped by section. Prefer:

```md
## Naming
- Files: kebab-case (`user-profile.ts`)
- React components: PascalCase, one component per file
- Test files: colocated as `*.test.ts`
```

Over prose. Each rule should be enforceable — a reviewer should be able to point at it and say "this violates rule X".
