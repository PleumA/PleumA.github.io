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

runTest('index.html has no Thai " / English" duplicate in visible text or attributes', () => {
    // Blank out code/script/style blocks but keep newlines so line numbers stay right.
    const scanned = html.replace(/<(code|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, (m) =>
        m.replace(/[^\n]/g, ' ')
    );
    // Thai (or ')', ']', '.' after Thai) then "/ English", and English then "/ Thai".
    // The second form catches the bilingual tooltip; the ']' and '.' forms catch
    // "ทุกวัน [weekday] / Every" and the "อา. / Sunday" day options.
    const re = /[฀-๿)\].]\s*\/\s*[A-Za-z]{3,}|[A-Za-z]{3,}\s*\/\s*[฀-๿]/g;
    const offenders = [];
    for (const m of scanned.matchAll(re)) {
        const line = scanned.slice(0, m.index).split('\n').length;
        offenders.push(`line ${line}: ${m[0]}`);
    }
    assert.deepStrictEqual(offenders, []);
});

runTest('every title attribute is translatable or already Thai', () => {
    const offenders = (html.match(/<[^>]*\stitle="[^"]*"[^>]*>/g) || []).filter((tag) => {
        const title = tag.match(/\stitle="([^"]*)"/)[1];
        return !/data-i18n-title=/.test(tag) && !/[\u0E00-\u0E7F]/.test(title);
    });
    assert.deepStrictEqual(offenders, []);
});

runTest('every aria-label is translatable or already Thai', () => {
    const offenders = (html.match(/<[^>]*\saria-label="[^"]*"[^>]*>/g) || []).filter((tag) => {
        const label = tag.match(/\saria-label="([^"]*)"/)[1];
        return !/data-i18n-aria=/.test(tag) && !/[\u0E00-\u0E7F]/.test(label);
    });
    assert.deepStrictEqual(offenders, []);
});

runTest('no all-caps label classes (Thai has no case, so EN would look bigger)', () => {
    const offenders = [];
    for (const f of ['index.html', 'app.js', 'structuredInputs.js']) {
        const src = fs.readFileSync(f, 'utf8');
        src.split('\n').forEach((line, i) => {
            if (
                /class(Name)?=["'`][^"'`]*\buppercase\b/.test(line) ||
                /["'`\s]uppercase["'`\s]/.test(line)
            )
                offenders.push(`${f}:${i + 1}`);
        });
    }
    assert.deepStrictEqual(offenders, []);
});

console.log(`\nPASSED: ${passed}/${total}, FAILED: ${total - passed}`);
if (passed !== total) process.exit(1);
