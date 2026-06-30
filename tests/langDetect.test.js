const fs = require('fs');
const assert = require('assert');

// 1. Mock DOM and Globals
const mockDOM = {};
global.document = {
    getElementById: (id) => {
        if (!mockDOM[id]) {
            mockDOM[id] = { 
                value: '', 
                checked: false, 
                classList: { add: () => {}, remove: () => {} },
                appendChild: () => {},
                innerHTML: '',
                style: {}
            };
        }
        return mockDOM[id];
    },
    querySelectorAll: () => [],
    documentElement: { lang: '' }
};
global.window = {
    innerWidth: 1024,
    XLSX: {},
    navigator: {}
};
global.navigator = global.window.navigator;
global.doctors = [];
global.offData = [];
global.extraSlotsData = [];
global.manualOverrides = {};
global.translations = { th: {}, en: {} };
global.isCalculating = false;
global.isInitialLoad = true;
global.globalResult = null;
global.scheduleData = [];
global.lucide = { createIcons: () => {} };

// Mock DOM functions
global.document.createElement = () => ({ setAttribute: () => {}, appendChild: () => {}, classList: { add: () => {}, remove: () => {} }, innerHTML: '', querySelector: () => ({ textContent: '' }) });
global.document.body = { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } };
global.document.addEventListener = () => {};
global.window.addEventListener = () => {};

let storage = {};
global.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => { storage[key] = val; }
};

let appJsCode = fs.readFileSync('./app.js', 'utf8');

function loadApp() {
    const window = global.window;
    const navigator = global.navigator;
    eval(appJsCode);
}

console.log("Running LangDetect Unit Tests...");

// TEST 1: THAI BROWSER LANGUAGE DETECTED
storage = {};
global.window.navigator = { language: "th-TH" };
global.navigator = global.window.navigator;
loadApp();
assert.strictEqual(storage['schedule_lang'], 'th', "Test 1 Failed: Should detect Thai");
console.log("✅ TEST 1 PASSED: THAI BROWSER LANGUAGE DETECTED");

// TEST 2: NON-THAI BROWSER LANGUAGE DEFAULTS TO ENGLISH
storage = {};
global.window.navigator = { language: "fr-FR" };
global.navigator = global.window.navigator;
loadApp();
assert.strictEqual(storage['schedule_lang'], 'en', "Test 2 Failed: Should default to English");
console.log("✅ TEST 2 PASSED: NON-THAI BROWSER LANGUAGE DEFAULTS TO ENGLISH");

// TEST 3: SAVED PREFERENCE OVERRIDES DETECTION
storage = { 'schedule_lang': 'en' };
global.window.navigator = { language: "th-TH" };
global.navigator = global.window.navigator;
loadApp();
assert.strictEqual(storage['schedule_lang'], 'en', "Test 3 Failed: Saved preference should win");
console.log("✅ TEST 3 PASSED: SAVED PREFERENCE OVERRIDES DETECTION");

// TEST 4: MANUAL TOGGLE PERSISTS FOR NEXT LOAD
storage = {};
global.window.navigator = { language: "th-TH" };
global.navigator = global.window.navigator;
loadApp();
assert.strictEqual(storage['schedule_lang'], 'th', "Should initialize with Thai");

// Simulate toggle
if (typeof global.window.toggleLanguage === 'function') {
    global.window.toggleLanguage();
} else if (typeof toggleLanguage === 'function') {
    toggleLanguage();
}

assert.strictEqual(storage['schedule_lang'], 'en', "Toggle should set storage to en");

// Simulate a fresh page load
loadApp();
assert.strictEqual(storage['schedule_lang'], 'en', "Test 4 Failed: Toggle should persist");
console.log("✅ TEST 4 PASSED: MANUAL TOGGLE PERSISTS FOR NEXT LOAD");

// TEST 5: MISSING NAVIGATOR.LANGUAGE — NO CRASH
storage = {};
global.window.navigator = { language: undefined };
global.navigator = global.window.navigator;
loadApp();
assert.strictEqual(storage['schedule_lang'], 'en', "Test 5 Failed: Should default to English without crashing");
console.log("✅ TEST 5 PASSED: MISSING NAVIGATOR.LANGUAGE — NO CRASH");

console.log("All LangDetect unit tests passed successfully!");
