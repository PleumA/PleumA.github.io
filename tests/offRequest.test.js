const fs = require('fs');
const assert = require('assert');

const mockDOM = {};
global.document = {
    getElementById: (id) => {
        if (!mockDOM[id]) {
            mockDOM[id] = { 
                value: '', 
                checked: false, 
                classList: { add: () => {}, remove: () => {} },
                innerHTML: '',
                setAttribute: () => {},
                innerText: '',
                querySelector: () => ({ innerHTML: '' })
            };
        }
        return mockDOM[id];
    },
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, classList: { add: () => {}, remove: () => {} }, click: () => {}, remove: () => {} }),
    body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } },
    addEventListener: () => {},
    documentElement: { lang: 'en', classList: { add: () => {}, remove: () => {} } },
    querySelectorAll: () => []
};

global.window = {
    innerWidth: 1024,
    XLSX: {},
    addEventListener: () => {},
    setTimeout: (fn) => fn()
};

global.navigator = { clipboard: { writeText: async () => {} } };
global.currentLang = 'en';
global.translations = { en: {}, th: {} };
global.lucide = { createIcons: () => {} };
global.localStorage = { getItem: () => 'en', setItem: () => {} };

let toastMessages = [];

function resetMocks() {
    Object.keys(mockDOM).forEach(key => delete mockDOM[key]);
    toastMessages = [];
    
    mockDOM['inputMonth'] = { value: '1', classList: { add: () => {}, remove: () => {} } };
    mockDOM['inputYear'] = { value: '2026', classList: { add: () => {}, remove: () => {} } };
    mockDOM['inputDefaultSlots'] = { value: '2', classList: { add: () => {}, remove: () => {} } };
    mockDOM['inputSpecialHols'] = { value: '', classList: { add: () => {}, remove: () => {} } };
    mockDOM['inputNoDuty'] = { value: '', classList: { add: () => {}, remove: () => {} } };
    mockDOM['inputSpecialDocs'] = { value: '', classList: { add: () => {}, remove: () => {} } };
    mockDOM['inputSpecialDays'] = { value: '0', classList: { add: () => {}, remove: () => {} } };
    mockDOM['chkUseSpecialRule'] = { checked: false };
    mockDOM['chkPreventConsecutive'] = { checked: true };
    mockDOM['chkPreventLongGaps'] = { checked: false };
    mockDOM['chkBalanceShifts'] = { checked: false };
    mockDOM['chkAllowBlankDays'] = { checked: false };
    mockDOM['chkRoleBased'] = { checked: false };
    mockDOM['inputDoctorRoles'] = { value: '' };
    mockDOM['inputDefaultRoleSlots'] = { value: '' };
    mockDOM['inputRoleQuotas'] = { value: '' };
    mockDOM['inputConflicts'] = { value: '' };
    
    mockDOM['btnCalculate'] = { disabled: false, innerHTML: 'Calculate' };
    mockDOM['scheduleTableBody'] = { innerHTML: '' };
    mockDOM['scheduleTableHeader'] = { innerHTML: '' };
    mockDOM['calendarGrid'] = { innerHTML: '', appendChild: () => {} };
    mockDOM['summaryTableBody'] = { innerHTML: '' };
    
    globalResult = null;
    isCalculating = false;
    isCustomDateRange = false;
    scheduleDates = [];
    for (let i = 1; i <= 31; i++) {
        scheduleDates.push(new Date(2026, 0, i));
    }
}

// Load app.js code
let appJsCode = fs.readFileSync('./app.js', 'utf8');

// Strip 'let' so app.js uses our global variables
appJsCode = appJsCode.replace(/let doctors = /g, 'global.doctors = ');
appJsCode = appJsCode.replace(/let offData = /g, 'global.offData = ');
appJsCode = appJsCode.replace(/let extraSlotsData = /g, 'global.extraSlotsData = ');
appJsCode = appJsCode.replace(/let manualOverrides = /g, 'global.manualOverrides = ');
appJsCode = appJsCode.replace(/let isCalculating = /g, 'global.isCalculating = ');
appJsCode = appJsCode.replace(/let isInitialLoad = /g, 'global.isInitialLoad = ');
appJsCode = appJsCode.replace(/let globalResult = /g, 'global.globalResult = ');
appJsCode = appJsCode.replace(/let viewMode = /g, 'global.viewMode = ');
appJsCode = appJsCode.replace(/let isCustomDateRange = /g, 'global.isCustomDateRange = ');
appJsCode = appJsCode.replace(/let scheduleDates = /g, 'global.scheduleDates = ');

// Override showToast to capture messages
appJsCode = appJsCode.replace(/function showToast\(msg, isError = false\) \{/, 'function showToast(msg, isError = false) { toastMessages.push({msg, isError});');
eval(appJsCode);

async function runTests() {
    console.log("Running offRequest.test.js...");
    let passed = 0;

    // 1. Strict Off Request
    try {
        resetMocks();
        doctors = ["A", "B", "C", "D"];
        mockDOM['inputDefaultSlots'].value = "2";
        
        // A requests off on Day 15
        offData = [{ id: 1, date: 15, names: "A" }];
        
        await window.generateSchedule();
        
        assert.notStrictEqual(globalResult, null);
        let day15 = globalResult.schedule[14]; // 0-indexed
        let docsOnDay15 = day15.selectedDocs.map(d => d.name);
        assert.strictEqual(docsOnDay15.includes("A"), false, "A should not work on day 15");
        console.log("✅ TEST 1 PASSED: STRICT OFF REQUEST RESPECTED");
        passed++;
    } catch (e) {
        console.error("❌ TEST 1 FAILED:", e.message);
    }

    // 2. Day-before Off Request Rule
    try {
        resetMocks();
        doctors = ["A", "B", "C", "D"];
        mockDOM['inputDefaultSlots'].value = "2";
        
        // A requests off on Day 15. The rule implies A shouldn't work Day 14.
        offData = [{ id: 1, date: 15, names: "A" }];
        
        await window.generateSchedule();
        
        assert.notStrictEqual(globalResult, null);
        let day14 = globalResult.schedule[13];
        let docsOnDay14 = day14.selectedDocs.map(d => d.name);
        assert.strictEqual(docsOnDay14.includes("A"), false, "A should not work on day 14 (day before off request)");
        console.log("✅ TEST 2 PASSED: DAY-BEFORE OFF REQUEST RESPECTED");
        passed++;
    } catch (e) {
        console.error("❌ TEST 2 FAILED:", e.message);
    }

    // 3. Level 3 Cascade Disables Day-before Off Rule
    try {
        resetMocks();
        // 2 slots a day. Doctors B, C, D are absent on day 14! So only A is available.
        doctors = ["A", "B", "C", "D"];
        mockDOM['inputDefaultSlots'].value = "2";
        
        // A wants off Day 15. B, C, D want off Day 14. 
        // For Day 14, A is the only one who didn't request Day 14 off.
        // But A requested Day 15 off. So Level 1 filter rejects A.
        // Pool is empty for Day 14!
        // Solver must cascade to Level 3 to disable day-before-off rule and pick A!
        offData = [
            { id: 1, date: 15, names: "A, B" },
            { id: 2, date: 14, names: "C, D" }
        ];
        
        await window.generateSchedule();
        
        assert.notStrictEqual(globalResult, null);
        let day14 = globalResult.schedule[13];
        let docsOnDay14 = day14.selectedDocs.map(d => d.name);
        
        let hasC = docsOnDay14.includes("C");
        let hasD = docsOnDay14.includes("D");
        
        assert.strictEqual(docsOnDay14.includes("A") && docsOnDay14.includes("B"), true, "A and B MUST work on day 14 due to Level 3 cascade");
        
        let day15 = globalResult.schedule[14];
        let docsOnDay15 = day15.selectedDocs.map(d => d.name);
        assert.strictEqual(docsOnDay15.includes("A"), false, "A MUST NOT work on day 15");
        assert.strictEqual(docsOnDay15.includes("B"), false, "B MUST NOT work on day 15");
        console.log("✅ TEST 3 PASSED: CASCADE LEVEL 3 DISABLES DAY-BEFORE RULE");
        passed++;
    } catch (e) {
        console.error("❌ TEST 3 FAILED:", e.message);
    }
    
    // 4. Multiple Off Requests
    try {
        resetMocks();
        doctors = ["A", "B", "C", "D", "E"];
        mockDOM['inputDefaultSlots'].value = "2";
        
        offData = [
            { id: 1, date: 1, names: "A, B" },
            { id: 2, date: 2, names: "B, C" }
        ];
        
        await window.generateSchedule();
        
        assert.notStrictEqual(globalResult, null);
        let day1 = globalResult.schedule[0].selectedDocs.map(d => d.name);
        assert.strictEqual(day1.includes("A"), false);
        assert.strictEqual(day1.includes("B"), false);
        
        let day2 = globalResult.schedule[1].selectedDocs.map(d => d.name);
        assert.strictEqual(day2.includes("B"), false);
        assert.strictEqual(day2.includes("C"), false);
        console.log("✅ TEST 4 PASSED: MULTIPLE OFF REQUESTS");
        passed++;
    } catch (e) {
        console.error("❌ TEST 4 FAILED:", e.message);
    }

    // TEST 5: MONTH BOUNDARY — DAY 1 OFF REQUEST, NO CRASH
    try {
        resetMocks();
        doctors = ["A", "B", "C", "D"];
        mockDOM['inputDefaultSlots'].value = "2";
        
        offData = [{ id: 1, date: 1, names: "A" }];
        
        await window.generateSchedule();
        
        assert.notStrictEqual(globalResult, null, "Schedule must generate successfully");
        let day1 = globalResult.schedule[0].selectedDocs.map(d => d.name);
        assert.strictEqual(day1.includes("A"), false, "A should not appear on day 1");
        
        // Ensure all 31 days have valid entries (no index error crash)
        assert.strictEqual(globalResult.schedule.length, 31, "All 31 days should be present");
        
        // Day 2 onwards should work fine
        for (let i = 1; i < globalResult.schedule.length; i++) {
            assert.strictEqual(globalResult.schedule[i].selectedDocs.length > 0, true, `Day ${i+1} should have assigned docs`);
        }
        
        console.log("✅ TEST 5 PASSED: MONTH BOUNDARY — DAY 1 OFF REQUEST, NO CRASH");
        passed++;
    } catch (e) {
        console.error("❌ TEST 5 FAILED:", e.message);
    }

    // TEST 6: OFF REQUEST ON LAST DAY OF SCHEDULE
    try {
        resetMocks();
        doctors = ["A", "B", "C", "D"];
        mockDOM['inputDefaultSlots'].value = "2";
        
        // January has 31 days. A requests off on day 31.
        offData = [{ id: 1, date: 31, names: "A" }];
        
        await window.generateSchedule();
        
        assert.notStrictEqual(globalResult, null, "Schedule must generate successfully");
        let lastDay = globalResult.schedule[30].selectedDocs.map(d => d.name);
        assert.strictEqual(lastDay.includes("A"), false, "A should not appear on day 31");
        
        // Day-before-off rule: A should not appear on day 30
        let dayBefore = globalResult.schedule[29].selectedDocs.map(d => d.name);
        assert.strictEqual(dayBefore.includes("A"), false, "A should not appear on day 30 (day-before-off rule)");
        
        assert.strictEqual(globalResult.schedule.length, 31, "All 31 days should be present");
        console.log("✅ TEST 6 PASSED: OFF REQUEST ON LAST DAY OF SCHEDULE");
        passed++;
    } catch (e) {
        console.error("❌ TEST 6 FAILED:", e.message);
    }

    // TEST 7: OFF REQUEST IN CUSTOM DATE RANGE MODE
    try {
        resetMocks();
        doctors = ["A", "B", "C", "D"];
        mockDOM['inputDefaultSlots'].value = "2";
        mockDOM['chkCustomDateRange'] = { checked: true, classList: { add: () => {}, remove: () => {} } };
        mockDOM['inputStartDate'] = { value: "2026-05-28", classList: { add: () => {}, remove: () => {} } };
        mockDOM['inputEndDate'] = { value: "2026-06-06", classList: { add: () => {}, remove: () => {} } };
        isCustomDateRange = true;
        
        // A wants off on June 2 (02/06/2026 in DD/MM/YYYY format)
        offData = [{ id: 1, date: "02/06/2026", names: "A" }];
        
        await window.generateSchedule();
        
        assert.notStrictEqual(globalResult, null, "Schedule must generate successfully");
        assert.strictEqual(scheduleDates.length, 10, "Should have 10 days");
        
        // Find index of June 2 in scheduleDates
        let june2Index = scheduleDates.findIndex(d => d.getMonth() === 5 && d.getDate() === 2);
        assert.strictEqual(june2Index >= 0, true, "June 2 should be in the schedule");
        
        let june2Docs = globalResult.schedule[june2Index].selectedDocs.map(d => d.name);
        assert.strictEqual(june2Docs.includes("A"), false, "A should not appear on June 2 (off request)");
        
        // Day-before-off: June 1 (the day before the off date)
        let june1Index = scheduleDates.findIndex(d => d.getMonth() === 5 && d.getDate() === 1);
        if (june1Index >= 0) {
            let june1Docs = globalResult.schedule[june1Index].selectedDocs.map(d => d.name);
            assert.strictEqual(june1Docs.includes("A"), false, "A should not appear on June 1 (day-before-off rule)");
        }
        
        console.log("✅ TEST 7 PASSED: OFF REQUEST IN CUSTOM DATE RANGE MODE");
        passed++;
    } catch (e) {
        console.error("❌ TEST 7 FAILED:", e.message);
    }

    const totalTests = 7;
    console.log(`\noffRequest: PASSED: ${passed}, FAILED: ${totalTests - passed}\n`);
}

runTests();
