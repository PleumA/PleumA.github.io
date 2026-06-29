const fs = require('fs');
const assert = require('assert');

// Mock Globals
const mockDOM = {};
let lastDownloadedConfig = null;
let toastMessages = [];

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
                appendChild: () => {}
            };
        }
        return mockDOM[id];
    },
    createElement: (tag) => {
        let el = {
            setAttribute: (attr, val) => {
                if (attr === 'href') el.href = val;
            },
            appendChild: () => {},
            classList: { add: () => {}, remove: () => {} },
            click: () => {
                if (tag === 'a' && el.href && el.href.startsWith('data:text/json;charset=utf-8,')) {
                    let jsonStr = decodeURIComponent(el.href.replace('data:text/json;charset=utf-8,', ''));
                    lastDownloadedConfig = JSON.parse(jsonStr);
                }
            },
            remove: () => {},
            querySelector: () => ({ innerHTML: '' })
        };
        return el;
    },
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
global.lucide = { createIcons: () => {} };

function resetMocks() {
    Object.keys(mockDOM).forEach(key => delete mockDOM[key]);
    toastMessages = [];
    lastDownloadedConfig = null;
    
    // Use the getElementById so it auto-creates the full object with dispatchEvent
    document.getElementById('inputMonth').value = '1';
    document.getElementById('inputYear').value = '2026';
    document.getElementById('chkRoleBased').checked = false;
    document.getElementById('chkCustomDateRange').checked = false;
    document.getElementById('customDateRangeContainer').classList.remove = () => {};
    document.getElementById('monthYearContainer').classList.add = () => {};
}

let appJsCode = fs.readFileSync('./app.js', 'utf8');
appJsCode = appJsCode.replace(/let doctors = /g, 'global.doctors = ');
appJsCode = appJsCode.replace(/let offData = /g, 'global.offData = ');
appJsCode = appJsCode.replace(/let extraSlotsData = /g, 'global.extraSlotsData = ');
appJsCode = appJsCode.replace(/let manualOverrides = /g, 'global.manualOverrides = ');
appJsCode = appJsCode.replace(/function showToast\(msg, isError = false\) \{/, 'function showToast(msg, isError = false) { toastMessages.push({msg, isError});');
eval(appJsCode);

console.log("Running jsonRoundTrip.test.js...");
let passed = 0;

// TEST 1: Export Config JSON
try {
    resetMocks();
    doctors = ["Alice", "Bob"];
    offData = [{ id: 1, date: 15, names: "Alice" }];
    manualOverrides = { "1": { "0": "Bob" } };
    mockDOM['inputMonth'].value = "10";
    mockDOM['chkRoleBased'].checked = true;
    
    window.exportConfigJSON();
    
    assert.notStrictEqual(lastDownloadedConfig, null);
    assert.deepStrictEqual(lastDownloadedConfig.doctors, ["Alice", "Bob"]);
    assert.deepStrictEqual(lastDownloadedConfig.offData, [{ id: 1, date: 15, names: "Alice" }]);
    assert.deepStrictEqual(lastDownloadedConfig.manualOverrides, { "1": { "0": "Bob" } });
    assert.strictEqual(lastDownloadedConfig.inputs.inputMonth, "10");
    assert.strictEqual(lastDownloadedConfig.checkboxes.chkRoleBased, true);
    
    let hasToast = toastMessages.some(t => !t.isError && t.msg.includes("Config exported"));
    assert.strictEqual(hasToast, true, "Success toast should be shown");
    console.log("✅ TEST 1 PASSED: CONFIG EXPORT");
    passed++;
} catch (e) {
    console.error("❌ TEST 1 FAILED:", e.message);
}

// TEST 2: Import Config JSON
try {
    resetMocks();
    doctors = [];
    offData = [];
    manualOverrides = {};
    
    const configToImport = {
        doctors: ["Charlie", "Dave"],
        offData: [{ id: 1, date: 5, names: "Charlie" }],
        manualOverrides: { "2": { "1": "Dave" } },
        inputs: { inputMonth: "12" },
        checkboxes: { chkRoleBased: true, chkCustomDateRange: true }
    };
    
    const event = {
        target: {
            files: [new Blob([JSON.stringify(configToImport)], { type: 'application/json' })]
        }
    };
    
    // Polyfill FileReader for Node.js
    global.FileReader = class {
        readAsText(blob) {
            blob.text().then(text => {
                this.onload({ target: { result: text } });
            });
        }
    };
    
    // We need to bypass the actual FileReader because Blob reading is async in Node but we want sync testing, or we just mock the reader.
    global.FileReader = class {
        constructor() {}
        readAsText(blob) {
            // Since event.target.files[0] in our mock is just an object, we simulate
            setTimeout(() => {
                this.onload({ target: { result: JSON.stringify(configToImport) } });
                
                // Assertions inside setTimeout since import is async due to FileReader
                try {
                    assert.deepStrictEqual(doctors, ["Charlie", "Dave"]);
                    assert.deepStrictEqual(offData, [{ id: 1, date: 5, names: "Charlie" }]);
                    assert.deepStrictEqual(manualOverrides, { "2": { "1": "Dave" } });
                    assert.strictEqual(mockDOM['inputMonth'].value, "12");
                    assert.strictEqual(mockDOM['chkRoleBased'].checked, true);
                    
                    let hasToast = toastMessages.some(t => !t.isError && t.msg.includes("Config imported"));
                    assert.strictEqual(hasToast, true);
                    console.log("✅ TEST 2 PASSED: CONFIG IMPORT");
                    passed++;
                    
                    // Run next test from here to handle async
                    runTest3();
                } catch(e) {
                    console.error("❌ TEST 2 FAILED:", e.message);
                    runTest3();
                }
            }, 10);
        }
    };
    
    window.importConfigJSON({ target: { files: [{}] } });
    
} catch (e) {
    console.error("❌ TEST 2 FAILED:", e.message);
    runTest3();
}

function runTest3() {
    // TEST 3: Invalid Import JSON
    try {
        resetMocks();
        global.FileReader = class {
            readAsText() {
                setTimeout(() => {
                    const originalConsoleError = console.error;
                    console.error = () => {};
                    this.onload({ target: { result: "INVALID JSON DATA" } });
                    console.error = originalConsoleError;
                    
                    try {
                        let hasErrorToast = toastMessages.some(t => t.isError && t.msg.includes("Error reading JSON file"));
                        if (!hasErrorToast) {
                            console.log("Toast Messages:", toastMessages);
                        }
                        assert.strictEqual(hasErrorToast, true);
                        console.log("✅ TEST 3 PASSED: INVALID IMPORT HANDLED");
                        passed++;
                        
                        runTest4();
                    } catch (e) {
                        console.error("❌ TEST 3 FAILED:", e.message);
                        runTest4();
                    }
                }, 10);
            }
        };
        window.importConfigJSON({ target: { files: [{}] } });
    } catch (e) {
        console.error("❌ TEST 3 FAILED:", e.message);
        runTest4();
    }
}

function runTest4() {
    // TEST 4: IMPORT WITH MISSING OPTIONAL FIELDS (OLD JSON COMPAT)
    try {
        resetMocks();
        doctors = [];
        offData = [];
        manualOverrides = {};

        const oldConfig = {
            doctors: ["X", "Y"],
            offData: [{ id: 1, date: 5, names: "X" }],
            inputs: { inputMonth: "3" },
            checkboxes: {}
            // Intentionally missing: isCustomDateRange, customStartDate, customEndDate fields
        };

        global.FileReader = class {
            readAsText() {
                setTimeout(() => {
                    this.onload({ target: { result: JSON.stringify(oldConfig) } });

                    try {
                        assert.deepStrictEqual(doctors, ["X", "Y"]);
                        assert.deepStrictEqual(offData, [{ id: 1, date: 5, names: "X" }]);
                        assert.strictEqual(mockDOM['inputMonth'].value, "3");

                        // isCustomDateRange should default to false since it wasn't in the config
                        const chkCustom = document.getElementById('chkCustomDateRange');
                        assert.strictEqual(chkCustom.checked, false, "isCustomDateRange should default to false");

                        let hasToast = toastMessages.some(t => !t.isError && t.msg.includes("Config imported"));
                        assert.strictEqual(hasToast, true);
                        console.log("✅ TEST 4 PASSED: IMPORT WITH MISSING OPTIONAL FIELDS (OLD JSON COMPAT)");
                        passed++;
                        runTest5();
                    } catch (e) {
                        console.error("❌ TEST 4 FAILED:", e.message);
                        runTest5();
                    }
                }, 10);
            }
        };
        window.importConfigJSON({ target: { files: [{}] } });
    } catch (e) {
        console.error("❌ TEST 4 FAILED:", e.message);
        runTest5();
    }
}

function runTest5() {
    // TEST 5: MANUAL OVERRIDES PRESERVED IN ROUND-TRIP
    try {
        resetMocks();
        doctors = ["Alice", "Bob"];
        offData = [];
        manualOverrides = { "3": { "0": "Bob" } };
        mockDOM['inputMonth'].value = "6";

        // Export
        lastDownloadedConfig = null;
        window.exportConfigJSON();
        assert.notStrictEqual(lastDownloadedConfig, null, "Export should produce config");
        assert.deepStrictEqual(lastDownloadedConfig.manualOverrides, { "3": { "0": "Bob" } }, "Export must contain overrides");

        // Reset state
        doctors = [];
        offData = [];
        manualOverrides = {};

        // Import the exported config
        const exportedJson = JSON.stringify(lastDownloadedConfig);
        global.FileReader = class {
            readAsText() {
                setTimeout(() => {
                    this.onload({ target: { result: exportedJson } });

                    try {
                        assert.deepStrictEqual(manualOverrides, { "3": { "0": "Bob" } }, "manualOverrides[3][0] must match after import");
                        console.log("✅ TEST 5 PASSED: MANUAL OVERRIDES PRESERVED IN ROUND-TRIP");
                        passed++;
                        runTest6();
                    } catch (e) {
                        console.error("❌ TEST 5 FAILED:", e.message);
                        runTest6();
                    }
                }, 10);
            }
        };
        window.importConfigJSON({ target: { files: [{}] } });
    } catch (e) {
        console.error("❌ TEST 5 FAILED:", e.message);
        runTest6();
    }
}

function runTest6() {
    // TEST 6: CUSTOM DATE RANGE STATE ROUND-TRIP
    try {
        resetMocks();
        doctors = ["A", "B"];
        offData = [];
        mockDOM['chkCustomDateRange'].checked = true;
        mockDOM['inputStartDate'] = { value: "2026-03-15", classList: { add: () => {}, remove: () => {} } };
        mockDOM['inputEndDate'] = { value: "2026-04-10", classList: { add: () => {}, remove: () => {} } };

        // Export
        lastDownloadedConfig = null;
        window.exportConfigJSON();
        assert.notStrictEqual(lastDownloadedConfig, null);
        assert.strictEqual(lastDownloadedConfig.checkboxes.chkCustomDateRange, true);
        assert.strictEqual(lastDownloadedConfig.inputs.inputStartDate, "2026-03-15");
        assert.strictEqual(lastDownloadedConfig.inputs.inputEndDate, "2026-04-10");

        // Reset
        doctors = [];
        mockDOM['chkCustomDateRange'].checked = false;
        mockDOM['inputStartDate'].value = "";
        mockDOM['inputEndDate'].value = "";

        const exportedJson = JSON.stringify(lastDownloadedConfig);
        global.FileReader = class {
            readAsText() {
                setTimeout(() => {
                    this.onload({ target: { result: exportedJson } });

                    try {
                        assert.strictEqual(mockDOM['chkCustomDateRange'].checked, true, "isCustomDateRange should be restored");
                        assert.strictEqual(mockDOM['inputStartDate'].value, "2026-03-15", "Start date should be restored");
                        assert.strictEqual(mockDOM['inputEndDate'].value, "2026-04-10", "End date should be restored");
                        console.log("✅ TEST 6 PASSED: CUSTOM DATE RANGE STATE ROUND-TRIP");
                        passed++;

                        const totalTests = 6;
                        console.log(`\njsonRoundTrip: PASSED: ${passed}, FAILED: ${totalTests - passed}\n`);
                    } catch (e) {
                        console.error("❌ TEST 6 FAILED:", e.message);
                        const totalTests = 6;
                        console.log(`\njsonRoundTrip: PASSED: ${passed}, FAILED: ${totalTests - passed}\n`);
                    }
                }, 10);
            }
        };
        window.importConfigJSON({ target: { files: [{}] } });
    } catch (e) {
        console.error("❌ TEST 6 FAILED:", e.message);
        const totalTests = 6;
        console.log(`\njsonRoundTrip: PASSED: ${passed}, FAILED: ${totalTests - passed}\n`);
    }
}
