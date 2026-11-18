---
type: concept
title: Hub Vault Design System
status: active
tags:
  - design
created: 2026-07-27
last_updated: 2026-07-27T14:51
---

# Hub Vault — Design System

**Aesthetic:** Faded Ink. Dusty, desaturated dark. Every color slightly aged, nothing saturated, nothing corporate. Closer to a risograph print or self-published zine than a SaaS dashboard.

**Mood:** Private. Personal. A space built for yourself, not a product shipped to customers.

---

## Color Tokens

### Base

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#18161A` | Page background |
| `--color-surf-1` | `#221F25` | Primary surface — sidebar, topbar, cards |
| `--color-surf-2` | `#2C2830` | Nested surface — hover states, sub-cards |
| `--color-border` | `#4A4550` | Visible border — focus rings, strong dividers |
| `--color-border-dim` | `#3A3540` | Dim border — card edges, separators |

### Text

| Token | Hex | Role |
|---|---|---|
| `--color-text` | `#D8D3DC` | Primary text |
| `--color-muted` | `#8E8898` | Secondary / metadata text |
| `--color-faint` | `#5A5560` | Label caps, placeholders, disabled |

### Section Accents

Each vault section owns exactly one accent color. Do not use section colors interchangeably.

| Token | Hex | Section | Character |
|---|---|---|---|
| `--color-accent` | `#C17F74` | Home / primary action | Dusty rose-terracotta. Ink on aged paper. Drives all primary CTAs. |
| `--color-projects` | `#7EA8A0` | Projects | Dusty teal. Faded water, depth, ongoing work. |
| `--color-journal` | `#B8A86E` | Journal | Faded gold. Light on aged paper, time, reflection. |
| `--color-ideas` | `#9A8FBF` | Ideas | Dusty lavender. Imagination, not-yet-real things. |
| `--color-resources` | `#A08888` | Resources | Muted rose-grey. Preserved, stored, reference. |

### Accent Dim Variants (background tints at 12% opacity)

| Token | Value |
|---|---|
| `--color-accent-dim` | `rgba(193, 127, 116, 0.12)` |
| `--color-projects-dim` | `rgba(126, 168, 160, 0.12)` |
| `--color-journal-dim` | `rgba(184, 168, 110, 0.12)` |
| `--color-ideas-dim` | `rgba(154, 143, 191, 0.12)` |
| `--color-resources-dim` | `rgba(160, 136, 136, 0.12)` |

### Semantic Colors (functional)

| Token | Hex | Borrowed from | Use |
|---|---|---|---|
| `--color-success` | `#7EA8A0` | `--color-projects` | Completion, saved state |
| `--color-warning` | `#B8A86E` | `--color-journal` | Caution, attention needed |
| `--color-danger` | `#C17F74` | `--color-accent` | Destructive actions, errors |

---

## Section Color Map

| Section | Primary token | Dim token | Applied to |
|---|---|---|---|
| Home / primary | `--color-accent` | `--color-accent-dim` | Active nav, primary buttons, "New Session" CTA, Home stat card |
| Projects | `--color-projects` | `--color-projects-dim` | Projects nav, Projects stat card, project tags, "Open vault" links |
| Journal | `--color-journal` | `--color-journal-dim` | Journal nav, Journal stat card, entry metadata, Calendar today highlight |
| Ideas | `--color-ideas` | `--color-ideas-dim` | Ideas nav, Ideas stat card, idea capture button |
| Resources | `--color-resources` | `--color-resources-dim` | Resources nav, Resources stat card, resource type tags |
| Inbox | `--color-ideas` | `--color-ideas-dim` | Inbox nav badge (capture is pre-idea space) |
| Calendar today | `--color-journal` | `--color-journal-dim` | Today highlight (time-based, belongs to journal) |

---

## Typography

**Font stack:** `'Inter', system-ui, -apple-system, sans-serif`

### Type Scale

| Token | Value | Pixels | Used for |
|---|---|---|---|
| `--text-xs` | `0.65rem` | ~10px | Caps labels, badges, section headers |
| `--text-sm` | `0.75rem` | 12px | Metadata, timestamps, activity meta |
| `--text-base` | `0.82rem` | ~13px | Nav items, card body text |
| `--text-md` | `0.9rem` | ~14px | Project names, content titles |
| `--text-lg` | `1rem` | 16px | Section headings |
| `--text-xl` | `1.2rem` | ~19px | Page title |
| `--text-stat` | `1.7rem` | ~27px | Stat card values |

### Weight Scale

| Weight | Used for |
|---|---|
| 400 | Body text, metadata |
| 500 | Nav items, card titles, interactive labels |
| 600 | Section headings, stat labels, button text |
| 700 | Stat values, active nav item, logo mark |

### Label Caps Style

Used for: sidebar section headers (`WORKSPACE`, `QUICK ACCESS`), card titles (`PROJECTS`, `RECENT`).

```
font-size: var(--text-xs)
font-weight: 700
letter-spacing: 0.14em – 0.18em
text-transform: uppercase
color: var(--color-faint)
```

---

## Spacing

4px base unit. All spacing is a multiple of 4.

| Token | Value | Common use |
|---|---|---|
| `--space-1` | `4px` | Icon gap, tight internal padding |
| `--space-2` | `8px` | Nav item padding, badge padding |
| `--space-3` | `12px` | Card internal gaps |
| `--space-4` | `16px` | Card padding, grid gap |
| `--space-5` | `20px` | Section internal padding |
| `--space-6` | `24px` | Main content padding |
| `--space-8` | `32px` | Between sections |
| `--space-10` | `40px` | Large section breaks |
| `--space-12` | `48px` | Page-level vertical rhythm |

### Layout Constants

| Element | Value |
|---|---|
| Sidebar width | `220px` |
| Topbar height | `52px` |
| Card padding | `1rem 1.1rem` (16px / 17.6px) |
| Main content padding | `1.5rem` (24px) |
| Card grid gap | `1rem` (16px) |

---

## Border Radius

| Token | Value | Used for |
|---|---|---|
| `--radius` | `10px` | Cards, modals, main containers |
| `--radius-sm` | `6px` | Buttons, badges, nav items, inputs |
| `--radius-xs` | `4px` | Tags, inline chips |

---

## Component Rules

### Cards

- Background: `--color-surf-1`
- Border: `1px solid var(--color-border-dim)`
- Hover: border upgrades to `var(--color-border)`
- Stat cards: `border-left: 2px solid <section-color>` + `background: linear-gradient(135deg, <section-dim>, transparent)`

### Nav Items

| State | Background | Text color |
|---|---|---|
| Default | transparent | `--color-muted` |
| Hover | `--color-surf-2` | `--color-text` |
| Active | `--color-accent-dim` | `--color-accent` |

SVG icon opacity: 0.8 default, 1.0 on active.

### Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Ghost | transparent | `--color-muted` | `--color-border` | bg: `--color-surf-2`, text: `--color-text` |
| Primary | `--color-accent` | `--color-bg` | none | background lightened ~10% (`#CE9189`) |

### Badges (nav)

- Background: `--color-accent-dim`
- Text: `--color-accent`
- Font: `--text-xs`, weight 600
- Border-radius: `10px`

### Tags

- Active/section: `rgba(<section-color-rgb>, 0.15)` background, section color text
- Example active tag: `rgba(193,127,116,0.15)` bg, `--color-accent` text

### Capture Buttons

- Direction: column, centered, gap `0.35rem`
- Border: `1px solid var(--color-border-dim)`
- Hover: `--color-surf-2` bg, `--color-border` border
- Icon color maps: Note=`--color-accent`, Idea=`--color-ideas`, Session=`--color-accent`, Inbox=`--color-ideas`

---

## Design Principles

**Do:**
- Use tinted near-black/near-white — never pure `#000` or `#fff`
- Keep all accent colors desaturated — aged, not vivid
- Use border color progression for elevation (dim border → border), not shadows
- Map section colors consistently — one color per section, always
- Use SVG icons only, stroke-width 2, consistent family (Lucide / Heroicons)

**Avoid:**
- Saturated corporate colors (Tailwind blue-500, green-500, generic indigo)
- Shadows as primary elevation signals
- Rounded pill shapes — max radius is `--radius-sm` (6px)
- Emoji as icons
- Gray-on-gray text — minimum `--color-muted` on `--color-surf-1` (meets 3:1)
- Swapping section colors between sections
