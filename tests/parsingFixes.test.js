process.env.TZ = 'America/New_York'; // before anything touches Date
const assert = require('assert');
const { loadApp, reset, settle, setInput, runner } = require('./domHarness');

(async () => {
    const w = await loadApp();
    const d = w.document;
    const { test, done } = runner('parsingFixes');
    const custom = (start, end) => {
        setInput(w, 'chkCustomDateRange', true);
        w.eval('isCustomDateRange = true');
        setInput(w, 'inputStartDate', start);
        setInput(w, 'inputEndDate', end);
    };
    const note = (c, day, name) => {
        const row = {
            day,
            isHoliday: false,
            isNoDuty: false,
            selectedDocs: [{ name, role: 'Default' }],
        };
        w.updateDayNote(row, null, c);
        return row.note;
    };

    await test('C6: empty shift-slot input falls back to 1, 0 is kept, 99 clamps to 10', () => {
        reset(w);
        setInput(w, 'chkShiftBased', true);
        setInput(w, 'inputMorningSlots', '');
        setInput(w, 'inputAfternoonSlots', '0');
        setInput(w, 'inputNightSlots', '99');
        const c = w.parseUIConfig();
        assert.deepStrictEqual([c.morningSlots, c.afternoonSlots, c.nightSlots], [1, 0, 10]);
        assert.doesNotThrow(() => w.generateSingleScheduleCandidate(0, c));
    });

    await test('I3: off-day notes follow config.offMap (ranges and lists)', () => {
        reset(w);
        w.eval(
            `offData = [{ id: 1, date: '2-4', names: 'A' }, { id: 2, date: '10,12', names: 'B' }];`
        );
        const c = w.parseUIConfig();
        assert.ok(note(c, 3, 'A').includes('requested Off'), 'range day 3');
        assert.ok(note(c, 12, 'B').includes('requested Off'), 'list day 12');
        assert.ok(!note(c, 5, 'A').includes('requested Off'), 'day 5 is not off');
    });

    await test('I3: custom-range notes use the DD/MM/YYYY key of the row date', () => {
        reset(w, ['A', 'B']);
        w.eval(`
            isCustomDateRange = true;
            scheduleDates = [new Date(2026, 2, 1), new Date(2026, 2, 2), new Date(2026, 2, 3)];
            offData = [{ id: 1, date: '02/03/2026', names: 'A' }];
        `);
        const c = w.parseUIConfig();
        assert.ok(note(c, 2, 'A').includes('requested Off'), 'day 2 is 02/03');
        assert.ok(!note(c, 1, 'A').includes('requested Off'), 'day 1 is not off');
    });

    await test('I4: custom mode reaches explainSlotFailure', () => {
        reset(w, ['A', 'B']);
        w.eval(`
            isCustomDateRange = true;
            scheduleDates = [new Date(2026, 2, 1), new Date(2026, 2, 2), new Date(2026, 2, 3)];
            offData = [{ id: 1, date: '02/03/2026', names: 'A' }];
        `);
        const c = w.parseUIConfig();
        assert.strictEqual(c.isCustomDateRange, true);
        w.eval(
            `globalResult = {
                schedule: [1, 2, 3].map((d) => ({ day: d, selectedDocs: [{ name: d === 2 ? 'A' : 'B' }] })),
                doctors: ['A', 'B'], dates: scheduleDates.slice(), isCustomDateRange: true,
            };`
        );
        w.explainSlotFailure(2, 'A', c);
        assert.ok(
            w.toasts.some((t) => t.msg.includes('requested off today')),
            JSON.stringify(w.toasts)
        );
    });

    await test('I5: a role quota is per doctor, so 20 each is impossible for two doctors', () => {
        reset(w, ['A', 'B']);
        setInput(w, 'chkRoleBased', true);
        setInput(w, 'inputDoctorRoles', 'A:R1,B:R1');
        setInput(w, 'inputDefaultRoleSlots', 'R1:2');
        setInput(w, 'inputRoleQuotas', 'R1:20');
        setInput(w, 'chkAllowBlankDays', true);
        assert.strictEqual(w.checkQuotaFeasibility(w.parseUIConfig()).length, 2);
    });

    await test('I8: a huge numeric off range is clamped to the schedule', () => {
        reset(w, ['A', 'B']);
        w.eval(`offData = [{ id: 1, date: '1-3000000', names: 'A' }];`);
        const keys = Object.keys(w.parseUIConfig().offMap).map(Number);
        assert.ok(keys.length <= 31 && Math.max(...keys) <= 31, `${keys.length} keys`);
    });

    await test('I8: a decades-long custom off range is skipped with a warning', () => {
        reset(w, ['A', 'B']);
        w.eval(`
            isCustomDateRange = true;
            scheduleDates = [new Date(2026, 2, 1), new Date(2026, 2, 2)];
            offData = [{ id: 1, date: '01/01/2000-31/12/2026', names: 'A' }];
        `);
        assert.strictEqual(Object.keys(w.parseUIConfig().offMap).length, 0);
        assert.ok(w.toasts.some((t) => t.msg.includes('too long')));
    });

    await test('DST: a custom off range across a fall-back day keeps every date', () => {
        reset(w, ['A', 'B']);
        w.eval(`
            isCustomDateRange = true;
            scheduleDates = Array.from({ length: 6 }, (_, i) => new Date(2026, 9, 30 + i));
            offData = [{ id: 1, date: '31/10/2026-03/11/2026', names: 'A' }];
        `);
        assert.deepStrictEqual(Object.keys(w.parseUIConfig().offMap), [
            '31/10/2026',
            '01/11/2026',
            '02/11/2026',
            '03/11/2026',
        ]);
    });

    await test('M-year: years below 1000 are rejected with a toast, BE years are fine', async () => {
        reset(w);
        await w.generateSchedule();
        const before = w.eval('globalResult');
        for (const y of ['26', '0', '']) {
            setInput(w, 'inputYear', y);
            w.toasts.length = 0;
            await w.generateSchedule();
            assert.ok(
                w.toasts.some((t) => t.isError && t.msg === w.eval('translations.en.yearInvalid')),
                `no year toast for "${y}"`
            );
            assert.strictEqual(w.eval('globalResult'), before, `result replaced for "${y}"`);
        }
        setInput(w, 'inputYear', '2569');
        await w.generateSchedule();
        assert.strictEqual(w.eval('globalResult.schedule.length'), 31);
    });

    for (const tz of ['America/New_York', 'Asia/Bangkok', 'Pacific/Kiritimati']) {
        await test(`M-utc (${tz}): custom range days and the date-picker chip keep their date`, async () => {
            process.env.TZ = tz;
            reset(w);
            custom('2026-03-01', '2026-03-03');
            await w.generateSchedule();
            assert.strictEqual(w.eval('scheduleDates.map((x) => x.getDate()).join()'), '1,2,3');
            const ui = d.getElementById('inputSpecialHolsUI');
            ui.type = 'date';
            ui.value = '2026-03-01';
            ui.dispatchEvent(new w.Event('change'));
            assert.strictEqual(d.getElementById('inputSpecialHols').value, '01/03/2026');
            process.env.TZ = 'America/New_York';
        });
    }

    await test('F4: month outside 1..12 or empty is rejected with a toast', async () => {
        reset(w);
        await w.generateSchedule();
        const before = w.eval('globalResult');
        for (const m of ['13', '0', '']) {
            setInput(w, 'inputMonth', m);
            w.toasts.length = 0;
            await w.generateSchedule();
            assert.ok(
                w.toasts.some((t) => t.isError && t.msg === w.eval('translations.en.monthInvalid')),
                `no month toast for "${m}"`
            );
            assert.strictEqual(w.eval('globalResult'), before, `result replaced for "${m}"`);
        }
        assert.ok(w.eval('translations.th.monthInvalid'));
        setInput(w, 'inputMonth', '1');
    });

    await test('F7: sanitizeName strips slash and zero-width chars, so they dedupe', () => {
        assert.strictEqual(w.eval('sanitizeName(' + JSON.stringify('A/B') + ')'), 'A B');
        assert.strictEqual(w.eval('sanitizeName(' + JSON.stringify('A​') + ')'), 'A');
        assert.strictEqual(w.eval('sanitizeName(' + JSON.stringify('﻿A‌‍') + ')'), 'A');
        const c = w.sanitizeConfig({ doctors: ['A', 'A​'] }).config;
        assert.deepStrictEqual(Array.from(c.doctors), ['A']);
    });

    await test('F8: periodLabel year follows the language after a toggle', async () => {
        reset(w);
        w.eval(`currentLang = 'th'`);
        setInput(w, 'inputYear', '2569');
        await w.generateSchedule();
        assert.ok(w.periodLabel('th').endsWith('1/2569'), w.periodLabel('th'));
        w.toggleLanguage();
        await settle(w);
        assert.strictEqual(w.eval('currentLang'), 'en');
        assert.ok(w.periodLabel('en').endsWith('1/2026'), w.periodLabel('en'));
        assert.ok(w.periodLabel('th').endsWith('1/2569'), w.periodLabel('th'));
    });

    done();
})();
