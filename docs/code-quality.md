# Code Quality

## Hard limits

| Thing                     | Target    | Hard stop | On exceeding            |
| ------------------------- | --------- | --------- | ----------------------- |
| File                      | 200 lines | 300       | Split by responsibility |
| Component                 | 120 lines | 150       | Extract a subcomponent  |
| Function / hook           | 40 lines  | 60        | Extract a named helper  |
| Function parameters       | 3         | 3         | Take an options object  |
| Props per component       | 5         | 7         | Reconsider the design   |
| Nesting depth (code)      | 2         | 3         | Early return or extract |
| JSX nesting depth         | 4         | 5         | Extract a subcomponent  |
| `useEffect` per component | 0         | 1         | See below               |

These are enforced by ESLint. **Exceeding a limit means splitting the code, never raising the limit.**

### Splitting by responsibility, not by line count

Cutting a 300-line component at line 150 produces two incoherent files. Find the seams: a screen that renders a filter bar, a table, and a detail panel is three components. A hook that manages selection _and_ fetches data is two hooks.

---

## `useEffect` is almost always the wrong tool

Most `useEffect` calls in a codebase like this are mistakes. Before writing one, check the table:

| You want to                        | Use instead                                                 |
| ---------------------------------- | ----------------------------------------------------------- |
| Fetch data                         | TanStack Query — see [data-and-forms.md](data-and-forms.md) |
| Derive a value from props or state | Compute it during render                                    |
| Reset state when a prop changes    | A `key` prop on the component                               |
| Respond to a user action           | An event handler                                            |
| Sync two pieces of state           | Remove one; derive it                                       |

```tsx
// WRONG — derived state in an effect: an extra render and a stale window
const [total, setTotal] = useState(0)
useEffect(() => {
  setTotal(items.reduce(sum, 0))
}, [items])

// CORRECT — just compute it
const total = items.reduce(sum, 0)
```

Legitimate uses are narrow: subscribing to a browser event, a media query, an interval, or imperatively focusing an element. Each must clean up after itself.

---

## Principles, applied with judgement

### KISS — the default

The simplest thing that correctly solves the stated problem.

```tsx
// WRONG — a render-prop abstraction for one use
<DataRenderer render={({ data }) => <Table rows={data} />} />

// CORRECT
<Table rows={students} />
```

### DRY — after the third repetition, not the second

Two similar components are usually fine. Three is a pattern worth extracting. Extracting at two often produces a component with six boolean props that fits neither case.

**But do not duplicate a table or a form shell.** This app has many directory tables, audit log views, and forms. A shared `DataTable` and form field primitives are worth building early, because the fourth and fifth cases are certain to arrive. Duplicating a directory table is a defect; duplicating two slightly different empty states is not.

The distinction: extract **structure** that is certain to repeat. Do not extract **behaviour** speculatively.

### SOLID — the parts that earn their keep

| Principle                 | What it means here                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| **Single responsibility** | One component renders one thing. One hook owns one concern. Most valuable principle in this list.  |
| **Open/closed**           | Achieved through composition and `children`, not configuration props.                              |
| **Liskov**                | Not relevant — no inheritance in React components.                                                 |
| **Interface segregation** | Keep props minimal. A component should not accept props it ignores in most uses.                   |
| **Dependency inversion**  | Pass behaviour in as props or children rather than importing a concrete dependency deep in a tree. |

Do not cite SOLID to justify an abstraction nobody asked for. Over-abstraction is the more common failure here than under-abstraction.

---

## Overengineering — what to avoid

- A component with more than two `variant` props
- A render prop or `children`-as-function where plain composition works
- A custom hook that wraps a single `useState`
- A context provider for state used by one subtree
- `useMemo` / `useCallback` added without a measured problem
- A generic `<Form>` that configures fields from a schema object (unreadable, undebuggable)
- An animation library for a CSS transition
- A global store for data TanStack Query already caches

### Build for today's requirement

No speculative props, no "we might need this later" branches, no half-built screens. When the second case arrives, refactor then — with the second case in hand to design against.

---

## Comments

**Write no comments by default.** Well-named code explains itself; a comment that restates it is noise that rots.

### Banned

```tsx
// Render the school list                  ← restates the code
{
  schools.map((s) => <SchoolCard key={s.id} school={s} />)
}

// ===== HANDLERS =====                    ← section divider; split the component
// TODO: fix later                         ← no issue reference
// <OldTable rows={rows} />                ← commented-out code; delete it
/**
 * SchoolCard component                    ← restates the name
 * @param school The school
 */
```

Also banned: file header blocks, author tags, and any comment referencing the task that prompted the change ("added for the admin portal", "fixes #123"). That belongs in the commit message, and in code it is wrong within a month.

### Permitted — the WHY only

A comment is warranted when a reader would otherwise reasonably change the code and break something:

```tsx
// The view-as ticket is single-use and expires in 30 seconds; do not cache
// the handoff URL or allow the user to copy it.
window.location.href = handoffUrl
```

Both explain a constraint invisible in the code. Neither restates what the line does.

If removing a comment would not confuse a careful reader, remove it.

---

## Naming

| Thing                     | Convention                                | Example                                       |
| ------------------------- | ----------------------------------------- | --------------------------------------------- |
| Component files           | kebab-case                                | `school-card.tsx`                             |
| Components                | PascalCase, matching the filename         | `SchoolCard`                                  |
| Hooks                     | `use` prefix, camelCase                   | `useSchoolDirectory`                          |
| Query/mutation hooks      | `use<Thing>Query` / `use<Action>Mutation` | `useSchoolsQuery`, `useOnboardSchoolMutation` |
| Props interfaces          | `<Component>Props`                        | `SchoolCardProps`                             |
| Event handlers (prop)     | `on<Event>`                               | `onSelect`, `onSubmit`                        |
| Event handlers (internal) | `handle<Event>`                           | `handleSubmit`                                |
| Booleans                  | `is` / `has` / `can` / `should`           | `isActive`, `canViewAs`                       |
| True constants            | SCREAMING_SNAKE_CASE                      | `MAX_UPLOAD_BYTES`                            |
| Zod schemas               | camelCase, `Schema` suffix                | `onboardSchoolSchema`                         |

Rules:

- **No abbreviations** beyond universally known ones (`id`, `url`, `pdf`). Not `schl`, not `aud`.
- **Avoid `data`, `info`, `item`, `obj`, `wrapper`, `container`, `helper`, `manager`** as names. They describe nothing. `SchoolDirectory`, not `SchoolDataWrapper`.
- **Match domain language exactly.** The spec says _school_, _campus_, _admin_, _audit log_, _onboarding_. Use those words.
- **Name components for what they show**, not where they sit. `SchoolDirectory`, not `MainPageContent`.

---

## Functions and components

### Early return over nesting

```tsx
// WRONG
function View({ data }) {
  return data ? data.items.length ? <List items={data.items} /> : <Empty /> : <Spinner />
}

// CORRECT
function View({ data, isLoading }: ViewProps) {
  if (isLoading) return <Spinner />
  if (!data || data.items.length === 0) return <Empty />
  return <List items={data.items} />
}
```

### Handle every state, not just success

Every screen that loads data handles **loading, empty, error, and success**. A screen that renders only the success path shows a blank panel on failure, and the user has no idea whether their data is missing or the request broke. This is the single most common UI defect.

### No boolean parameters

```ts
// WRONG
generateReport(schoolId, true, false)

// CORRECT
generateReport(schoolId, { includeMetrics: true, draft: false })
```

---

## Checklist

- [ ] No file over 300 lines, no component over 150, no function over 60
- [ ] No `useEffect` that could be a computed value, a `key`, or an event handler
- [ ] Nesting depth within limits; early returns used
- [ ] No abstraction with a single use and no planned second
- [ ] Loading, empty, error, and success states all handled
- [ ] No comment that restates the code; remaining comments explain _why_
- [ ] No commented-out code, section dividers, or task references in comments
- [ ] Names follow the table above and use exact domain vocabulary
