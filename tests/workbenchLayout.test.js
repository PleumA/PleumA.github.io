const assert = require('assert');
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

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

for (const file of ['structuredInputs.js', 'translations.js', 'calendarExport.js', 'app.js']) {
    const el = document.createElement('script');
    el.textContent = fs.readFileSync(file, 'utf8');
    document.body.appendChild(el);
}

let totalTests = 0;
let passedTests = 0;
function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`✅ [PASSED] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`❌ [FAILED] ${name}`);
        console.error(err);
    }
}

const cardOf = (key) =>
    document.querySelector(`[data-i18n="${key}"]`).closest('details, div.rounded-2xl');

runTest('rarely used cards are collapsible and start closed', () => {
    ['docsPerDay', 'advSettings'].forEach((key) => {
        const card = document.querySelector(`[data-i18n="${key}"]`).closest('details');
        assert.ok(card, `${key} card is not a <details>`);
        assert.strictEqual(card.open, false, `${key} should start closed`);
        assert.ok(
            card.querySelector(':scope > summary [data-i18n="' + key + '"]'),
            `${key} title must be in <summary>`
        );
    });
});

runTest('cards with header controls stay plain (no controls inside a summary)', () => {
    ['basicSettings', 'offRequests', 'lockSpecial'].forEach((key) => {
        assert.strictEqual(
            document.querySelector(`[data-i18n="${key}"]`).closest('details'),
            null,
            key
        );
    });
    document.querySelectorAll('summary').forEach((s) => {
        assert.strictEqual(
            s.querySelector('button, input, select, a'),
            null,
            'interactive control inside <summary>'
        );
    });
});

runTest('settings pane is 340px wide and the schedule views have no 600px cap', () => {
    assert.ok(cardOf('basicSettings').closest('section').className.includes('lg:w-[340px]'));
    ['tableViewContainer', 'calendarViewContainer', 'personViewContainer'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) assert.ok(!el.className.includes('max-h-[600px]'), `${id} still capped`);
    });
});

console.log(`\nPASSED: ${passedTests}/${totalTests}, FAILED: ${totalTests - passedTests}`);
if (passedTests !== totalTests) process.exit(1);
