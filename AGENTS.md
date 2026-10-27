# AGENTS.md — School Management Admin Dashboard

**Read this file completely before writing or modifying any code. It is not optional.**

This is the platform admin dashboard for the school management system. It is a desktop-primary (but mobile-responsive) internal tool served at `admin.techsparks.co`. One deployment, one host, no per-school subdomains.

---

## Read before you code

| Doing this                                  | Read first                                       |
| ------------------------------------------- | ------------------------------------------------ |
| **Anything at all**                         | This file                                        |
| Creating files or deciding where code goes  | [docs/architecture.md](docs/architecture.md)     |
| Writing types or touching API data          | [docs/typescript.md](docs/typescript.md)         |
| Writing any function                        | [docs/code-quality.md](docs/code-quality.md)     |
| Building or changing UI                     | [docs/components.md](docs/components.md)         |
| Fetching data or building a form            | [docs/data-and-forms.md](docs/data-and-forms.md) |
| Any styling, theming, or layout             | [docs/styling.md](docs/styling.md)               |
| Choosing a colour, size, icon or row height | [docs/design-system.md](docs/design-system.md)   |
| Auth, tokens, rendering user content        | [docs/security.md](docs/security.md)             |
| Any new behaviour                           | [docs/testing.md](docs/testing.md)               |

Do not skim. If a rule in a linked doc contradicts this file, **this file wins** — and report the contradiction.

---

## Product context

The admin dashboard is the platform operator's tool. It is served at a single host (`admin.techsparks.co`) with no per-school subdomains and no per-school branding. It always uses the platform default palette.

Five features:

1. **School directory and onboarding** — list, create, configure, and deactivate schools
2. **Analytics** — platform-wide metrics, per-school health, usage trends
3. **View-as handoff** — enter a school's context via a single-use ticket that redirects to `school-management-web`
4. **Admin management** — invite, deactivate, and manage platform admin accounts and roles
5. **Audit log** — searchable, filterable log of admin actions across the platform

Decisions already made — do not revisit or "improve" them:

- **Next.js App Router + TypeScript + TanStack Query + Tailwind + shadcn/ui**
- **Next is presentation-only.** All business logic lives in the Express API, a separate repository.
- **Client components + TanStack Query** hitting the API directly. Do not fetch data in server components.
- **API types are generated** from the API's OpenAPI spec. Never hand-write them.
- **Desktop-primary but mobile-responsive.** Admins use laptops and occasionally tablets or phones. Design desktop-first, ensure mobile works.
- **Sidebar navigation**, not bottom nav. The sidebar collapses on narrow viewports.
- **No per-school branding.** The dashboard always renders with the platform default palette (hue 200, chroma 0.16).
- **No SMS anywhere in the product.**

---

## The five rules that matter most

Violating any of these is a defect, regardless of whether it looks correct in a browser.

### 1. Never hand-write an API type

Run the generator. A hand-written interface drifts from the API silently, and the drift surfaces as a runtime bug in production. See [docs/typescript.md](docs/typescript.md).

### 2. Never use `any`, `as`, `!`, or `@ts-ignore`

Parse at boundaries, narrow with guards. See [docs/typescript.md](docs/typescript.md).

### 3. Never put business logic in a component

Components render. Hooks hold logic. Services and the API decide. A component with a `useEffect` orchestrating three requests is in the wrong layer. See [docs/components.md](docs/components.md).

### 4. Client-side permission checks are cosmetic only

Hiding a button is a convenience, never a security control. The API enforces authorisation. Never rely on the UI to prevent an action. See [docs/security.md](docs/security.md).

### 5. Colours come from theme tokens, never literals

The admin dashboard uses a fixed palette, but it is still applied through CSS variables and theme tokens. A hardcoded hex or a raw Tailwind colour bypasses the token system and breaks consistency. See [docs/styling.md](docs/styling.md).

---

## Hard limits

| Thing                  | Limit                         |
| ---------------------- | ----------------------------- |
| File length            | 200 lines (hard stop: 300)    |
| Component length       | 150 lines                     |
| Function length        | 40 lines (hard stop: 60)      |
| Function parameters    | 3, then take an object        |
| Nesting depth          | 3                             |
| Props per component    | 7, then reconsider the design |
| `any` in source        | 0                             |
| Hand-written API types | 0                             |

Exceeding a limit means **split the component or extract the hook** — not raise the limit.

---

## How to work

1. **Read the existing code first.** Read the whole file you are about to change, plus neighbouring components in the same feature. Follow the patterns already there.
2. **Check whether a component already exists** before building one. This app has many near-identical tables and forms; duplicating one is a defect.
3. **Match the feature's conventions**, even where you would have chosen differently.
4. **Change only what was asked.** No drive-by refactors, no reformatting untouched lines.
5. **Do not add dependencies** without explicit approval. Most needs are already covered by TanStack Query, React Hook Form, Zod, date-fns, or shadcn/ui.
6. **Do not edit `components/ui/`** by hand — those are shadcn primitives. Wrap or compose instead.
7. **Do not create files that were not asked for** — no example pages, no barrel re-exports, no scaffolding for future work.
8. **Write no comments by default.** See [docs/code-quality.md](docs/code-quality.md).
9. **Verify in a browser at desktop width and at phone width** before reporting UI work finished. Type checks do not prove a feature works.

### When a rule blocks you

Stop and ask. Do not rationalise an exception, and do not silently work around it.

---

## Before you report work finished

Verify every line. Do not claim completion with an unchecked box.

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm lint` passes with zero warnings
- [ ] `pnpm test` passes
- [ ] No `any`, `as` (outside the allowed list), `!`, `@ts-ignore`, or `@ts-expect-error`
- [ ] No hand-written API types; generated client used
- [ ] No hardcoded colours; all styling via theme tokens
- [ ] No raw `<img>`/`<a>` — `next/image`/`next/link` used, no `eslint-disable` on their lint rules
- [ ] No business logic inside a component
- [ ] No component over 150 lines, no file over 300
- [ ] No comments that restate what the code does
- [ ] Loading, empty, and error states all handled — not just the success path
- [ ] **Checked in a browser at desktop width and at ~390px width**: layout works, no horizontal scroll
- [ ] No new dependencies, or approval obtained
- [ ] No files created beyond what the task required

If you could not verify something — particularly the browser check — **say which and why**. Never report UI work as done based on code that merely compiles.
