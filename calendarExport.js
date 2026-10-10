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
        ? [...new Set(doctors.map((d) => doctorRoles[d] || 'Default'))].filter(
              (r) => r !== 'Default'
          )
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
