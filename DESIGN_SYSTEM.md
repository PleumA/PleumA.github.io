# Design System

Component classes and design tokens for ระบบจัดตารางเวรอัตโนมัติ.

---

## Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#0d3b66` | Primary brand actions, links |
| `secondary` | `#faf0ca` | Light backgrounds, highlights |
| `accent` | `#f4a261` | Warnings, emphasis |
| `teal-600` | `#0d9488` | Main interactive / header |
| `emerald-600` | `#059669` | Header gradient midpoint |
| `indigo-600` | `#4f46e5` | Header gradient end, role badges |

Dark-mode variants use the `dark:` prefix and slate-800/900/950 backgrounds.

---

## Typography

- **Font**: [Sarabun](https://fonts.google.com/specimen/Sarabun) (Thai + Latin) — weights 300, 400, 500, 600, 700
- **Base size**: 16 px / `text-base`
- **Headings**: `font-bold text-slate-700 dark:text-slate-200`
- **Helper text**: `text-[11px] text-slate-500 dark:text-slate-400`
- **Labels**: `text-xs font-bold text-slate-600 dark:text-slate-400` (sentence case: Thai has no case, so all-caps would make English look heavier)

---

## Reusable Component Classes

### `.btn-primary`
> Confirm / Calculate actions

```html
<button class="bg-white text-teal-700 hover:bg-teal-50 dark:bg-slate-800 dark:text-teal-400
               font-bold py-3 px-6 rounded-xl shadow-sm active:scale-95 transition-all
               flex items-center gap-2">
  Label
</button>
```

### `.btn-ghost`
> Header icon buttons

```html
<button class="bg-white/10 hover:bg-white/20 border border-white/10 p-2.5 rounded-xl
               transition-all active:scale-95 text-white">
  <i data-lucide="icon" class="w-5 h-5" aria-hidden="true"></i>
</button>
```

### `.card`
> Configuration panels

```html
<div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm
            border border-slate-200/80 dark:border-slate-800 overflow-hidden">
  <!-- card header -->
  <div class="bg-slate-50/50 dark:bg-slate-800/40 px-5 py-4
              border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
    <h2 class="text-lg font-bold text-slate-700 dark:text-slate-200">Title</h2>
  </div>
  <!-- card body -->
  <div class="p-5 space-y-4">…</div>
</div>
```

### `.input`
> Text / number inputs

```html
<input class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800
              rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none
              text-slate-800 dark:text-slate-100">
```

### `.tag-chip`
> Doctor name tags inside the tag input

```html
<span class="inline-flex items-center gap-1 bg-teal-100 dark:bg-teal-900/40 text-teal-800
             dark:text-teal-300 text-xs font-bold px-2 py-0.5 rounded-full">
  Name
  <button aria-label="Remove Name">×</button>
</span>
```

### `.toggle`
> On/off toggle checkbox pair

```html
<input type="checkbox" class="toggle-checkbox …">
<label class="toggle-label …"></label>
```

### `.modal`
> Overlay modals (manual, edit schedule)

```html
<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl
              max-h-[90vh] overflow-y-auto">…</div>
</div>
```

### Fairness row (`#fairnessStrip`)
> Per-doctor totals above the schedule

```html
<span class="px-2.5 py-1 rounded-lg text-sm {doctor colour}">Name 5</span>
<span class="px-2.5 py-1 rounded-lg text-sm {doctor colour} ring-2 ring-amber-400">Name 8</span> <!-- outlier -->
<span class="ml-auto text-xs font-bold text-slate-500 dark:text-slate-400">Spread 5–8</span>
```
The doctor(s) furthest from the mean get `ring-2 ring-amber-400`; the right-aligned label shows min–max. Names are always `esc()`-ed. The per-doctor details table under it is a `<details open>` section.

### Settings panel (`#settingsPanel`)
> Inline column at >= 1024px, native popover below

A `<section popover="auto">` opened by the header button (`popovertarget="settingsPanel"`). At >= 1024px it is a normal, independently scrolling column. Below 1024px (when `:popover-open` is supported) it becomes a fixed left drawer: `width: min(340px, 100vw)`, `height: 100dvh`, scrollable, with a dimmed `::backdrop`. Its colours are set explicitly (light `#f8fafc` / `#1e293b`, dark `#0f172a` / `#f1f5f9`) because the top layer does not inherit page text colour. Rarely used groups ("Doctors per day", "Advanced rules") are collapsible `<details class="group">` cards.

### Phone schedule cards (< 768px)
Each `#scheduleTableBody tr` becomes a flex-wrap card: date and day on one line, duty chips underneath; the table header (`#scheduleTableHeader`) is hidden and `table` min-width is removed. The page header is not sticky on phones.

### Undo button (`#btnUndo`)
> Secondary toolbar button, hidden until there is something to undo

```html
<button id="btnUndo" class="hidden flex items-center justify-center gap-1.5 text-xs font-bold
        text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200
        dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2.5 rounded-xl">
  <i data-lucide="undo-2" class="w-4 h-4" aria-hidden="true"></i> <span data-i18n="undoBtn">…</span>
</button>
```
Sits before the rose-coloured Reset-all button; it carries `data-i18n-aria="undoBtn"`.

---

## Spacing Scale

All spacing follows Tailwind's default scale. Key layout values:
- **Card padding**: `p-5` (1.25 rem)
- **Card header padding**: `px-5 py-4`
- **Section gap**: `gap-6` / `space-y-6`
- **Input border radius**: `rounded-xl`
- **Button border radius**: `rounded-xl`

---

## Dark Mode

Applied via `darkMode: 'class'` — toggled by adding/removing `class="dark"` on `<html>`.
All dark variants use the `dark:` prefix.

**Contrast rule:** every light surface that gets a `dark:` background must also get a `dark:` text colour that reads on it (e.g. chips use `dark:bg-*-900/40` with `dark:text-*-300`). Only use real Tailwind shades (50-950); a nonexistent class such as `slate-150` compiles to nothing and leaves dark text on a dark background (`tests/tailwindClasses.test.js` guards this). Top-layer elements such as the popover panel set their own colours.

---

## Iconography

[Lucide Icons](https://lucide.dev) loaded via CDN, pinned (`unpkg.com/lucide@1.55.0`). Dynamic render loops use inline `<svg>` instead.
Always add `aria-hidden="true"` to decorative icons and `aria-label` to icon-only buttons.
