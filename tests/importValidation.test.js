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

    done();
})();
