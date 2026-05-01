---
name: codemap
description: Build and maintain a persistent structural index of a Java, Go, Python, or Rust codebase under .codemap/ (graph.json + MAP.md), so other skills explore via the map instead of grep + read loops. Tree-sitter based; supports polyglot repos. Use when starting work in an unfamiliar non-TS/JS repo, when the user asks to build/refresh/update the codemap, after large refactors, or before any exploration phase that would otherwise scan source files. For TypeScript/JavaScript repos, use the sibling `ts-codemap` skill — it has higher fidelity (path aliases, re-export flattening, JSX).
disable-model-invocation: true
---

# codemap

A persistent, file-based map of a codebase. The build script walks the target repo with tree-sitter, writes a graph of symbols and edges to `.codemap/graph.json`, and a human-readable summary to `.codemap/MAP.md`. Other skills read these instead of running Glob/Grep/Read loops over raw source.

For TypeScript/JavaScript, use the sibling `ts-codemap` skill (ts-morph based, higher fidelity). Both write the same `.codemap/graph.json` schema, so consumer skills don't care which one ran.

## Quick start

```sh
# Full build (run from repo root, or pass a target path)
/ken-swe:codemap build

# Incremental update (only re-parses files whose SHA256 changed)
/ken-swe:codemap update
```

Both commands execute the bundled scripts via `npx tsx`. They install dependencies inside the skill folder on first run; the target repo gets `.codemap/` (committed) and `.codemap/cache/` (gitignored).

## Supported languages

| Language | Extensions | Symbols | Edges |
|---|---|---|---|
| Java | `.java` | classes, interfaces, methods | imports, calls, extends, implements |
| Go | `.go` | funcs, methods, structs, interfaces | imports, calls |
| Python | `.py` | functions, classes, methods | imports, calls, extends (base classes) |
| Rust | `.rs` | fns, structs, enums, traits | imports (`use`), calls, implements (`impl Trait for T`) |

Polyglot repos (e.g. a Go backend with a Python ML pipeline) are supported — both languages get indexed in the same `graph.json`.

## When to invoke

- **Foundation phase** for any non-trivial work in a Java/Go/Python/Rust repo. Build once, then other skills query the map.
- After significant refactors (large file moves, framework upgrade, big API renames).
- When `.codemap/MAP.md` is missing or older than the latest commit on the relevant module.

## Workflow

### 1. Detect target repo

- Default: current working directory.
- Optional first argument: explicit path to a target repo.
- Refuse to run if no `.java`/`.go`/`.py`/`.rs` files are found — direct the user to `/ken-swe:ts-codemap` if the repo looks TS/JS.

### 2. Resolve action

| Argument | Action |
|---|---|
| `build` (or no arg, no existing `.codemap/`) | Full build |
| `update` (or no arg, `.codemap/` exists) | Incremental update via SHA256 cache |

### 3. Run the script

The skill scripts:

1. Walk the target repo, collecting `.java`/`.go`/`.py`/`.rs` files (ignoring vendored/build dirs).
2. Initialize tree-sitter and load the WASM grammar for each detected language.
3. For each file: parse, run the language's extraction queries, emit nodes + edges.
4. Write `.codemap/graph.json`, `.codemap/MAP.md`, and update `.codemap/cache/<sha>.json` per file.
5. On first run, append `.codemap/cache/` to the target repo's `.gitignore`.

### 4. Report

Print a one-screen summary:

- File count, symbol count, edge count.
- Languages detected and per-language counts.
- Top-level modules (dirs with > N symbols).
- Wall-clock time and cache hit rate (update mode).

## Output format

Identical to `ts-codemap` — same `graph.json` schema, same `MAP.md` sections. Consumer skills read from `.codemap/` regardless of which producer ran.

```json
{
  "meta": {
    "generated_at": "<iso8601>",
    "version": "1",
    "stats": { "files": 0, "nodes": 0, "edges": 0 },
    "languages": { "python": 12, "go": 5 }
  },
  "nodes": [
    {
      "id": "<rel-path>#<symbol>",
      "type": "file|class|function|const|module",
      "file": "<rel-path>",
      "name": "<symbol>",
      "line_start": 0,
      "line_end": 0,
      "exported": true,
      "lang": "python|go|java|rust"
    }
  ],
  "edges": [
    { "source": "<id>", "target": "<id>", "type": "imports|calls|extends|implements|exports" }
  ]
}
```

Stable IDs: `<rel-path>#<symbol>` for symbols, `<rel-path>` for files. For class methods, `<rel-path>#<ClassName>.<methodName>`.

## Consumer contract

Other skills read `.codemap/` first. Each consumer skill has a short note describing how it queries the map. Keep the format stable — breaking changes to `graph.json` need a version bump in `meta.version`.

## v1 scope

**Included**

- Java, Go, Python, Rust
- Top-level functions/methods, classes/structs/enums/interfaces/traits
- Imports (lexical: target is the module path string, not a resolved file)
- Calls (lexical: target is the called identifier name)
- Inheritance edges where the language has the concept (Java `extends`/`implements`, Python base classes, Rust `impl Trait for T`)
- SHA256-keyed incremental cache
- Polyglot indexing (multiple languages in one `graph.json`)

**Out of scope** (intentionally, for v1)

- TS/JS (use `ts-codemap`)
- Other languages (C, C++, Ruby, Kotlin, Swift, etc.)
- Cross-file symbol resolution (imports stay as lexical strings)
- Generics / type parameters
- Macros (Rust) / annotations (Java) / decorators (Python) — captured by name only
- Vector search / embeddings
- Watch mode

## Failure modes

- **No source files** — refuse with a clear error suggesting `/ken-swe:ts-codemap` for TS/JS repos.
- **WASM grammar load failure** — log and skip that language's files; continue with others.
- **File parse error** — skip the file, log a warning, continue.
- **`graph.json` larger than 5 MB** — emit a warning suggesting the user trim ignored dirs (e.g. `target/`, `vendor/`, `__pycache__/`).

## Relationship to other skills

| Phase | Skill | Uses codemap for |
|---|---|---|
| Implementation | `feature-dev` | Stage 2 codebase exploration: read `MAP.md` first, then targeted `graph.json` lookups |
| Debugging | `bug-fix` | Stage 2 root cause: trace caller/callee edges instead of grepping for usages |
| Quality | `code-review` | Blast-radius assessment: transitive callers of changed symbols |
| Planning | `prd-to-plan` | Module boundaries when defining tracer-bullet slices |
