# Calendar Export (Google / Apple) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scope selector (All / Group / Individual) and two buttons, "Apple Calendar" and "Google Calendar", that export the generated duty schedule as calendar events.

**Architecture:** Both calendars import standard iCalendar (`.ics`, RFC 5545) files, so one pure generator serves both. A new DOM-free `calendarExport.js` builds the `.ics` text and filters duties by scope; `app.js` wires it to the UI. "Apple Calendar" downloads the file, which macOS and iOS open straight into Calendar. Google Calendar has no URL that adds many events at once, so "Google Calendar" downloads the same file and opens Google's Import page in a new tab, with a toast explaining the step.

**Tech Stack:** Vanilla browser JS (plain `<script>` files, no modules, no bundler), Tailwind CSS, Lucide icons, Node 20 test scripts (`node tests/*.test.js`, run via `npm test`), jsdom for DOM tests, ESLint 8 + Prettier.

**Spec:** The user's request in this conversation: *"add button to send information to google calendar and apple calendar, can specify into all/group/individual."* Interpretations made in this plan (confirm during review):
- **Group** = the existing role system (`config.doctorRoles`: R1 / R2 / R3 / Staff), grouped by **the person's** role. Group options appear only when role-based mode (`chkRoleBased`) is on.
- **Event** = one all-day event per duty slot. The app has no shift clock times, so shift-based mode puts Morning / Afternoon / Night in the title instead of using timed events.
- **"Send"** = file export plus import, not a live sync. A live subscription feed needs a server, which this static GitHub Pages app does not have. **Out of scope.**

## Global Constraints

- No new npm dependencies. No ES modules: `calendarExport.js` is a classic script. It exposes globals in the browser and exposes `module.exports` only when `module` exists (Node tests).
- Every new global that one script uses from another must be added to `globals` in `.eslintrc.cjs`. Otherwise CI lint fails with `no-undef`, which is exactly the failure fixed in the previous lint commit.
- `npm run lint` and `npm test` must both exit 0 after every task. Run `npm run lint:fix` to apply Prettier formatting (4-space indent, single quotes, printWidth 100).
- Every user-visible string goes in **both** `translations.th` and `translations.en` in `translations.js`, and markup uses `data-i18n="key"`.
- Doctor names are user input: escape them with the existing `esc()` (from `translations.js`) before inserting them into HTML.
- Never derive a calendar date from `toISOString()`. Users are in Thailand (UTC+7), where local midnight is 17:00 of the previous day in UTC.
- Script load order in `index.html`: `structuredInputs.js`, `translations.js`, **`calendarExport.js`**, `app.js` (all `defer`).
- `sw.js` caches app assets: add `./calendarExport.js` and bump `CACHE_NAME` so installed PWAs pick up the change.

## Review Focus

1. **Timezone date shift:** in UTC+7, a duty on 1 Jan must export as `20260101`, not `20251231`. Pinned in Task 1 (the test runs with `TZ=Asia/Bangkok`).
2. **Thai names and long titles:** RFC 5545 lines are limited to 75 octets, and Thai letters are 3 bytes each in UTF-8. Folding must never split a character. Pinned in Task 1.
3. **Names containing `,` `;` `\` newlines or `:`:** they must not corrupt `.ics` fields (Task 1) or the scope value `person:<name>` (Task 2).
4. **Shortage and blank slots:** `__SHORTAGE__`, `'-'` and `''` must never become events. Custom date ranges that cross a month boundary must use `scheduleDates`, not `day/month`. Pinned in Task 2.
5. **Name-based XSS in the scope `<select>`:** a doctor named `<img src=x onerror=alert(1)>` must render as text. Pinned in Task 3.

Known ceiling (document it, don't build it): re-importing after the schedule changes **adds** new events but cannot **remove** old ones. UIDs are stable, so an unchanged duty is not duplicated. Removing stale events would need a subscription feed and a server.

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `calendarExport.js` | Create | Pure `.ics` building, scope parsing and duty-to-event collection. No DOM access. |
| `tests/calendarExport.test.js` | Create | Unit tests for `calendarExport.js` (Tasks 1–2). |
| `tests/calendarExportUI.test.js` | Create | jsdom test of the selector and buttons (Task 3). |
| `app.js` | Modify | `renderCalendarScopeOptions()`, `window.exportCalendar()`, one call in `renderResults()`. |
| `index.html` | Modify | Selector + two buttons in the results toolbar (next to `exportToExcel`, ~line 877); script tag (~line 1116). |
| `translations.js` | Modify | 12 new keys in `th` and `en`. |
| `sw.js` | Modify | Cache list + `CACHE_NAME` bump. |
| `.eslintrc.cjs` | Modify | New globals. |

**Before Task 1:** the working tree still holds the uncommitted lint fix from the previous session. Commit it first (`git add -A ':!node_modules' && git commit -m "fix(lint): ..."`) so this feature's commits stay clean. Restore `.gitignore` with `node_modules/` too.

---

### Task 1: `.ics` builder

**Files:**
- Create: `calendarExport.js`
- Create: `tests/calendarExport.test.js`
- Modify: `.eslintrc.cjs` (globals)

**Interfaces:**
- Consumes: nothing.
- Produces (globals in the browser, `module.exports` in Node):
  - `formatICSDate(date: Date) -> string` (`'YYYYMMDD'`, from the local calendar date)
  - `escapeICSText(str: string) -> string`
  - `foldICSLine(line: string) -> string` (joins chunks with `'\r\n '`)
  - `buildICS(events: Array<{date: Date, title: string, uid: string, description?: string}>, calName: string, now?: Date) -> string`

- [ ] **Step 1: Write the failing test.** Create `tests/calendarExport.test.js`:

```js
// TZ must be set before any Date is created: proves dates use local calendar days, not UTC.
process.env.TZ = 'Asia/Bangkok';

const assert = require('assert');
const {
    formatICSDate,
    escapeICSText,
    foldICSLine,
    buildICS,
} = require('../calendarExport.js');

let totalTests = 0;
let passedTests = 0;

function runTest(name, testFn) {
    totalTests++;
    try {
        testFn();
        console.log(`✅ [PASSED] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`❌ [FAILED] ${name}`);
        console.error(err);
    }
}

runTest('formatICSDate uses local date in UTC+7 (no toISOString shift)', () => {
    assert.strictEqual(formatICSDate(new Date(2026, 0, 1)), '20260101');
    assert.strictEqual(formatICSDate(new Date(2026, 11, 31)), '20261231');
});

runTest('escapeICSText escapes backslash, semicolon, comma, newline', () => {
    assert.strictEqual(escapeICSText('a\\b;c,d\ne'), 'a\\\\b\\;c\\,d\\ne');
});

runTest('foldICSLine leaves short lines alone', () => {
    assert.strictEqual(foldICSLine('SUMMARY:Duty'), 'SUMMARY:Duty');
});

runTest('foldICSLine keeps every line <= 75 octets and never splits a Thai character', () => {
    const line = 'SUMMARY:' + 'เวรดึก'.repeat(20); // 3 bytes per Thai char
    const folded = foldICSLine(line);
    const parts = folded.split('\r\n');
    assert.ok(parts.length > 1, 'should fold');
    parts.forEach((p, i) => {
        assert.ok(Buffer.byteLength(p, 'utf8') <= 75, `line ${i} too long`);
        if (i > 0) assert.strictEqual(p[0], ' ', 'continuation must start with a space');
        assert.ok(!p.includes('�'), 'no broken characters');
    });
    // Unfolding (RFC 5545 §3.1) restores the original
    assert.strictEqual(folded.replace(/\r\n /g, ''), line);
});

runTest('buildICS produces a valid all-day VEVENT with CRLF endings', () => {
    const ics = buildICS(
        [{ date: new Date(2026, 0, 31), title: 'Duty: A, B', uid: 'u1@doctor-scheduler' }],
        'Schedule',
        new Date(Date.UTC(2026, 9, 10, 12, 0, 0))
    );
    assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));
    assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
    assert.ok(!/[^\r]\n/.test(ics), 'every newline must be CRLF');
    assert.ok(ics.includes('DTSTART;VALUE=DATE:20260131\r\n'));
    assert.ok(ics.includes('DTEND;VALUE=DATE:20260201\r\n'), 'DTEND rolls over the month');
    assert.ok(ics.includes('DTSTAMP:20261010T120000Z\r\n'));
    assert.ok(ics.includes('SUMMARY:Duty: A\\, B\r\n'));
    assert.ok(ics.includes('UID:u1@doctor-scheduler\r\n'));
    assert.ok(ics.includes('X-WR-CALNAME:Schedule\r\n'));
});

runTest('buildICS with no events is still a valid empty calendar', () => {
    const ics = buildICS([], 'Empty');
    assert.ok(!ics.includes('BEGIN:VEVENT'));
    assert.ok(ics.includes('END:VCALENDAR'));
});

console.log(`\nPASSED: ${passedTests}/${totalTests}, FAILED: ${totalTests - passedTests}`);
if (passedTests !== totalTests) process.exit(1);
```

- [ ] **Step 2: Run it and confirm it fails.**
Run: `node tests/calendarExport.test.js`
Expected: crashes with `Cannot find module '../calendarExport.js'`.

- [ ] **Step 3: Implement.** Create `calendarExport.js`:

```js
// Pure iCalendar (.ics, RFC 5545) helpers for exporting the duty schedule.
// No DOM access, so Node tests can require() this file directly.

const pad2 = (n) => String(n).padStart(2, '0');

// Local calendar day → YYYYMMDD. Never toISOString(): in UTC+7 that shifts midnight to the previous day.
function formatICSDate(date) {
    return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

const formatICSStamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function escapeICSText(str) {
    return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
}

// Fold to <= 75 octets per line without splitting a UTF-8 character (Thai = 3 bytes per char).
function foldICSLine(line) {
    const enc = new TextEncoder();
    const chunks = [];
    let cur = '';
    let curBytes = 0;
    for (const ch of line) {
        const bytes = enc.encode(ch).length;
        const limit = chunks.length === 0 ? 75 : 74; // continuation lines get a leading space
        if (curBytes + bytes > limit) {
            chunks.push(cur);
            cur = '';
            curBytes = 0;
        }
        cur += ch;
        curBytes += bytes;
    }
    chunks.push(cur);
    return chunks.join('\r\n ');
}

function buildICS(events, calName, now = new Date()) {
    const stamp = formatICSStamp(now);
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//doctor-scheduler//Duty Schedule//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${escapeICSText(calName)}`,
    ];
    for (const ev of events) {
        const end = new Date(ev.date.getFullYear(), ev.date.getMonth(), ev.date.getDate() + 1);
        lines.push(
            'BEGIN:VEVENT',
            `UID:${ev.uid}`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${formatICSDate(ev.date)}`,
            `DTEND;VALUE=DATE:${formatICSDate(end)}`,
            `SUMMARY:${escapeICSText(ev.title)}`
        );
        if (ev.description) lines.push(`DESCRIPTION:${escapeICSText(ev.description)}`);
        lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.map(foldICSLine).join('\r\n') + '\r\n';
}

if (typeof module !== 'undefined') {
    module.exports = { formatICSDate, escapeICSText, foldICSLine, buildICS };
}
```

Then add the new globals to `.eslintrc.cjs` under `globals` (after `pushToUndoStack`):

```js
    // calendarExport.js
    buildICS: 'readonly',
```

(`formatICSDate`, `escapeICSText` and `foldICSLine` are only used inside `calendarExport.js`, so they need no global entry.)

- [ ] **Step 4: Run the tests and lint.**
Run: `node tests/calendarExport.test.js && npm run lint:fix && npm run lint && npm test`
Expected: `PASSED: 6/6, FAILED: 0`, lint exits 0, `ALL TEST SUITES PASSED SUCCESSFULLY!`

- [ ] **Step 5: Commit.**

```bash
git add calendarExport.js tests/calendarExport.test.js .eslintrc.cjs
git commit -m "feat(calendar): add RFC 5545 .ics builder"
```

---

### Task 2: Duty → event collection and scopes

**Files:**
- Modify: `calendarExport.js` (append functions before the `module.exports` block and extend it)
- Modify: `tests/calendarExport.test.js` (append tests before the final summary lines)
- Modify: `.eslintrc.cjs` (globals)

**Interfaces:**
- Consumes: `formatICSDate` (Task 1).
- Produces:
  - `parseCalendarScope(value: string) -> {type:'all'} | {type:'group', role: string} | {type:'person', name: string}`. Accepts `'all'`, `'group:<role>'` and `'person:<name>'`, splitting on the **first** colon only. Anything else returns `{type:'all'}`.
  - `listCalendarScopes(doctors: string[], doctorRoles: Object<string,string>, roleBased: boolean) -> {groups: string[], people: string[]}`. `groups` holds the distinct non-`'Default'` roles in first-seen order, and is `[]` when `roleBased` is false.
  - `collectDutyEvents(schedule, dates, scope, opts) -> Array<{date, title, uid}>`
    - `schedule`: `globalResult.schedule` rows `{ day: number (1-based), selectedDocs: Array<{name, role}> }`
    - `dates`: `scheduleDates` (`Date[]`, where index `day - 1` is the real date, including custom ranges)
    - `opts`: `{ doctorRoles?: object, slotLabel?: (slotIdx, docObj) => string, titlePrefix?: string, skipNames?: string[] }`
    - title: `` `${titlePrefix}: ${name}` `` plus `` ` (${label})` `` when `slotLabel` returns a non-empty string
    - uid: `` `${formatICSDate(date)}-${slotIdx}-${encodeURIComponent(name)}@doctor-scheduler` `` (stable across re-exports)

- [ ] **Step 1: Write the failing tests.** Add the import at the top of `tests/calendarExport.test.js` (replace the existing `require` block):

```js
const {
    formatICSDate,
    escapeICSText,
    foldICSLine,
    buildICS,
    parseCalendarScope,
    listCalendarScopes,
    collectDutyEvents,
} = require('../calendarExport.js');
```

Then append these tests before the `console.log(\`\nPASSED...` line:

```js
// Custom range crossing a month: row.day is an index into dates, not a day-of-month
const dates = [new Date(2026, 0, 30), new Date(2026, 0, 31), new Date(2026, 1, 1)];
const schedule = [
    { day: 1, selectedDocs: [{ name: 'Alice', role: 'R1' }, { name: '__SHORTAGE__', role: 'Default' }] },
    { day: 2, selectedDocs: [{ name: 'Bob', role: 'R2' }, { name: '-', role: 'Default' }] },
    { day: 3, selectedDocs: [{ name: 'Alice', role: 'R1' }, { name: '', role: 'Default' }, { name: 'a:b', role: 'R2' }] },
];
const doctorRoles = { Alice: 'R1', Bob: 'R2', 'a:b': 'R2' };
const opts = { doctorRoles, titlePrefix: 'Duty', skipNames: ['__SHORTAGE__'] };

runTest('parseCalendarScope handles all / group / person / names with colons / junk', () => {
    assert.deepStrictEqual(parseCalendarScope('all'), { type: 'all' });
    assert.deepStrictEqual(parseCalendarScope('group:R1'), { type: 'group', role: 'R1' });
    assert.deepStrictEqual(parseCalendarScope('person:a:b'), { type: 'person', name: 'a:b' });
    assert.deepStrictEqual(parseCalendarScope(''), { type: 'all' });
    assert.deepStrictEqual(parseCalendarScope('bogus:x'), { type: 'all' });
});

runTest('listCalendarScopes: distinct non-Default roles only in role-based mode', () => {
    const docs = ['Alice', 'Bob', 'Cara', 'Dan'];
    const roles = { Alice: 'R1', Bob: 'R2', Cara: 'R1', Dan: 'Default' };
    assert.deepStrictEqual(listCalendarScopes(docs, roles, true), {
        groups: ['R1', 'R2'],
        people: docs,
    });
    assert.deepStrictEqual(listCalendarScopes(docs, roles, false).groups, []);
});

runTest('collectDutyEvents(all) skips shortage, "-" and blank slots', () => {
    const evs = collectDutyEvents(schedule, dates, { type: 'all' }, opts);
    assert.deepStrictEqual(
        evs.map((e) => e.title),
        ['Duty: Alice', 'Duty: Bob', 'Duty: Alice', 'Duty: a:b']
    );
});

runTest('collectDutyEvents uses scheduleDates across a month boundary', () => {
    const evs = collectDutyEvents(schedule, dates, { type: 'all' }, opts);
    assert.deepStrictEqual(
        evs.map((e) => formatICSDate(e.date)),
        ['20260130', '20260131', '20260201', '20260201']
    );
});

runTest('collectDutyEvents(person) returns only that person', () => {
    const evs = collectDutyEvents(schedule, dates, { type: 'person', name: 'Alice' }, opts);
    assert.strictEqual(evs.length, 2);
    assert.ok(evs.every((e) => e.title === 'Duty: Alice'));
});

runTest('collectDutyEvents(group) filters by the person\'s role', () => {
    const evs = collectDutyEvents(schedule, dates, { type: 'group', role: 'R2' }, opts);
    assert.deepStrictEqual(evs.map((e) => e.title), ['Duty: Bob', 'Duty: a:b']);
});

runTest('collectDutyEvents applies slotLabel and builds stable, URI-safe UIDs', () => {
    const evs = collectDutyEvents(schedule, dates, { type: 'person', name: 'a:b' }, {
        ...opts,
        slotLabel: (i) => (i === 2 ? 'Night' : ''),
    });
    assert.strictEqual(evs[0].title, 'Duty: a:b (Night)');
    assert.strictEqual(evs[0].uid, '20260201-2-a%3Ab@doctor-scheduler');
    const again = collectDutyEvents(schedule, dates, { type: 'person', name: 'a:b' }, opts);
    assert.strictEqual(again[0].uid, evs[0].uid, 'UID must not change between exports');
});

runTest('collectDutyEvents for a person with no duties returns []', () => {
    assert.deepStrictEqual(
        collectDutyEvents(schedule, dates, { type: 'person', name: 'Nobody' }, opts),
        []
    );
});
```

- [ ] **Step 2: Run it and confirm it fails.**
Run: `node tests/calendarExport.test.js`
Expected: the new tests print `❌ [FAILED]` with `parseCalendarScope is not a function` (and similar for the other two functions), and the process exits 1.

- [ ] **Step 3: Implement.** In `calendarExport.js`, insert before the `if (typeof module ...` block:

```js
// Select value → scope. 'person:<name>' splits on the first colon only (names may contain ':').
function parseCalendarScope(value) {
    const i = String(value).indexOf(':');
    const kind = i === -1 ? value : value.slice(0, i);
    const arg = i === -1 ? '' : value.slice(i + 1);
    if (kind === 'group' && arg) return { type: 'group', role: arg };
    if (kind === 'person' && arg) return { type: 'person', name: arg };
    return { type: 'all' };
}

function listCalendarScopes(doctors, doctorRoles, roleBased) {
    const groups = roleBased
        ? [...new Set(doctors.map((d) => doctorRoles[d] || 'Default'))].filter((r) => r !== 'Default')
        : [];
    return { groups, people: [...doctors] };
}

function collectDutyEvents(schedule, dates, scope, opts = {}) {
    const { doctorRoles = {}, slotLabel = () => '', titlePrefix = 'Duty', skipNames = [] } = opts;
    const matches = (name) =>
        scope.type === 'all' ||
        (scope.type === 'person' && name === scope.name) ||
        (scope.type === 'group' && (doctorRoles[name] || 'Default') === scope.role);

    const events = [];
    for (const row of schedule) {
        const date = dates[row.day - 1];
        if (!date) continue;
        row.selectedDocs.forEach((docObj, slotIdx) => {
            const name = docObj && docObj.name;
            if (!name || name === '-' || skipNames.includes(name) || !matches(name)) return;
            const label = slotLabel(slotIdx, docObj);
            events.push({
                date,
                title: `${titlePrefix}: ${name}${label ? ` (${label})` : ''}`,
                uid: `${formatICSDate(date)}-${slotIdx}-${encodeURIComponent(name)}@doctor-scheduler`,
            });
        });
    }
    return events;
}
```

Replace the export block with:

```js
if (typeof module !== 'undefined') {
    module.exports = {
        formatICSDate,
        escapeICSText,
        foldICSLine,
        buildICS,
        parseCalendarScope,
        listCalendarScopes,
        collectDutyEvents,
    };
}
```

Add to `.eslintrc.cjs` globals, under `buildICS`:

```js
    parseCalendarScope: 'readonly',
    listCalendarScopes: 'readonly',
    collectDutyEvents: 'readonly',
```

- [ ] **Step 4: Run the tests and lint.**
Run: `node tests/calendarExport.test.js && npm run lint:fix && npm run lint && npm test`
Expected: `PASSED: 14/14, FAILED: 0`, lint exits 0, all suites pass.

- [ ] **Step 5: Commit.**

```bash
git add calendarExport.js tests/calendarExport.test.js .eslintrc.cjs
git commit -m "feat(calendar): collect duty events by all/group/person scope"
```

---

### Task 3: UI: scope selector and Apple / Google buttons

**Files:**
- Modify: `translations.js` (`th` block ends ~line 190, `en` block ~line 345; add the keys next to `exportExcelBtn`)
- Modify: `index.html` (toolbar ~line 877, after the `exportToExcel()` button; scripts ~line 1116)
- Modify: `app.js` (new functions after `window.exportToExcel`, ~line 4137; one call in `renderResults`, ~line 3362)
- Modify: `sw.js` (lines 1–7)
- Modify: `.eslintrc.cjs` (`exportCalendar` global)
- Create: `tests/calendarExportUI.test.js`

**Interfaces:**
- Consumes: `buildICS`, `parseCalendarScope`, `listCalendarScopes`, `collectDutyEvents` (Tasks 1–2). From `app.js`: `globalResult`, `scheduleDates`, `doctors`, `parseUIConfig()` (returns `{ doctorRoles, roleBased, isShiftBased, morningSlots, afternoonSlots, nightSlots, ... }`), `showToast(msg, isError)`, `esc()`, `SHORTAGE_MARKER`, `translations`, `currentLang`.
- Produces: `renderCalendarScopeOptions(config)`, `window.exportCalendar(target: 'apple' | 'google')`, a DOM `<select id="selectCalendarScope">`, and buttons `#btnCalendarApple` and `#btnCalendarGoogle`.

- [ ] **Step 1: Write the failing test.** Create `tests/calendarExportUI.test.js`:

```js
const assert = require('assert');
const fs = require('fs');
const { JSDOM } = require('jsdom');

let totalTests = 0;
let passedTests = 0;

function runTest(name, testFn) {
    totalTests++;
    try {
        testFn();
        console.log(`✅ [PASSED] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`❌ [FAILED] ${name}`);
        console.error(err);
    }
}

let indexHtml = fs.readFileSync('index.html', 'utf8');
// Strip tailwind config script to prevent "tailwind is not defined" during JSDOM parsing
indexHtml = indexHtml.replace(/<script>[\s\S]*?tailwind\.config[\s\S]*?<\/script>/g, '');

const dom = new JSDOM(indexHtml, { runScripts: 'dangerously', url: 'http://localhost/' });
const window = dom.window;
const document = window.document;
window.lucide = { createIcons: () => {} };

let downloads = [];
let opened = [];
let lastICS = null;
window.HTMLAnchorElement.prototype.click = function () {
    downloads.push(this.download);
};
window.URL.createObjectURL = () => 'blob:mock';
window.URL.revokeObjectURL = () => {};
window.open = (url) => opened.push(url);

for (const file of ['structuredInputs.js', 'translations.js', 'calendarExport.js', 'app.js']) {
    const el = document.createElement('script');
    el.textContent = fs.readFileSync(file, 'utf8');
    document.body.appendChild(el);
}

const realBuild = window.buildICS;
window.buildICS = (...args) => (lastICS = realBuild(...args));

window.eval(`
    currentLang = 'en';
    doctors.length = 0; doctors.push('Alice', '<img src=x onerror=alert(1)>');
    scheduleDates = [new Date(2026, 0, 1), new Date(2026, 0, 2)];
    globalResult = {
        schedule: [
            { day: 1, selectedDocs: [{ name: 'Alice', role: 'Default' }] },
            { day: 2, selectedDocs: [{ name: '<img src=x onerror=alert(1)>', role: 'Default' }] },
        ],
        maxSlots: 1, month: 1, year: 2026, summary: [],
    };
`);

function reset() {
    downloads = [];
    opened = [];
    lastICS = null;
}

runTest('markup has scope select and both buttons, wired with data-i18n', () => {
    assert.ok(document.getElementById('selectCalendarScope'));
    assert.strictEqual(
        document.getElementById('btnCalendarApple').getAttribute('onclick'),
        "exportCalendar('apple')"
    );
    assert.strictEqual(
        document.getElementById('btnCalendarGoogle').getAttribute('onclick'),
        "exportCalendar('google')"
    );
});

runTest('calendarExport.js loads before app.js', () => {
    const srcs = [...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src'));
    assert.ok(srcs.indexOf('calendarExport.js') > -1);
    assert.ok(srcs.indexOf('calendarExport.js') < srcs.indexOf('app.js'));
});

runTest('every new translation key exists in th and en', () => {
    const keys = [
        'calendarScopeLabel', 'calendarScopeAll', 'calendarScopeGroup', 'calendarScopePerson',
        'calendarAppleBtn', 'calendarGoogleBtn', 'calendarEventPrefix', 'calendarName',
        'calendarNoData', 'calendarNoEvents', 'calendarAppleHint', 'calendarGoogleHint',
    ];
    const t = window.eval('translations');
    keys.forEach((k) => {
        assert.ok(t.th[k], `th.${k} missing`);
        assert.ok(t.en[k], `en.${k} missing`);
    });
});

runTest('scope options list All + each person, names escaped (no XSS)', () => {
    window.renderCalendarScopeOptions(window.parseUIConfig());
    const sel = document.getElementById('selectCalendarScope');
    const values = [...sel.options].map((o) => o.value);
    assert.deepStrictEqual(values, ['all', 'person:Alice', 'person:<img src=x onerror=alert(1)>']);
    assert.strictEqual(sel.querySelector('img'), null, 'name must not become an element');
});

runTest('Apple export downloads an .ics with all duties, opens nothing', () => {
    reset();
    document.getElementById('selectCalendarScope').value = 'all';
    window.exportCalendar('apple');
    assert.strictEqual(downloads.length, 1);
    assert.ok(downloads[0].endsWith('.ics'));
    assert.strictEqual(opened.length, 0);
    assert.strictEqual((lastICS.match(/BEGIN:VEVENT/g) || []).length, 2);
});

runTest('Google export downloads the same file and opens the Google import page', () => {
    reset();
    window.exportCalendar('google');
    assert.strictEqual(downloads.length, 1);
    assert.deepStrictEqual(opened, ['https://calendar.google.com/calendar/r/settings/export']);
});

runTest('person scope exports only that person', () => {
    reset();
    document.getElementById('selectCalendarScope').value = 'person:Alice';
    window.exportCalendar('apple');
    assert.strictEqual((lastICS.match(/BEGIN:VEVENT/g) || []).length, 1);
    assert.ok(lastICS.includes('SUMMARY:Duty: Alice'));
});

runTest('no schedule → no download', () => {
    reset();
    window.eval('globalResult = null;');
    window.exportCalendar('apple');
    assert.strictEqual(downloads.length, 0);
});

console.log(`\nPASSED: ${passedTests}/${totalTests}, FAILED: ${totalTests - passedTests}`);
if (passedTests !== totalTests) process.exit(1);
```

- [ ] **Step 2: Run it and confirm it fails.**
Run: `node tests/calendarExportUI.test.js`
Expected: `❌ [FAILED]` on the markup test (`selectCalendarScope` is null) and on the tests after it; the process exits 1.

- [ ] **Step 3a: Add the translations.** In `translations.js`, add after `exportExcelBtn` in the **`th`** block:

```js
        calendarScopeLabel: 'ส่งเข้าปฏิทินของ',
        calendarScopeAll: 'ทุกคน',
        calendarScopeGroup: 'กลุ่ม',
        calendarScopePerson: 'รายบุคคล',
        calendarAppleBtn: 'Apple Calendar',
        calendarGoogleBtn: 'Google Calendar',
        calendarEventPrefix: 'เวร',
        calendarName: 'ตารางเวร',
        calendarNoData: 'ยังไม่มีข้อมูลตารางเวร',
        calendarNoEvents: 'ไม่มีเวรสำหรับตัวเลือกนี้',
        calendarAppleHint: 'ดาวน์โหลดไฟล์ .ics แล้ว — เปิดไฟล์เพื่อเพิ่มลง Apple Calendar',
        calendarGoogleHint: 'ดาวน์โหลดไฟล์ .ics แล้ว — นำเข้าไฟล์ในหน้า Google Calendar ที่เปิดขึ้น',
```

and after `exportExcelBtn` in the **`en`** block:

```js
        calendarScopeLabel: 'Send to calendar for',
        calendarScopeAll: 'Everyone',
        calendarScopeGroup: 'Group',
        calendarScopePerson: 'Individual',
        calendarAppleBtn: 'Apple Calendar',
        calendarGoogleBtn: 'Google Calendar',
        calendarEventPrefix: 'Duty',
        calendarName: 'Duty Schedule',
        calendarNoData: 'No schedule data available',
        calendarNoEvents: 'No duties for this selection',
        calendarAppleHint: '.ics downloaded — open it to add to Apple Calendar',
        calendarGoogleHint: '.ics downloaded — import it on the Google Calendar page that just opened',
```

- [ ] **Step 3b: Add the markup.** In `index.html`, directly after the closing `</button>` of the `onclick="exportToExcel()"` button (inside the same `flex flex-wrap ... gap-2` div):

```html
                            <label for="selectCalendarScope" class="sr-only"
                                data-i18n="calendarScopeLabel">ส่งเข้าปฏิทินของ</label>
                            <select id="selectCalendarScope"
                                class="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold shadow-sm">
                                <option value="all">ทุกคน</option>
                            </select>
                            <button id="btnCalendarApple" onclick="exportCalendar('apple')"
                                class="flex items-center justify-center gap-2 bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all">
                                <i data-lucide="calendar-plus" class="w-4 h-4"></i> <span
                                    data-i18n="calendarAppleBtn">Apple Calendar</span>
                            </button>
                            <button id="btnCalendarGoogle" onclick="exportCalendar('google')"
                                class="flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all">
                                <i data-lucide="calendar-plus" class="w-4 h-4"></i> <span
                                    data-i18n="calendarGoogleBtn">Google Calendar</span>
                            </button>
```

Replace the script block (~line 1115):

```html
    <script defer src="structuredInputs.js"></script>
    <script defer src="translations.js"></script>
    <script defer src="calendarExport.js"></script>
    <script defer src="app.js"></script>
```

- [ ] **Step 3c: Wire `app.js`.** In `renderResults()`, add after `renderSummaryTable(config);`:

```js
    renderCalendarScopeOptions(config);
```

(`applyTranslations()` already calls `renderResults()` when a result exists, so the option labels follow language changes.)

After the end of `window.exportToExcel = function () { ... };`, add:

```js
// Calendar export (.ics): Apple Calendar opens the file directly; Google has no bulk-add URL,
// so we download the same file and open Google's Import page.
function renderCalendarScopeOptions(config) {
    const sel = document.getElementById('selectCalendarScope');
    if (!sel) return;
    const prev = sel.value;
    const t = translations[currentLang];
    const { groups, people } = listCalendarScopes(doctors, config.doctorRoles, config.roleBased);
    const opt = (value, label) => `<option value="${esc(value)}">${esc(label)}</option>`;
    let html = opt('all', t.calendarScopeAll);
    if (groups.length) {
        html += `<optgroup label="${esc(t.calendarScopeGroup)}">${groups.map((g) => opt(`group:${g}`, g)).join('')}</optgroup>`;
    }
    html += `<optgroup label="${esc(t.calendarScopePerson)}">${people.map((p) => opt(`person:${p}`, p)).join('')}</optgroup>`;
    sel.innerHTML = html;
    if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

window.exportCalendar = function (target) {
    const t = translations[currentLang];
    if (!globalResult || globalResult.schedule.length === 0) {
        showToast(t.calendarNoData, true);
        return;
    }
    const config = parseUIConfig();
    const scope = parseCalendarScope(
        document.getElementById('selectCalendarScope')?.value || 'all'
    );
    const M = config.morningSlots || 0;
    const A = config.afternoonSlots || 0;
    const slotLabel = (i, docObj) => {
        if (config.isShiftBased) {
            return i < M ? t.shiftMorning : i < M + A ? t.shiftAfternoon : t.shiftNight;
        }
        return config.roleBased && docObj.role && docObj.role !== 'Default' ? docObj.role : '';
    };
    const events = collectDutyEvents(globalResult.schedule, scheduleDates, scope, {
        doctorRoles: config.doctorRoles,
        slotLabel,
        titlePrefix: t.calendarEventPrefix,
        skipNames: [SHORTAGE_MARKER],
    });
    if (events.length === 0) {
        showToast(t.calendarNoEvents, true);
        return;
    }

    const scopeName =
        scope.type === 'all' ? t.calendarScopeAll : scope.type === 'group' ? scope.role : scope.name;
    const ics = buildICS(events, `${t.calendarName} – ${scopeName}`);
    // Blob URL, not data: URL. iOS Safari only offers "Add to Calendar" for a real text/calendar file.
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${scopeName.replace(/[\\/:*?"<>|\s]+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    if (target === 'google') {
        window.open('https://calendar.google.com/calendar/r/settings/export', '_blank', 'noopener');
        showToast(t.calendarGoogleHint);
    } else {
        showToast(t.calendarAppleHint);
    }
};
```

- [ ] **Step 3d: Update the service worker and lint globals.** In `sw.js`, bump `const CACHE_NAME = 'doctor-scheduler-v2';` to `'doctor-scheduler-v3'`, and add `'./calendarExport.js',` to `ASSETS_TO_CACHE` after `'./translations.js',`. In `.eslintrc.cjs`, add under the "App globals exposed on window" group:

```js
    exportCalendar: 'writable',
```

- [ ] **Step 4: Run the tests and lint.**
Run: `node tests/calendarExportUI.test.js && npm run lint:fix && npm run lint && npm test`
Expected: `PASSED: 8/8, FAILED: 0`, lint exits 0, all suites pass (now including both new test files).

- [ ] **Step 5: Manual smoke test** (real calendars, which no automated test can reach):
Run: `npm run build && python3 -m http.server 8080`, open `http://localhost:8080`, and generate a schedule.
  - Pick **Everyone** and click **Apple Calendar**. On macOS, opening the downloaded `.ics` shows an import dialog with one all-day event per duty, on the correct dates.
  - Pick a **person** and click **Google Calendar**. The file downloads and a Google Calendar "Import" tab opens. Import the file and confirm the dates are not shifted by a day.
  - Turn on role-based mode. The selector shows a **Group** section, and choosing R1 exports only R1 doctors' duties.
  - Switch the language. The selector labels change and the current selection is kept.

- [ ] **Step 6: Commit.**

```bash
git add translations.js index.html app.js sw.js .eslintrc.cjs tests/calendarExportUI.test.js
git commit -m "feat(calendar): export schedule to Apple/Google Calendar by all/group/person"
```
