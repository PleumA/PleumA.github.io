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
