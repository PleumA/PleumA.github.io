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
    mockDOM['chkPreventLongGaps'] = { checked: true }; // for Level 2
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
    console.log("Running cascade.test.js...");
    let passed = 0;

    // 1. Level 4 Fallback: Conflicts list
    try {
        resetMocks();
        doctors = ["A", "B", "C"];
        mockDOM['inputDefaultSlots'].value = "2";
        mockDOM['inputConflicts'].value = "A:B, B:C, C:A"; // Everyone conflicts with everyone
        mockDOM['chkAllowBlankDays'].checked = false; // Must fill
        
        await window.generateSchedule();
        
        assert.notStrictEqual(globalResult, null, "Should generate a schedule via Level 4 fallback");
        assert.strictEqual(globalResult.schedule.length, 31);
        console.log("✅ TEST 1 PASSED: LEVEL 4 FALLBACK (CONFLICTS)");
        passed++;
    } catch (e) {
        console.error("❌ TEST 1 FAILED:", e.message);
    }

    // 2. Level 5 Fallback: Consecutive Shifts
    try {
        resetMocks();
        doctors = ["A", "B"]; // 2 doctors, 2 slots/day -> everyone works every day!
        mockDOM['inputDefaultSlots'].value = "2";
        mockDOM['chkPreventConsecutive'].checked = true;
        mockDOM['chkAllowBlankDays'].checked = false; 
        
        await window.generateSchedule();
        
        assert.notStrictEqual(globalResult, null, "Should generate a schedule via Level 5 fallback (consecutive ignored)");
        assert.strictEqual(globalResult.schedule.length, 31);
        let consCount = 0;
        for (let i = 1; i < globalResult.schedule.length; i++) {
            let p = globalResult.schedule[i-1].selectedDocs.map(d => d.name);
            let c = globalResult.schedule[i].selectedDocs.map(d => d.name);
            if (p.some(x => c.includes(x))) consCount++;
        }
        assert.strictEqual(consCount > 0, true, "Must have consecutive shifts");
        console.log("✅ TEST 2 PASSED: LEVEL 5 FALLBACK (CONSECUTIVE)");
        passed++;
    } catch (e) {
        console.error("❌ TEST 2 FAILED:", e.message);
    }

    // 3. Level 2 Fallback: Gap Spacing
    try {
        resetMocks();
        doctors = ["A", "B", "C"]; // 3 docs, 2 slots/day => someone has to work 2 days, off 1 day, work 2 days... long gaps impossible
        mockDOM['inputDefaultSlots'].value = "2";
        mockDOM['chkPreventLongGaps'].checked = true;
        mockDOM['chkAllowBlankDays'].checked = false; 
        
        await window.generateSchedule();
        
        assert.notStrictEqual(globalResult, null, "Should generate a schedule via Level 2 fallback");
        assert.strictEqual(globalResult.schedule.length, 31);
        console.log("✅ TEST 3 PASSED: LEVEL 2 FALLBACK (GAP SPACING)");
        passed++;
    } catch (e) {
        console.error("❌ TEST 3 FAILED:", e.message);
    }
    
    // 4. Critical Coverage Error (No solution even at Level 5)
    try {
        resetMocks();
        doctors = ["A", "B"];
        mockDOM['chkRoleBased'].checked = true;
        mockDOM['inputDoctorRoles'].value = "A:R1, B:R1";
        mockDOM['inputDefaultRoleSlots'].value = "R1:1, R2:1";
        mockDOM['chkAllowBlankDays'].checked = false; 
        
        // This will be caught inside generateSchedule and show a toast, returning early.
        await window.generateSchedule();
        
        let hasError = toastMessages.some(t => t.isError && t.msg.includes("Critical Coverage Error"));
        assert.strictEqual(hasError, true, "Should show critical coverage error toast");
        assert.strictEqual(globalResult, null, "Should not generate schedule");
        console.log("✅ TEST 4 PASSED: CRITICAL COVERAGE ERROR");
        passed++;
    } catch (e) {
        console.error("❌ TEST 4 FAILED:", e.message);
    }

    // 5. Shortage allowed
    try {
        resetMocks();
        doctors = ["A", "B"];
        mockDOM['chkRoleBased'].checked = true;
        mockDOM['inputDoctorRoles'].value = "A:R1, B:R1";
        mockDOM['inputDefaultRoleSlots'].value = "R1:1, R2:1";
        mockDOM['chkAllowBlankDays'].checked = true; // Shortage allowed!
        
        await window.generateSchedule();
        
        assert.notStrictEqual(globalResult, null, "Should generate schedule with shortages");
        let hasShortage = false;
        for (let i = 0; i < globalResult.schedule.length; i++) {
            if (globalResult.schedule[i].selectedDocs.some(d => d.name === "__SHORTAGE__" || d.name === "ขาดคน")) {
                hasShortage = true;
                break;
            }
        }
        assert.strictEqual(hasShortage, true, "Must contain shortage markers");
        console.log("✅ TEST 5 PASSED: SHORTAGE ASSIGNED WHEN ALLOWED");
        passed++;
    } catch (e) {
        console.error("❌ TEST 5 FAILED:", e.message);
    }

    console.log(`\ncascade: PASSED: ${passed}, FAILED: ${5 - passed}\n`);
}

runTests();
