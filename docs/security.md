# Security

This app manages every school on the platform, controls admin accounts, and can view-as any user. A compromised admin session is a platform-wide incident.

**The client is not a security boundary.** Everything here reduces risk and prevents mistakes; the API enforces authorisation.

---

## Client-side permission checks are cosmetic

Hiding a button is a convenience for the user, never a control.

```tsx
// Correct use — reduce confusion
{
  can('schools:deactivate') && <DeactivateButton />
}
```

Rules:

- **Never rely on the UI to prevent an action.** Anyone can call the API directly.
- **Never hide data client-side that the user should not have received.** If a junior admin must not see audit logs, the API must not send them. Filtering in the browser means the data was already on their device.
- If you find yourself filtering a response for authorisation reasons, the API endpoint is wrong. Report it rather than patching it here.

---

## Host isolation

The admin dashboard is served at `admin.techsparks.co`, fully isolated from school subdomains (`*.techsparks.co`).

- The session cookie is **host-scoped** to `admin.techsparks.co` only. It is not a wildcard cookie on `.techsparks.co`, so it is never sent to a school subdomain.
- The admin dashboard and the school-facing app share no cookies, no storage, and no client-side state.
- The API proxy preserves the `Host` header so the backend can distinguish admin requests from school requests.

---

## View-as handoff

A platform admin can view a school's context by entering view-as mode. This does **not** share a cookie or session with `school-management-web`. Instead:

1. The admin dashboard requests a **single-use ticket** from the API.
2. The API returns a short-lived, single-use token embedded in a redirect URL to `school-management-web`.
3. The admin's browser navigates to `school-management-web`, which consumes the ticket and establishes a separate, scoped session.
4. The ticket expires after one use or after a short TTL (whichever comes first).

Rules:

- **Never cache or display the handoff URL.** It is single-use and time-limited.
- **Never allow the admin to copy the handoff URL.** Navigate programmatically.
- **The view-as session on `school-management-web` is scoped** — it shows the impersonation banner and limits actions according to the API's rules. The admin dashboard is not involved once the handoff completes.
- **Exiting view-as on `school-management-web` returns to the admin dashboard.** The admin's original session on `admin.techsparks.co` is untouched.

---

## Tokens and sessions

- The session lives in an `httpOnly` cookie set by the API, scoped to `admin.techsparks.co`. **The app never reads, stores, or forwards a token.**
- **Never put a token in `localStorage`, `sessionStorage`, or a global variable.** An XSS bug then becomes full account takeover.
- Never log a token, a password, or a full admin record.
- On 401, the API client (`lib/api/client.ts`) tries one silent refresh and replays the original request before giving up. Concurrent 401s share a single refresh call — the refresh token rotates on every use, so presenting it twice at once would revoke the whole chain.
- If the refresh also fails, clear the query cache and redirect to login. Stale cached data must not remain visible after a session ends.

```ts
// On logout or 401
queryClient.clear()
```

---

## Secrets

- **No secret in this repository.** It is a browser app; anything bundled is public.
- Only `NEXT_PUBLIC_*` variables are available client-side, and anything named that way **is published**. Never put a key, token, or connection string behind that prefix.
- Validate environment variables with Zod at startup, in one place.

---

## Rendering user content

School names, admin names, and audit log details may contain user-authored text.

- React escapes text by default. Keep it that way.
- **`dangerouslySetInnerHTML` is banned** unless the content is sanitised with a vetted library immediately before rendering, and the reason is stated in a comment.
- Never render user content into an `href`, `src`, or `style`.
- Validate that any user-supplied URL uses `https:` before rendering it as a link.

---

## Audit log

Every admin action is logged server-side. The admin dashboard displays audit logs but does not generate them — the API records them.

- Do not attempt to log actions client-side. The API is the single source of truth.
- Display audit entries as read-only. There is no client-side edit or delete of audit records.

---

## External links and embeds

- External links use `rel="noopener noreferrer"`.
- Do not embed third-party iframes, widgets, analytics, or fonts beyond what is already approved.

---

## Dependencies

- **No new dependency without approval.** Every package ships to every user's browser and is a supply-chain risk.
- Pin exact versions for anything security-relevant.

---

## Checklist

- [ ] No authorisation decision relies on client code
- [ ] No response filtered client-side for authorisation reasons
- [ ] No token read, stored, or logged; session left to the `httpOnly` cookie
- [ ] Session cookie host-scoped to `admin.techsparks.co`, not a wildcard
- [ ] View-as uses a single-use ticket, not cookie sharing
- [ ] `queryClient.clear()` on logout and on 401
- [ ] No secret in the repo; nothing sensitive behind `NEXT_PUBLIC_*`
- [ ] User content rendered as text; no `dangerouslySetInnerHTML`
- [ ] No user content in `href`, `src`, or `style`
- [ ] No new dependencies, or approval obtained
