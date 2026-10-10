// Guards against Tailwind classes that don't exist (they compile to nothing and silently break styling).
const fs = require('fs');
const assert = require('assert');

const FILES = [
    'index.html',
    'app.js',
    'structuredInputs.js',
    'translations.js',
    'calendarExport.js',
];
const COLORS =
    'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const SHADES = new Set([
    '50',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
    '950',
]);
const colorRe = new RegExp(
    `(?:^|[\\s"'\`:])(?:[a-z-]+:)*[a-z]+-(?:${COLORS})-(\\d+)(?=[\\s"'\`/]|$)`,
    'g'
);
const halfRe =
    /(?:^|[\s"'`:])(?:[a-z-]+:)*(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|w|h)-(\d+\.5)(?=[\s"'`]|$)/g;

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
