const fs = require('fs');
const assert = require('assert');

const mockDOM = {};
const classListMap = {};

global.document = {
    getElementById: (id) => {
        if (!mockDOM[id]) {
            classListMap[id] = new Set();
            mockDOM[id] = { 
                value: '', 
                checked: false, 
                classList: {
                    add: (cls) => classListMap[id].add(cls),
                    remove: (cls) => classListMap[id].delete(cls),
                    contains: (cls) => classListMap[id].has(cls)
                },
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

// Load app.js code
let appJsCode = fs.readFileSync('app.js', 'utf8');

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

appJsCode = appJsCode.replace(/document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/g, 'function dummyInit() {');
appJsCode = appJsCode.replace(/\}\);\s*\n\/\/ Toggle Role-Based/, '}\n// Toggle Role-Based');
appJsCode = appJsCode.replace(/function showToast\(msg, isError = false\) \{/, 'function showToast(msg, isError = false) { toastMessages.push({msg, isError});');

eval(appJsCode);

let passed = 0;
let failed = 0;

function runTests() {
    console.log("Running uiVisibility.test.js...");

    // TEST 1: DEFAULT SLOTS HIDDEN WHEN ROLE-BASED MODE ON
    try {
        mockDOM['chkRoleBased'] = { checked: true };
        classListMap['defaultSlotsContainer'] = new Set();
        
        toggleRoleBasedUI();
        
        assert.ok(classListMap['defaultSlotsContainer'].has('hidden'), "defaultSlotsContainer should have class 'hidden'");
        assert.ok(!classListMap['extraSlotsList'] || !classListMap['extraSlotsList'].has('hidden'), "custom daily slots list should not have class 'hidden'");
        
        console.log("✅ TEST 1 PASSED: DEFAULT SLOTS HIDDEN WHEN ROLE-BASED MODE ON");
        passed++;
    } catch (e) {
        console.log("❌ TEST 1 FAILED:", e.message);
        failed++;
    }

    // TEST 2: DEFAULT SLOTS VISIBLE WHEN ROLE-BASED MODE OFF
    try {
        mockDOM['chkRoleBased'] = { checked: false };
        classListMap['defaultSlotsContainer'] = new Set();
        // pre-fill it with 'hidden' to test it gets removed
        classListMap['defaultSlotsContainer'].add('hidden');
        
        toggleRoleBasedUI();
        
        assert.ok(!classListMap['defaultSlotsContainer'].has('hidden'), "defaultSlotsContainer should not have class 'hidden'");
        assert.ok(!classListMap['extraSlotsList'] || !classListMap['extraSlotsList'].has('hidden'), "custom daily slots list should not have class 'hidden'");
        
        console.log("✅ TEST 2 PASSED: DEFAULT SLOTS VISIBLE WHEN ROLE-BASED MODE OFF");
        passed++;
    } catch (e) {
        console.log("❌ TEST 2 FAILED:", e.message);
        failed++;
    }

    console.log(`\nuiVisibility: PASSED: ${passed}, FAILED: ${failed}`);
    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();
