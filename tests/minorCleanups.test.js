const assert = require('assert');
const fs = require('fs');
const { loadApp, reset, settle, setInput, runner } = require('./domHarness');

(async () => {
    const w = await loadApp();
    const d = w.document;
    const { test, done } = runner('minorCleanups');

    await test('header buttons carry data-i18n-aria and follow the language', () => {
        reset(w);
        const ids = {
            btnDarkMode: 'darkModeTitle',
            btnLanguage: 'langSwitchTitle',
            btnManual: 'manualBtnTitle',
            btnCalculate: 'calcBtn',
        };
        const tr = (lang, key) => w.eval(`translations.${lang}.${key}`);
        for (const [id, key] of Object.entries(ids)) {
            assert.strictEqual(d.getElementById(id).getAttribute('data-i18n-aria'), key, id);
        }
        for (const lang of ['th', 'en']) {
            w.eval(`currentLang = '${lang}'`);
            w.applyTranslations();
            for (const [id, key] of Object.entries(ids)) {
                assert.strictEqual(
                    d.getElementById(id).getAttribute('aria-label'),
                    tr(lang, key),
                    `${id} (${lang})`
                );
            }
        }
    });

    await test('conflict editor keeps half-filled rows through add and remove', async () => {
        reset(w, ['A', 'B', 'C']);
        setInput(w, 'inputConflicts', 'A:B');
        w.renderStructuredConflicts();
        const rows = () => [...d.querySelectorAll('#structuredConflictsContainer .flex')];
        w.addStructuredConflictPair(); // row 2 is empty
        rows()[1].querySelector('.conflict-doc-1').value = 'C'; // half-filled: no partner yet
        w.addStructuredConflictPair(); // used to drop the half-filled row
        await settle(w);
        assert.strictEqual(rows().length, 3);
        assert.strictEqual(rows()[1].querySelector('.conflict-doc-1').value, 'C');
        w.removeStructuredConflict(0); // removes A:B, not whatever shares the index in the text
        await settle(w);
        assert.strictEqual(rows().length, 2);
        assert.strictEqual(rows()[0].querySelector('.conflict-doc-1').value, 'C');
    });

    await test('removeDoctor drops the name from every structured section', async () => {
        reset(w, ['Alice', 'Bob', 'Zed']);
        setInput(w, 'inputDoctorRoles', 'Alice:R1, Bob:R1, Zed:RZ');
        setInput(w, 'inputRoleQuotas', 'RZ:2');
        setInput(w, 'inputConflicts', 'Alice:Zed, Alice:Bob');
        setInput(w, 'inputSpecialDocs', 'Zed');
        w.initStructuredInputs();
        w.renderSpecialDocsCheckboxList();
        const idx = w.eval('doctors.indexOf("Zed")');
        w.removeDoctor(idx);
        await settle(w);
        const sections = {
            roles: '#structuredDoctorRolesContainer',
            roleQuotas: '#structuredRoleQuotasContainer',
            singlePool: '#structuredSinglePoolQuotasContainer',
            conflicts: '#structuredConflictsContainer',
            specialDocs: '#specialDocsCheckboxList',
        };
        for (const [name, sel] of Object.entries(sections)) {
            const el = d.querySelector(sel);
            assert.ok(el, `${name}: container ${sel} not found`);
            const text =
                el.innerHTML +
                [...el.querySelectorAll('input,select')].map((i) => i.value).join('|');
            assert.ok(!/Zed/.test(text), `${name} still shows Zed`);
        }
        assert.ok(
            /Alice/.test(d.querySelector(sections.conflicts).innerHTML),
            'unrelated pair kept'
        );
    });

    await test('the dead confirm-changes button is gone from app.js', () => {
        assert.ok(!/btnConfirmChanges|confirmChanges/.test(fs.readFileSync('app.js', 'utf8')));
    });

    await test('DESIGN_SYSTEM.md no longer documents all-caps labels', () => {
        assert.ok(!/uppercase tracking-wide/.test(fs.readFileSync('DESIGN_SYSTEM.md', 'utf8')));
    });

    done();
})();
