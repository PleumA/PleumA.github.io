const assert = require('assert');
const { loadApp, reset, settle, setInput, snap, importJSON, runner } = require('./domHarness');

(async () => {
    const w = await loadApp();
    const d = w.document;
    const { test, done } = runner('editingState');
    const cleared = () => w.eval('translations.en.overridesCleared');

    await test('C1: undo reverts the schedule, summary and fairness row', async () => {
        reset(w);
        await w.generateSchedule();
        const cell = () => w.eval('globalResult.schedule[4].selectedDocs[0].name');
        const strip = () => d.getElementById('fairnessStrip').textContent;
        const total = () => w.eval('globalResult.summary.reduce((a, s) => a + s.total, 0)');
        const before = { cell: cell(), strip: strip(), total: total() };
        w.updateDoctorAssignment(5, 0, before.cell === 'A' ? 1 : 0);
        assert.notStrictEqual(cell(), before.cell, 'edit did not apply');
        w.undoLastAction();
        assert.strictEqual(cell(), before.cell);
        assert.strictEqual(strip(), before.strip);
        assert.strictEqual(total(), before.total);
        assert.strictEqual(
            d.querySelector('#btn-day-5-slot-0 span.truncate').textContent,
            before.cell
        );
    });

    await test('I1: manual edits are cleared, with a toast, when the month changes', async () => {
        reset(w);
        await w.generateSchedule();
        w.updateDoctorAssignment(5, 1, 0);
        assert.ok(w.eval('undoStack.length') > 0);
        setInput(w, 'inputMonth', '2');
        w.toasts.length = 0;
        await w.generateSchedule();
        assert.deepStrictEqual(snap(w, 'manualOverrides'), {});
        assert.strictEqual(w.eval('undoStack.length'), 0);
        assert.ok(
            w.toasts.some((t) => t.msg === cleared()),
            'no discard toast'
        );
        // switching back does not resurrect them, and nothing is announced when there is nothing to clear
        setInput(w, 'inputMonth', '1');
        w.toasts.length = 0;
        await w.generateSchedule();
        assert.deepStrictEqual(snap(w, 'manualOverrides'), {});
        assert.ok(!w.toasts.some((t) => t.msg === cleared()));
    });

    await test('I1: a custom range change clears manual edits', async () => {
        reset(w);
        await w.generateSchedule();
        w.updateDoctorAssignment(2, 0, 1);
        setInput(w, 'chkCustomDateRange', true);
        w.eval('isCustomDateRange = true');
        setInput(w, 'inputStartDate', '2026-03-01');
        setInput(w, 'inputEndDate', '2026-03-10');
        await w.generateSchedule();
        assert.deepStrictEqual(snap(w, 'manualOverrides'), {});
    });

    await test('I1: an imported config brings its own overrides and drops old undo history', async () => {
        reset(w);
        await w.generateSchedule();
        w.updateDoctorAssignment(3, 0, 1); // leaves one undo entry
        await importJSON(w, {
            doctors: ['A', 'B', 'C', 'D'],
            manualOverrides: { 5: { 0: 'D' } },
            inputs: { inputMonth: '3', inputYear: '2026' },
        });
        assert.deepStrictEqual(snap(w, 'manualOverrides'), { 5: { 0: 'D' } });
        assert.strictEqual(w.eval('undoStack.length'), 0);
        assert.strictEqual(w.eval('globalResult.schedule[4].selectedDocs[0].name'), 'D');
    });

    await test('I2: a change made mid-calculation is queued and uses the latest inputs', async () => {
        reset(w);
        const first = w.generateSchedule(); // Jan, parked on its first timer
        setInput(w, 'inputMonth', '2'); // what the change listener would do
        await w.generateSchedule(); // used to return at once and drop the change
        await first;
        await settle(w);
        assert.strictEqual(w.eval('globalResult.month'), 2);
        assert.strictEqual(w.eval('globalResult.schedule.length'), 28);
        assert.strictEqual(w.eval('globalResult.originalSchedule.length'), 28);
    });

    await test('I2: back to back calls with no settle; many queued calls coalesce into the latest inputs', async () => {
        reset(w);
        const a = w.generateSchedule();
        setInput(w, 'inputMonth', '2');
        const b = w.generateSchedule();
        setInput(w, 'inputMonth', '4'); // 30 days
        const c = w.generateSchedule();
        await Promise.all([a, b, c]);
        assert.strictEqual(w.eval('isCalculating'), false);
        assert.strictEqual(w.eval('globalResult.month'), 4);
        assert.strictEqual(w.eval('globalResult.schedule.length'), 30);
        assert.strictEqual(w.eval('regenPending'), false);
    });

    await test('I2: a queued run that fails validation does not wedge the queue', async () => {
        reset(w);
        const first = w.generateSchedule();
        setInput(w, 'inputYear', '26');
        await w.generateSchedule();
        await first;
        await settle(w);
        assert.strictEqual(w.eval('isCalculating'), false);
        setInput(w, 'inputYear', '2026');
        await w.generateSchedule();
        assert.strictEqual(w.eval('globalResult.schedule.length'), 31);
    });

    done();
})();
