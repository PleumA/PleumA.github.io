# Workbench Layout Redesign: Design

**Date:** 2026-10-10
**Status:** Approved in conversation; written spec awaiting review
**Builds on:** `feat/calendar-export` (calendar export + frontend fixes). New branch `feat/workbench-layout`.

## Purpose

The organizers build each month's duty schedule by going back and forth: they change a setting, regenerate, check the table and the per-doctor totals, then hand-edit cells. Today the settings column runs to about 2,000px while the schedule gets roughly half the width and a 600px-tall table. Each pass therefore means scrolling between settings and results, and on phones the schedule comes after the whole form.

**Goal:** make the schedule the main thing on screen and keep the settings within reach without scrolling the page.

### Users and devices (from the user)
- **Main users:** one or a few organizers, mostly on a **laptop or iPad** (both landscape and portrait).
- **Phones:** some organizers use them, mainly to view or make small edits.
- **Workflow:** mostly settings → regenerate → check, plus hand edits in the table. The **Table** view is used for building and the **Person** view for checking fairness.

### Success criteria
1. On a laptop or iPad in landscape (≥1024px), you can change any setting and see the schedule and totals update without scrolling the page.
2. On an iPad in portrait or a phone (<1024px), the schedule is the first content below the header, and settings open in a panel without leaving the page.
3. On a phone (<768px), the table never scrolls sideways.
4. The app keeps working with no feature removed, and Thai/English and dark mode behave as they do today.

## Approach

**Approach A, "Workbench", built in three stages,** with the minimal-build rule applied: CSS and native HTML first, and no new JavaScript unless something requires it. Each stage is one commit that leaves the app working, so the work can stop after any stage.

| Breakpoint | Layout |
|---|---|
| ≥1024px (`lg`) | Settings pane and schedule pane side by side, each scrolling on its own |
| <1024px | Settings live in a native `popover` panel opened from the header; the schedule fills the page |
| <768px (`md`) | As above, and each table row is shown as a card |

## Stage 1: Two independently scrolling panes and collapsible settings

**Layout (≥1024px):**
- The two-column container below the header becomes a fixed-height workspace: height `100dvh` minus the header, with each column `overflow-y-auto`. The page itself no longer scrolls at this width.
- **Settings column:** fixed width of 340px (`lg:w-[340px] lg:shrink-0`).
- **Results column:** fills the rest (`flex-1 min-w-0`).
- **Schedule height:** the table's `max-h-[600px]` cap is removed, so the schedule uses the column's full height.

**Collapsible settings:**
- Each existing settings card becomes a native `<details>` element, with its current header as the `<summary>`. Cards keep their contents and order. Inputs are not moved between cards.

| Card (existing) | Default |
|---|---|
| Basic settings (month, doctors, roles, holidays) | open |
| Off requests | open |
| Doctors per day | closed |
| Advanced rules | closed |
| Lock special duty | closed |

**Unchanged in Stage 1:**
- The summary table stays above the schedule.
- Below 1024px, the layout stays as it is today.

**Not built (YAGNI):** remembering which sections are open. Add it if users ask.

## Stage 2: Fairness row and settings popover

**Fairness row** (all widths):
- **Placement:** it sits at the top of the results column, directly above the schedule toolbar.
- **Contents:** one chip per doctor, coloured with the existing `DOC_COLOR(doc)`, showing the doctor's total, e.g. `A 10`. It is rendered from `globalResult.summary`, the same data the summary table uses, so there is no new calculation.
- **Outlier:** the doctor whose total is furthest from the mean gets an amber outline (`ring-2 ring-amber-400`). If several tie, all of them get it. If every total is equal, nobody gets it.
- **Spread:** shown at the end of the row as `min–max`. The separate "spread" stat tile is **deleted**, leaving three tiles.
- **Details:** the full summary table moves into a `<details>` placed right under the row, labelled with a new translation key `summaryDetailsLabel` (th `รายละเอียดรายบุคคล`, en `Per-doctor details`), closed by default. Nothing is lost.
- **Not built:** tapping a chip to jump to the Person view. That view cannot show a single doctor, and adding that is new work.

**Settings popover (<1024px):**
- **Markup:** the settings column gets `id="settingsPanel"` and `popover="auto"`. A header button (`lg:hidden`) gets `popovertarget="settingsPanel"`, with a label from the new key `settingsBtn` (th `ตั้งค่า`, en `Settings`).
- **Behaviour the browser provides:** toggling, Escape to close, tapping outside to close, `aria-expanded`, and the top layer. No JavaScript.
- **Size:** 340px wide on iPad and full width on phones, full height, scrolling internally. Regenerating does not close it.
- **Desktop override:** at ≥1024px, CSS forces the same element back inline: `display: block`, static position, no top-layer styling. It is the **same element** at every width, so there is no duplicate set of inputs.
- **Fallback:** where `popover` is not supported (iOS 16 or older), the attribute is ignored and the panel shows inline above the schedule, as today. The header button is hidden with `@supports not selector(:popover-open)`.

## Stage 3: Phone cards

- **Schedule first:** this already happens, because Stage 2 moves the settings into the popover below 1024px.
- **Delete** the sticky "View schedule" button (`.mobile-view-btn` markup and CSS) and its `viewScheduleBtn` translation key, since it no longer has a purpose.
- **Rows as cards (<768px):** CSS-only changes in `renderTableView`.
  - The table drops its `min-w-[750px]` below `md` (`md:min-w-[750px]`).
  - Below `md`, `thead` is hidden and each `tr` is shown as a block card.
  - The date and day cells share one line; the duty cells and the note sit underneath. Uses Tailwind's `max-md:` variants.
  - The DOM, ids and handlers are unchanged, so hand-editing dropdowns and drag keep working.
- **Ceiling:** role labels (R1, R2) under the column headers aren't visible on phones. Add a role tag per chip if phone users miss them.
- **Not built:** a separate phone renderer or day-list view.

## Constraints (carried from the existing branch)

- No new npm dependencies and no ES modules.
- Only real Tailwind 3 classes. `tests/tailwindClasses.test.js` must keep passing.
- Every user-visible string goes in both `translations.th` and `translations.en`, with no `/ English` duplicates. `tests/translationsCopy.test.js` must keep passing.
- Keep the existing element ids and `onclick` handlers, including the calendar-export ones (`selectCalendarScope`, `btnCalendarApple`, `btnCalendarGoogle`, `calendarExportGroup`).
- `npm run build` runs and `dist/output.css` is committed in every stage, since GitHub Pages serves it as-is.
- `npm run lint` must show 0 errors and `npm test` must pass after every stage.
- Dark mode must stay readable in every new element.

## Testing

**New test file:** `tests/workbenchLayout.test.js`, using jsdom on `index.html` the same way `tests/calendarExportUI.test.js` loads the page. Each stage adds its own assertions:
- **Stage 1:** the five settings cards are `<details>` elements with the stated default `open` state, and the table no longer has `max-h-[600px]`.
- **Stage 2:**
  - `#settingsPanel` has `popover="auto"`, and the header button's `popovertarget` points to it.
  - Given a fixture `globalResult.summary` of totals `[10, 11, 10, 14]`, the fairness row renders 4 chips and only the doctor with 14 gets the amber ring.
  - When every total is equal, no doctor gets the ring.
  - The spread tile is gone.
- **Stage 3:** `.mobile-view-btn` is absent, and the rendered table rows carry the `max-md:` block classes.

**Visual check:** screenshots at 1440×900, 820×1180 (iPad portrait, popover open and closed) and 390×844, in light and dark mode, served by the injection server. Things to confirm:
- No horizontal page scroll at any width.
- At ≥1024px, both panes scroll independently.
- The popover opens, stays open while you edit, and closes on Escape and when you tap the schedule.

## Out of scope

- Remembering which sections are open.
- Chip-to-Person-view navigation.
- A dedicated phone renderer.
- Role tags on phone cards.
- Changes to the solver or any data handling.
