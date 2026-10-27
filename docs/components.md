# Components

## One component, one responsibility, one file

- One exported component per file, named export matching the filename (`school-card.tsx` -> `SchoolCard`)
- Small internal subcomponents may live in the same file **only** if used nowhere else and the file stays under 200 lines
- No default exports except `app/` route files, which Next requires

---

## Size and extraction

Hard limit is 150 lines. When a component grows, extract along these seams:

| Seam                                                              | Extract to                                |
| ----------------------------------------------------------------- | ----------------------------------------- |
| A visually distinct block (filter bar, summary row, detail panel) | A subcomponent                            |
| Logic, state, derived values                                      | A hook in `features/<feature>/hooks/`     |
| Data fetching                                                     | A query hook in `features/<feature>/api/` |
| Repeated markup inside the component                              | A subcomponent, even a tiny one           |

```tsx
// CORRECT — screen composes, children render, hook decides
export function SchoolDirectoryScreen() {
  const { schools, filters, setFilters, pagination, isLoading, isError, refetch } =
    useSchoolDirectory()

  return (
    <Screen title="Schools">
      <SchoolFilters value={filters} onChange={setFilters} />
      <SchoolTable schools={schools} isLoading={isLoading} isError={isError} onRetry={refetch} />
      <Pagination {...pagination} />
    </Screen>
  )
}
```

The component reads as a description of the screen. All logic sits in `useSchoolDirectory`.

---

## No business logic in components

A component may format for display. It may not decide.

```tsx
// WRONG — business rule in the view, and it will disagree with the API
const isOverdue = daysSinceCreated > 30
const healthScore = activeStudents / totalCapacity

// CORRECT — the API computes it; the component displays it
const { isOverdue, healthScore } = school
```

School metrics, usage analytics, and aggregate calculations come from the API. See [architecture.md](architecture.md).

Formatting _is_ the component's job: `formatDate`, `formatNumber`, pluralisation. Keep those in `lib/utils/`.

---

## Props

### Keep the surface small

Five is comfortable, seven is the hard limit. Beyond that the component is doing too much, or configuration should be composition.

### Composition over configuration

```tsx
// WRONG — a boolean per feature, and it grows forever
<DataTable
  showSearch
  showExport
  showPagination
  showBulkActions
  compact
  striped
/>

// CORRECT — pass what you need
<DataTable
  rows={rows}
  columns={columns}
  toolbar={<><SearchInput /><ExportButton /></>}
  footer={<Pagination />}
/>
```

### Never spread unknown props

See [typescript.md](typescript.md). Extend a known element type deliberately instead.

### No prop drilling past two levels

If a value travels through three components that do not use it, use composition or a feature-scoped context. Do not add a global store for it.

---

## shadcn/ui primitives

- `components/ui/` is **generated. Never hand-edit it.** Changes are lost on regeneration.
- Need different behaviour? Wrap it in `components/shared/` or a feature folder.
- Need different styling? Use theme tokens — see [styling.md](styling.md).
- Check `components/ui/` before building any primitive. Buttons, dialogs, selects, tabs, and tables already exist.

---

## Images and links — always the Next primitives

Never write a raw `<img>` or `<a>` tag. Use `next/image`'s `Image` and `next/link`'s `Link` instead, with no exceptions for "just this once."

```tsx
// WRONG
<img src={school.logoUrl} alt={school.name} />
<a href="/schools">Schools</a>

// CORRECT
<Image src={school.logoUrl} alt={school.name} width={48} height={48} />
<Link href="/schools">Schools</Link>
```

- A remote image (a school's Cloudinary logo) needs its host added to `images.remotePatterns` in `next.config.ts`. Add the host there — do not fall back to `<img>` to avoid the config change.
- **Never silence `@next/next/no-img-element` or `@next/next/no-html-link-for-pages` with an `eslint-disable` comment.** The rule firing means the code is wrong, not the rule. Fix the code.

---

## Shared components — copied from school-management-web

Shared components are **copied** from `school-management-web`, not imported from a shared package. The admin dashboard uses a subset.

### Used in this dashboard

| Component       | Purpose                                               |
| --------------- | ----------------------------------------------------- |
| `Screen`        | Page shell: title, description, actions               |
| `DataTable`     | Directory tables, audit log, analytics breakdowns     |
| `StatTile`      | Dashboard metrics                                     |
| `EmptyState`    | Every list screen                                     |
| `ErrorState`    | Every data screen; distinguishes offline from failure |
| `ConfirmDialog` | Destructive actions (deactivate school, remove admin) |
| `SearchInput`   | Every list screen                                     |
| `Pagination`    | Every list screen                                     |
| `StatusBadge`   | School status, admin status                           |
| `Toaster`       | Mounted once in the root layout                       |
| `PersonAvatar`  | Admin list, audit log entries                         |

### NOT used in this dashboard

| Component             | Why                                                  |
| --------------------- | ---------------------------------------------------- |
| `ImpersonationBanner` | View-as hands off to school-management-web           |
| `NotificationFeed`    | Admin dashboard has no chat-bubble notification feed |
| `AttendanceBadge`     | Attendance is a school-level concern                 |
| `OtpInput`            | No OTP flow in the admin dashboard                   |

Do not import or copy components from the "not used" list unless the product requires them.

---

## Every data screen handles four states

Loading, empty, error, success. A screen that renders only the success path shows a blank panel on failure, and the user cannot tell whether data is missing or the request broke.

```tsx
export function SchoolDirectory({ filters }: SchoolDirectoryProps) {
  const { data, isPending, isError, refetch } = useSchoolsQuery(filters)

  if (isPending) return <TableSkeleton rows={10} />
  if (isError) return <ErrorState onRetry={refetch} />
  if (data.length === 0) return <EmptyState message="No schools match these filters." />

  return <DataTable rows={data} columns={schoolColumns} />
}
```

Use skeletons sized to the real content, not a centred spinner. Content that reflows on arrival feels broken.

---

## Desktop first — but mobile works

The admin dashboard is used primarily on laptops and desktops. Design at desktop width first, then ensure the layout degrades gracefully on tablets and phones.

- Sidebar collapses on narrow viewports
- Tables scroll horizontally inside their container — no page-level horizontal scroll
- Forms stack to single column on mobile
- Tap targets at least **24px** (WCAG 2.5.8 AA)

---

## Accessibility

Not optional.

- Semantic elements first. A `div` with `onClick` is not a button.
- Every input has an associated `<label>`. A placeholder is not a label.
- Keyboard reachable: focus order follows visual order, focus is visible
- Dialogs trap focus and close on Escape
- Loading and error regions announce via `aria-live`
- Never convey meaning by colour alone — status needs a label or icon, not just a colour
- Respect `prefers-reduced-motion`
- Icon-only buttons have an `aria-label`

---

## Checklist

- [ ] One component per file; named export matches the filename
- [ ] Component under 150 lines; logic extracted to a hook
- [ ] No business calculation in the component — values come from the API
- [ ] Props under 7; composition used instead of boolean configuration
- [ ] `components/ui/` not hand-edited; existing shared components reused, not duplicated
- [ ] No raw `<img>` or `<a>` — `next/image` and `next/link` used instead, no `eslint-disable`
- [ ] Loading, empty, error, and success states all handled
- [ ] Verified at desktop width and at ~390px: no horizontal scroll, layout functional
- [ ] Labels on inputs, keyboard reachable, status not conveyed by colour alone
