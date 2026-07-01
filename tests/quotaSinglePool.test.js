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
                style: {},
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
global.currentLang = 'th';
global.translations = { en: {}, th: {} };
global.lucide = { createIcons: () => {} };
global.localStorage = { getItem: () => 'th', setItem: () => {} };
global.doctors = [];
global.scheduleDates = [];
global.isCustomDateRange = false;

let toastMessages = [];
global.showToast = (msg, isError = false) => {
    toastMessages.push({ msg, isError });
};

function resetMocks() {
    Object.keys(mockDOM).forEach(key => delete mockDOM[key]);
    toastMessages = [];
    
    mockDOM['inputMonth'] = { value: '1', classList: { add: () => {}, remove: () => {} } };
    mockDOM['inputYear'] = { value: '2026', classList: { add: () => {}, remove: () => {} } };
    mockDOM['inputDefaultSlots'] = { value: '1', classList: { add: () => {}, remove: () => {} } };
    mockDOM['inputSinglePoolQuotas'] = { value: '' };
    mockDOM['chkRoleBased'] = { checked: false };
    mockDOM['inputSpecialHols'] = { value: '' };
    mockDOM['inputNoDuty'] = { value: '' };
    mockDOM['chkAllowBlankDays'] = { checked: false };
    mockDOM['chkPreventConsecutive'] = { checked: false };
    mockDOM['btnCalculate'] = { innerHTML: 'Calc' };
    
    global.doctors = [];
    global.offData = [];
    global.extraSlotsData = [];
    global.isCustomDateRange = false;
    global.scheduleDates = [];
    global.isCalculating = false;
}

let appJsCode = fs.readFileSync('app.js', 'utf8');
appJsCode = appJsCode.replace(/document\.addEventListener\('DOMContentLoaded'/g, 'function dummyInit()');
appJsCode = appJsCode.replace(/let doctors = \[\];/g, '');
appJsCode = appJsCode.replace(/let isCustomDateRange = false;/g, '');
appJsCode = appJsCode.replace(/let scheduleDates = \[\];/g, '');
eval(appJsCode);

let passed = 0;
let failed = 0;
let globalResult = null;

const originalRender = window.renderScheduleList;
window.renderScheduleList = function(result) {
    globalResult = result;
};

async function waitForCalculation() {
    return new Promise(resolve => {
        const check = () => {
            if (!window.isCalculating) resolve();
            else setImmediate(check);
        };
        check();
    });
}

async function runTests() {
    console.log("Running quotaSinglePool.test.js...");

    // TEST 1: SINGLE POOL QUOTA - EXACT MATCH
    try {
        resetMocks();
        global.doctors = ["A", "B", "C"];
        mockDOM['inputSinglePoolQuotas'].value = "A:10, B:10, C:11"; // Total 31
        
        await window.generateSchedule();
        await waitForCalculation();
        
        const res = globalResult;
        assert.ok(res, "Result generated");
        assert.strictEqual(res.tCounts["A"], 10, "A should have 10");
        assert.strictEqual(res.tCounts["B"], 10, "B should have 10");
        assert.strictEqual(res.tCounts["C"], 11, "C should have 11");
        
        console.log("✅ TEST 1 PASSED: SINGLE POOL QUOTA - EXACT MATCH");
        passed++;
    } catch (e) {
        console.error("❌ TEST 1 FAILED:", e.message);
        failed++;
    }
    
    // TEST 2: SINGLE POOL QUOTA - SUM MISMATCH (FAIL SAFE)
    try {
        resetMocks();
        global.doctors = ["A", "B", "C"];
        mockDOM['inputSinglePoolQuotas'].value = "A:5, B:5, C:5"; // Total 15, but 31 slots needed
        
        await window.generateSchedule();
        await waitForCalculation();
        
        let hasError = toastMessages.some(t => t.isError && t.msg.includes("ผลรวมโควตารายบุคคลไม่ตรงกับจำนวนเวรทั้งหมด"));
        assert.ok(hasError, "Should throw fail-safe error");
        
        console.log("✅ TEST 2 PASSED: SINGLE POOL QUOTA - SUM MISMATCH (FAIL SAFE)");
        passed++;
    } catch (e) {
        console.error("❌ TEST 2 FAILED:", e.message);
        failed++;
    }

    console.log(`\nquotaSinglePool: PASSED: ${passed}, FAILED: ${failed}`);
}

runTests();
