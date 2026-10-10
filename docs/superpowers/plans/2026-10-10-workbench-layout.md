# Workbench Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the schedule the main thing on screen. On wide screens, settings stay alongside it in a narrower pane with the rarely used sections collapsed. Below 1024px, settings move into a native popover panel. On phones, the table never scrolls sideways.

**Architecture:** Use CSS and native HTML first (`<details>`, `popover`). The one addition to `app.js` is a small fairness-row renderer that reuses the existing per-doctor summary data, plus one line that closes the panel when an iPad rotates. Ship three stages, one task each; every stage leaves the app working.

**Tech Stack:** Vanilla JS (plain `<script>` files), Tailwind CSS 3 compiled to the committed `dist/output.css`, Node test scripts with jsdom (`npm test`), ESLint 8 and Prettier.

**Spec:** `docs/superpowers/specs/2026-10-10-workbench-layout-design.md`

## Deviations from the spec (rulings; please confirm when you review)

1. **Stage 1 is smaller than the spec says.** On wide screens (≥1024px), both columns already have a fixed height and scroll independently (`lg:h-[calc(100vh-150px)] lg:overflow-y-auto` in `index.html`). Stage 1 only narrows the settings column, removes the 600px cap on the schedule views, and adds the collapsible sections.
2. **Only two cards collapse:** "Doctors per day" and "Advanced rules". The other three headers contain their own controls: Basic settings has the export/import buttons, Off requests has the Add button, and Lock special duty has an on/off switch. A `<summary>` cannot contain buttons; that is nested interactive content and breaks both clicking and screen readers. Basic settings and Off requests were meant to start open anyway. Lock special duty already shows and hides its section with its switch.
3. **The "View schedule" button is deleted in Stage 2, not Stage 3.** It sits inside the settings column. Once that column becomes the popover, the button would appear inside the panel.
4. **Phone cards are plain CSS rules in `index.html`'s `<style>` block,** not `max-md:` classes inside `renderTableView`. This keeps the change in one place, and it also covers cells that `updateTargetedCellDOM()` re-renders after a hand edit.
5. **One line of JavaScript was added (Stage 2):** close the settings panel when the window widens past 1024px, for example when an iPad rotates. Without it, an open popover would keep floating over the inline layout.

## Global Constraints

- No new npm dependencies. No ES modules.
- Only real Tailwind 3 classes. `tests/tailwindClasses.test.js` must keep passing.
- Every user-visible string goes in both `translations.th` and `translations.en`, with no `/ English` duplicates. `tests/translationsCopy.test.js` must keep passing.
- Keep the existing element ids and `onclick` handlers, including the calendar-export ones (`selectCalendarScope`, `btnCalendarApple`, `btnCalendarGoogle`, `calendarExportGroup`).
- Every stage runs `npm run build` and commits `dist/output.css`, because GitHub Pages serves it as-is.
- After every stage: `npm run lint` shows 0 errors (`npm run lint:fix` formats) and `npm test` passes.
- Dark mode must stay readable in every new element.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Branch `feat/workbench-layout`, created from `feat/calendar-export` HEAD by the controller before Task 1.

## Review Focus

1. **Typing in the open settings panel (<1024px):** every change triggers an automatic regenerate. The panel must stay open; only a tap outside it, Escape or the button closes it. Checked by screenshot in Task 2.
2. **Rotating an iPad from portrait to landscape with the panel open:** the panel must snap back inline, not float. This is the one-line `matchMedia` handler in Task 2, checked by a 1440px screenshot after resizing.
3. **A doctor's name containing HTML in the fairness row:** it must render as text. Covered by a Task 2 test.
4. **All doctors with equal totals:** no amber outline; a single doctor also gets none. Covered by a Task 2 test.
5. **Phone (390px) with role or shift columns:** no sideways scroll, and a day with no note shows no empty strip. Checked by screenshot in Task 3.

**Visual check tool (all tasks):** the controller provides `inject_server.py` in the plan workspace.
- Start it with `python3 -I <workspace>/inject_server.py <repo>`. It serves `http://127.0.0.1:8766/?dark=true|false&lang=th|en` and skips the first-visit manual and the service worker. If port 8766 is already in use, an existing server is serving the current files; just use it.
- Take a screenshot with `google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --user-data-dir=<fresh tmp dir> --virtual-time-budget=8000 --window-size=W,H --screenshot=<out>.png "<url>"`.
- Inspect **full-resolution crops** with Python PIL. Downscaled full-page images hide layout bugs.

**jsdom harness used by `tests/workbenchLayout.test.js`:** this is the same setup as `tests/calendarExportUI.test.js`. Read that file's first ~60 lines and copy its JSDOM setup verbatim: it strips the Tailwind config script, uses `runScripts: 'dangerously'`, mocks `lucide`, and loads `structuredInputs.js`, `translations.js`, `calendarExport.js` and `app.js` as script elements.

---

### Task 1: Narrower settings pane, full-height schedule, collapsible rarely used cards

**Files:**
- Modify: `index.html` (the `<main id="main-content">` container; the two `<section>` columns; the "Doctors per day" and "Advanced rules" cards; the three view containers that carry `max-h-[600px]`)
- Create: `tests/workbenchLayout.test.js`
- Modify: `dist/output.css` (rebuild)

**Interfaces:**
- Produces: `tests/workbenchLayout.test.js`, with a `runTest` helper and a jsdom `window` and `document`. Tasks 2 and 3 append tests before its final summary lines.

- [ ] **Step 1: Write the failing test.** Create `tests/workbenchLayout.test.js`. Start it with the jsdom harness copied from `tests/calendarExportUI.test.js` (described above), so `window` and `document` are defined and the four scripts are loaded. Then add:

```js
let totalTests = 0;
let passedTests = 0;
function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`✅ [PASSED] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`❌ [FAILED] ${name}`);
        console.error(err);
    }
}

const cardOf = (key) => document.querySelector(`[data-i18n="${key}"]`).closest('details, div.rounded-2xl');

runTest('rarely used cards are collapsible and start closed', () => {
    ['docsPerDay', 'advSettings'].forEach((key) => {
        const card = document.querySelector(`[data-i18n="${key}"]`).closest('details');
        assert.ok(card, `${key} card is not a <details>`);
        assert.strictEqual(card.open, false, `${key} should start closed`);
        assert.ok(card.querySelector(':scope > summary [data-i18n="' + key + '"]'), `${key} title must be in <summary>`);
    });
});

runTest('cards with header controls stay plain (no controls inside a summary)', () => {
    ['basicSettings', 'offRequests', 'lockSpecial'].forEach((key) => {
        assert.strictEqual(document.querySelector(`[data-i18n="${key}"]`).closest('details'), null, key);
    });
    document.querySelectorAll('summary').forEach((s) => {
        assert.strictEqual(s.querySelector('button, input, select, a'), null, 'interactive control inside <summary>');
    });
});

runTest('settings pane is 340px wide and the schedule views have no 600px cap', () => {
    assert.ok(cardOf('basicSettings').closest('section').className.includes('lg:w-[340px]'));
    ['tableViewContainer', 'calendarViewContainer', 'personViewContainer'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) assert.ok(!el.className.includes('max-h-[600px]'), `${id} still capped`);
    });
});

console.log(`\nPASSED: ${passedTests}/${totalTests}, FAILED: ${totalTests - passedTests}`);
if (passedTests !== totalTests) process.exit(1);
```

Before running, check the ids of the calendar and person view containers in `index.html`. They are the `<div>`s after `#tableViewContainer` that carry `max-h-[600px]`. Use their real ids in the list above. If one has no id, give it the id named above.

- [ ] **Step 2: Run it and confirm it fails.** Run `node tests/workbenchLayout.test.js`. Expected: 1/3 passes ("cards with header controls stay plain") and 2 fail. The `<details>` assertion fails, and so do the `lg:w-[340px]` and cap assertions.

- [ ] **Step 3: Implement.**
  1. **Main container.** In `<main id="main-content" ...>`, replace `grid grid-cols-1 lg:grid-cols-12 gap-8` with `flex flex-col lg:flex-row gap-8`. Keep its other classes.
  2. **Settings `<section>`** (the first one). Replace `lg:col-span-4` with `lg:w-[340px] lg:shrink-0`. Remove `lg:flex-shrink-0` if present, since it duplicates `lg:shrink-0`.
  3. **Results `<section>`** (the second one). Replace `lg:col-span-8` with `lg:flex-1 lg:min-w-0`.
  4. **View containers.** Remove `max-h-[600px]` from the three schedule view containers (table, calendar, person).
  5. **"Doctors per day" card.** Change its outer `<div class="bg-white ... rounded-2xl ...">` to `<details class="group bg-white ... (same classes)">`, and its closing `</div>` to `</details>`. Change the header `<div class="bg-slate-50/50 ... flex items-center gap-2">` to `<summary class="(same classes) cursor-pointer list-none [&::-webkit-details-marker]:hidden">`, with a matching `</summary>`. Inside the summary, after the `<h2>`, add `<i data-lucide="chevron-down" class="w-4 h-4 ml-auto text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true"></i>`.
  6. **"Advanced rules" card** (`data-i18n="advSettings"`). Apply the same change.
  7. Leave the Basic settings, Off requests and Lock special duty cards unchanged.

- [ ] **Step 4: Run the tests, lint and build.** Run `node tests/workbenchLayout.test.js && npm run lint:fix && npm run lint && npm test && npm run build`. Expected: 3/3 pass, lint shows 0 errors, and all suites pass.

- [ ] **Step 5: Check visually.**
  - **1440×900, light and dark:** the settings pane is visibly narrower and the schedule wider. "Doctors per day" and "Advanced rules" show closed with a chevron, and clicking one opens it. Before clicking, take a screenshot; to check the open state, add `open` in a scratch copy, or describe the closed state only.
  - **820×1180 and 390×844:** stacked as before, with nothing broken.
  - **No horizontal page scroll** at any width.
  - Put the screenshot paths and what you saw in the report.

- [ ] **Step 6: Commit.**

```bash
git add index.html tests/workbenchLayout.test.js dist/output.css
git commit -m "feat(layout): narrower settings pane, full-height schedule, collapsible rare settings"
```

---

### Task 2: Fairness row and the settings popover

**Files:**
- Modify: `index.html` (stat tiles: delete the spread tile, 4→3 columns; summary card: add `#fairnessStrip`, wrap the table in `<details>`; settings `<section>`: `id`/`popover`; header: add `#btnSettings`; `<style>`: popover CSS; delete the mobile "View schedule" button and its CSS)
- Modify: `app.js` (`updateStatsDashboard`: remove the `statSpread` lines; new `renderFairnessStrip`, called from `renderSummaryTable`; one `matchMedia` line in the init code)
- Modify: `translations.js` (add `settingsBtn` and `summaryDetailsLabel`; delete `viewScheduleBtn`)
- Modify: `tests/translationsCopy.test.js` (remove the "mobile View Schedule button is translated" test)
- Modify: `tests/workbenchLayout.test.js` (append tests)
- Modify: `dist/output.css` (rebuild)

**Interfaces:**
- Consumes: `globalResult.summary` (an array of `{ name: string, total: number, ... }`), `DOC_COLOR(name)`, `esc(str)`, and `translations[currentLang].statsSpread`, all existing.
- Produces: `renderFairnessStrip(summary)`, which writes into `#fairnessStrip`; the element `#settingsPanel` (`popover="auto"`); and `#btnSettings` (`popovertarget="settingsPanel"`).

- [ ] **Step 1: Write the failing tests.** Append these tests to `tests/workbenchLayout.test.js`, before the summary lines:

```js
runTest('settings column is a native popover opened by the header button', () => {
    const panel = document.getElementById('settingsPanel');
    assert.ok(panel, '#settingsPanel missing');
    assert.strictEqual(panel.getAttribute('popover'), 'auto');
    assert.ok(panel.querySelector('[data-i18n="basicSettings"]'), 'panel must be the settings column');
    const btn = document.getElementById('btnSettings');
    assert.strictEqual(btn.getAttribute('popovertarget'), 'settingsPanel');
    assert.ok(btn.className.includes('lg:hidden'));
});

runTest('spread tile and View schedule button are gone; new keys exist in th and en', () => {
    assert.strictEqual(document.getElementById('statSpread'), null);
    assert.strictEqual(document.querySelector('.mobile-view-btn'), null);
    const t = window.eval('translations');
    ['settingsBtn', 'summaryDetailsLabel'].forEach((k) => assert.ok(t.th[k] && t.en[k], k));
    assert.strictEqual(t.th.viewScheduleBtn, undefined);
});

const strip = () => document.getElementById('fairnessStrip');
const chips = () => [...strip().querySelectorAll('span.rounded-lg')];

runTest('fairness row: one chip per doctor, ring only on the furthest from the mean', () => {
    window.renderFairnessStrip([
        { name: 'A', total: 10 },
        { name: 'B', total: 11 },
        { name: 'C', total: 10 },
        { name: 'D', total: 14 },
    ]);
    assert.strictEqual(chips().length, 4);
    const ringed = chips().filter((c) => c.className.includes('ring-amber-400')).map((c) => c.textContent.trim());
    assert.deepStrictEqual(ringed, ['D 14']);
    assert.ok(strip().textContent.includes('10–14'), 'spread min–max shown');
});

runTest('fairness row: equal totals or a single doctor → no ring', () => {
    window.renderFairnessStrip([
        { name: 'A', total: 10 },
        { name: 'B', total: 10 },
    ]);
    assert.strictEqual(chips().filter((c) => c.className.includes('ring-amber-400')).length, 0);
    window.renderFairnessStrip([{ name: 'A', total: 7 }]);
    assert.strictEqual(chips().filter((c) => c.className.includes('ring-amber-400')).length, 0);
});

runTest('fairness row: names render as text (no HTML injection), empty summary clears it', () => {
    window.renderFairnessStrip([{ name: '<img src=x onerror=alert(1)>', total: 3 }]);
    assert.strictEqual(strip().querySelector('img'), null);
    window.renderFairnessStrip([]);
    assert.strictEqual(strip().innerHTML, '');
});

runTest('full summary table lives in a closed <details>', () => {
    const d = document.getElementById('summaryTableBody').closest('details');
    assert.ok(d, 'summary table not inside <details>');
    assert.strictEqual(d.open, false);
});
```

- [ ] **Step 2: Run it and confirm it fails.** Run `node tests/workbenchLayout.test.js`. Expected: the 3 Task 1 tests pass and the 6 new tests fail.

- [ ] **Step 3: Implement.**
  1. **Translations.** In `translations.js`, add `settingsBtn: 'ตั้งค่า'` and `summaryDetailsLabel: 'รายละเอียดรายบุคคล'` to `th`, and `settingsBtn: 'Settings'` and `summaryDetailsLabel: 'Per-doctor details'` to `en`. Delete `viewScheduleBtn` from both blocks.
  2. **Copy test.** In `tests/translationsCopy.test.js`, delete the whole `runTest('mobile View Schedule button is translated', ...)` block.
  3. **Delete the "View schedule" button.** In `index.html`, delete the `<!-- Mobile View Schedule Button -->` `<div class="sticky bottom-4 ... mobile-view-btn ...">…</div>` and its CSS in `<style>` (the `/* Mobile View Schedule Button */` rule and its `@media (max-width: 1023px)` block).
  4. **Settings panel.** Add `id="settingsPanel" popover="auto"` to the settings `<section>`.
  5. **Header button.** Add this as the first button in the header's button row, before `#btnDarkMode`:

```html
                <button popovertarget="settingsPanel" id="btnSettings"
                    class="lg:hidden bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-2.5 rounded-xl transition-all active:scale-95 text-white flex items-center justify-center gap-1.5 font-bold text-sm">
                    <i data-lucide="sliders-horizontal" class="w-5 h-5" aria-hidden="true"></i>
                    <span data-i18n="settingsBtn">ตั้งค่า</span>
                </button>
```

  6. **Popover CSS.** Add to `<style>`, where the deleted mobile-button CSS was:

```css
        /* Settings: inline column at ≥1024px, native popover panel below */
        @supports selector(:popover-open) {
            @media (max-width: 1023px) {
                #settingsPanel:not(:popover-open) {
                    display: none;
                }
                #settingsPanel:popover-open {
                    position: fixed;
                    inset: 0 auto 0 0;
                    margin: 0;
                    border: 0;
                    width: min(340px, 100vw);
                    height: 100dvh;
                    max-height: none;
                    overflow-y: auto;
                    padding: 1rem;
                    background: #f8fafc;
                    box-shadow: 0 10px 40px rgb(0 0 0 / 0.25);
                }
                .dark #settingsPanel:popover-open {
                    background: #0f172a;
                }
                #settingsPanel::backdrop {
                    background: rgb(15 23 42 / 0.3);
                }
            }
        }
        @supports not selector(:popover-open) {
            #btnSettings {
                display: none;
            }
        }
        /* At ≥1024px undo the browser's [popover] defaults so the column sits inline */
        @media (min-width: 1024px) {
            #settingsPanel {
                position: static;
                inset: auto;
                margin: 0;
                border: 0;
                padding: 0;
                background: transparent;
                color: inherit;
            }
        }
```

  The display and size at ≥1024px still come from the section's existing Tailwind classes (`lg:block lg:w-[340px] lg:h-[calc(100vh-150px)] lg:overflow-y-auto`). Author styles override the browser's built-in `[popover]` defaults.

  7. **Rotation handler.** In `app.js`, inside the existing `DOMContentLoaded` init handler, add one line:

```js
    // An open settings popover must not float over the inline layout after an iPad rotates to landscape
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => e.matches && document.getElementById('settingsPanel')?.hidePopover?.());
```

  8. **Stat tiles.** In `index.html`, delete the whole fourth stat tile (the one containing `data-i18n="statsSpread"` and `id="statSpread"`), and change `#statsDashboard`'s `md:grid-cols-4` to `md:grid-cols-3`. In `updateStatsDashboard()` in `app.js`, delete the lines that write `statSpread`, plus any `minVal`/`maxVal` computation used only by them. Read the function first and keep anything else that uses those values.
  9. **Summary card.** In the summary card in `index.html`:
     - Directly after its header `<div>` (the one containing `data-i18n="summaryTitle"`), insert `<div id="fairnessStrip" class="flex flex-wrap items-center gap-2 px-6 py-3"></div>`.
     - Wrap the existing `<div class="overflow-x-auto p-2">…</div>` (which contains the table) in:

```html
                    <details class="border-t border-slate-100 dark:border-slate-800">
                        <summary class="px-6 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer" data-i18n="summaryDetailsLabel">รายละเอียดรายบุคคล</summary>
                        <!-- existing overflow-x-auto table div here, unchanged -->
                    </details>
```

  10. **Fairness renderer.** In `app.js`, add right after `renderSummaryTable`:

```js
// Compact per-doctor totals; the doctor(s) furthest from the mean get an amber ring
function renderFairnessStrip(summary) {
    const strip = document.getElementById('fairnessStrip');
    if (!strip) return;
    if (!summary || summary.length === 0) {
        strip.innerHTML = '';
        return;
    }
    const totals = summary.map((s) => s.total);
    const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
    const maxDev = Math.max(...totals.map((t) => Math.abs(t - mean)));
    const chipsHtml = summary
        .map((s) => {
            const ring = maxDev > 0 && Math.abs(s.total - mean) === maxDev ? ' ring-2 ring-amber-400' : '';
            return `<span class="px-2.5 py-1 rounded-lg text-sm ${DOC_COLOR(s.name)}${ring}">${esc(s.name)} ${s.total}</span>`;
        })
        .join('');
    strip.innerHTML = `${chipsHtml}<span class="ml-auto text-xs font-bold text-slate-500 dark:text-slate-400">${esc(translations[currentLang].statsSpread)} ${Math.min(...totals)}–${Math.max(...totals)}</span>`;
}
```

  At the end of `renderSummaryTable(config)`, after the table body is written, add `renderFairnessStrip(globalResult.summary);`. Add `renderFairnessStrip` to `.eslintrc.cjs` `globals` only if lint flags it. It is used inside `app.js` itself, so it should not.

- [ ] **Step 4: Run the tests, lint and build.** Run `node tests/workbenchLayout.test.js && node tests/translationsCopy.test.js && npm run lint:fix && npm run lint && npm test && npm run build`. Expected: 9/9 and the copy suite pass, lint shows 0 errors, and all suites pass.

- [ ] **Step 5: Check visually.** Static screenshots can't click, so for the open popover state add `?open=1` support **in a scratch copy of the inject server only** (it injects `document.getElementById('settingsPanel').showPopover()` after load), or describe the closed state and rely on the attribute tests.
  - **1440×900, light and dark:** the fairness row shows above the schedule with a ring on the outlier, there are three stat tiles, the "Per-doctor details" section is closed, and there is no Settings button.
  - **820×1180:** the Settings button is in the header and the schedule is the first content. With the panel open, it is 340px wide on the left over a dimmed backdrop.
  - **390×844:** with the panel open, it is full width.
  - **Dark mode:** the panel background is dark.
  - Put the screenshot paths and what you saw in the report.

- [ ] **Step 6: Commit.**

```bash
git add index.html app.js translations.js tests/translationsCopy.test.js tests/workbenchLayout.test.js dist/output.css
git commit -m "feat(layout): fairness row, settings popover below 1024px; drop spread tile and View schedule button"
```

---

### Task 3: Phone cards for the schedule table

**Files:**
- Modify: `index.html` (`<style>`: one `@media (max-width: 767px)` block)
- Modify: `tests/workbenchLayout.test.js` (append one test)
- Modify: `dist/output.css` (rebuild; expected to be unchanged, since no classes change. Commit it only if it changed.)

**Interfaces:**
- Consumes: the existing ids `#tableViewContainer`, `#scheduleTableHeader` (the `<thead>`) and `#scheduleTableBody` (the `<tbody>`). Check both ids in `index.html` before writing the CSS. The note cell is the last `<td>` of each row (`id="note-day-N"`); it is empty when a day has no note.

- [ ] **Step 1: Write the failing test.** Append before the summary lines:

```js
runTest('phone CSS turns table rows into cards without sideways scroll', () => {
    const css = [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n');
    const m = css.match(/@media \(max-width: 767px\) \{([\s\S]*?)\n {8}\}/);
    assert.ok(m, 'no @media (max-width: 767px) block');
    const block = m[1];
    assert.ok(/#tableViewContainer table\s*\{[^}]*min-width:\s*0/.test(block), 'table min-width not reset');
    assert.ok(/#scheduleTableHeader\s*\{[^}]*display:\s*none/.test(block), 'header not hidden');
    assert.ok(/#scheduleTableBody tr\s*\{[^}]*display:\s*flex/.test(block), 'rows not flex cards');
    assert.ok(/#scheduleTableBody td:empty\s*\{[^}]*display:\s*none/.test(block), 'empty note cell not hidden');
});
```

- [ ] **Step 2: Run it and confirm it fails.** Run `node tests/workbenchLayout.test.js`. Expected: the new test fails with `no @media (max-width: 767px) block`.

- [ ] **Step 3: Implement.** Add to `<style>` in `index.html`, at the same 8-space indentation as the other rules so the test's block regex matches:

```css
        /* Phones: each schedule row becomes a card; date + day on one line, duties underneath */
        @media (max-width: 767px) {
            #tableViewContainer table {
                min-width: 0;
            }
            #scheduleTableHeader {
                display: none;
            }
            #scheduleTableBody tr {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
            }
            #scheduleTableBody td {
                display: block;
                padding: 0;
            }
            #scheduleTableBody td:nth-child(n + 3) {
                flex: 1 1 40%;
            }
            #scheduleTableBody td:empty {
                display: none;
            }
        }
```

  If Prettier or the editor reflows `nth-child(n + 3)`, either form is fine. The `/* ponytail: */`-style ceiling is already recorded in the spec: role labels aren't visible on phone cards.

- [ ] **Step 4: Run the tests, lint and build.** Run `node tests/workbenchLayout.test.js && npm run lint:fix && npm run lint && npm test && npm run build`. Expected: 10/10 pass, lint shows 0 errors, and all suites pass.

- [ ] **Step 5: Check visually.**
  - **390×844, light and dark, Table view:** each day is a card with the date and day on one line and the duty chips below. There is no horizontal scroll, either on the page or inside the table container. A day with no note shows no empty strip.
  - **Role-based and shift-based mode:** turning each on in a scratch copy, or describing the default role-based demo, still gives no sideways scroll.
  - **1440×900:** the table is unchanged.
  - Put the screenshot paths and what you saw in the report.

- [ ] **Step 6: Commit.**

```bash
git add index.html tests/workbenchLayout.test.js
git diff --quiet dist/output.css || git add dist/output.css
git commit -m "feat(layout): schedule rows become cards on phones"
```
