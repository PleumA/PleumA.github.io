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
    mockDOM['chkRoleBased'] = { checked: false };
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
appJsCode = appJsCode.replace(/let offData = \[\];/g, 'global.offData = [];');
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
    console.log("Running offRequestRange.test.js...");

    // TEST 1: RANGE "2-4"
    try {
        resetMocks();
        global.doctors = ["A", "B", "C"];
        global.offData = [{ id: 1, date: "2-4", names: "A" }];
        
        await window.generateSchedule();
        await waitForCalculation();
        
        const res = globalResult;
        assert.ok(res, "Result generated");
        
        const day2 = res.schedule.find(d => d.day === 2);
        const day3 = res.schedule.find(d => d.day === 3);
        const day4 = res.schedule.find(d => d.day === 4);
        
        assert.ok(!day2.selectedDocs.some(d => d.name === "A"), "A should be off on day 2");
        assert.ok(!day3.selectedDocs.some(d => d.name === "A"), "A should be off on day 3");
        assert.ok(!day4.selectedDocs.some(d => d.name === "A"), "A should be off on day 4");
        
        console.log("✅ TEST 1 PASSED: OFF RANGE 2-4");
        passed++;
    } catch (e) {
        console.error("❌ TEST 1 FAILED:", e.message);
        failed++;
    }

    console.log(`\noffRequestRange: PASSED: ${passed}, FAILED: ${failed}`);
}

runTests();
