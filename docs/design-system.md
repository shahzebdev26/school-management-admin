# Design System

The admin dashboard's visual direction follows **theme C: bright and bold** — the same direction as `school-management-web`: a lightly tinted page, white cards lifted by long soft shadows, rounded geometry, a gradient primary action, and one friendly geometric typeface. It should feel like a modern internal tool that is also a serious management platform.

Read [styling.md](styling.md) for the rules, this file for the values and the reasoning behind them.

---

## No per-school branding — fixed platform palette

Unlike `school-management-web`, the admin dashboard does not fetch a school's brand colour. The CSS variables are **hardcoded** to the platform default: **hue 200, chroma 0.16** (a vivid teal-blue).

There is no branding provider, no subdomain detection, and no dynamic palette. The `--brand-h` and `--brand-c` values are set once in `globals.css` and never change at runtime.

The same OKLCH token system, type scale, geometry, status colours, and component recipes from `school-management-web` apply here. The only difference is that the brand values are static.

---

## Colour

### OKLCH token system

The same OKLCH-based token ramp used in `school-management-web`, but with fixed brand values rather than dynamic ones.

| Token                 | Stop      | Used for                                                          |
| --------------------- | --------- | ----------------------------------------------------------------- |
| `--primary`           | brand-600 | Primary buttons (top of the gradient), links, selected controls   |
| `--primary-strong`    | brand-700 | Bottom of the primary gradient, pressed state                     |
| `--accent`            | brand-100 | Soft fills: secondary buttons, icon bubbles, selected rows, chips |
| `--accent-foreground` | brand-800 | Text and icons on an accent fill                                  |

### Neutrals carry the brand hue

Page, text, muted text, borders and control edges all carry the platform hue at a small fraction of the brand chroma, identical to the `school-management-web` system:

| Token                    | Lightness | Chroma (x brand chroma)         |
| ------------------------ | --------- | ------------------------------- |
| `--background`           | 0.965     | x 0.09 (= 0.014 at the default) |
| `--foreground`           | 0.22      | x 0.19 (= 0.03)                 |
| `--muted-foreground`     | 0.45      | x 0.19                          |
| `--input` (control edge) | 0.62      | x 0.19                          |
| `--border`               | 0.91      | x 0.10                          |

Cards, popovers and toasts stay pure white.

### Status colours are fixed

Status never derives from the brand. Identical to `school-management-web`:

| Token         | Hue           | Why                                                              |
| ------------- | ------------- | ---------------------------------------------------------------- |
| `success`     | **teal**, 175 | Not green. Red/green is indistinguishable for ~8% of male users. |
| `warning`     | orange, 65    | Separable under all three common colour-blindness types          |
| `destructive` | red, 25       |                                                                  |
| `info`        | blue, 245     |                                                                  |

**Status never rides on colour alone.** `StatusBadge` renders an icon _and_ a text label.

### Contrast floors

Enforce **WCAG 2.2**: 4.5:1 for body text, 3:1 for large text and UI components.

- `--border` is a quiet separator. It may be faint because it carries no meaning.
- `--input` is the edge of a control. It must clear 3:1 against the surface it sits on.

---

## Typography

### Plus Jakarta Sans, self-hosted

One family, from 200 to 800. Weight and tracking carry the hierarchy.

- **`tnum`** — tabular figures. Without it an analytics table cannot align.

### Type scale

| Use             | Size                       | Weight  | Tracking                      |
| --------------- | -------------------------- | ------- | ----------------------------- |
| Page title      | 24px mobile / 30px desktop | **800** | -0.03em                       |
| Section heading | 18px                       | **700** | -0.02em                       |
| Body            | 15px                       | 400-500 | 0                             |
| Label           | 14px                       | **700** | 0                             |
| Secondary       | 13px                       | 500     | 0                             |
| Table header    | 12px                       | **700** | +0.01em, muted, not uppercase |
| Table cell      | 14px                       | 500     | 0                             |
| Numeric cell    | 14px                       | 600     | 0, `tabular`, right-aligned   |
| Stat figure     | 30-36px                    | **800** | -0.03em, `tabular`            |
| **Any input**   | **16px minimum on mobile** |         |                               |

Rules:

- **16px is the floor for inputs on mobile.** Below it, iOS zooms the viewport on focus. Desktop may use 15px.
- **Never below 13px for data.** 12px is for table headers and captions only.
- Every column of digits gets `.tabular`. `DataTable` applies it to any column marked `numeric`.

---

## Icons — lucide-react

Same as `school-management-web`. Chosen because shadcn's primitives hardcode `from "lucide-react"`.

Icons are drawn at stroke width 2 (1.75 at 24px and above), rounded caps and joins.

### Renames that will break your build

| Old         | New            |
| ----------- | -------------- |
| `Filter`    | **`Funnel`**   |
| `Building2` | **`Building`** |

**Never mix icon libraries.** It doubles bytes and mismatched stroke weights read as sloppy.

---

## Geometry, elevation, focus

### Radius

| Token          | Value | Used for                                       |
| -------------- | ----- | ---------------------------------------------- |
| `rounded-sm`   | 8px   | Small chips, checkbox, table-cell controls     |
| `rounded-md`   | 12px  | Inputs, selects, menu items, small buttons     |
| `rounded-lg`   | 16px  | Buttons, popovers, dropdown and select content |
| `rounded-xl`   | 24px  | Cards, dialogs, sheets, large tiles            |
| `rounded-full` | ---   | Badges, status pills, avatars, switches, tabs  |

Nothing is sharper than 8px.

### Elevation

Surfaces are separated by **layering and soft shadow, not borders**.

| Token             | Used for                                                              |
| ----------------- | --------------------------------------------------------------------- |
| `shadow-xs`       | Small controls that need a hint of lift                               |
| `shadow-sm`       | Rows that are cards, stat tiles at rest                               |
| `shadow-md`       | Cards, tables, the standard content surface                           |
| `shadow-overlay`  | Anything floating over content: dialog, popover, dropdown, toast      |
| `shadow-glow`     | The primary button only: an inset highlight and a brand-coloured glow |
| `shadow-hairline` | A 1px edge where a flat surface genuinely needs one                   |

Inputs, table rows and badges never carry a drop shadow.

### Focus

**No focus rings, outlines or border changes on focus or press.** `globals.css` removes them globally, and no component adds a ring, glow or border colour change.

- Inputs, selects and textareas signal focus with a quiet **background shift** only (`bg-background` to `bg-card`) and the caret.
- Everything else shows no focus treatment at all.

---

## Controls and row heights

| Control          | Height                     |
| ---------------- | -------------------------- |
| Button `default` | **44px**                   |
| Button `lg`      | 48px                       |
| Button `sm`      | 36px                       |
| Button `xs`      | 28px (dense toolbars only) |
| Input, Select    | 44px                       |
| Textarea         | min 96px                   |
| Checkbox         | 24px box in a >=44px row   |
| Switch           | 52 x 32px                  |

Row heights:

| Situation                                                  | Row height                             |
| ---------------------------------------------------------- | -------------------------------------- |
| The **row itself** is tappable (school list, admin list)   | **48px** mobile / 40px desktop         |
| The row is **data** and controls inside it are the targets | **52px**, each control a >=42px target |

---

## Recipes

How the shared look is built. All of it uses tokens; none uses a colour literal.

| Part               | Recipe                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Primary button     | `bg-linear-to-b from-primary to-primary-strong text-primary-foreground shadow-glow`, hover `brightness-110`           |
| Secondary button   | `bg-accent text-accent-foreground`                                                                                    |
| Outline button     | `border-[1.5px] border-input bg-card`                                                                                 |
| Destructive button | `bg-destructive text-destructive-foreground`                                                                          |
| Input              | `h-[52px] rounded-lg border-[1.5px] border-input bg-background`; focus: `bg-card` only; invalid: `border-destructive` |
| Card               | `rounded-xl bg-card shadow-md`                                                                                        |
| Soft icon bubble   | `rounded-full bg-accent text-accent-foreground`                                                                       |
| Badge / status     | `rounded-full`, solid `*-bg` fill with `*-text`, always an icon and a label                                           |
| Overlay            | `rounded-xl bg-popover shadow-overlay`, scrim `bg-foreground/40 backdrop-blur-sm`                                     |

---

## The four states

Every data screen handles **loading, empty, error, success**. Non-negotiable; see [components.md](components.md).

- **Under 1 second, show no indicator at all.** Don't flash a skeleton.
- **Skeleton** for a full predictable layout. **Spinner** for a single module or a user-initiated action. **Spinner, not skeleton, for search** — variable result counts make a skeleton misleading.
- **Size skeletons to the real row count.** A skeleton showing 3 rows when 10 arrive causes a layout shift worse than no skeleton.
- Never let a skeleton persist indefinitely — swap to the error state.
- An error state must distinguish **offline** from **request failed**.

---

## Shared components

In `src/components/shared/`. Check here before building anything similar — duplicating a directory table is a defect.

| Component     | Purpose                                                 |
| ------------- | ------------------------------------------------------- |
| `Screen`      | Page shell: title, description, actions                 |
| `DataTable`   | Directory tables, audit log, analytics breakdowns       |
| `EmptyState`  | Says what is absent and how to populate it              |
| `ErrorState`  | Distinguishes offline from failure; offers retry        |
| `StatusBadge` | Status with icon **and** label, never colour alone      |
| `StatTile`    | Dashboard metrics with label, value, and optional trend |

### Do not mark shared components `'use client'`

`DataTable` and `ErrorState` deliberately omit the directive. They use no hooks, so they inherit their importer's context.

Adding `'use client'` breaks function props across the boundary.

---

## Desktop first, mobile responsive

The admin dashboard is desktop-primary. Design at full width first, then verify on narrow viewports. Unlike `school-management-web`, there is no attendance-marking-on-a-phone scenario — but the dashboard must still be usable on a tablet or phone in a pinch.
