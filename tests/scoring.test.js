const fs = require('fs');
const assert = require('assert');

// Mock Globals
global.document = {
    getElementById: () => null,
    addEventListener: () => {}
};
global.window = {
    addEventListener: () => {},
    setTimeout: (fn) => fn()
};
global.localStorage = { getItem: () => 'en', setItem: () => {} };

let appJsCode = fs.readFileSync('./app.js', 'utf8');

// Strip 'let' so app.js uses our global variables
appJsCode = appJsCode.replace(/let doctors = /g, 'global.doctors = ');
eval(appJsCode);

console.log("Running scoring.test.js...");
let passed = 0;

// Helper to create a dummy candidate
function createCandidate(scheduleDocs, tCounts, hCounts, wCounts) {
    let schedule = [];
    scheduleDocs.forEach((docsOnDay, idx) => {
        schedule.push({
            day: idx + 1,
            selectedDocs: docsOnDay.map(d => ({ name: d, role: 'Default' }))
        });
    });
    return {
        schedule,
        tCounts: tCounts || { A: 0, B: 0 },
        hCounts: hCounts || { A: 0, B: 0 },
        wCounts: wCounts || { A: 0, B: 0 }
    };
}

// TEST 1: Shortages Penalty
try {
    doctors = ["A", "B"];
    
    // Candidate 1: Full schedule
    let candFull = createCandidate([["A", "B"], ["A", "B"]], { A: 2, B: 2 }, { A: 0, B: 0 }, { A: 2, B: 2 });
    
    // Candidate 2: One shortage
    let candShortage = createCandidate([["A", "__SHORTAGE__"], ["A", "B"]], { A: 2, B: 1 }, { A: 0, B: 0 }, { A: 2, B: 1 });
    
    let scoreFull = scoreSchedule(candFull);
    let scoreShortage = scoreSchedule(candShortage);
    
    assert.strictEqual(scoreFull > scoreShortage, true, "Full schedule should score higher than one with a shortage");
    assert.strictEqual(scoreShortage <= scoreFull - 15000, true, "Shortage penalty should be at least 15000");
    console.log("✅ TEST 1 PASSED: SHORTAGE PENALTY");
    passed++;
} catch (e) {
    console.error("❌ TEST 1 FAILED:", e.message);
}

// TEST 2: Variance Penalty
try {
    doctors = ["A", "B"];
    
    // Candidate Balanced: A=6, B=6
    let candBalanced = createCandidate(
        [["A"], ["B"], ["A"], ["B"], ["A"], ["B"], ["A"], ["B"], ["A"], ["B"], ["A"], ["B"]],
        { A: 6, B: 6 }, { A: 0, B: 0 }, { A: 6, B: 6 }
    );
    
    // Candidate Unbalanced: A=10, B=2
    let candUnbalanced = createCandidate(
        [["A"], ["A"], ["A"], ["A"], ["A"], ["A"], ["A"], ["A"], ["A"], ["A"], ["B"], ["B"]],
        { A: 10, B: 2 }, { A: 0, B: 0 }, { A: 10, B: 2 }
    );
    
    let scoreBalanced = scoreSchedule(candBalanced);
    let scoreUnbalanced = scoreSchedule(candUnbalanced);
    
    assert.strictEqual(scoreBalanced > scoreUnbalanced, true, "Balanced schedule should score higher than high variance schedule");
    console.log("✅ TEST 2 PASSED: VARIANCE PENALTY");
    passed++;
} catch (e) {
    console.error("❌ TEST 2 FAILED:", e.message);
}

// TEST 3: Gap Penalty
try {
    doctors = ["A", "B"];
    
    // Candidate Good Gap: A works day 1 and day 4 (gap = 3)
    let candGoodGap = createCandidate(
        [["A"], ["B"], ["B"], ["A"]],
        { A: 2, B: 2 }, { A: 0, B: 0 }, { A: 2, B: 2 }
    );
    
    // Candidate Bad Gap: A works day 1 and day 3 (gap = 2, i.e. 1 day rest)
    let candBadGap = createCandidate(
        [["A"], ["B"], ["A"], ["B"]],
        { A: 2, B: 2 }, { A: 0, B: 0 }, { A: 2, B: 2 }
    );
    
    let scoreGoodGap = scoreSchedule(candGoodGap);
    let scoreBadGap = scoreSchedule(candBadGap);
    
    assert.strictEqual(scoreGoodGap > scoreBadGap, true, "Schedule with 2-day rests should score higher than 1-day rest");
    console.log("✅ TEST 3 PASSED: GAP PENALTY");
    passed++;
} catch (e) {
    console.error("❌ TEST 3 FAILED:", e.message);
}

console.log(`\nscoring: PASSED: ${passed}, FAILED: ${3 - passed}\n`);
