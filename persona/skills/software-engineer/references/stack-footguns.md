# Stack-Specific Footguns Reference

Per-language invariants. Each rule here has shipped a production incident somewhere. Read the relevant section before writing code in a language you haven't touched in this codebase yet.

## Table of Contents

1. [Universal (all languages)](#universal-all-languages)
2. [Python](#python)
3. [TypeScript / JavaScript](#typescript--javascript)
4. [Java](#java)
5. [Go](#go)
6. [Rust](#rust)
7. [Frontend (React / Lit / CSS / HTML)](#frontend-react--lit--css--html)
8. [Accessibility (a11y)](#accessibility-a11y)

---

## Universal (all languages)

These apply regardless of stack:

1. **No swallowed exceptions.** `try { ... } catch (_) {}` / `try: ... except: pass` / `_ = err` without handling is almost always a bug. Either handle the specific class with intent, or let it propagate.
2. **No N+1 queries.** Calling an ORM / DB inside a loop is a hotspot. Bulk-load, join, or dataload.
3. **No shared mutable state across async boundaries.** Anything crossing an `await` / `<-chan` / `.await` / `async` call can be stale or concurrently modified.
4. **No secrets in logs.** Redact at the logging layer. Not at debug level, not "just temporarily." Once in logs, they're in log aggregation forever.
5. **No unbounded retries.** Every retry loop has max attempts *and* max total duration. Infinite retry = infinite load when the upstream's down.
6. **No hardcoded URLs / keys / timeouts.** Config is config.
7. **No off-by-one in batch boundaries.** Pagination, chunking, date ranges — write the test that exercises the exact boundary.

---

## Python

**Must avoid:**

- **Mutable default arguments.** `def f(xs=[])` — the list is shared across calls. Use `def f(xs=None): xs = xs or []`.
- **`except:` without a class.** Catches `SystemExit` and `KeyboardInterrupt`. Always `except Exception:` at minimum; prefer specific classes.
- **`is` for value comparison.** `x is 0` works by accident sometimes, `x is 1000` doesn't. Use `==` for values, `is` only for `None` / singletons / identity.
- **`datetime.now()` without timezone.** Naive datetimes compare incorrectly across DST and timezones. Always `datetime.now(timezone.utc)`.
- **Mixing sync and async.** Calling a blocking function from an `async def` blocks the event loop. Use `asyncio.to_thread` or an async-native client.
- **Relying on dict insertion order before Python 3.7.** In 3.7+ it's guaranteed, before it wasn't. Not a concern on modern Python but watch for migrated code.
- **Using `subprocess` with `shell=True`** for anything involving user input. Command injection risk. Use a list argv and `shell=False`.
- **Forgetting to close file handles / connections.** Use context managers (`with`) — file descriptors leak without them.
- **Deserializing untrusted input with unsafe formats** (e.g., `pickle`, `yaml.load` without `SafeLoader`). Arbitrary code execution. Use JSON or a typed schema.

**Prefer:**

- `pathlib.Path` over string paths
- `dataclasses` / `pydantic` over raw dicts for structured data
- `logging` module with structured extras over `print`
- Type hints on public functions; `mypy --strict` or `pyright` in CI

---

## TypeScript / JavaScript

**Must avoid:**

- **`any` as a surrender.** Each `any` is a hole in the type system. Use `unknown` + narrowing, or define the real type.
- **`==` with type coercion.** `0 == ""` is `true`. Always `===` / `!==` unless you've thought it through and left a comment.
- **Unhandled promise rejections.** Every `async` / `.then` chain has a terminal `.catch` or is awaited inside a try/catch. Unhandled rejections crash Node in newer versions.
- **`forEach` with async callbacks.** `forEach` ignores the returned promise. Use `for...of` with `await` or `Promise.all` for concurrency.
- **Mutating function arguments.** Frequent source of bugs in shared code. Return new values; use `readonly` / `Readonly<T>`.
- **`JSON.parse` on untrusted input without validation.** Parse then validate with Zod / io-ts / similar. Trust nothing.
- **`new Date(str)` without a format.** Parsing is implementation-defined. Use `Date.parse` with ISO 8601, or a library like date-fns.
- **`process.env.X` at module top level.** Loads once at import time; test overrides miss it. Access inside functions.
- **React: deps array lies.** The `useEffect` / `useMemo` deps array must list every referenced value, or you have stale closures. ESLint `react-hooks/exhaustive-deps` is non-negotiable.
- **React: mutating state.** `setState(s => { s.foo = 1; return s; })` — returning the same reference skips the re-render. Return a new object.

**Prefer:**

- `strict: true` in `tsconfig.json` (includes `strictNullChecks`, `noImplicitAny`, etc.)
- `readonly` on types that shouldn't mutate; `as const` for literal narrowing
- Native `fetch` / `URLSearchParams` / `structuredClone` over libraries for simple needs
- Structured logging (pino / winston) over `console.log`

---

## Java

**Must avoid:**

- **Swallowing checked exceptions.** `catch (Exception e) {}` buries real failures. Either handle the specific class with intent, chain it (`throw new X("context", e)`), or let it propagate.
- **`==` for object equality.** `==` compares references, not values. Use `.equals()` — and `Objects.equals(a, b)` when either side can be null.
- **Broken `equals` / `hashCode` contract.** Override both together or neither. Equal objects must have equal hash codes. Otherwise `HashMap` / `HashSet` silently lose entries.
- **Legacy `Date` / `Calendar` / `SimpleDateFormat`.** Mutable, not thread-safe, timezone traps. Use `java.time` (`Instant`, `LocalDate`, `ZonedDateTime`, `DateTimeFormatter`).
- **Unclear nullness.** Annotate with `@Nullable` / `@NonNull` (JSpecify, JetBrains, Checker Framework), or return `Optional` where empty is a legitimate outcome. Don't use `Optional` for fields or parameters.
- **Mutating a collection while iterating it.** Throws `ConcurrentModificationException` (fail-fast) or silently corrupts. Use `Iterator.remove()`, `CopyOnWriteArrayList`, or collect-then-apply.
- **Unclosed resources.** File / socket / statement / connection leaks. Always `try-with-resources` on anything `AutoCloseable`.
- **Executor not shut down.** Leaked threads keep the JVM alive. Call `executor.shutdown()` + `awaitTermination()` in lifecycle end; register a shutdown hook for app-level pools.
- **Swallowed `InterruptedException`.** `catch (InterruptedException e) {}` breaks cancellation. Restore the flag: `Thread.currentThread().interrupt();` then return or rethrow.
- **`String +` in hot loops.** Each concat allocates a new array. Use `StringBuilder` or `String.join`.
- **Autoboxing in hot paths.** `List<Integer>` with arithmetic boxes on every op. Use primitive arrays or `IntStream` for perf-sensitive code.
- **Deserializing untrusted input via `ObjectInputStream`.** Arbitrary code execution. Jackson / Gson with strict typing and allow-lists; never enable default typing on untrusted sources.
- **String-concatenated SQL.** `"SELECT ... WHERE id = " + userId`. Always `PreparedStatement` with `?` parameters, or a query DSL (jOOQ, JPA Criteria).
- **Spring `@Transactional` self-invocation.** `this.foo()` from within the same bean bypasses the proxy — no tx, no aspects. Call via the injected bean or restructure.
- **`LocalDateTime` where instants are meant.** `LocalDateTime` has no zone. Use `Instant` / `ZonedDateTime` at boundaries; convert to `LocalDateTime` only for display.
- **`Stream` short-circuiting mistakes.** `forEach` ignores ordering on parallel streams; `peek` isn't guaranteed to run for elements unused downstream. Use `forEachOrdered` when order matters; don't rely on `peek` for side effects.

**Prefer:**

- `java.time` for all time handling
- `Objects.requireNonNull` at public boundaries
- Immutable collections (`List.of`, `Map.copyOf`) over defensive copies
- `record` for value objects (Java 16+); sealed types for closed hierarchies
- `var` for obvious local types; full types on fields and public signatures
- Structured logging via SLF4J with MDC; never `System.out.println`
- Nullness annotations + Error Prone / SpotBugs / Checker Framework in CI
- `CompletableFuture` / virtual threads (Java 21+) over raw `Thread` for concurrency

---

## Go

**Must avoid:**

- **Ignored errors.** `x, _ := f()` loses the error. Handle it or explain in a comment why ignoring is safe.
- **Nil pointer dereference on maps.** `var m map[string]int; m["x"] = 1` panics. `m = make(map[string]int)` first.
- **Goroutine leaks.** Every goroutine has a clear termination path. `go f()` without a way for `f` to return on context cancellation is a leak.
- **Shared mutable state without a mutex or channel.** The race detector (`go test -race`) catches many of these; run it in CI.
- **Context not plumbed through.** Every I/O function takes `context.Context` as the first argument and honors cancellation.
- **Zero-value timers / tickers not stopped.** `time.After` in a select inside a loop leaks memory. Use `time.NewTimer` and `Stop()`.
- **Defer in a loop.** `defer` runs at function return, not loop iteration. For per-iteration cleanup, use a closure or explicit call.
- **String concatenation in a hot loop.** Each `+` allocates. Use `strings.Builder`.
- **Returning a pointer to a local variable of an interface type when you meant to implement the interface on the value type.** Easy to mix up pointer vs value receivers; be deliberate.

**Prefer:**

- `errors.Is` / `errors.As` for error checking, not string matching
- `context.Context` as the first parameter on every I/O function
- Small interfaces defined at the consumer, not the producer
- `go vet`, `staticcheck`, and `-race` in CI

---

## Rust

**Must avoid:**

- **`unwrap()` / `expect()` in production code paths.** Panics on `None` / `Err`. Either handle the case or propagate with `?`. `expect` is acceptable with a message that's provably impossible given invariants.
- **Blocking in an async context.** `std::fs::read` inside a Tokio task blocks the worker. Use `tokio::fs` or `spawn_blocking`.
- **`Arc<Mutex<T>>` as a default.** Often there's a channel- or actor-based design that avoids shared mutable state entirely. Reach for `Arc<Mutex<T>>` only after considering alternatives.
- **Holding a `MutexGuard` across `.await`.** Deadlock risk, and `MutexGuard` isn't `Send` in some runtimes. Drop the guard before awaiting.
- **`clone()` to silence the borrow checker.** Often signals a design issue. Sometimes it's the right answer; sometimes it's hiding one.
- **`unsafe` without a safety comment.** Every `unsafe` block has a `// SAFETY: ...` comment explaining the invariants being upheld.
- **Integer overflow in release mode.** In release, overflow wraps silently (in debug it panics). Use `checked_` / `saturating_` / `wrapping_` variants deliberately.
- **`Box<dyn Error>` as the only error type on a library.** OK for applications, too opaque for a library — callers can't match on specific errors.

**Prefer:**

- `thiserror` for library errors, `anyhow` for application errors
- `?` and early returns over nested `match`
- `Result<T, E>` over exceptions; `Option<T>` over sentinel values
- `cargo clippy -- -D warnings` in CI
- Tests via `cargo test`, property tests via `proptest` for invariants

---

## Frontend (React / Lit / CSS / HTML)

### React

- **`useEffect` for side effects only.** Not for derived state (use a variable / memo). Not for synchronizing props to state (pass props directly). Each spurious effect is a re-render and a chance to desync.
- **Stale closures in effects.** If you read a state / prop inside an effect and it's not in the deps array, you're reading the stale version. ESLint `react-hooks/exhaustive-deps` catches this — don't disable it without a written reason.
- **Infinite render loops.** Setting state in render, or in an effect whose deps include the state it sets, loops forever. If you see one, the logic is wrong — don't silence with a ref hack.
- **Lists without stable `key`.** `key={index}` reorders break. Use a stable ID from your data.
- **`useState` with objects you mutate.** Mutation doesn't trigger re-render. Return new objects: `setState(s => ({ ...s, x: 1 }))`.
- **Context for everything.** Context re-renders every consumer on change. Split by concern; memoize the value; or use a state library for high-churn state.
- **Event handlers inline in JSX for memoized children.** New function identity each render breaks memoization. Use `useCallback` or lift the handler out.
- **Setting state in a `useMemo`.** Don't. Memos are for computation; effects are for side effects.
- **Suspense without a boundary.** A component that suspends without an ancestor `<Suspense>` throws. Put boundaries at route-level at minimum.

### Lit

- **Mutating an array / object property doesn't re-render.** Lit detects reactive-property changes by reference. `this.items.push(x)` is a no-op. Reassign: `this.items = [...this.items, x]`, or call `this.requestUpdate()` explicitly.
- **`@property` vs `@state` mix-up.** `@property` is a public attribute/prop with HTML-attribute reflection; `@state` is internal. Using `@property` for internal state leaks it into the component's API surface. Using `@state` for a public value means consumers can't set it from markup.
- **`requestUpdate()` inside `updated()` without a guard.** Re-renders forever. Compute derived values in `willUpdate(changedProperties)` instead, or guard with a diff check.
- **Shadow-DOM event retargeting surprises.** Events fired inside shadow DOM don't cross the boundary unless `composed: true`. A listener on a host parent won't fire for internal buttons unless the event is composed.
- **Global stylesheets don't pierce shadow DOM.** Don't expect `app.css` to reach a custom element's internals. Expose customization via CSS custom properties, `::part`, or accept slotted content.
- **Missing `<slot>` in the template.** Children projected into a custom element must have a `<slot>` placeholder inside `render()`. Without it, children silently don't render.
- **Manual listeners on `window` / `document` without cleanup.** `addEventListener` in `connectedCallback` without a matching `removeEventListener` in `disconnectedCallback` leaks across element removal. Use an `AbortController` signal, or mirror the pair.
- **`unsafeHTML` / `unsafeSVG` on user input.** Defeats Lit's safe-by-default `html` template. Sanitize or avoid.
- **Decorator config drift.** TS decorators need either `experimentalDecorators: true` (legacy) or TC39 standard decorators — pick one, match Lit's version, align with Vite / tsc config. Mixed modes produce confusing "decorator is not a function" errors at runtime.
- **SSR hydration mismatch.** Lit SSR + hydration requires deterministic render output. Non-deterministic values (`Date.now`, `Math.random`, user locale) during render cause hydration breakage.
- **New directive instances per render.** Directives like `repeat`, `guard`, `cache`, `ref` cache by identity — constructing a new one each render defeats them. Instantiate once at module scope.
- **Light-DOM opt-out without intent.** `createRenderRoot() { return this; }` opts out of shadow DOM — outside styles now reach in, but encapsulation is gone. Choose deliberately, not accidentally.

### CSS

- **`!important` as a shortcut.** Usually means a specificity problem or a scoping problem — fix the root cause, don't bulldoze.
- **Animating layout properties** (`width`, `height`, `top`, `left`, `margin`). Triggers layout every frame. Animate `transform` / `opacity` instead; they composite.
- **`position: fixed` inside a transformed ancestor.** `transform` creates a new containing block; `fixed` anchors to it, not the viewport. Surprising.
- **`z-index` without a stacking context plan.** A z-index war is an architecture smell. Document the z-layers (modal, tooltip, toast) and stick to them.
- **100vh on mobile.** Viewport height shifts when the address bar hides/shows. Use `100dvh` for modern browsers or a JS-computed fallback.
- **Fighting the cascade with deep selectors** (`.foo .bar .baz .qux`). Flatten the component tree or scope with CSS Modules / vanilla-extract.

### HTML

- **`<div onClick>` for a button.** No keyboard, no screen reader. Use `<button>`. If you can't use `<button>`, add `role="button" tabIndex={0}` and handle Enter + Space — but you can almost always just use `<button>`.
- **`<a>` without `href`.** Not a link; not focusable; no browser affordances. Use `<button>` for actions.
- **`<img>` without `alt`.** `alt=""` for decorative, descriptive alt for content. Omitting `alt` makes screen readers announce the filename.
- **Form without `<label>`.** Placeholder is not a label — it disappears on focus and is low-contrast.
- **Nested interactive elements.** `<button>` inside `<a>`, or `<a>` inside `<button>`. Invalid HTML, unpredictable behavior.
- **`scrollIntoView()` in iframe-embedded previews** disrupts outer-frame scrolling. Use `element.scrollTop = ...` or `window.scrollTo({...})`.

---

## Accessibility (a11y)

- **Removing focus outline without replacement.** `outline: none` with nothing visible instead is an accessibility failure. Replace with a ring, box-shadow, or equivalent.
- **Placeholder as label.** Disappears on focus, low contrast, not read by assistive tech. Use a real `<label>`.
- **Color as the only signal.** Red-for-error and green-for-success fail color-blind users. Pair color with icon + text.
- **Contrast below WCAG AA.** 4.5:1 for body, 3:1 for large text and UI elements. Low-contrast text is a common accidental ship.
- **Auto-playing media with sound.** Universally hated; often blocked by browsers. If autoplay, always muted.
- **Missing `aria-label` on icon-only buttons.** Screen readers announce "button" with no name. Add `aria-label` or visually-hidden text.
- **Positive `tabindex`** (`tabindex="3"`). Breaks natural tab order. Use `0` (in order) or `-1` (programmatically focusable only).
- **Modal without focus trap.** Tab escapes the modal; users lose their place. Use a focus-trap library or a well-tested primitive (Radix, React Aria).
- **No `prefers-reduced-motion` handling** for non-essential animation. Vestibular disorders make motion painful — respect the setting.

---

## Framework-Specific

### TanStack Start

- **Isomorphic by default** — any file without a `.server.` / `.client.` suffix ships to **both** bundles. Treating every file as universal is the source of most leaks.
- **DB client (Drizzle / pg / postgres / better-sqlite3) outside a `.server.ts` file** — will end up in the client bundle through any transitive import from a route / component.
- **`process.env.X` at module top level** of a shared file — value gets inlined into the client bundle at build time.
- **Loader reads a secret directly** — loaders run on both server and client; move secret-bearing logic into a `createServerFn` handler that the loader calls.
- **`createServerFn` without `.inputValidator()`** — handler receives raw network data; always validate.
- **Dynamic `import()` of server modules** from client-reachable code — bundler can't rewrite reliably.

Full guide: [tanstack-start.md](tanstack-start.md). Read before touching anything that imports a database, filesystem, or secret in a TanStack Start project.

### Next.js (App Router)

- **Server Component imports a Client Component is fine; the reverse poisons the boundary.** A Client Component that imports a server-only module pulls it into the client bundle.
- **No `'use client'` / `'use server'` marker** — easy to forget which side a file is on. Default is Server Component in App Router; add `'use client'` at the top for client, `'use server'` for Server Actions.
- **Secrets without the `server-only` package** — `import 'server-only'` at the top of data-access modules fails the build if a Client Component reaches them. Use it on every DAL file.
- **`NEXT_PUBLIC_` prefix on a secret** — anything prefixed `NEXT_PUBLIC_` is inlined into the client bundle. Never use for API keys, DB URLs, tokens.
- **Server Action without authn/authz in the handler** — actions are public HTTP POST endpoints regardless of where the form renders. Re-check the session and resource ownership in every action body.
- **Returning raw DB rows from a Server Component or Action** — leaks columns (hashed passwords, internal flags). Return DTOs shaped to the view.
- **Mutations inside render** — Server Components must be pure; mutate only inside Server Actions or route handlers.
- **Stale cache after a mutation** — call `revalidatePath` / `revalidateTag` from the action, or the UI will show old data.
- **Reading cookies / headers in a cached fetch** — forces dynamic rendering anyway, and can leak per-request data into a shared cache if misconfigured.

Full guide: [nextjs.md](nextjs.md). Read before touching Server Components, Server Actions, or anything under `app/` that crosses the server/client boundary.
