---
name: ts-codemap
description: Build and maintain a persistent structural index of a TypeScript/JavaScript codebase under .codemap/ (graph.json + MAP.md), so other skills explore via the map instead of grep + read loops. Uses ts-morph for high-fidelity TS/JS parsing (tsconfig path aliases, re-export flattening, JSX). Use when the user asks to build, refresh, or update the codemap on a TS/JS repo, when starting work in an unfamiliar TS/JS repo, or before any exploration phase that would otherwise scan source files. For Java/Go/Python/Rust repos, use the language-agnostic `codemap` skill instead.
disable-model-invocation: true
---

# ts-codemap

A persistent, file-based map of a TypeScript/JavaScript codebase. The build script walks the target repo with the TypeScript compiler API (via `ts-morph`), writes a graph of symbols and edges to `.codemap/graph.json`, and a human-readable summary to `.codemap/MAP.md`. Other skills read these instead of running Glob/Grep/Read loops over raw source.

For Java/Go/Python/Rust, use the sibling `codemap` skill (tree-sitter based) — it writes the same `.codemap/graph.json` schema, so consumer skills don't care which one ran.

## Quick start

```sh
# Full build (run from repo root, or pass a target path)
/ken-swe:ts-codemap build

# Incremental update (only re-parses files whose SHA256 changed)
/ken-swe:ts-codemap update
```

Both commands execute the bundled scripts via `npx tsx`. They install dependencies inside the skill folder on first run; the target repo gets `.codemap/` (committed) and `.codemap/cache/` (gitignored).

## When to invoke

- **Foundation phase** for any non-trivial work in a TS/JS repo. Build once, then other skills query the map.
- After significant refactors (large file moves, framework upgrade, big API renames).
- When `.codemap/MAP.md` is missing or older than the latest commit on the relevant module.

## Workflow

### 1. Detect target repo

- Default: current working directory (must be a git repo with `package.json`).
- Optional first argument: explicit path to a target repo.
- Refuse to run if no `package.json` is found — the skill is TS/JS only for v1.

### 2. Resolve action

| Argument | Action |
|---|---|
| `build` (or no arg, no existing `.codemap/`) | Full build |
| `update` (or no arg, `.codemap/` exists) | Incremental update via SHA256 cache |
| `--with-summaries` | After build/update, run an LLM prose pass over each module section in MAP.md (cached) |

### 3. Run the script

```sh
cd <skill-dir> && npm install --silent --no-audit --no-fund   # only if node_modules missing
cd <target-repo> && npx --prefix <skill-dir> tsx <skill-dir>/scripts/build.ts .
```

The skill scripts:

1. Load `tsconfig.json` if present (for path-alias resolution).
2. Walk `src/`, `app/`, `pages/`, `lib/`, `components/` — and any other top-level dirs that contain `.ts`/`.tsx`/`.js`/`.jsx`.
3. For each file: extract functions, classes, exported consts, imports, calls, `extends`, `implements`, JSDoc.
4. Resolve re-exports (`export * from './foo'`) so symbol IDs are stable.
5. Detect Next.js routes (any `app/**/page.tsx`, `app/**/route.ts`, `pages/**/*.tsx`).
6. Write `.codemap/graph.json`, `.codemap/MAP.md`, and update `.codemap/cache/<sha>.json` per file.
7. On first run, append `.codemap/cache/` to the target repo's `.gitignore`.

### 4. Report

Print a one-screen summary:

- File count, symbol count, edge count.
- Modules detected (top-level dirs with > N symbols).
- Routes detected (if Next.js).
- Wall-clock time and cache hit rate (update mode).

## Output format

### `.codemap/graph.json`

```json
{
  "meta": {
    "generated_at": "<iso8601>",
    "version": "1",
    "stats": { "files": 0, "nodes": 0, "edges": 0 }
  },
  "nodes": [
    {
      "id": "<stable-id>",
      "type": "file|module|class|function|const|route|schema",
      "file": "<rel-path>",
      "name": "<symbol>",
      "line_start": 0,
      "line_end": 0,
      "exported": true
    }
  ],
  "edges": [
    { "source": "<id>", "target": "<id>", "type": "imports|calls|extends|implements|tested_by|exports" }
  ]
}
```

Stable IDs: `<rel-path>#<symbol>` for symbols, `<rel-path>` for files.

### `.codemap/MAP.md`

Sections, in order:

1. **Repo summary** — file count, languages, framework detection, top-level structure.
2. **Modules** — one section per top-level dir or detected feature: purpose, public exports, key entities, dependencies on other modules.
3. **Cross-cutting indices** — Next.js routes table, schema definitions, env vars referenced.
4. **TOC** at the very top.

Target size: 5–15k tokens. Truncate long export lists with a `... +N more` marker; full detail lives in `graph.json`.

## Consumer contract

Other skills read `.codemap/` first. Each consumer skill's SKILL.md has a short "Codemap" section describing how it queries the map. Keep the format stable — breaking changes to `graph.json` need a version bump in `meta.version`.

## v1 scope

**Included**

- TS, TSX, JS, JSX
- Functions, classes, exported consts, imports, calls, `extends`, `implements`
- Next.js `app/` and `pages/` route detection
- `tsconfig.json` path alias resolution
- Re-export flattening
- SHA256-keyed incremental cache
- `build.ts` and `update.ts` scripts
- Optional `--with-summaries` LLM pass

**Out of scope** (use sibling `codemap` skill for these)

- Java, Go, Python, Rust (tree-sitter based)
- Vector search / embeddings
- Community detection / clustering / god-node analysis
- Query CLI scripts (Claude reads `graph.json` directly)
- Watch mode

## Failure modes

- **No `package.json`** — refuse, report "ts-codemap is TS/JS only — use /ken-swe:codemap for other languages".
- **`tsconfig.json` parse error** — fall back to default settings, log a warning.
- **File parse error** — skip the file, log a warning, continue.
- **`graph.json` larger than 5 MB** — emit a warning suggesting the user trim ignored dirs (e.g. `dist/`, `.next/`).

## Relationship to other skills

| Phase | Skill | Uses codemap for |
|---|---|---|
| Implementation | `feature-dev` | Stage 2 codebase exploration: read `MAP.md` first, then targeted `graph.json` lookups |
| Debugging | `bug-fix` | Stage 2 root cause: trace caller/callee edges instead of grepping for usages |
| Quality | `code-review` | Blast-radius assessment: transitive callers of changed symbols |
| Planning | `prd-to-plan` | Module boundaries when defining tracer-bullet slices |
