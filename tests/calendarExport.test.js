// TZ must be set before any Date is created: proves dates use local calendar days, not UTC.
process.env.TZ = 'Asia/Bangkok';

const assert = require('assert');
const { formatICSDate, escapeICSText, foldICSLine, buildICS } = require('../calendarExport.js');

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
