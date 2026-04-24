# Frontend Craft Reference

Detailed guidance for building product UI inside an existing codebase. The target is a component that looks and feels like the rest of the app and behaves correctly in every state. Not a showcase piece — coherence is the goal.

## Table of Contents

1. [Context Extraction](#context-extraction)
2. [Design Token Discipline](#design-token-discipline)
3. [Component Patterns](#component-patterns)
4. [State Matrix](#state-matrix)
5. [Forms](#forms)
6. [Data Fetching](#data-fetching)
7. [Accessibility](#accessibility)
8. [Motion](#motion)
9. [Responsive & Density](#responsive--density)
10. [Dark Mode](#dark-mode)
11. [Styling Approach](#styling-approach)
12. [When to Build Custom](#when-to-build-custom)
13. [Lit (custom elements)](#lit-custom-elements)

---

## Context Extraction

Before writing the first line of JSX / HTML, audit the existing product. Think out loud so the user can validate your reading:

- **Design tokens**: Open `tailwind.config.ts` / `theme.ts` / CSS variables / design-system package. What's the color palette? Type scale? Spacing scale? Radius set? Shadow levels? Breakpoints?
- **Component inventory**: What primitives exist (Button, Input, Select, Modal, Table, Toast, Tabs, Tooltip, Popover, Card)? What variants does each expose? What composition pattern (slots / children / render props)?
- **Page template**: Pick 2–3 similar pages. How do they structure the layout (header / sidebar / main / actions)? What's the container max-width? Gutter size?
- **Interaction conventions**: Hover / focus / active — color shift, shadow, scale, translate? Click feedback? Loading affordance (skeleton / spinner / bar)?
- **Iconography**: Which icon library (Lucide, Heroicons, Phosphor, custom)? Default size? Stroke weight?
- **Empty / error illustrations**: Does the product use any? Text-only, custom SVG, stock?
- **Copy tone**: Terse / friendly / technical / playful? Sentence case vs Title Case for buttons?
- **Animations**: Any? If yes, what's the easing convention and duration baseline?

Don't recreate what exists. Don't diverge from what's established. If a primitive is missing a variant you need, **extend the existing primitive** with a new variant — don't fork it.

---

## Design Token Discipline

**Never hardcode.** Every color, spacing unit, font size, radius, and shadow comes from the token system.

**Find the source of truth first:**

- Tailwind project → `tailwind.config.ts` / `tailwind.config.js` under `theme.extend`
- CSS variables → usually in a global stylesheet or `:root` block
- Theme object → search for `createTheme` / `ThemeProvider` / `theme.ts`
- Design system package → `@org/design-tokens` or similar
- CSS Modules / vanilla-extract → token file conventions per project

**If you genuinely need a new token** (genuine product need, not because you didn't look): add it to the source of truth, don't hardcode. Then use it. One more token is cheap; hardcoded hex across the app is expensive.

**Derived colors**: If you need a slightly lighter / darker variant of a brand color, derive it via `color-mix()`, `oklch()`, or the design system's tint / shade utilities. Don't eyeball a new hex.

---

## Component Patterns

### Composition over props explosion

A component with 23 boolean props is harder to use than one that accepts children + slots.

```jsx
// ❌ prop explosion
<Card title="Hello" titleIcon={<Icon/>} showBadge badge="New" footer="..." />

// ✅ composition
<Card>
  <Card.Header icon={<Icon/>}>Hello <Badge>New</Badge></Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

Use the pattern already in the codebase. If there isn't one, pick one and stick to it.

### Controlled vs uncontrolled

- Controlled (state lives in parent): use when the parent needs to read / validate / react to the value, or when the value syncs to URL / server.
- Uncontrolled (state lives in the component): use for transient UI state the parent doesn't care about.

If both modes are needed, implement controlled and let the parent pass an initial value.

### Prefer data-driven rendering

A table with five columns is five `<td>` tags. A table with N columns is a `columns` array that maps to `<td>`. Choose deliberately; don't reflexively abstract the five-column case.

---

## State Matrix

Every interactive surface handles these states. The happy path is the easy part; the rest is where bugs live.

| State | Indicator | Example |
|---|---|---|
| **Default** | The normal thing | Card showing data |
| **Loading (initial)** | Skeleton matching final layout; never spinner on a blank screen | Skeleton rows in a table |
| **Loading (refetch)** | Subtle indicator; existing data stays visible | Muted top bar, existing rows dim |
| **Empty** | Actionable message explaining next step | "No results. Try adjusting filters." |
| **Error** | Recovery path (retry / contact) with clear cause | "Couldn't load — [Retry]" |
| **Partial / stale** | Optimistic update showing; reconciliation expected | Dimmed row, inline spinner |
| **Disabled** | Visually distinct + `disabled` attr + `aria-disabled` | Greyed button, no hover effect |
| **Hover / focus / active** | Clear affordance; focus visible always | Ring, color shift |

Never ship a component that renders a blank box or indefinite spinner in any of these states.

---

## Forms

Forms are where most UX bugs live. Checklist:

- **Client validation** with helpful messages, not generic "Invalid". Tell the user what's wrong and how to fix.
- **Server validation** that mirrors client rules. Client validation is UX; server validation is correctness. Don't skip either.
- **Disable submit while in-flight**, show progress. Re-enable on response. Never double-submit.
- **Success feedback** — where does the user go on success? Toast + redirect, inline confirmation, or modal close? Decide deliberately.
- **Error feedback** — show the error next to the offending field, not just at the top. Scroll the first error into view (using `scrollTo`, not `scrollIntoView`).
- **Focus** — first field focused on mount (unless a modal with a primary action), first-error focused on submit failure.
- **Keyboard submit** — Enter submits the form. Escape cancels if in a modal.
- **Draft preservation** — if the form is long and the user might navigate away, save to localStorage or warn with `beforeunload`.
- **Label associations** — `<label htmlFor>` or wrap. Placeholder is not a label.
- **Required markers** — explicit, not just asterisk color.
- **Autocomplete hints** — `autocomplete="email"` etc. Essential for password managers and mobile keyboards.
- **Mobile keyboard** — `type="email"` / `inputMode="numeric"` / `enterKeyHint` steer the right keyboard.

Prefer a library if the project uses one (react-hook-form, Formik, Conform). Fighting a form library is rarely a better use of time than learning it.

---

## Data Fetching

Pick one pattern, apply it consistently. Don't mix.

**Server-rendered / loader pattern** (Next.js, Remix, TanStack Start):
- Loaders run before render; no loading state on initial navigation
- Errors handled via error boundary; not-found via not-found boundary
- Cache invalidation via framework primitive (revalidate / action response)
- Streaming for slow loaders so the shell renders instantly

**Client-side with query library** (React Query, SWR):
- `useQuery` for reads, `useMutation` for writes
- Invalidate affected queries on mutation success
- Optimistic updates with rollback on failure
- Stale-while-revalidate by default; configure per-query as needed

**Don't:** mix fetch-in-useEffect with a query library. Don't cache server state in useState. Don't refetch on every render.

---

## Accessibility

Accessibility is not a polish pass — it's correctness. A feature that doesn't work with a keyboard is a broken feature.

**Non-negotiables:**

- **Semantic HTML first.** `<button>` for actions, `<a href>` for navigation, `<form>` for forms. `<div onClick>` is almost always wrong (no keyboard, no screen reader, no focus).
- **Every input has a label** associated via `htmlFor`/`id` or wrap, or `aria-label` for icon-only inputs.
- **Icon-only buttons have accessible names** — `aria-label` or visually hidden text.
- **Keyboard** — Tab order logical, Escape closes overlays, Enter submits forms, arrow keys navigate menus / tabs / listboxes. Focus trapped in modals.
- **Focus visible** — don't remove the focus ring without replacing it with something equally clear.
- **Color contrast** WCAG AA: 4.5:1 for body text, 3:1 for large text (18pt+ or 14pt+ bold) and UI elements. Test with a contrast checker when introducing new color pairings.
- **Color + text** — error states use icon + message, not just red. Required fields aren't marked only by asterisk color.
- **Landmarks** — `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` help screen reader users navigate.
- **ARIA sparingly and correctly.** First rule of ARIA: don't use ARIA. Prefer semantic HTML. When you must, use established patterns (`aria-expanded`, `aria-selected`, `aria-live`) correctly — broken ARIA is worse than none.
- **Motion respect** — honor `prefers-reduced-motion`; disable non-essential motion for users who opt out.
- **Zoom & reflow** — the page must remain usable at 200% zoom. No horizontal scroll, no clipped content.

**Test quickly:**
- Tab through the page — can you reach and activate everything without a mouse?
- Open DevTools → Accessibility tree — do elements have sensible roles and names?
- Axe / Lighthouse a11y audit — fix high-severity issues before ship.

---

## Motion

Motion is seasoning. Too much is worse than none.

**When to animate:**

- **Orientation** — a panel sliding in from the right is more understandable than one that pops
- **Feedback** — a button that responds to press feels more direct
- **Continuity** — an item animating to its new position is easier to follow than one that teleports

**When not to animate:**

- **Every single state change.** Most UI changes should be instant.
- **Layout on input** (causing content to jump while typing)
- **Decorative bounce / wiggle** on load

**Timing:**

- 150–200ms for micro-interactions (button press, hover)
- 250–350ms for transitions (panel open, page change)
- Longer is rarely better. If it feels slow, it is.

**Easing:**

- Use the system's established easing (often `ease-out` for entries, `ease-in` for exits, custom cubic-bezier for brand)
- If the codebase doesn't use custom easing, stick with `ease-out` / `ease-in-out`

**Technical:**

- CSS transitions for state-driven animation (hover, focus, toggles). Cheapest, most performant.
- CSS animations for looping or sequenced (loading spinners, entry reveals)
- JS animation (Framer Motion / Motion One) only when CSS can't express it (shared element transitions, gestures, physics)
- Animate `transform` and `opacity` where possible; avoid animating `width` / `height` / `top` / `left` (triggers layout)
- Honor `prefers-reduced-motion: reduce` — wrap non-essential motion in a media query

---

## Responsive & Density

Know the target breakpoints from the existing project. Typically:

- Mobile: 320–640px
- Tablet: 640–1024px
- Desktop: 1024px+
- Wide: 1440px+

**Mobile-first** by default — write base styles for mobile, layer on larger breakpoints with media queries. Avoids most responsive bugs.

**Density**: If the product has a "compact" variant (Linear-style dense tables), respect it as a toggle, not a rewrite. Use a CSS variable / class for density so it's consistent app-wide.

**Touch targets** ≥ 44×44 CSS pixels on mobile. Hit-slop via padding / pseudo-elements where the visual target is smaller.

---

## Dark Mode

If the host app supports dark mode, your component must too. Don't opt out.

- Use design tokens (which already have light/dark values), not literal colors
- Test both modes before shipping — it's usually where dark-mode bugs hide
- Honor `prefers-color-scheme` as the default; user override via settings
- Shadows in dark mode are often invisible — use border + subtle glow instead

If the host app doesn't support dark mode, don't add it for your component alone — it'll look out of place.

---

## Styling Approach

Match the codebase. Don't introduce a second styling paradigm.

- **Tailwind**: use the existing utility classes + theme. Don't mix CSS Modules into a Tailwind codebase.
- **CSS Modules / CSS-in-JS**: follow the existing file layout and naming.
- **vanilla-extract / Pigment / Panda**: learn it if that's what the project uses.
- **Styled-system variants**: use the variant API; don't fork.

For one-off styles that don't fit the system, consider: is this genuinely one-off, or am I missing a token / primitive I should be using? Usually the latter.

---

## When to Build Custom

Default to using the platform (`<select>`, `<input type="date">`, `<dialog>`, native scroll). Custom implementations are warranted only when:

1. **The native version genuinely lacks a required feature** (multi-select, type-ahead, custom rendering of options)
2. **The native version has known serious UX issues** on target platforms
3. **The host design system already has a custom version** you should use

If you're building custom, use an unstyled primitive library (Radix, Ark, React Aria) rather than reinventing keyboard and accessibility handling. Custom dropdowns rolled from `<div>` are where keyboard and screen-reader support go to die.

---

## Lit (custom elements)

When the host codebase uses Lit, most rules above still apply (design tokens, state matrix, accessibility, motion, dark mode, responsive, styling discipline). The differences live in the component model itself.

### Component shape

Lit components are classes extending `LitElement`. Reactive state comes from decorators, not hooks. The mental model is "observable fields + declarative template," not "function + closures."

```ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('user-card')
export class UserCard extends LitElement {
  static styles = css`/* scoped to shadow root */`;

  @property({ type: String }) name = '';
  @state() private expanded = false;

  render() {
    return html`
      <button @click=${() => (this.expanded = !this.expanded)}>
        ${this.name}
      </button>
      ${this.expanded ? html`<slot></slot>` : null}
    `;
  }
}
```

### Public API: `@property` vs `@state`

- **`@property`** — public, settable from markup or parent; optionally reflects to an HTML attribute. This is your component's public API.
- **`@state`** — internal reactive state, not visible to consumers. Use for anything a parent shouldn't touch.

Mixing them up either leaks internals into your API or hides values consumers legitimately need to set. Decide per field when writing.

### Parent ↔ child communication

- **Parent → child**: set an attribute (primitives) or a property (objects / functions).
- **Child → parent**: dispatch a `CustomEvent`. Crossing a shadow-DOM boundary requires `composed: true`:

```ts
this.dispatchEvent(new CustomEvent('select', {
  detail: item,
  bubbles: true,
  composed: true,
}));
```

No React-style callback props. Event-driven communication is the platform's answer — lean into it instead of pretending you're in React.

### Composition via slots

Children project into the component via `<slot>`. Named slots for multiple insertion points:

```ts
html`
  <header><slot name="header"></slot></header>
  <div class="body"><slot></slot></div>
  <footer><slot name="footer"></slot></footer>
`
```

Consumer:

```html
<my-card>
  <h2 slot="header">Title</h2>
  <p>Body</p>
  <button slot="footer">Action</button>
</my-card>
```

If a slot isn't in the template, projected children silently don't render. Slots are the Lit equivalent of React's `children` and render props — master them first.

### Reactivity: reassign, don't mutate

Lit detects property changes by reference. Mutating in place won't trigger a re-render.

```ts
// ❌ no re-render
this.items.push(newItem);

// ✅ reassign
this.items = [...this.items, newItem];

// ✅ explicit
this.items.push(newItem);
this.requestUpdate();
```

Prefer reassignment — same discipline as React state, avoids surprise.

### Lifecycle & derived state

- **`willUpdate(changed)`** — before render; compute derived values here. Safe to mutate reactive props.
- **`update(changed)`** — calls `render()` by default; override only to intercept attribute reflection.
- **`updated(changed)`** — after render, DOM in sync. **Don't set reactive props here without a guard** — infinite loop.
- **`firstUpdated`** — one-shot after the first render; good for focus / measurement.
- **`connectedCallback` / `disconnectedCallback`** — DOM attach / detach. Add listeners in one, remove in the other (or use an `AbortController` signal).

### Styling & shadow DOM

Styles in `static styles = css\`...\`` are scoped to the shadow root. They don't leak out; outside styles don't leak in. Customization points:

- **CSS custom properties** — inherit through shadow boundary by default. Expose tokens as `--my-color`, let consumers override.
- **`::part`** — style specific internals from outside: `<div part="label">` → `my-el::part(label) { ... }`.
- **Slotted selectors** — `::slotted(p) { ... }` styles slotted children (top-level only; doesn't pierce further).

If you need global styles (e.g., Tailwind utilities) inside Lit components, either adopt global stylesheets via `adoptedStyleSheets`, opt out of shadow DOM with `createRenderRoot() { return this; }` (loses encapsulation), or restructure. Don't fight the boundary.

### Reusable logic: reactive controllers

Lit's equivalent of hooks. A controller hooks into a host's lifecycle and can request updates.

```ts
class MouseController implements ReactiveController {
  host: ReactiveControllerHost;
  x = 0; y = 0;
  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }
  hostConnected() { window.addEventListener('mousemove', this.onMove); }
  hostDisconnected() { window.removeEventListener('mousemove', this.onMove); }
  onMove = (e: MouseEvent) => {
    this.x = e.clientX; this.y = e.clientY;
    this.host.requestUpdate();
  };
}
```

Use controllers for anything hook-shaped: subscriptions, debounced computation, async data. One place owns setup and cleanup.

### SSR

Lit SSR renders to string on the server, hydrates on the client. Hydration requires deterministic render output — same locale, same time source, same data. If the host app uses Lit SSR, avoid `Date.now()` / `Math.random()` / user-locale formatting during render, or stub them consistently between server and client.

### Testing

Use `@open-wc/testing` (Mocha + Chai + fixture helpers) or Playwright against a real browser. **Don't use jsdom** — custom element and shadow DOM support is incomplete, and you'll waste hours on environment bugs, not product bugs. Real browser, even for unit tests.
