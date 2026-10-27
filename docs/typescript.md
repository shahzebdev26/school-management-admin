# Type Safety

The API is a separate repository. The type system is the only thing keeping this app's assumptions aligned with the API's reality. Treat it as a correctness tool, not a style preference.

---

## Compiler settings

These are non-negotiable in `tsconfig.json`:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true,
  "forceConsistentCasingInFileNames": true
}
```

Never weaken a flag to make code compile. Fix the code.

---

## Banned constructs

| Banned                       | Why                                              | Use instead                           |
| ---------------------------- | ------------------------------------------------ | ------------------------------------- |
| `any`                        | Disables all checking, silently and transitively | `unknown` + Zod parse, or a real type |
| `as` (type assertion)        | Lies to the compiler                             | Parse, narrow, or type-guard          |
| `!` (non-null assertion)     | Claims a guarantee the compiler could not verify | An explicit check or early return     |
| `@ts-ignore`                 | Hides the error and everything after it          | Fix the error                         |
| `@ts-expect-error`           | Same, with a nicer name                          | Fix the error                         |
| `React.FC`                   | Adds nothing, complicates generics and children  | Annotate props directly               |
| `object` / `Function`        | Mean almost nothing                              | A real shape or signature             |
| Implicit `any` on parameters | Unchecked input                                  | Annotate it                           |

There is no "just this once". If you believe you need one of these, stop and ask.

### The only permitted assertions

Two narrow exceptions, both requiring a one-line comment stating why:

```ts
const PORTALS = ['admin', 'school', 'teacher', 'parent', 'student'] as const
const theme = { radius: '0.5rem' } satisfies ThemeTokens
```

`as const` and `satisfies` are encouraged. They are not type assertions.

---

## API types are generated — never hand-written

This is the rule most likely to be broken and most expensive when it is.

```bash
pnpm generate:api   # regenerates src/lib/api/generated from the API's OpenAPI spec
```

```ts
// CORRECT
import type { School } from '@/lib/api/generated'

// WRONG — will drift from the API and fail at runtime, not compile time
interface School {
  id: string
  name: string
  subdomain: string
}
```

Rules:

- **Never edit anything under `src/lib/api/generated/`.** It is overwritten.
- **Never redeclare an API shape** locally, even partially, even "just for this prop".
- Need a subset? Derive it:

```ts
type SchoolListItem = Pick<School, 'id' | 'name' | 'subdomain' | 'status'>
```

- If a generated type is wrong, the **API's Zod schema** is wrong. Fix it there; do not patch locally.
- CI regenerates and fails if committed types differ. A failure means the API changed — regenerate and handle the change, never force the old types back.

### Business values come from the API

School metrics, usage analytics, and aggregate calculations are computed by the API and arrive typed. Recomputing them here produces two numbers that disagree.

---

## Parse at boundaries

Generated API types describe what the API _promises_. Everything else entering the app is `unknown` until validated: form input, URL params, `localStorage`, and anything from `window`.

```ts
// CORRECT — form input parsed by Zod via React Hook Form resolver
const form = useForm<OnboardSchoolInput>({ resolver: zodResolver(onboardSchoolSchema) })

// CORRECT — storage is untrusted and can be anything
const parsed = preferencesSchema.safeParse(JSON.parse(raw))
const preferences = parsed.success ? parsed.data : defaultPreferences
```

`localStorage` can hold stale data from an older version, can be absent in a private window, and can throw. Always parse it, always provide a default, always wrap access in `try/catch`.

### Zod is the single source of truth for form types

```ts
export const onboardSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required').max(200),
  subdomain: z.string().min(1, 'Subdomain is required'),
  adminName: z.string().min(1, 'Admin name is required'),
  adminPhone: z.string().regex(E164, 'Enter a valid phone number'),
})
export type OnboardSchoolInput = z.infer<typeof onboardSchoolSchema>
```

Never maintain a schema and an interface by hand.

---

## Component props

Annotate props explicitly. One interface per component, named `<Component>Props`.

```tsx
// CORRECT
interface SchoolCardProps {
  school: SchoolListItem
  onSelect: (id: string) => void
  isSelected: boolean
}

export function SchoolCard({ school, onSelect, isSelected }: SchoolCardProps) {}

// WRONG
export function SchoolCard(props: any) {}
export const SchoolCard: React.FC<SchoolCardProps> = (props) => {}
```

### Never spread unknown props

```tsx
// WRONG — anything can be passed, nothing is checked
;<Input {...props} />

// CORRECT — extend a known element type deliberately
interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  label: string
}
```

---

## Prefer unions over booleans

```ts
// WRONG — allows an impossible fourth state
{
  isLoading: boolean
  isError: boolean
}

// CORRECT
{
  status: 'idle' | 'loading' | 'success' | 'error'
}
```

Discriminated unions for variant data:

```ts
type AuditEntry =
  | { kind: 'school_created'; schoolName: string; createdAt: string }
  | { kind: 'admin_invited'; adminEmail: string; invitedAt: string }
```

---

## Events and errors

Type event handlers with React's types. Never `any`.

```tsx
function onChange(event: React.ChangeEvent<HTMLInputElement>): void {}
```

`catch` binds `unknown`. Narrow it; never cast it.

```ts
try {
  await mutate(input)
} catch (error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    /* ... */
  }
  throw error
}
```

---

## Checklist

- [ ] No `any`, `as`, `!`, `@ts-ignore`, or `@ts-expect-error` anywhere in the change
- [ ] No hand-written or redeclared API types; generated types imported or derived with `Pick`/`Omit`
- [ ] Nothing under `lib/api/generated/` edited
- [ ] Form types inferred from Zod schemas
- [ ] `localStorage` and URL input parsed with a default and wrapped in `try/catch`
- [ ] Props interface explicit, no `React.FC`, no unknown prop spreading
- [ ] `catch` blocks bind `unknown` and narrow
- [ ] `pnpm typecheck` passes with zero errors and no weakened compiler flags
