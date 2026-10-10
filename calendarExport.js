// Pure iCalendar (.ics, RFC 5545) helpers for exporting the duty schedule.
// No DOM access, so Node tests can require() this file directly.

const pad2 = (n) => String(n).padStart(2, '0');

// Local calendar day → YYYYMMDD. Never toISOString(): in UTC+7 that shifts midnight to the previous day.
function formatICSDate(date) {
    return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

const formatICSStamp = (date) =>
    date
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');

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
