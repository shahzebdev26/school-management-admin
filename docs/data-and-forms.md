# Data Fetching & Forms

This app is heavily data-driven: school directories, analytics tables, audit logs, and admin management forms. Getting these two patterns right removes most of the work.

---

## Data fetching

### One rule: all server data goes through TanStack Query

No `fetch` in a component. No `useEffect` that loads data. No Zustand store holding API responses.

```tsx
// WRONG — no caching, no dedupe, no retry, races on re-render
useEffect(() => {
  fetch(`/v1/schools`).then(setSchools)
}, [])

// CORRECT
const { data, isPending, isError } = useSchoolsQuery(filters)
```

TanStack Query is the server-data cache. Zustand holds only small UI state.

### Query hooks live in `features/<feature>/api/`

One hook per endpoint, wrapping the generated client.

```ts
// features/schools/api/use-schools-query.ts
export function useSchoolsQuery(filters: SchoolFilters) {
  return useQuery({
    queryKey: schoolKeys.list(filters),
    queryFn: () => api.listSchools({ ...filters }),
  })
}
```

Components never call the generated client directly. Always go through a hook, so caching and invalidation stay in one place.

### Query keys are centralised and hierarchical

Scattered string-array keys make invalidation guesswork. Define a key factory per feature:

```ts
export const schoolKeys = {
  all: ['schools'] as const,
  list: (filters: SchoolFilters) => [...schoolKeys.all, 'list', filters] as const,
  detail: (id: string) => [...schoolKeys.all, 'detail', id] as const,
}
```

Hierarchy means invalidating `schoolKeys.all` clears every school query at once.

### Mutations invalidate; they do not hand-patch the cache

```ts
export function useOnboardSchoolMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.onboardSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.all })
    },
  })
}
```

Manual `setQueryData` is permitted only for optimistic updates, and then you must handle rollback in `onError`. Without rollback, a failed request leaves the UI showing data that does not exist.

### Never fetch inside a loop or a list item

A list of 50 schools must not mount 50 components that each fetch. Fetch the list once in the parent.

### Pagination is mandatory on list screens

No screen renders an unbounded collection. The API paginates; respect it.

---

## Loading and error states

Every data screen handles **loading, empty, error, success**. See [components.md](components.md).

- Use skeletons sized to the real content, not a centred spinner. Content that reflows on arrival feels broken.
- Error states offer a retry (`refetch`), never a dead end.
- `isPending` for first load; `isFetching` for background refresh — do not blank the screen on a background refetch.

---

## The app requires a connection

There is no offline support. Do not add persistence, background sync, or a service-worker data cache.

When a request fails because the device is offline, show a clear "You're offline — connect to continue" state rather than stale or empty data. Never let a failed request look like an empty result: an admin seeing "No schools found" when the request actually failed is a serious bug.

---

## Forms

### Always React Hook Form + Zod

Never hand-roll form state. Never `useState` per field.

```tsx
const form = useForm<OnboardSchoolInput>({
  resolver: zodResolver(onboardSchoolSchema),
  defaultValues: { name: '', subdomain: '' },
})
```

### Schemas live in `features/<feature>/schemas/`, types are inferred

```ts
export const onboardSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required').max(200),
  subdomain: z
    .string()
    .min(1, 'Subdomain is required')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  adminName: z.string().min(1, 'Admin name is required'),
  adminPhone: z.string().regex(E164, 'Enter a valid phone number'),
})
export type OnboardSchoolInput = z.infer<typeof onboardSchoolSchema>
```

Never maintain a schema and an interface by hand. See [typescript.md](typescript.md).

### Validation messages are written for admins, not developers

```ts
// WRONG
z.string().min(1) // "String must contain at least 1 character(s)"

// CORRECT
z.string().min(1, 'School name is required')
```

Messages must say what to do, not what failed.

### Server validation errors map back to fields

A 400 from the API must land on the relevant input, not in a toast the user has to interpret.

```ts
onError: (error) => {
  if (error instanceof ApiValidationError) {
    for (const [field, message] of Object.entries(error.fieldErrors)) {
      form.setError(field as keyof OnboardSchoolInput, { message })
    }
    return
  }
  toast.error('Something went wrong. Please try again.')
}
```

### Disable submit while submitting

Every mutation button disables on `isPending` and shows progress. Otherwise a double-click creates two records.

### Never submit to a Next route handler

Forms submit through a TanStack Query mutation to the Express API. See [architecture.md](architecture.md).

### Confirm destructive actions

Deactivating a school, removing an admin, or any irreversible action goes through `ConfirmDialog` with a specific message naming what will happen. Never a generic "Are you sure?".

---

## Checklist

- [ ] All server data via TanStack Query; no `fetch` or data `useEffect` in components
- [ ] Query hook lives in `features/<feature>/api/`; components do not call the generated client
- [ ] Query keys come from a centralised factory
- [ ] Mutations invalidate the right keys; optimistic updates roll back on error
- [ ] No fetching inside a loop or list item; list screens paginated
- [ ] Loading, empty, error, success all handled; errors offer retry
- [ ] Offline failure shows an offline state, never an empty result
- [ ] Forms use React Hook Form + Zod with inferred types
- [ ] Validation messages are plain language with a next action
- [ ] Server field errors mapped back onto inputs
- [ ] Submit disabled while pending
- [ ] Destructive actions confirmed with a specific message
