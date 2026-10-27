# Architecture

## Folder structure

```
src/
  app/                      Routes ONLY. Thin files that compose from features/.
    schools/
    analytics/
    admins/
    audit-log/
    layout.tsx
  features/
    <feature>/
      components/           Feature-specific UI
      hooks/                Feature logic
      api/                  TanStack Query hooks wrapping the generated client
      schemas/              Zod schemas for forms
      types.ts              Types inferred from schemas
      __tests__/
  components/
    ui/                     shadcn primitives — GENERATED, do not hand-edit
    form/                   Field primitives wired to React Hook Form + Zod
    layout/                 Shell, sidebar, admin chrome
    shared/                 Cross-feature composites (DataTable, EmptyState, ...)
  lib/
    api/
      generated/            Generated from the API's OpenAPI spec. Never edit.
      client.ts             Configured fetch wrapper
    providers/              QueryClient, theme
    utils/
  hooks/                    Cross-feature hooks only
  styles/
```

One folder per feature under `features/`. A feature owns its components, hooks, data access, schemas, and tests. Do not create top-level `components/forms/` or `hooks/queries/` folders — they force every change to touch five directories.

---

## `app/` is routing, not implementation

A route file wires a page together and does nothing else.

```tsx
// app/schools/page.tsx
export default function SchoolsPage() {
  return <SchoolDirectoryScreen />
}
```

If a file in `app/` contains data fetching, form state, or layout logic beyond composition, that logic belongs in `features/`.

Each route provides `loading.tsx` and `error.tsx`. A route without an error boundary fails to a blank screen.

---

## Next is presentation-only

All business logic lives in the Express API, a separate repository.

- **No business rules in this codebase.** School counts, usage metrics, and aggregate analytics are computed by the API. Recomputing them here guarantees two numbers that disagree.
- **No Next route handlers for data.** The API proxy at `/api/*` forwards requests to the Express API, preserving the `Host` header.
- **No server-side data fetching for admin data.** Fetch from client components with TanStack Query.

### API proxy

The admin dashboard proxies API requests through `/api/*` to the Express API backend. The proxy preserves the `Host` header so the API can identify the request as coming from the admin dashboard. This is a pass-through — no request transformation or business logic in the proxy.

Server components are still correct for static shell, layouts, and anything with no dynamic data.

---

## Layers

```
app/ (route)  →  feature component  →  feature hook  →  api hook  →  generated client
```

| Layer             | Does                                              | Never does                                                    |
| ----------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| `app/` route      | Composes a screen                                 | Fetches, holds state, implements layout logic                 |
| Feature component | Renders, handles user events                      | Calls `fetch`, derives business values, orchestrates requests |
| Feature hook      | Owns logic, state, derived values                 | Returns JSX                                                   |
| `api/` hook       | Wraps the generated client in a query or mutation | Contains business rules                                       |
| Generated client  | HTTP                                              | Anything hand-written                                         |

Dependencies point one way. A hook never imports a component.

---

## Sidebar navigation

The admin dashboard uses a sidebar layout, not bottom navigation. The sidebar:

- Shows all five sections: Schools, Analytics, View-as, Admins, Audit Log
- Collapses to icons on narrow viewports and can be toggled
- Is desktop-primary but functional on mobile
- Lives in `components/layout/`

---

## No per-school branding

Unlike `school-management-web`, this dashboard has no tenant resolution and no branding fetch. The CSS variables are hardcoded to the platform default palette (hue 200, chroma 0.16). There is no branding provider, no subdomain detection, and no dynamic manifest.

---

## What not to build

- **Barrel `index.ts` re-export files** — they obscure the dependency graph and slow tooling
- **A global state store for server data** — TanStack Query is the server-data cache. Zustand is for small UI state only.
- **A wrapper around TanStack Query** — it is already the abstraction
- **A hand-rolled API client** — use the generated one
- **A design system** — shadcn/ui plus theme tokens is the design system
- **Per-school branding, subdomain routing, or a dynamic manifest** — this is a single-host dashboard
- **Feature flags or back-compat shims** — nothing is released; change the code
