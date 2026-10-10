const assert = require('assert');
const { loadApp, reset } = require('./domHarness');

(async () => {
    const w = await loadApp();
    const d = w.document;
    const { test, done } = require('./domHarness').runner('uiI18nFixes');

    await test('U2 role option and cell aria follow the language', async () => {
        reset(w);
        await w.generateSchedule();
        w.eval("document.getElementById('chkRoleBased').checked = true");
        w.renderStructuredDoctorRoles();
        w.toggleLanguage();
        assert.strictEqual(w.eval('currentLang'), 'th');
        assert.ok(/[฀-๿]/.test(d.querySelector('#btn-day-1-slot-0').getAttribute('aria-label')));
        const opt = d.querySelector('.doc-role-select option[value="__NEW__"]');
        assert.ok(opt && /[฀-๿]/.test(opt.textContent), opt && opt.textContent);
        w.toggleLanguage();
        assert.ok(/^Day /.test(d.querySelector('#btn-day-1-slot-0').getAttribute('aria-label')));
    });

    await test('U1 OK button is i18n', () => {
        const ids = [...d.querySelectorAll('[data-i18n="okBtn"]')];
        assert.ok(ids.length >= 1);
        assert.ok(!/ตกลง \/ OK/.test(d.body.innerHTML));
    });

    await test('U5/U4 dead classes and robots.txt', () => {
        const fs = require('fs');
        const src = ['index.html', 'app.js', 'structuredInputs.js']
            .map((f) => fs.readFileSync(require('path').join(__dirname, '..', f), 'utf8'))
            .join('\n');
        assert.ok(!/animate-in|fade-in|duration-400/.test(src));
        assert.ok(
            !/Sitemap:\s*Sitemap:/.test(
                fs.readFileSync(require('path').join(__dirname, '..', 'robots.txt'), 'utf8')
            )
        );
    });

    await test('U3 manual wording', () => {
        const t = w.eval('translations');
        const all = JSON.stringify([t.th, t.en]);
        assert.ok(!/ก็ย้อนกลับได้เช่นกัน|can also be undone/.test(all));
        assert.ok(/ไม่สามารถย้อนกลับได้/.test(t.th.manualSection5Body));
        assert.ok(/cannot be undone/.test(t.en.manualSection5Body));
        assert.ok(/แทนที่อักขระ/.test(t.th.manualSection6Body));
        assert.ok(/replaced with a space/.test(t.en.manualSection6Body));
    });

    done();
})();
