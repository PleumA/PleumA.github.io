// TZ must be set before any Date is created: proves dates use local calendar days, not UTC.
process.env.TZ = 'Asia/Bangkok';

const assert = require('assert');
const {
    formatICSDate,
    escapeICSText,
    foldICSLine,
    buildICS,
    parseCalendarScope,
    listCalendarScopes,
    collectDutyEvents,
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

// Custom range crossing a month: row.day is an index into dates, not a day-of-month
const dates = [new Date(2026, 0, 30), new Date(2026, 0, 31), new Date(2026, 1, 1)];
const schedule = [
    {
        day: 1,
        selectedDocs: [
            { name: 'Alice', role: 'R1' },
            { name: '__SHORTAGE__', role: 'Default' },
        ],
    },
    {
        day: 2,
        selectedDocs: [
            { name: 'Bob', role: 'R2' },
            { name: '-', role: 'Default' },
        ],
    },
    {
        day: 3,
        selectedDocs: [
            { name: 'Alice', role: 'R1' },
            { name: '', role: 'Default' },
            { name: 'a:b', role: 'R2' },
        ],
    },
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

runTest("collectDutyEvents(group) filters by the person's role", () => {
    const evs = collectDutyEvents(schedule, dates, { type: 'group', role: 'R2' }, opts);
    assert.deepStrictEqual(
        evs.map((e) => e.title),
        ['Duty: Bob', 'Duty: a:b']
    );
});

runTest('collectDutyEvents applies slotLabel and builds stable, URI-safe UIDs', () => {
    const evs = collectDutyEvents(
        schedule,
        dates,
        { type: 'person', name: 'a:b' },
        {
            ...opts,
            slotLabel: (i) => (i === 2 ? 'Night' : ''),
        }
    );
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

console.log(`\nPASSED: ${passedTests}/${totalTests}, FAILED: ${totalTests - passedTests}`);
if (passedTests !== totalTests) process.exit(1);
