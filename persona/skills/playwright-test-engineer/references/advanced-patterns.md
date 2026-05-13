# Advanced Reference: Playwright Patterns & Code Templates

Templates for the `playwright-test-engineer` skill. Copy, adapt to the codebase's conventions — **never impose these over existing patterns** when in Mature mode.

## Table of Contents

1. [Coverage Map Schema Variants](#coverage-map-schema-variants)
2. [Playwright Config Template](#playwright-config-template)
3. [Global Setup: storageState Generator](#global-setup-storagestate-generator)
4. [API Factory Pattern](#api-factory-pattern)
5. [Fixture Composition](#fixture-composition)
6. [Page Object Skeleton](#page-object-skeleton)
7. [Selector Disambiguation](#selector-disambiguation)
8. [Deterministic Time & Random](#deterministic-time--random)
9. [Flake Detection Loop](#flake-detection-loop)
10. [Debugging Failures](#debugging-failures)
11. [CI Shard Configuration](#ci-shard-configuration)
12. [Accessibility (opt-in)](#accessibility-opt-in)
13. [Mobile Emulation (opt-in)](#mobile-emulation-opt-in)
14. [API E2E (no browser)](#api-e2e-no-browser)

---

## Coverage Map Schema Variants

The canonical form lives at `tests/coverage-map.md`. Markdown, diffable, greppable.

**Standard schema:**

```markdown
| Feature        | Route/API       | Priority | Risk | Auth   | Data           | Spec                 | Status  |
|----------------|-----------------|----------|------|--------|----------------|----------------------|---------|
| Checkout       | /checkout       | P0       | High | user   | factory:Cart   | checkout.spec.ts     | covered |
| Admin panel    | /admin          | P1       | Med  | admin  | fixture:tenant | —                    | gap     |
| Public landing | /               | P2       | Low  | unauth | none           | landing.spec.ts      | covered |
| Login UI       | /login          | P0       | High | unauth | none           | auth.spec.ts         | covered |
```

**Column conventions:**
- **Priority**: P0 (release-blocking) / P1 (high-value) / P2 (nice-to-have)
- **Risk**: High / Med / Low — blast radius if it breaks in prod
- **Auth**: `unauth` / `user` / `admin` / named storageState key
- **Data**: `none` / `factory:<Entity>` / `fixture:<file>` / `external`
- **Status**: `covered` / `partial` / `gap` / `flaky` / `deprecated`

**Extended schema** (when the suite grows large — add columns, don't nest):

```markdown
| Feature | Route | Priority | Risk | Auth | Data | Spec | Status | Last Verified | Owner |
```

Avoid JSON — markdown wins on manager readability, git-blame friendliness, and grep.

---

## Playwright Config Template

Opinionated defaults matching the skill's hard rules. Tune per project.

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    // Opt-in: uncomment only when mobile flows are explicitly scoped.
    // {
    //   name: 'mobile-safari',
    //   use: { ...devices['iPhone 14'], storageState: 'playwright/.auth/user.json' },
    //   dependencies: ['setup'],
    // },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

`.gitignore` must include `playwright/.auth/` to keep credentials out of git.

---

## Global Setup: storageState Generator

One UI login per run (not per spec). Saves cookies + localStorage to a file; every subsequent spec reuses it.

```typescript
// tests/global.setup.ts
import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const userFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: userFile });
});
```

For multi-role setups, add parallel `setup` tasks writing to `admin.json`, `readonly.json`, etc. Reference via `storageState: 'playwright/.auth/admin.json'` in a dedicated project.

**API-based variant** (faster, bypasses UI) — use when the login UI itself is already covered by its own spec:

```typescript
setup('authenticate via API', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: { email: process.env.TEST_USER_EMAIL, password: process.env.TEST_USER_PASSWORD },
  });
  expect(response.ok()).toBeTruthy();
  const { token } = await response.json();

  await request.storageState({ path: userFile });
  // Or set token directly:
  // await context.addCookies([{ name: 'session', value: token, domain: ..., path: '/' }]);
});
```

---

## API Factory Pattern

Create test entities via API, not UI. Parallel-safe, fast, deterministic.

```typescript
// tests/factories/user.ts
import { APIRequestContext } from '@playwright/test';

type CreateUserInput = { email?: string; role?: 'user' | 'admin' };

export async function createUser(
  request: APIRequestContext,
  input: CreateUserInput = {}
) {
  const email = input.email ?? `test-${crypto.randomUUID()}@example.test`;
  const response = await request.post('/api/test/users', {
    data: { email, role: input.role ?? 'user' },
  });
  if (!response.ok()) {
    throw new Error(`createUser failed: ${response.status()} ${await response.text()}`);
  }
  return response.json() as Promise<{ id: string; email: string }>;
}
```

Conventions:
- Factories return the full created entity (id, derived fields) — not just input echo
- Each factory owns its own uniqueness (UUID in email, etc.) — never rely on a counter
- Cleanup is optional if the test env wipes between runs; otherwise add a `deleteUser` helper and call it in `afterEach`
- Factories live in `tests/factories/<entity>.ts`

---

## Fixture Composition

Use Playwright's `test.extend` to compose typed fixtures per feature.

```typescript
// tests/fixtures/authed.ts
import { test as base, expect } from '@playwright/test';
import { createUser } from '../factories/user';

type AuthedFixtures = {
  user: { id: string; email: string };
};

export const test = base.extend<AuthedFixtures>({
  user: async ({ request }, use) => {
    const user = await createUser(request);
    await use(user);
    // optional cleanup here
  },
});

export { expect };
```

Specs consume like this:

```typescript
import { test, expect } from '../fixtures/authed';

test('settings page shows user email', async ({ page, user }) => {
  await page.goto('/settings');
  await expect(page.getByText(user.email)).toBeVisible();
});
```

Never put stateful setup in `test.beforeAll` that other specs depend on — fixtures are the right tool.

### Fixture Scope

By default, fixtures are **test-scoped** — created and torn down per test. For expensive setup, switch to **worker-scoped** (one per parallel worker, reused across tests in that worker):

```typescript
type WorkerFixtures = {
  apiToken: string;
};

export const test = base.extend<{}, WorkerFixtures>({
  apiToken: [async ({ }, use) => {
    const token = await mintAdminToken(); // expensive, e.g. cert exchange
    await use(token);
  }, { scope: 'worker' }],
});
```

Worker-scoped fixtures are immutable from a test's perspective. If a test mutates worker state (writes a row keyed on the token), the next test in the same worker sees the mutation — **parallelism breaks**. Keep worker fixtures read-only.

### Per-file overrides with `test.use()`

To override config (viewport, baseURL, storageState) for a single spec file:

```typescript
import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 14'],
  storageState: 'playwright/.auth/admin.json',
});

test('mobile admin dashboard', async ({ page }) => {
  await page.goto('/admin');
  // mobile + admin context
});
```

### Serial mode escape hatch

If a spec genuinely cannot run in parallel (legacy DB lock, external service rate limit), gate it explicitly — don't disable global parallelism:

```typescript
test.describe.configure({ mode: 'serial' });

test.describe('legacy report generator', () => {
  test('step 1: queue job', async ({ page }) => { ... });
  test('step 2: poll job', async ({ page }) => { ... });
});
```

In serial mode, a failure in step 1 skips step 2. Use sparingly — flag it in the Manager Handoff so it's visible. The Push Back table explicitly forbids using this as a flake band-aid.

---

## Page Object Skeleton

Add a page object only when a page's interactions are reused **3+ times** across specs. Premature page objects are clutter.

```typescript
// tests/pages/CheckoutPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly emailField: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailField = page.getByLabel('Email');
    this.submitButton = page.getByRole('button', { name: 'Place order' });
  }

  async goto() {
    await this.page.goto('/checkout');
    await expect(this.page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  }

  async placeOrder(input: { email: string }) {
    await this.emailField.fill(input.email);
    await this.submitButton.click();
    await expect(this.page).toHaveURL(/\/order\/confirmation/);
  }
}
```

Conventions:
- Methods assert the **post-condition** of the action (`await expect(...)` at end of `goto`, `placeOrder`) so callers don't need to
- Locators are properties, created once in the constructor — don't re-query in every method
- One page object per *page*, not per feature
- Pages live in `tests/pages/<FeatureName>Page.ts`

---

## Selector Disambiguation

When `getByRole('button', { name: 'Save' })` matches multiple elements (e.g. one in a modal, one on the page behind it), resolve by scope — not by `.nth()`.

**Preferred: scope by container**

```typescript
const dialog = page.getByRole('dialog', { name: 'Confirm changes' });
await dialog.getByRole('button', { name: 'Save' }).click();
```

Reads: "the Save button inside the Confirm dialog." Survives layout changes.

**Acceptable: filter by neighbour text**

```typescript
const row = page.getByRole('row').filter({ hasText: 'admin@example.com' });
await row.getByRole('button', { name: 'Delete' }).click();
```

Reads: "the row containing this email, then its Delete button." Use when there's no enclosing landmark.

**Last resort: `.nth()` / `.first()` / `.last()`**

```typescript
// AVOID — order-dependent, breaks when the list reorders
await page.getByRole('button', { name: 'Save' }).nth(1).click();
```

If you reach for `.nth()`, you've usually missed a better scope. Comment the reason or refactor the test surface.

**`.filter({ has: locator })` for structural disambiguation**

```typescript
const submitRow = page.getByRole('row').filter({
  has: page.getByRole('button', { name: 'Submit' }),
});
```

Reads: "the row that contains a Submit button." Useful for grids where text alone is ambiguous.

**`getByText` exact vs substring**

```typescript
page.getByText('Save');           // substring — matches "Save", "Save changes", "Unsave"
page.getByText('Save', { exact: true });  // exact match
page.getByText(/^Save$/);          // regex equivalent
```

Default to `exact: true` for short button-like text. Substring matching is a flake source when copy changes.

---

## Deterministic Time & Random

Tests that depend on wall-clock time or `Math.random()` are flake farms.

**Freeze time via Playwright's clock API** (Playwright 1.45+):

```typescript
test('shows "just now" for fresh comments', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-15T10:00:00Z') });
  await page.goto('/post/123');
  await page.clock.pauseAt(new Date('2026-01-15T10:00:30Z'));
  await expect(page.getByText('just now')).toBeVisible();
});
```

**Seed randomness** by intercepting at the network layer:

```typescript
await page.route('**/api/random', (route) =>
  route.fulfill({ json: { value: 0.42 } })
);
```

Never test against live clock/random output — always freeze at the seam.

---

## Flake Detection Loop

Before declaring a spec done, run it 3 consecutive times:

```bash
for i in 1 2 3; do
  npx playwright test path/to/new.spec.ts --reporter=line || exit 1
done
```

If any run fails, the spec is flaky — **fix, don't retry**. Flake sources ordered by frequency:

1. **Timing** — replace `waitForTimeout` with `expect().toBeVisible()` / `toHaveURL()` / `toHaveText()`
2. **Network** — mock unstable deps at `page.route`, or wait for the specific request with `page.waitForResponse`
3. **Animation** — disable via `prefers-reduced-motion` media emulation, or wait on the post-animation state
4. **Shared state** — another spec is mutating data; isolate via factory
5. **Order dependence** — refactor to remove; Playwright runs in random order on CI

If flake traces to the product (real race condition), flag it to the manager — don't paper over with retries.

---

## Debugging Failures

When a spec fails in CI (or locally), use Playwright's built-in tooling before reaching for `console.log`.

**Trace viewer** — the highest-signal tool. Configure trace retention in `playwright.config.ts`:

```typescript
use: { trace: 'retain-on-failure' }  // already in the standard template
```

Then, after a failed run:

```bash
npx playwright show-trace test-results/<spec>/trace.zip
```

The trace viewer shows: every action, network request/response, console output, DOM snapshots before & after each step, screenshots, and the source-mapped code line. Most "I can't reproduce" failures get diagnosed in 5 minutes here.

For CI failures, the trace is in the artifact uploaded by the workflow (see shard config below). Download, extract, run `show-trace`.

**UI mode** (Playwright 1.32+) — interactive run + step-through:

```bash
npx playwright test --ui
```

Pick a spec, watch it run frame-by-frame, jump back in time, edit selectors live. Best when developing a new spec or hunting a flake locally.

**Headed + slow-mo** — visual debugging:

```bash
npx playwright test path/to.spec.ts --headed --project=chromium
```

Combine with `slowMo: 250` in config `use:` for a slowed-down browser if the UI moves too fast to see.

**PWDEBUG inspector** — pause at each action with the Playwright Inspector:

```bash
PWDEBUG=1 npx playwright test path/to.spec.ts
```

Steps through the spec, lets you pick selectors with the picker, copy generated locator code back into the spec.

**Console + network logging** — for hard-to-reproduce flake without trace coverage:

```typescript
test('debug network races', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', req => console.log('FAILED:', req.url(), req.failure()));
  // ...
});
```

Strip these after triage — they belong in the diagnosis phase, not the committed spec.

---

## CI Shard Configuration

For suites >~50 specs, shard across runners. The pattern is identical across providers — parallel matrix job, each running `npx playwright test --shard=N/M`, with `playwright-report/` and `test-results/` (for traces) uploaded as artifacts.

### GitHub Actions

```yaml
# .github/workflows/playwright.yml (excerpt)
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --shard=${{ matrix.shard }}/4
        env:
          PLAYWRIGHT_BASE_URL: ${{ vars.STAGING_URL }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ matrix.shard }}
          path: |
            playwright-report/
            test-results/
```

### CircleCI

CircleCI exposes `CIRCLE_NODE_INDEX` (0-based) and `CIRCLE_NODE_TOTAL` from `parallelism`. Playwright shards are 1-based, so add 1:

```yaml
# .circleci/config.yml (excerpt)
version: 2.1
jobs:
  playwright:
    docker:
      - image: mcr.microsoft.com/playwright:v1.49.0-jammy
    parallelism: 4
    steps:
      - checkout
      - run: npm ci
      - run:
          name: Run sharded Playwright
          command: |
            SHARD_INDEX=$((CIRCLE_NODE_INDEX + 1))
            npx playwright test --shard=${SHARD_INDEX}/${CIRCLE_NODE_TOTAL}
          environment:
            PLAYWRIGHT_BASE_URL: $STAGING_URL
      - store_artifacts:
          path: playwright-report
      - store_artifacts:
          path: test-results
      - store_test_results:
          path: playwright-report/junit.xml  # add ['junit', { outputFile: 'playwright-report/junit.xml' }] to reporter
```

`mcr.microsoft.com/playwright:vX.Y.Z-jammy` ships browsers pre-installed — skip `npx playwright install`.

### GitLab CI

GitLab's `parallel: matrix` and `CI_NODE_INDEX` / `CI_NODE_TOTAL` (1-based) align directly with Playwright's shard syntax:

```yaml
# .gitlab-ci.yml (excerpt)
playwright:
  image: mcr.microsoft.com/playwright:v1.49.0-jammy
  parallel: 4
  variables:
    PLAYWRIGHT_BASE_URL: $STAGING_URL
  script:
    - npm ci
    - npx playwright test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    reports:
      junit: playwright-report/junit.xml
    expire_in: 7 days
```

### Cross-provider notes

- **Always upload `test-results/`** alongside `playwright-report/` — it contains `trace.zip` files referenced by the Debugging Failures section. Without it, post-failure triage is blind.
- **Merge sharded HTML reports** with `npx playwright merge-reports ./all-blob-reports --reporter=html` if you want a single combined report (requires `['blob']` reporter on CI).
- **Secrets** (`TEST_USER_PASSWORD`, API tokens) belong in the CI provider's secret store, not in YAML. Never inline.

Config changes to CI are "Ask first" tier — present diff to manager before applying.

---

## Accessibility (opt-in)

Only when the manager scopes a11y in. Uses `@axe-core/playwright`.

```typescript
import AxeBuilder from '@axe-core/playwright';

test('checkout page has no WCAG violations', async ({ page }) => {
  await page.goto('/checkout');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

Caveats the agent should flag:
- Axe catches ~30–40% of real a11y issues — not a replacement for manual review
- Pass rate depends on which tags are included; start with `wcag2aa`, tighten later
- False positives on iframe content and third-party widgets — allow-list via `.exclude()`

---

## Mobile Emulation (opt-in)

Add a dedicated project in `playwright.config.ts` (see template above). Do not emulate mobile in-spec via `page.setViewportSize()` — it misses touch events, device pixel ratio, and user-agent differences.

```typescript
// Example: a mobile-specific spec, enabled via `--project=mobile-safari`
test.use({ ...devices['iPhone 14'] });

test('bottom nav is visible on mobile', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Bottom' })).toBeVisible();
});
```

---

## API E2E (no browser)

Use Playwright's `request` fixture when the flow is pure API. Same framework, same reporting, same CI.

```typescript
import { test, expect } from '@playwright/test';

test('POST /api/orders returns 201 with order id', async ({ request }) => {
  const response = await request.post('/api/orders', {
    data: { items: [{ sku: 'abc-123', qty: 1 }] },
    headers: { Authorization: `Bearer ${process.env.TEST_API_TOKEN}` },
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.id).toMatch(/^ord_/);
});
```

API E2E counts as coverage in the map — mark the Route column with the endpoint path (`POST /api/orders`). Don't duplicate UI coverage with an API spec that tests the same assertion.
