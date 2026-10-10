// Imported overrides and doctor-removal pruning apply only when a run commits.
const assert = require('assert');
const { loadApp, reset, settle, setInput, snap, importJSON, runner } = require('./domHarness');

(async () => {
    const w = await loadApp();
    const { test, done } = runner('commitOnlyOverrides');
    const names = (d) => snap(w, `globalResult.schedule[${d - 1}].selectedDocs.map(s=>s.name)`);
    const failQuota = async () => {
        setInput(w, 'inputSinglePoolQuota', 'A:1');
        await w.generateSchedule();
        assert.ok(w.toasts.slice(-1)[0].isError, 'the run must fail');
    };

    await test('S1 failed run after import leaves displayed result, edits and undo untouched', async () => {
        reset(w);
        await w.generateSchedule();
        w.updateDoctorAssignment(5, 0, 3);
        const cfg = JSON.parse(JSON.stringify(snap(w, 'getCurrentConfig()')));
        cfg.inputs.inputMonth = '2';
        cfg.inputs.inputSinglePoolQuota = 'A:1';
        cfg.manualOverrides = { 10: { 0: 'B' } };
        const day10 = names(10);
        await importJSON(w, cfg);
        assert.ok(w.toasts.slice(-1)[0].isError, 'import run fails');
        assert.deepStrictEqual(snap(w, 'manualOverrides'), { 5: { 0: 'D' } });
        assert.strictEqual(snap(w, 'undoStack.length'), 1);
        w.updateDoctorAssignment(6, 0, 2);
        w.undoLastAction();
        assert.deepStrictEqual(names(10), day10);
        assert.strictEqual(names(5)[0], 'D');
        assert.deepStrictEqual(snap(w, 'manualOverrides'), { 5: { 0: 'D' } });
    });

    await test('S1 successful import adopts imported overrides and clears undo', async () => {
        reset(w);
        await w.generateSchedule();
        w.updateDoctorAssignment(5, 0, 3);
        const cfg = JSON.parse(JSON.stringify(snap(w, 'getCurrentConfig()')));
        cfg.manualOverrides = { 10: { 0: 'B' } };
        await importJSON(w, cfg);
        assert.deepStrictEqual(snap(w, 'manualOverrides'), { 10: { 0: 'B' } });
        assert.strictEqual(snap(w, 'undoStack.length'), 0);
        assert.strictEqual(names(10)[0], 'B');
    });

    await test('S2 removeDoctor after a failed run keeps the edit until a run commits', async () => {
        reset(w);
        await w.generateSchedule();
        w.updateDoctorAssignment(5, 0, 3); // D
        setInput(w, 'inputMonth', '2');
        await failQuota();
        w.removeDoctor(3);
        await settle(w);
        assert.deepStrictEqual(snap(w, 'globalResult.doctors'), ['A', 'B', 'C', 'D']);
        assert.strictEqual(names(5)[0], 'D');
        w.updateDoctorAssignment(6, 0, 2);
        w.undoLastAction();
        assert.strictEqual(names(5)[0], 'D', 'earlier edit must not revert');
    });

    await test('S2 a committed run prunes overrides of doctors no longer in the result', async () => {
        reset(w);
        await w.generateSchedule();
        w.updateDoctorAssignment(5, 0, 3); // D
        w.removeDoctor(3);
        await settle(w);
        assert.deepStrictEqual(snap(w, 'globalResult.doctors'), ['A', 'B', 'C']);
        assert.deepStrictEqual(snap(w, 'manualOverrides'), {});
        assert.ok(!names(5).includes('D'));
    });

    done();
})();
