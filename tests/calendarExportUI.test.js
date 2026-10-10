const assert = require('assert');
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

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

// app.js auto-generates on load; the bare jsdom page has roles but no doctors, so that startup
// run throws a Critical Coverage Error. It is jsdom-environment noise: drop only that message.
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (e) => {
    if (!String(e.message).includes('Critical Coverage Error')) console.error(e);
});
const dom = new JSDOM(indexHtml, {
    runScripts: 'dangerously',
    url: 'http://localhost/',
    virtualConsole,
});
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
        'calendarScopeLabel',
        'calendarScopeAll',
        'calendarScopeGroup',
        'calendarScopePerson',
        'calendarAppleBtn',
        'calendarGoogleBtn',
        'calendarEventPrefix',
        'calendarName',
        'calendarNoData',
        'calendarNoEvents',
        'calendarAppleHint',
        'calendarGoogleHint',
        'calendarPopupBlocked',
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

runTest('Blob URL is revoked after 60 s, not 1 s', () => {
    reset();
    const delays = [];
    const realSet = window.setTimeout;
    window.setTimeout = (fn, ms) => {
        delays.push(ms);
        return 0;
    };
    try {
        window.exportCalendar('apple');
    } finally {
        window.setTimeout = realSet;
    }
    assert.ok(delays.includes(60000), `timeouts: ${delays}`);
});

runTest('Google export: a blocked pop-up shows a toast with the import link', () => {
    reset();
    window.open = () => null;
    window.exportCalendar('google');
    const msg = document.getElementById('toastMsg').textContent;
    assert.ok(msg.includes('https://calendar.google.com/calendar/r/settings/export'), msg);
    window.open = (url) => opened.push(url);
});

runTest('no schedule → no download', () => {
    reset();
    window.eval('globalResult = null;');
    window.exportCalendar('apple');
    assert.strictEqual(downloads.length, 0);
});

runTest('scope select and both calendar buttons share one group (never split on wrap)', () => {
    const group = document.getElementById('calendarExportGroup');
    assert.ok(group, '#calendarExportGroup missing');
    ['selectCalendarScope', 'btnCalendarApple', 'btnCalendarGoogle'].forEach((id) =>
        assert.strictEqual(document.getElementById(id).parentElement, group, `${id} not in group`)
    );
});

console.log(`\nPASSED: ${passedTests}/${totalTests}, FAILED: ${totalTests - passedTests}`);
if (passedTests !== totalTests) process.exit(1);
