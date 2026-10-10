# Frontend Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the frontend review findings. Some Tailwind classes don't exist, which breaks dark-mode contrast and padding. The Thai UI mixes in English. The export toolbar splits apart on phones. The duty chips are hard to read. There are also a few layout glitches.

**Architecture:** These are UI-only edits in the existing plain-script app. Markup lives in `index.html`. Rendered HTML strings come from `app.js`. Copy lives in `translations.js`. The CSS is a compiled Tailwind build (`dist/output.css`, served as-is by GitHub Pages), so every task that changes classes rebuilds and commits it. Each task leaves one regression test.

**Tech Stack:** Vanilla JS, Tailwind CSS 3 (compiled with `npm run build`), Node test scripts plus jsdom (`npm test`), ESLint 8 + Prettier.

**Spec:** The frontend review given in this conversation on 2026-10-10. Its findings: #1 nonexistent Tailwind classes; #2 hard-coded English in Thai mode; #3 the toolbar wrapping on phones; #4 the schedule chips and wrapping; #5 competing export buttons; #6 tiny stat labels, the header wrapping on phones, the "กะ"/"เวร" unit mismatch, and an empty band in the "Doctors per day" card.

## Global Constraints

- No new npm dependencies. No ES modules.
- `npm run lint` (0 errors) and `npm test` (all suites pass) after every task. Run `npm run lint:fix` for Prettier formatting.
- If a task changes or adds any class, run `npm run build` and commit `dist/output.css` in that same task. The page loads the committed CSS.
- Use only real Tailwind 3 default shades: 50, 100, 200, …, 900, 950. Half-step spacing exists only for 0.5, 1.5, 2.5 and 3.5.
- Every user-visible string goes in both `translations.th` and `translations.en`.
- Keep the element ids and `onclick` handlers the tests rely on: `selectCalendarScope`, `btnCalendarApple`, `btnCalendarGoogle`, `exportToExcel()` and `copyScheduleForExcel()`.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## Review Focus

1. **Dark mode after the remap:** a class with no dark variant inherits the light colour. After Task 1, check the summary "Total" header, the weekday rows and the holiday badges in dark mode (screenshot).
2. **Language toggle:** after Task 2, switching to EN and back must change every label it touches. No Thai string may still contain a `/ English` duplicate. The Task 2 test pins this.
3. **Toolbar on a 390px screen:** the scope select must stay on the same row as Apple and Google. The Task 3 test pins the shared parent; the screenshot checks the wrap.
4. **Many doctors:** with 8+ doctors, chip colours cycle through `DOC_COLORS`. Every entry must keep readable contrast in both themes (Task 4).
5. **Role-mode toggling:** turning role-based mode on and off must not leave an empty bordered band or a missing divider in "Doctors per day" (Task 3).

**Visual check tool (all tasks):** `python3 -I <workspace>/inject_server.py <repo>` serves the repo on `http://127.0.0.1:8766/?dark=true|false&lang=th|en`. It skips the first-visit manual and the service worker. Take a screenshot with:
`google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --user-data-dir=<tmpdir> --virtual-time-budget=8000 --window-size=1440,2400 --screenshot=<out>.png "<url>"`
Use `--window-size=390,5200` for a phone. The controller gives the workspace path in each dispatch.

---

### Task 1: Replace nonexistent Tailwind classes

**Files:**
- Modify: `index.html`, `app.js` (all occurrences)
- Create: `tests/tailwindClasses.test.js`
- Modify: `dist/output.css` (rebuild)

**Interfaces:** Produces nothing new. Later tasks rely on a source tree with no invalid classes, which this test enforces from then on.

- [ ] **Step 1: Write the failing test.** Create `tests/tailwindClasses.test.js`:

```js
// Guards against Tailwind classes that don't exist (they compile to nothing and silently break styling).
const fs = require('fs');
const assert = require('assert');

const FILES = ['index.html', 'app.js', 'structuredInputs.js', 'translations.js', 'calendarExport.js'];
const COLORS =
    'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const SHADES = new Set(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']);
const colorRe = new RegExp(`(?:^|[\\s"'\`:])(?:[a-z-]+:)*[a-z]+-(?:${COLORS})-(\\d+)(?=[\\s"'\`/]|$)`, 'g');
const halfRe = /(?:^|[\s"'`:])(?:[a-z-]+:)*(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|w|h)-(\d+\.5)(?=[\s"'`]|$)/g;

const bad = [];
for (const f of FILES) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(colorRe)) if (!SHADES.has(m[1])) bad.push(`${f}: ${m[0].trim()}`);
    for (const m of src.matchAll(halfRe)) {
        if (!['0.5', '1.5', '2.5', '3.5'].includes(m[1])) bad.push(`${f}: ${m[0].trim()}`);
    }
}

try {
    assert.deepStrictEqual(bad, [], `Nonexistent Tailwind classes:\n${bad.join('\n')}`);
    console.log('✅ [PASSED] no nonexistent Tailwind shade/spacing classes');
    console.log('\nPASSED: 1/1, FAILED: 0');
} catch (err) {
    console.error('❌ [FAILED] no nonexistent Tailwind shade/spacing classes');
    console.error(err.message);
    console.log('\nPASSED: 0/1, FAILED: 1');
    process.exit(1);
}
```

- [ ] **Step 2: Run it and confirm it fails.** Run `node tests/tailwindClasses.test.js`. Expected: FAIL, listing about 52 occurrences (`dark:text-slate-350`, `dark:border-slate-850`, `p-4.5`, `dark:text-slate-550`, `dark:text-orange-305`, `text-orange-850`, `text-*-650`, `dark:bg-slate-850/NN`, …).

- [ ] **Step 3: Replace each class.** Use this mapping. Keep any prefix (`dark:`, `hover:`) and any opacity suffix (`/20`) as they are.

| Invalid | Replace with | Why |
|---|---|---|
| `slate-350` | `slate-300` | lighter text on dark backgrounds |
| `slate-550` | `slate-500` | |
| `slate-650` | `slate-600` | |
| `slate-850` | `slate-800` | borders and backgrounds |
| `orange-305` | `orange-300` | |
| `orange-850` | `orange-800` | |
| `violet-650`, `teal-650`, `red-650`, `emerald-650`, `indigo-650` | the same colour at `-700` | text on light backgrounds; 700 keeps contrast |
| `p-4.5` | `p-4` | manual section cards |

If the test reports anything not in this table, round to the nearest real shade in the direction that raises contrast against that element's background, and list it in your report.

- [ ] **Step 4: Run the tests and lint, and rebuild the CSS.** Run `node tests/tailwindClasses.test.js && npm run lint:fix && npm run lint && npm test && npm run build`. Expected: the new test passes, lint shows 0 errors, and all suites pass.

- [ ] **Step 5: Check visually.** Take screenshots at `?dark=true&lang=th` (desktop) and of the first-visit manual. For the manual, use a fresh `--user-data-dir` and the plain `python3 -m http.server` (port 8765) so the modal shows. In dark mode the summary "Total" header, the weekday dates and day names, and the "Holiday" badges must be clearly readable. The manual's sections must have inner padding. Describe what you saw in the report.

- [ ] **Step 6: Commit.**

```bash
git add index.html app.js tests/tailwindClasses.test.js dist/output.css
git commit -m "fix(ui): replace nonexistent Tailwind classes breaking dark-mode contrast and padding"
```

---

### Task 2: Thai copy without English duplicates, and a single unit word

**Files:**
- Modify: `translations.js` (`th` block)
- Modify: `index.html` (the mobile "View Schedule" button around line 706; fallback text inside elements whose `data-i18n` keys change)
- Create: `tests/translationsCopy.test.js`

**Interfaces:**
- Produces: a new translation key `viewScheduleBtn` in `th` (`'ดูตาราง'`) and in `en` (`'View schedule'`).

**Ruling carried in the plan:** a short English gloss in parentheses after a Thai technical term stays, for example `(Role-Based)`, `(Off)` or `(Balance Workload)`. Thai clinicians use these terms. Only full ` / English` duplicates are removed.

- [ ] **Step 1: Write the failing test.** Create `tests/translationsCopy.test.js`:

```js
const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

const ctx = {};
vm.runInNewContext(fs.readFileSync('translations.js', 'utf8') + '\nthis.t = translations;', ctx);
const t = ctx.t;
const html = fs.readFileSync('index.html', 'utf8');

let total = 0;
let passed = 0;
function runTest(name, fn) {
    total++;
    try {
        fn();
        console.log(`✅ [PASSED] ${name}`);
        passed++;
    } catch (err) {
        console.error(`❌ [FAILED] ${name}`);
        console.error(err.message);
    }
}

runTest('Thai strings carry no " / English" duplicate', () => {
    const dupes = Object.entries(t.th)
        .filter(([, v]) => typeof v === 'string' && /\s\/\s*[A-Za-z]{3,}/.test(v))
        .map(([k, v]) => `${k}: ${v}`);
    assert.deepStrictEqual(dupes, []);
});

runTest('strength options are Thai-only in th', () => {
    ['strengthLow', 'strengthMedium', 'strengthHigh'].forEach((k) =>
        assert.ok(!/[A-Za-z]/.test(t.th[k]), `${k} = ${t.th[k]}`)
    );
});

runTest('th uses one unit word for shifts (เวร)', () => {
    assert.strictEqual(t.th.shiftsUnit, 'เวร');
});

runTest('mobile View Schedule button is translated', () => {
    assert.ok(t.th.viewScheduleBtn && t.en.viewScheduleBtn);
    assert.ok(html.includes('data-i18n="viewScheduleBtn"'));
    assert.ok(!html.includes('ดูตาราง / View Schedule'));
});

console.log(`\nPASSED: ${passed}/${total}, FAILED: ${total - passed}`);
if (passed !== total) process.exit(1);
```

- [ ] **Step 2: Run it and confirm it fails.** Run `node tests/translationsCopy.test.js`. Expected: the first three tests fail and list `ruleShiftBased`, `ruleSoftAlternate`, `ruleSoftAlternateDesc`, `alternateStrengthLabel`, `singlePoolQuotasLabel`, `singlePoolQuotasDesc` and the strength keys. The last test fails because the key is missing.

- [ ] **Step 3: Implement.** In the `th` block, set these values:

```js
        ruleShiftBased: 'โหมดจัดเวร 3 ผลัด',
        ruleSoftAlternate: 'สลับเวรอัตโนมัติ',
        ruleSoftAlternateDesc: 'ลดการทำงานร่วมกันซ้ำๆ ของกลุ่มเดิม',
        alternateStrengthLabel: 'ความเข้มของการสลับ',
        strengthLow: 'ต่ำ',
        strengthMedium: 'กลาง',
        strengthHigh: 'สูง',
        shiftsUnit: 'เวร',
        viewScheduleBtn: 'ดูตาราง',
```

Add `viewScheduleBtn: 'View schedule',` to the `en` block. For `singlePoolQuotasLabel` and `singlePoolQuotasDesc`, and any other key the test flags, keep the Thai half and remove the ` / English` part. In `index.html`, change the button text to `📋 <span data-i18n="viewScheduleBtn">ดูตาราง</span>`. Update the fallback text inside the elements for the keys above so it matches the new Thai values. That text is what shows before `applyTranslations()` runs.

- [ ] **Step 4: Run the tests and lint.** Run `node tests/translationsCopy.test.js && npm run lint:fix && npm run lint && npm test`. Expected: 4/4 pass, lint shows 0 errors, and all suites pass. Check that no existing test asserted the old strings. If one does, update it to the new value and list it in the report.

- [ ] **Step 5: Commit.**

```bash
git add translations.js index.html tests/translationsCopy.test.js
git commit -m "fix(i18n): drop English duplicates from Thai copy; one unit word; translate View schedule"
```

---

### Task 3: Toolbar grouping, header, stat labels, empty band

**Files:**
- Modify: `index.html` (results toolbar near the `exportToExcel()` button; header CTA; stat tiles; `#customSlotsContainer`)
- Modify: `app.js` (`toggleRoleBasedUI()`, around line 333)
- Modify: `tests/calendarExportUI.test.js` (one added test)
- Modify: `dist/output.css` (rebuild)

**Interfaces:**
- Consumes: the element ids from the Global Constraints (unchanged).
- Produces: a wrapper `<div id="calendarExportGroup">` that contains `#selectCalendarScope`, `#btnCalendarApple` and `#btnCalendarGoogle`.

**Ruling carried in the plan:** review item #5 suggested one "Export" dropdown. Instead the controls are grouped visually: `[Copy table][.xlsx]` and then `[scope ▾][Apple][Google]`, each group kept together. This adds no new JavaScript, keeps the existing tests and keyboard access, and fixes the split controls on phones.

- [ ] **Step 1: Write the failing test.** Append before the summary lines of `tests/calendarExportUI.test.js`:

```js
runTest('scope select and both calendar buttons share one group (never split on wrap)', () => {
    const group = document.getElementById('calendarExportGroup');
    assert.ok(group, '#calendarExportGroup missing');
    ['selectCalendarScope', 'btnCalendarApple', 'btnCalendarGoogle'].forEach((id) =>
        assert.strictEqual(document.getElementById(id).parentElement, group, `${id} not in group`)
    );
});
```

- [ ] **Step 2: Run it and confirm it fails.** Run `node tests/calendarExportUI.test.js`. Expected: the new test fails with `#calendarExportGroup missing`.

- [ ] **Step 3: Implement.**
  1. **Toolbar.** The export controls currently sit in `<div class="flex flex-wrap items-center gap-2 justify-end font-sans">`. Change that container's classes to `flex flex-wrap items-center gap-2 justify-start sm:justify-end font-sans`. Wrap `#btnClearOverrides`, the `copyScheduleForExcel()` button and the `exportToExcel()` button in `<div class="flex flex-wrap items-center gap-2">`. Wrap the `<label for="selectCalendarScope">`, `#selectCalendarScope`, `#btnCalendarApple` and `#btnCalendarGoogle` in `<div id="calendarExportGroup" class="flex items-center gap-2">`. That group is `flex` without wrap, so it moves as one unit.
  2. **Header CTA.** Add `whitespace-nowrap` to the header "calculate" button (the one with `data-i18n="calcBtn"` or its parent button) so it stays on one line at 390px.
  3. **Stat tile labels.** In the four stat tiles at the top of the results, the small grey label text uses an `text-[9px]`/`text-[10px]` class. Change it to `text-xs`. Find the tiles by the translation keys used inside them. If they're rendered from `app.js` (`updateStatsDashboard`), change it there.
  4. **Empty band.** In role-based mode both `#defaultSlotsContainer` and `#singlePoolQuotaContainer` are hidden. `#customSlotsContainer` still keeps `border-t pt-4`, which draws a divider above nothing. In `toggleRoleBasedUI()`, after the existing show/hide logic, add:

```js
    const customSlotsContainer = document.getElementById('customSlotsContainer');
    if (customSlotsContainer) {
        const nothingAbove = ['defaultSlotsContainer', 'singlePoolQuotaContainer'].every(
            (id) => document.getElementById(id)?.classList.contains('hidden') ?? true
        );
        customSlotsContainer.classList.toggle('border-t', !nothingAbove);
        customSlotsContainer.classList.toggle('pt-4', !nothingAbove);
    }
```

  First read `toggleRoleBasedUI()` and confirm which containers it hides. If `singlePoolQuotaContainer` is toggled somewhere else (for example `toggleShiftBasedUI`), call this same block from there too, or put it in one small named function that both call. Do not paste it twice.

- [ ] **Step 4: Run the tests, lint and build.** Run `node tests/calendarExportUI.test.js && npm run lint:fix && npm run lint && npm test && npm run build`. Expected: 9/9 pass, lint shows 0 errors, and all suites pass.

- [ ] **Step 5: Check visually.** Take a phone screenshot (`--window-size=390,5200`, `?dark=false&lang=th`). The toolbar must read as two rows at most, left-aligned, with scope, Apple and Google together. The header button must be on one line, and the "Doctors per day" card in role mode must have no empty bordered band. Also take a desktop screenshot to confirm nothing regressed. Describe both in the report.

- [ ] **Step 6: Commit.**

```bash
git add index.html app.js tests/calendarExportUI.test.js dist/output.css
git commit -m "fix(ui): keep calendar export controls together; tidy header, stat labels, empty band"
```

---

### Task 4: Readable duty chips and no wrapping in the date and day columns

**Files:**
- Modify: `app.js` (`DOC_COLORS` at line 19; `renderTableView` header and cells around 3418–3560; `updateTargetedCellDOM` around 2813, which must match)
- Create: `tests/scheduleReadability.test.js`
- Modify: `dist/output.css` (rebuild)

**Interfaces:**
- Consumes: `DOC_COLOR(doc)` (unchanged signature).

- [ ] **Step 1: Write the failing test.** Create `tests/scheduleReadability.test.js`:

```js
const fs = require('fs');
const assert = require('assert');
const src = fs.readFileSync('app.js', 'utf8');

let total = 0;
let passed = 0;
function runTest(name, fn) {
    total++;
    try {
        fn();
        console.log(`✅ [PASSED] ${name}`);
        passed++;
    } catch (err) {
        console.error(`❌ [FAILED] ${name}`);
        console.error(err.message);
    }
}

const block = src.slice(src.indexOf('const DOC_COLORS = ['), src.indexOf('];', src.indexOf('const DOC_COLORS = [')));
const entries = block.match(/'[^']+'/g) || [];

runTest('every doctor colour uses a solid-enough fill and dark text in light mode', () => {
    assert.ok(entries.length >= 7);
    entries.forEach((e) => {
        assert.ok(/\bbg-[a-z]+-100\b/.test(e), `light fill should be -100: ${e}`);
        assert.ok(/\btext-[a-z]+-800\b/.test(e), `light text should be -800: ${e}`);
        assert.ok(/dark:text-[a-z]+-200\b/.test(e), `dark text should be -200: ${e}`);
    });
});

runTest('date and day columns never wrap', () => {
    const table = src.slice(src.indexOf('function renderTableView'), src.indexOf('function renderCalendarView'));
    assert.ok((table.match(/whitespace-nowrap/g) || []).length >= 4, 'need nowrap on both <th> and both <td>');
});

runTest('table chips use text-sm', () => {
    const table = src.slice(src.indexOf('function renderTableView'), src.indexOf('function renderCalendarView'));
    assert.ok(/openCellDropdown\(event, 'tablecelldropdown[^"]*" class="[^"]*\btext-sm\b/.test(table));
});

console.log(`\nPASSED: ${passed}/${total}, FAILED: ${total - passed}`);
if (passed !== total) process.exit(1);
```

- [ ] **Step 2: Run it and confirm it fails.** Run `node tests/scheduleReadability.test.js`. Expected: 0/3 pass.

- [ ] **Step 3: Implement.**
  1. Replace `DOC_COLORS` with entries of this form. Keep the same 7 hues in the same order:

```js
const DOC_COLORS = [
    'bg-teal-100 dark:bg-teal-900/50 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200',
    'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200',
    'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200',
    'bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200',
    'bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200',
    'bg-sky-100 dark:bg-sky-900/50 border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200',
    'bg-rose-100 dark:bg-rose-900/50 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200',
];
```

  2. In `renderTableView`, add `whitespace-nowrap` to the date `<th>` and day `<th>` (the ones using `tableDateCol` and `tableDayCol`) and to both cells in the `colsHtml` line that renders `displayDay` and `row.dayName`.
  3. In the table cell button (`onclick="openCellDropdown(event, 'tablecelldropdown-...`), change `text-xs` to `text-sm`. Make the same change to the chip markup in `updateTargetedCellDOM()` if it rebuilds that button's class. A cell that was changed by hand must look the same as a freshly rendered one.
  4. Check that the chip borders still show. If `DOC_COLOR` badges have no `border` class on the button, the `border-*` colours do nothing. That's acceptable; don't add borders.

- [ ] **Step 4: Run the tests, lint and build.** Run `node tests/scheduleReadability.test.js && npm run lint:fix && npm run lint && npm test && npm run build`. Expected: 3/3 pass, lint shows 0 errors, and all suites pass.

- [ ] **Step 5: Check visually.** Take desktop screenshots at `?dark=false` and `?dark=true`. Names must be easy to read, and "วันพฤหัสบดี" and the date header must each be on one line. Describe both in the report.

- [ ] **Step 6: Commit.**

```bash
git add app.js tests/scheduleReadability.test.js dist/output.css
git commit -m "fix(ui): readable duty chips; keep date and day columns on one line"
```
