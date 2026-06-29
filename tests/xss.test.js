const fs = require('fs');
const assert = require('assert');

// Mock Globals
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
                style: { display: '' },
                dispatchEvent: () => {},
                querySelectorAll: () => [],
                insertBefore: () => {},
                appendChild: function(c) { this.innerHTML += (c.innerHTML || ''); },
                querySelector: () => ({ classList: { add: () => {}, remove: () => {} }, innerHTML: '' })
            };
        }
        return mockDOM[id];
    },
    createElement: () => ({ setAttribute: () => {}, appendChild: function(c) { this.innerHTML += (c.innerHTML || '') }, classList: { add: () => {}, remove: () => {} }, click: () => {}, remove: () => {}, querySelector: () => ({ innerHTML: '' }), innerHTML: '' }),
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
global.localStorage = { getItem: () => 'en', setItem: () => {} };
global.currentLang = 'en';
global.translations = { en: {}, th: {} };
global.lucide = { createIcons: () => {} };

let toastMessages = [];

function resetMocks() {
    Object.keys(mockDOM).forEach(key => delete mockDOM[key]);
    toastMessages = [];
    
    mockDOM['inputMonth'] = { value: '1' };
    mockDOM['inputYear'] = { value: '2026' };
    mockDOM['inputDefaultSlots'] = { value: '2' };
    mockDOM['chkAllowBlankDays'] = { checked: false };
    mockDOM['chkRoleBased'] = { checked: false };
    mockDOM['btnCalculate'] = { disabled: false, innerHTML: 'Calculate' };
    
    globalResult = null;
    isCalculating = false;
    isCustomDateRange = false;
    global.viewMode = 'calendar';
    scheduleDates = [];
    for (let i = 1; i <= 31; i++) {
        scheduleDates.push(new Date(2026, 0, i));
    }
}

let appJsCode = fs.readFileSync('./app.js', 'utf8');

appJsCode = appJsCode.replace(/let doctors = /g, 'global.doctors = ');
appJsCode = appJsCode.replace(/let globalResult = /g, 'global.globalResult = ');
appJsCode = appJsCode.replace(/let viewMode = /g, 'global.viewMode = ');
appJsCode = appJsCode.replace(/const esc = /g, 'global.esc = ');
appJsCode = appJsCode.replace(/function showToast\(msg, isError = false\) \{/, 'function showToast(msg, isError = false) { toastMessages.push({msg, isError});');
eval(appJsCode);

async function runTests() {
    console.log("Running xss.test.js...");
    let passed = 0;

    // TEST 1: Direct testing of `esc` function
    try {
        const malicious = '<script>alert("XSS")</script>&\'';
        const safe = global.esc(malicious);
        
        assert.strictEqual(safe, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;&amp;&#39;');
        assert.strictEqual(safe.includes("<script>"), false);
        
        console.log("✅ TEST 1 PASSED: ESC FUNCTION SANITIZES CHARACTERS");
        passed++;
    } catch (e) {
        console.error("❌ TEST 1 FAILED:", e.message);
    }
    
    // TEST 2: DOM Injection via generateSchedule
    try {
        resetMocks();
        doctors = ["<img src=x onerror=alert(1)>", "SafeDoc"];
        
        await window.generateSchedule();
        
        window.setViewMode('table');
        let tableHTML = document.getElementById('scheduleTableBody').innerHTML;
        
        window.setViewMode('calendar');
        let cellHTML = document.getElementById('calendarGrid').innerHTML;
        
        assert.strictEqual(tableHTML.includes("<img src=x onerror=alert(1)>"), false, "Table HTML must not contain raw XSS string");
        
        let hasRawInGrid = cellHTML.includes("<img src=x onerror=alert(1)>");
        assert.strictEqual(hasRawInGrid, false, "Grid HTML must not contain raw XSS string");
        
        assert.strictEqual(tableHTML.includes("&lt;img src=x onerror=alert(1)&gt;"), true, "Table HTML should contain escaped XSS string");
        assert.strictEqual(cellHTML.includes("&lt;img src=x onerror=alert(1)&gt;"), true, "Grid HTML should contain escaped XSS string");
        
        console.log("✅ TEST 2 PASSED: RENDER RESULTS SANITIZES DOCTOR NAMES");
        passed++;
    } catch (e) {
        console.error("❌ TEST 2 FAILED:", e.message);
    }

    // TEST 3: APOSTROPHE IN NAME — EVENT HANDLER SAFETY
    try {
        resetMocks();
        doctors = ["O'Connor", "SafeDoc"];
        
        await window.generateSchedule();
        
        window.setViewMode('calendar');
        let cellHTML = document.getElementById('calendarGrid').innerHTML;
        
        // The raw string O'Connor should NOT appear in event attributes
        assert.strictEqual(cellHTML.includes("O'Connor"), false, "Raw O'Connor should not appear in rendered HTML");
        
        // Event handlers should use the doctor's array index, not the name string
        // ondragstart should contain integer indices, not string names
        assert.strictEqual(cellHTML.includes("handleDragStart(event,"), true, "Should have drag handlers");
        
        // esc function should properly escape apostrophe
        let escaped = global.esc("O'Connor");
        assert.strictEqual(escaped, "O&#39;Connor", "esc must escape apostrophe to &#39;");
        
        console.log("✅ TEST 3 PASSED: APOSTROPHE IN NAME — EVENT HANDLER SAFETY");
        passed++;
    } catch (e) {
        console.error("❌ TEST 3 FAILED:", e.message);
    }
    
    // TEST 4: DOUBLE QUOTE IN NAME
    try {
        let escaped = global.esc('Dr. "House"');
        assert.strictEqual(escaped, 'Dr. &quot;House&quot;', "esc must escape double quotes");
        
        resetMocks();
        doctors = ['Dr. "House"', "SafeDoc"];
        
        await window.generateSchedule();
        
        window.setViewMode('table');
        let tableHTML = document.getElementById('scheduleTableBody').innerHTML;
        
        // No unmatched quote characters should appear in attribute strings
        assert.strictEqual(tableHTML.includes('Dr. "House"'), false, "Raw double-quoted name should not appear in HTML");
        assert.strictEqual(tableHTML.includes('Dr. &quot;House&quot;'), true, "Escaped name should appear in HTML");
        
        console.log("✅ TEST 4 PASSED: DOUBLE QUOTE IN NAME");
        passed++;
    } catch (e) {
        console.error("❌ TEST 4 FAILED:", e.message);
    }
    
    // TEST 5: AMPERSAND IN NAME
    try {
        let escaped = global.esc("Smith & Jones");
        assert.strictEqual(escaped, "Smith &amp; Jones", "esc must escape ampersand");
        
        resetMocks();
        doctors = ["Smith & Jones", "SafeDoc"];
        
        await window.generateSchedule();
        
        window.setViewMode('table');
        let tableHTML = document.getElementById('scheduleTableBody').innerHTML;
        
        // Raw & should not appear (all & in HTML should be &amp;)
        // But we check that the escaped version is present
        assert.strictEqual(tableHTML.includes("Smith &amp; Jones"), true, "Escaped ampersand name should appear");
        
        console.log("✅ TEST 5 PASSED: AMPERSAND IN NAME");
        passed++;
    } catch (e) {
        console.error("❌ TEST 5 FAILED:", e.message);
    }
    
    // TEST 6: NULL AND UNDEFINED INPUT TO ESC
    try {
        let escNull, escUndef;
        let noError = true;
        
        try {
            escNull = global.esc(null);
            escUndef = global.esc(undefined);
        } catch(e) {
            noError = false;
        }
        
        assert.strictEqual(noError, true, "esc(null) and esc(undefined) should not throw");
        
        // esc returns str unchanged if typeof str !== 'string'
        // So esc(null) returns null, esc(undefined) returns undefined
        // The function guards with: if (typeof str !== 'string') return str;
        assert.strictEqual(escNull, null, "esc(null) should return null (passthrough)");
        assert.strictEqual(escUndef, undefined, "esc(undefined) should return undefined (passthrough)");
        
        console.log("✅ TEST 6 PASSED: NULL AND UNDEFINED INPUT TO ESC");
        passed++;
    } catch (e) {
        console.error("❌ TEST 6 FAILED:", e.message);
    }

    const totalTests = 6;
    console.log(`\nxss: PASSED: ${passed}, FAILED: ${totalTests - passed}\n`);
}

runTests();
