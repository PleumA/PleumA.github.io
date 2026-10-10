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

const block = src.slice(
    src.indexOf('const DOC_COLORS = ['),
    src.indexOf('];', src.indexOf('const DOC_COLORS = ['))
);
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
    const table = src.slice(
        src.indexOf('function renderTableView'),
        src.indexOf('function renderCalendarView')
    );
    assert.ok(
        (table.match(/whitespace-nowrap/g) || []).length >= 4,
        'need nowrap on both <th> and both <td>'
    );
});

runTest('table chips use text-sm', () => {
    const table = src.slice(
        src.indexOf('function renderTableView'),
        src.indexOf('function renderCalendarView')
    );
    assert.ok(
        /openCellDropdown\(event, 'tablecelldropdown[^"]*" class="[^"]*\btext-sm\b/.test(table)
    );
});

runTest('hand-edited cells keep the drag cursor and sizing of fresh renders', () => {
    const fn = src.slice(
        src.indexOf('function updateTargetedCellDOM'),
        src.indexOf('// 3. Rebuild Notes')
    );
    const classes = fn.match(/className = `[^`]*`/g) || [];
    assert.strictEqual(classes.length, 2);
    classes.forEach((c) => assert.ok(c.includes('cursor-grab active:cursor-grabbing'), c));
    assert.ok(classes[0].includes('text-sm'), classes[0]);
});

console.log(`\nPASSED: ${passed}/${total}, FAILED: ${total - passed}`);
if (passed !== total) process.exit(1);
