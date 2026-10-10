const assert = require('assert');
const { loadApp, reset, settle, snap, importJSON, runner } = require('./domHarness');

(async () => {
    const w = await loadApp();
    const d = w.document;
    const { test, done } = runner('importValidation');
    const state = () => snap(w, '({ doctors, offData, extraSlotsData, manualOverrides })');
    const errors = () => w.toasts.filter((t) => t.isError).map((t) => t.msg);
    const rejectedMsg = () => w.eval('translations.en.importInvalid');

    await test('a wrong container type is rejected and nothing changes', async () => {
        const bad = [
            { doctors: 'X' },
            { offData: {} },
            { extraSlotsData: 5 },
            { manualOverrides: [] },
            { inputs: 'x' },
            [],
            null,
            7,
        ];
        for (const file of bad) {
            reset(w, ['A', 'B', 'C']);
            const before = state();
            await importJSON(w, JSON.stringify(file));
            assert.deepStrictEqual(state(), before, `state changed for ${JSON.stringify(file)}`);
            assert.ok(
                errors().includes(rejectedMsg()),
                `no rejection toast for ${JSON.stringify(file)}`
            );
        }
        await w.generateSchedule(); // not wedged
        assert.deepStrictEqual(snap(w, 'globalResult.summary.map((s) => s.name)'), ['A', 'B', 'C']);
    });

    const cases = [
        [
            'null override day',
            { doctors: ['X', 'Y', 'Z'], manualOverrides: { 1: null } },
            { doctors: ['X', 'Y', 'Z'], manualOverrides: {} },
        ],
        [
            'override values must be strings with digit keys',
            { manualOverrides: { 1: { 0: 5, 1: 'X' }, abc: { 0: 'X' }, 2: { zz: 'X' } } },
            { manualOverrides: { 1: { 1: 'X' } } },
        ],
        ['offData null entry', { offData: [null] }, { offData: [] }],
        [
            'offData without names',
            { offData: [{ id: 1, date: '1' }] },
            { offData: [{ id: 1, date: '1', names: '' }] },
        ],
        ['numeric doctors', { doctors: [1, 2, 3] }, { doctors: ['1', '2', '3'] }],
        ['duplicate doctors', { doctors: ['X', 'X', 'Y'] }, { doctors: ['X', 'Y'] }],
        [
            'doctors are cleaned',
            { doctors: ['Dr:A', ' B ', 'C;', ''] },
            { doctors: ['Dr A', 'B', 'C'] },
        ],
        [
            'extra slots junk',
            { doctors: ['X', 'Y', 'Z'], extraSlotsData: [{ id: 1 }] },
            { extraSlotsData: [{ id: 1, date: '', slots: '' }] },
        ],
        [
            'duplicate row ids are renumbered',
            {
                offData: [
                    { id: 1, date: '1', names: 'A' },
                    { id: 1, date: '2', names: 'B' },
                ],
            },
            {
                offData: [
                    { id: 1, date: '1', names: 'A' },
                    { id: 2, date: '2', names: 'B' },
                ],
            },
        ],
        [
            'numeric off date is kept',
            { offData: [{ id: 1, date: 5, names: 'A' }] },
            { offData: [{ id: 1, date: 5, names: 'A' }] },
        ],
    ];
    for (const [label, input, expected] of cases) {
        await test(`import coerces: ${label}`, async () => {
            reset(w, ['A', 'B', 'C']);
            await importJSON(w, input);
            const s = state();
            for (const [key, value] of Object.entries(expected))
                assert.deepStrictEqual(s[key], value, key);
            assert.ok(!errors().includes(rejectedMsg()), 'valid file was rejected');
            assert.ok(!errors().some((m) => m.includes('Error reading JSON')), 'import threw');
        });
    }

    await test('an imported __proto__ key cannot pollute Object.prototype', async () => {
        reset(w);
        await importJSON(
            w,
            '{"manualOverrides":{"__proto__":{"0":"X"},"1":{"__proto__":"y","0":"A"}}}'
        );
        assert.strictEqual(w.eval('({})[0]'), undefined);
        assert.deepStrictEqual(snap(w, 'manualOverrides'), { 1: { 0: 'A' } });
    });

    await test('an import that throws after assigning state rolls back', async () => {
        reset(w, ['A', 'B', 'C']);
        w.eval(`overridesPeriod = '1-2026'; undoStack.push({ 1: { 0: 'A' } })`);
        const real = w.renderOffRequests;
        w.renderOffRequests = () => {
            throw new Error('boom');
        };
        const realErr = console.error;
        console.error = () => {};
        try {
            await importJSON(w, { doctors: ['X', 'Y', 'Z'] });
        } finally {
            console.error = realErr;
            w.renderOffRequests = real;
        }
        assert.deepStrictEqual(snap(w, 'doctors'), ['A', 'B', 'C']);
        assert.ok(errors().some((m) => m.includes('Error reading JSON')));
        assert.strictEqual(w.eval('overridesPeriod'), '1-2026', 'overridesPeriod lost');
        assert.deepStrictEqual(snap(w, 'undoStack'), [{ 1: { 0: 'A' } }], 'undo history lost');
    });

    await test('names are renamed consistently in overrides and off requests', async () => {
        reset(w, ['A', 'B']);
        await importJSON(w, {
            doctors: ['A:1', 'B'],
            offData: [{ id: 1, date: '2', names: 'A:1, B, Ghost' }],
            manualOverrides: { 1: { 0: 'A:1', 1: 'Ghost' } },
        });
        const s = snap(w, '({ doctors, offData, manualOverrides })');
        assert.deepStrictEqual(s.doctors, ['A 1', 'B']);
        assert.strictEqual(s.offData[0].names, 'A 1, B');
        assert.deepStrictEqual(s.manualOverrides, { 1: { 0: 'A 1' } });
        const q = w.sanitizeConfig({
            doctors: ['A:1'],
            quota: { 'A:1': 2, B: 'x', C: null, D: -1 },
        });
        assert.deepStrictEqual(JSON.parse(JSON.stringify(q.config.quota)), { 'A 1': 2, D: -1 });
    });

    await test('a doctors list that cleans to nothing is rejected', async () => {
        reset(w, ['A', 'B']);
        await importJSON(w, { doctors: [':', null, ' '] });
        assert.deepStrictEqual(snap(w, 'doctors'), ['A', 'B']);
        assert.ok(errors().includes(rejectedMsg()));
    });

    await test('a huge offData array does not overflow the stack', () => {
        const offData = Array.from({ length: 300000 }, (_, i) => ({
            id: i + 1,
            date: '1',
            names: '',
        }));
        assert.ok(w.sanitizeConfig({ offData }).ok);
    });

    await test('a late failure restores inputs, checkboxes, tags and data', async () => {
        reset(w, ['A', 'B', 'C']);
        w.syncDoctorsToInput();
        w.renderDoctorTags();
        d.getElementById('inputDefaultSlots').value = '3';
        d.getElementById('chkAllowBlankDays').checked = true;
        const before = {
            state: state(),
            slots: d.getElementById('inputDefaultSlots').value,
            blank: d.getElementById('chkAllowBlankDays').checked,
            tags: d.getElementById('doctorTagsContainer')?.textContent,
            text: d.getElementById('inputDoctors')?.value,
        };
        const real = w.renderExtraSlots;
        w.renderExtraSlots = () => {
            w.renderExtraSlots = real;
            throw new Error('boom');
        };
        const realErr = console.error;
        console.error = () => {};
        w.toasts.length = 0;
        try {
            await importJSON(w, {
                doctors: ['X', 'Y', 'Z'],
                inputs: { inputDefaultSlots: '1' },
                checkboxes: { chkAllowBlankDays: false },
            });
        } finally {
            console.error = realErr;
            w.renderExtraSlots = real;
        }
        assert.deepStrictEqual(state(), before.state);
        assert.strictEqual(d.getElementById('inputDefaultSlots').value, before.slots);
        assert.strictEqual(d.getElementById('chkAllowBlankDays').checked, before.blank);
        assert.strictEqual(d.getElementById('doctorTagsContainer')?.textContent, before.tags);
        assert.strictEqual(d.getElementById('inputDoctors')?.value, before.text);
        assert.ok(
            !w.toasts.some((t) => t.msg === 'Config imported successfully!'),
            'success toast shown'
        );
        assert.ok(errors().some((m) => m.includes('Error reading JSON')));
    });

    await test('addDoctor strips separators, trims, and drops duplicates', async () => {
        reset(w, ['A', 'B']);
        w.addDoctor('  Dr:X; Y,\nZ  ');
        w.addDoctor(':;,'); // nothing left after cleaning
        w.toasts.length = 0;
        w.addDoctor('A:'); // cleans to the existing "A"
        await settle(w);
        assert.deepStrictEqual(snap(w, 'doctors'), ['A', 'B', 'Dr X Y Z']);
        assert.strictEqual(errors().length, 1, 'duplicate should toast once');
    });

    await test('Thai names pass through unchanged', async () => {
        reset(w, ['A', 'B']);
        w.addDoctor('นพ. สมชาย ใจดี');
        await settle(w);
        assert.deepStrictEqual(snap(w, 'doctors'), ['A', 'B', 'นพ. สมชาย ใจดี']);
    });

    await test('the comma/Enter keydown path cleans names too', async () => {
        reset(w, ['A', 'B']);
        const input = d.getElementById('doctorInput');
        input.value = 'P;Q';
        input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
        await settle(w);
        assert.deepStrictEqual(snap(w, 'doctors'), ['A', 'B', 'P Q']);
        input.value = 'R,S';
        input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
        await settle(w);
        assert.deepStrictEqual(snap(w, 'doctors'), ['A', 'B', 'P Q', 'R S']);
    });

    await test('a new role name from the prompt is cleaned', () => {
        reset(w, ['A', 'B']);
        w.renderStructuredDoctorRoles();
        w.prompt = () => ' R:3,x ';
        const sel = d.querySelector('.doc-role-select');
        sel.value = '__NEW__';
        w.handleDocRoleSelectChange(sel);
        assert.ok(
            [...sel.options].some((o) => o.value === 'R 3 x'),
            'cleaned role missing'
        );
    });

    await test('F6: only keys getCurrentConfig emits survive; values are coerced', () => {
        const raw = JSON.parse(
            '{"inputs":{"btnCalculate":"x","__proto__":{"a":1},"inputYear":{"o":1},"inputMonth":5,"inputConflicts":"A:B"},"checkboxes":{"chkRoleBased":"yes","evil":true,"chkShiftBased":0}}'
        );
        const c = JSON.parse(JSON.stringify(w.sanitizeConfig(raw).config));
        assert.ok(!('btnCalculate' in c.inputs) && !('evil' in c.checkboxes));
        assert.ok(!Object.hasOwn(c.inputs, '__proto__'));
        assert.ok(!('a' in Object.getPrototypeOf(w.eval('({})'))));
        assert.ok(!('inputYear' in c.inputs) || typeof c.inputs.inputYear === 'string');
        assert.strictEqual(c.inputs.inputMonth, '5');
        assert.strictEqual(c.inputs.inputConflicts, 'A:B');
        assert.strictEqual(c.checkboxes.chkRoleBased, true);
        assert.strictEqual(c.checkboxes.chkShiftBased, false);
    });

    done();
})();
