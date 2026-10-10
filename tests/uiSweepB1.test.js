const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadApp, reset, settle, runner } = require('./domHarness');

const src = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const key = (w, k, e = {}) =>
    w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, ...e }));

(async () => {
    const w = await loadApp();
    const T = w.eval('translations');
    const d = w.document;
    const { test, done } = runner('uiSweepB1');
    const chips = (id) => d.getElementById(id).value;
    const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));

    await test('B1 partial year in a date chip input is ignored; full date commits', async () => {
        reset(w);
        w.eval('isCustomDateRange = true');
        const ui = d.getElementById('inputNoDutyUI');
        ui.type = 'date';
        ui.value = '0002-01-05';
        fire(ui, 'change');
        assert.strictEqual(chips('inputNoDuty'), '');
        assert.strictEqual(ui.value, '0002-01-05', 'typing must not be wiped');
        ui.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        ui.dispatchEvent(new w.Event('blur'));
        assert.strictEqual(chips('inputNoDuty'), '');
        ui.value = '2026-01-05';
        fire(ui, 'change');
        assert.strictEqual(chips('inputNoDuty'), '05/01/2026');
        await settle(w);
    });

    await test('B2 toggling custom range re-types the chip inputs', async () => {
        reset(w);
        const chk = d.getElementById('chkCustomDateRange');
        chk.checked = true;
        fire(chk, 'change');
        assert.strictEqual(d.getElementById('inputNoDutyUI').type, 'date');
        assert.strictEqual(d.getElementById('inputSpecialHolsUI').type, 'date');
        chk.checked = false;
        fire(chk, 'change');
        await settle(w);
        assert.strictEqual(d.getElementById('inputNoDutyUI').type, 'text');
        assert.strictEqual(d.getElementById('inputSpecialHolsUI').type, 'text');
    });

    await test('B3 cancelled/empty/duplicate role prompt', async () => {
        reset(w);
        d.getElementById('chkRoleBased').checked = true;
        d.getElementById('inputDoctorRoles').value = 'A:R2, B:R1, C:R1, D:R1';
        w.renderStructuredDoctorRoles();
        await settle(w);
        const sel = () => d.querySelector('.doc-role-select');
        assert.strictEqual(sel().value, 'R2');
        let n = 0;
        const gs = w.generateSchedule;
        w.generateSchedule = (...a) => (n++, gs(...a));
        for (const answer of [null, '   ']) {
            w.prompt = () => answer;
            sel().value = '__NEW__';
            sel().dispatchEvent(new w.Event('change'));
            assert.strictEqual(sel().value, 'R2', 'restored for ' + answer);
        }
        assert.strictEqual(n, 0, 'no regenerate');
        w.prompt = () => 'R1';
        sel().value = '__NEW__';
        sel().dispatchEvent(new w.Event('change'));
        assert.strictEqual(sel().value, 'R1');
        assert.strictEqual(sel().querySelectorAll('option[value="R1"]').length, 1);
        w.generateSchedule = gs;
        await settle(w);
    });

    await test('B7 first minus on an unset quota is a no-op', async () => {
        reset(w);
        w.updateSinglePoolQuota('A', -1);
        assert.strictEqual(chips('inputSinglePoolQuota'), '');
        d.getElementById('chkRoleBased').checked = true;
        d.getElementById('inputDoctorRoles').value = 'A:R1, B:R1, C:R2, D:R2';
        w.renderStructuredDoctorRoles();
        w.updateRoleQuota('R1', -1);
        assert.strictEqual(chips('inputRoleQuotas'), '');
        assert.strictEqual(w.toasts.length, 0, JSON.stringify(w.toasts));
        await settle(w);
    });

    await test('B8 role slots keep a sum >= 1 and clamp at 10; quotas clamp', async () => {
        reset(w);
        d.getElementById('chkRoleBased').checked = true;
        d.getElementById('inputDoctorRoles').value = 'A:R1, B:R1, C:R2, D:R2';
        d.getElementById('inputDefaultRoleSlots').value = 'R1:1, R2:0';
        w.renderStructuredDoctorRoles();
        w.toasts.length = 0;
        w.updateRoleSlot('R1', -1);
        assert.strictEqual(chips('inputDefaultRoleSlots'), 'R1:1, R2:0');
        assert.strictEqual(w.toasts.length, 1);
        assert.ok(T.th.roleSlotsMinOne && T.en.roleSlotsMinOne);
        for (let i = 0; i < 15; i++) w.updateRoleSlot('R2', 1);
        assert.ok(/R2:10/.test(chips('inputDefaultRoleSlots')), chips('inputDefaultRoleSlots'));
        for (let i = 0; i < 100; i++) w.updateRoleQuota('R1', 1);
        const q = parseInt(chips('inputRoleQuotas').split(':')[1]);
        assert.ok(q > 0 && q <= 90, q);
        await settle(w);
    });

    await test('B11 incomplete conflict rows do not regenerate', async () => {
        reset(w);
        let n = 0;
        const gs = w.generateSchedule;
        w.generateSchedule = (...a) => (n++, gs(...a));
        w.addStructuredConflictPair();
        assert.strictEqual(n, 0);
        const row = d.querySelector('#structuredConflictsContainer .flex');
        row.querySelector('.conflict-doc-1').value = 'A';
        w.syncStructuredConflicts();
        assert.strictEqual(n, 0);
        row.querySelector('.conflict-doc-2').value = 'B';
        w.syncStructuredConflicts();
        assert.strictEqual(n, 1);
        w.addStructuredConflictPair();
        assert.strictEqual(n, 1);
        w.generateSchedule = gs;
        await settle(w);
    });

    done();
})();
