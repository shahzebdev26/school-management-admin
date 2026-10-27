# Testing

## What must be tested

Test behaviour users depend on, not implementation detail.

| Priority | Area                                                  | Why                                                     |
| -------- | ----------------------------------------------------- | ------------------------------------------------------- |
| **High** | Forms — validation, submission, server error mapping  | School onboarding and admin management are form-heavy   |
| **High** | The four data states — loading, empty, error, success | The most common UI defect is a missing error state      |
| **High** | School directory filtering and pagination             | The primary screen; regressions are immediately visible |
| **High** | Permission-specific rendering                         | A junior admin must not see controls they cannot use    |
| Medium   | Hooks with derived logic                              | ---                                                     |
| Medium   | Shared components (`DataTable`, `StatTile`)           | Used everywhere; a regression is wide                   |
| Low      | Thin presentational components                        | ---                                                     |

Do **not** test: prop pass-through, styling, library behaviour, or that a component renders without crashing.

---

## Test behaviour, not implementation

```tsx
// WRONG — asserts internals, breaks on any refactor
expect(wrapper.find('SchoolCard')).toHaveLength(3)
expect(setStateSpy).toHaveBeenCalled()

// CORRECT — asserts what the user sees
expect(screen.getByText('City School')).toBeVisible()
expect(screen.getByRole('button', { name: 'Deactivate' })).toBeEnabled()
```

Query the way a user finds things: `getByRole`, `getByLabelText`, `getByText`. Reach for `getByTestId` only when nothing else can identify the element — if that happens often, the markup needs better semantics, which is also an accessibility problem.

---

## Mock the network, never the internals

Mock at the HTTP boundary with MSW. Never mock TanStack Query, a query hook, or a component's children.

```ts
// CORRECT — real hooks, real cache, real states
server.use(
  http.get('*/v1/schools', () => HttpResponse.json({ data: [{ id: '1', name: 'City School' }] })),
)

// WRONG — the component is no longer being tested
vi.mock('../api/use-schools-query')
```

Mocking the hook means loading and error states are never exercised — which is exactly where the bugs are.

Build fixtures from **generated API types** so a contract change breaks the test instead of hiding behind a hand-written mock:

```ts
const school: School = {/* typed, so the API's shape is enforced */}
```

---

## Test all four states

Every data screen gets four tests. The error and empty cases matter most, because they are the ones developers skip.

```tsx
it('shows a skeleton while loading')
it('shows an empty message when no schools match the filters')
it('shows an error with a retry when the request fails')
it('shows the school directory when data loads')
```

---

## Form tests

For each significant form:

```tsx
it('shows a plain-language error when the school name is empty')
it('rejects a malformed subdomain')
it('disables submit while the request is pending')
it('maps a server field error onto the right input')
it('submits normalised values')
```

Server error mapping is routinely broken and routinely untested. Cover it.

---

## Writing good tests

### Names state the expectation

```tsx
// WRONG
it('works')
it('renders')

// CORRECT
it('shows inactive status when the school is deactivated')
it('hides the deactivate button for a read-only admin')
```

### One behaviour per test

A test asserting five unrelated things tells you nothing when it fails.

### No conditional logic in tests

A test with an `if` tests two things badly. Write two tests.

### Deterministic

No reliance on current time or random values. Freeze time wherever dates matter.

### Await user interactions properly

```tsx
// CORRECT
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'Onboard school' }))
expect(await screen.findByText('School created successfully')).toBeVisible()
```

Use `findBy*` for anything asynchronous. Never add arbitrary timeouts to make a test pass.

---

## What not to do

- **No snapshot tests of whole component trees.** They fail on every harmless change and get blindly regenerated, which is worse than no test.
- **No mocking of query hooks or child components.**
- **No testing through implementation details** — class names, internal state, component instances.
- **No arbitrary waits.** Use `findBy*` and `waitFor`.
- **Never weaken an assertion to make a test pass.** If a test fails, the code is wrong until proven otherwise.

---

## What tests do not cover

Automated tests prove the code behaves as written. They do not prove the feature works.

Before reporting any UI work finished, **open it in a browser at desktop width and at ~390px width** and use it. Check:

- Layout works at both widths
- No horizontal page scroll
- Loading, empty, and error states look right, not just correct
- Wide tables scroll inside their container, not the page

If you could not run the browser check, **say so explicitly** rather than implying the feature is verified.

---

## Checklist

- [ ] New behaviour has a test that would fail without the change
- [ ] All four data states tested on new data screens
- [ ] New form tests validation, pending state, and server error mapping
- [ ] Network mocked with MSW; no hooks or children mocked
- [ ] Fixtures typed from generated API types
- [ ] Queries use role/label/text, not test IDs or class names
- [ ] Test names state the expectation
- [ ] No snapshots of whole trees, no conditional logic, no arbitrary waits, no time dependence
- [ ] `pnpm test` passes in full
- [ ] Browser-checked at desktop and phone width, or explicitly noted as unverified
