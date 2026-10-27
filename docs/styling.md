# Styling & Theming

Every colour, size, and shape comes from theme tokens. The admin dashboard uses a fixed platform palette, but the token system is identical to `school-management-web` so the two codebases stay consistent.

---

## Colours come from theme tokens, never literals

The palette is applied as CSS variables on the document root. A hardcoded colour bypasses the token system.

```tsx
// WRONG — ignores the token system entirely
<div className="bg-blue-600 text-white">
<div style={{ backgroundColor: '#1B3E6F' }}>

// CORRECT — follows the token system
<div className="bg-primary text-primary-foreground">
```

### Banned in component code

- Any hex, `rgb()`, or `hsl()` literal
- Raw Tailwind palette colours (`bg-blue-600`, `text-red-500`, `border-slate-200`)
- Inline `style` for colour

### The token set

Defined once in `src/app/globals.css`. Full list and reasoning in [design-system.md](design-system.md).

`background` . `foreground` . `card` . `popover` . `primary` . `secondary` . `muted` . `accent` . `success` . `warning` . `destructive` . `info` . `border` . `input` . `ring` . `brand-50...950` . `chart-1...5`

Each has a `-foreground` pair where text sits on it. Use the pair — never guess that white text works on the primary colour.

### Semantic status colours

School status, admin status, and audit log severity use `success` . `warning` . `destructive` . `info`. Never reach for `green-600` in one place and `emerald-500` in another.

These are **fixed and tenant-independent**.

**`success` is teal, not green.** Red/green is indistinguishable for roughly 8% of male users.

**Never convey status by colour alone.** Use `StatusBadge`, which renders an icon and a text label structurally — see [components.md](components.md).

---

## No per-school branding

Unlike `school-management-web`, this dashboard has no branding provider and no subdomain detection. The CSS variables are hardcoded to the platform default (hue 200, chroma 0.16) in `globals.css`. There is no dynamic manifest and no school logo in the app bar.

---

## Shape, elevation and focus

The values live in [design-system.md](design-system.md); the rules are:

- **Surfaces are separated by layering and soft shadow, not borders.** A card is `rounded-xl bg-card shadow-md`. Do not add `border` to a card to make it stand out; use the elevation token.
- **Only cards and floating overlays carry a drop shadow.** Inputs, table rows and badges never do.
- **Pick radius from the scale** (`rounded-sm` 8, `md` 12, `lg` 16, `xl` 24, `full`). No arbitrary radii.
- **No focus rings, outlines or border changes on focus or press.** `globals.css` removes them globally, and components must not add `ring-*`, `outline-*`, `focus:border-*` or glow shadows. Inputs show focus with a background shift only. See [design-system.md](design-system.md#focus) for the accessibility trade-off.
- **A control's edge must clear 3:1** against its surface: use `border-input`, not `border-border`, on anything the user interacts with.

---

## Light only

The app has one theme. There is no dark mode: no theme switcher, no `prefers-color-scheme` handling, no `data-theme` attribute and no `dark:` utilities. See [design-system.md](design-system.md).

Rules:

- **Every token is defined once, on bare `:root`.** Nothing is defined inside a media query or attribute selector.
- `:root` sets `color-scheme: light`, so browsers and OS "force dark" features cannot invert native controls.
- `body` sets an explicit background from a token.
- Do not write `dark:` classes, and do not add a dark variant.

---

## Tailwind usage

- Utility classes in JSX. No CSS modules, no styled-components, no `@apply` in component styles.
- `@apply` is acceptable only in `globals.css` for genuine primitives.
- Use `cn()` (clsx + tailwind-merge) for conditional classes — never string concatenation, which produces duplicate conflicting utilities.

```tsx
// CORRECT
<div className={cn('rounded-md p-4', isSelected && 'ring-2 ring-ring')} />

// WRONG — later class may not win
<div className={`rounded-md p-4 ${isSelected ? 'ring-2' : ''}`} />
```

- Never build class names dynamically from variables — Tailwind cannot see them at build time:

```tsx
// WRONG — class is not generated
;<div className={`bg-${color}-500`} />

// CORRECT — a lookup of complete class strings
const STATUS_CLASS = { active: 'bg-success', inactive: 'bg-destructive' } as const
```

- Long class lists are a smell. More than ~12 utilities on one element usually means a subcomponent is waiting to be extracted.

---

## Layout

- **Flex and grid with `gap`.** Not per-element margins, which collapse and double unpredictably.
- Side gutter of at least 16px at every width, set once on an outer wrapper.
- Let rows wrap or stack to one column at phone width.
- Give any flex or grid child holding text or a table `min-width: 0`, so long content wraps instead of pushing the page wider.
- `max-width: 100%` on images and any `aspect-ratio` box.
- Nothing gets a `min-width` wider than the screen.

### Never allow horizontal page scroll

Tables, wide diagrams, and code blocks scroll **inside their own `overflow-x-auto` container**. The page body never scrolls sideways.

---

## Typography

- One type scale, defined in the Tailwind config. Do not introduce one-off sizes.
- Running text near 65 characters wide.
- `text-wrap: balance` on headings.
- Minimum 14px for body text on mobile; 16px for inputs, since iOS zooms on focus for anything smaller.

---

## Spacing

Use the Tailwind spacing scale. No arbitrary values (`p-[13px]`) without a specific reason stated in a comment. Arbitrary spacing accumulates into a UI where nothing aligns.

---

## Desktop first, mobile responsive

Design at desktop width first, then verify on narrow viewports. The admin dashboard is used primarily on laptops.

- Tap targets at least **24px** (WCAG 2.5.8 AA)
- Sidebar collapses on narrow viewports
- Avoid hover-only affordances — tablet users have no hover
- Respect `prefers-reduced-motion`

---

## Checklist

- [ ] No hex, `rgb()`, `hsl()`, or raw Tailwind palette colour in component code
- [ ] All colours via semantic tokens, using the correct `-foreground` pair
- [ ] Every token defined once on bare `:root`; no `dark:` utilities
- [ ] Status never conveyed by colour alone
- [ ] `cn()` used for conditional classes; no dynamically constructed class names
- [ ] Layout uses flex/grid with `gap`; no page-level horizontal scroll
- [ ] Wide tables scroll inside their own container
- [ ] Inputs at least 16px to avoid iOS zoom
- [ ] No focus ring, outline or border change on focus or press
- [ ] Control edges use `border-input` (3:1), not `border-border`
- [ ] Cards use the elevation tokens, not a 1px border
- [ ] Verified at desktop width and at ~390px
