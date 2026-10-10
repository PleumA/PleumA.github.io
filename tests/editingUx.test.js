const assert = require('assert');
const { loadApp, reset, settle, setInput, snap, runner } = require('./domHarness');

(async () => {
    const w = await loadApp();
    const d = w.document;
    const { test, done } = runner('editingUx');
    const errors = () => w.toasts.filter((t) => t.isError).map((t) => t.msg);
    const useCustomRange = async () => {
        setInput(w, 'chkCustomDateRange', true);
        w.eval('isCustomDateRange = true');
        setInput(w, 'inputStartDate', '2026-01-25');
        setInput(w, 'inputEndDate', '2026-01-27');
        await w.generateSchedule();
    };

    await test('I6: language toggle keeps real weekdays and year format in a custom range', async () => {
        reset(w);
        w.eval(`currentLang = 'th'`);
        setInput(w, 'inputYear', '2569');
        setInput(w, 'chkCustomDateRange', true);
        w.eval('isCustomDateRange = true');
        setInput(w, 'inputStartDate', '2026-01-25');
        setInput(w, 'inputEndDate', '2026-02-05');
        await w.generateSchedule();
        assert.strictEqual(w.eval('globalResult.schedule[0].dayDisplay'), '25/01/2569');
        w.toggleLanguage();
        await settle(w);
        assert.strictEqual(w.eval('globalResult.schedule[0].dayName'), 'Sunday'); // 25 Jan 2026
        assert.strictEqual(w.eval('globalResult.schedule[7].dayName'), 'Sunday'); // 1 Feb 2026
        assert.strictEqual(w.eval('globalResult.schedule[0].dayDisplay'), '25/01/2026');
        assert.strictEqual(w.eval('globalResult.schedule[7].dayDisplay'), '01/02/2026');
    });

    await test('I7: Backspace on the empty doctor input goes through removeDoctor', async () => {
        reset(w);
        setInput(w, 'inputSpecialDocs', 'D');
        w.eval(
            `manualOverrides = { 3: { 0: 'D' }, 4: { 1: 'A' } }; offData = [{ id: 1, date: '2', names: 'D, A' }];`
        );
        const input = d.getElementById('doctorInput');
        input.value = '';
        input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Backspace' }));
        await settle(w);
        assert.deepStrictEqual(snap(w, 'doctors'), ['A', 'B', 'C']);
        assert.deepStrictEqual(snap(w, 'manualOverrides'), { 4: { 1: 'A' } });
        assert.strictEqual(d.getElementById('inputSpecialDocs').value, '');
        assert.strictEqual(snap(w, 'offData')[0].names, 'A');
    });

    await test('I7: adding and removing a doctor keeps the quota rows in sync', async () => {
        reset(w);
        const rows = () => d.querySelectorAll('#structuredSinglePoolQuotasContainer > div').length;
        w.renderStructuredSinglePoolQuotas();
        w.addDoctor('Zed');
        await settle(w);
        assert.strictEqual(rows(), 5);
        w.removeDoctor(0);
        await settle(w);
        assert.strictEqual(rows(), 4);
    });

    await test('M-ux: Ctrl+Z inside a text field is left to the field', () => {
        reset(w);
        let undone = 0;
        const realUndo = w.undoLastAction;
        w.undoLastAction = () => undone++;
        try {
            const ta = d.createElement('textarea');
            d.body.appendChild(ta);
            const typing = new w.KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true,
                cancelable: true,
            });
            ta.dispatchEvent(typing);
            assert.strictEqual(undone, 0, 'undo ran while typing');
            assert.strictEqual(typing.defaultPrevented, false, 'browser undo was blocked');
            const outside = new w.KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true,
                cancelable: true,
            });
            d.body.dispatchEvent(outside);
            assert.strictEqual(undone, 1, 'undo should still work outside fields');
        } finally {
            w.undoLastAction = realUndo;
        }
    });

    await test('M-ux: the drag-and-drop flag is reset even when a swap throws', () => {
        reset(w);
        const real = w.updateDoctorAssignment;
        w.updateDoctorAssignment = () => {
            throw new Error('boom');
        };
        const evt = {
            preventDefault() {},
            stopPropagation() {},
            dataTransfer: { getData: () => JSON.stringify({ day: 1, slotIndex: 0, docName: 'A' }) },
        };
        const realErr = console.error;
        console.error = () => {};
        try {
            w.handleDrop(evt, 2, 0, 1);
            assert.strictEqual(w.isDragAndDropOperation, false, 'handleDrop left the flag set');
            w.isDragAndDropOperation = true;
            w.handlePersonDrop(evt, 1, 1, 1);
            assert.strictEqual(
                w.isDragAndDropOperation,
                false,
                'handlePersonDrop left the flag set'
            );
        } finally {
            console.error = realErr;
            w.updateDoctorAssignment = real;
        }
    });

    await test('M-ux: copy buttons show an error toast when the Clipboard API is missing', async () => {
        reset(w);
        await w.generateSchedule();
        assert.strictEqual(w.navigator.clipboard, undefined);
        w.toasts.length = 0;
        w.copySummary();
        w.copyScheduleForExcel();
        const msg = w.eval('translations.en.clipboardUnavailable');
        assert.strictEqual(errors().filter((m) => m === msg).length, 2);
    });

    await test('M-ux: a new toast cancels the previous toast timer', () => {
        const cleared = [];
        const issued = [];
        const realSet = w.setTimeout;
        const realClear = w.clearTimeout;
        w.setTimeout = () => {
            issued.push(100 + issued.length);
            return issued[issued.length - 1];
        };
        w.clearTimeout = (id) => cleared.push(id);
        try {
            w.realShowToast('one');
            w.realShowToast('two');
        } finally {
            w.setTimeout = realSet;
            w.clearTimeout = realClear;
        }
        assert.ok(cleared.includes(issued[0]), `timer ${issued[0]} was never cleared`);
    });

    await test('M-ux: copySummary and exportToExcel name a custom range, not the month', async () => {
        reset(w);
        await useCustomRange();
        let copied = '';
        Object.defineProperty(w.navigator, 'clipboard', {
            value: { writeText: async (t) => (copied = t) },
            configurable: true,
        });
        w.copySummary();
        assert.ok(
            copied.includes('25/01/2026') && copied.includes('27/01/2026'),
            copied.split('\n')[0]
        );
        assert.ok(!copied.includes('Month 1/2026'), 'still labelled as a month');

        const sheets = [];
        let file = '';
        w.XLSX = {
            utils: {
                aoa_to_sheet: (rows) => rows,
                book_new: () => ({}),
                book_append_sheet: (_wb, _ws, name) => sheets.push(name),
            },
            writeFile: (_wb, name) => (file = name),
        };
        w.exportToExcel();
        assert.strictEqual(file, 'OnCall_2026-01-25_2026-01-27.xlsx');
        assert.ok(
            sheets[0].length <= 31 && !/[\\/?*[\]:]/.test(sheets[0]),
            `bad sheet name ${sheets[0]}`
        );
    });

    done();
})();
