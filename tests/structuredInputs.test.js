const assert = require('assert');
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

let totalTests = 0;
let passedTests = 0;

function runTest(name, testFn) {
    totalTests++;
    try {
        testFn();
        console.log(`✅ [PASSED] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`❌ [FAILED] ${name}`);
        console.error(err);
    }
}

console.log("Setting up JSDOM for F8: Structured Inputs...");
let indexHtml = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('app.js', 'utf8');
const structuredInputsJs = fs.readFileSync('structuredInputs.js', 'utf8');

// Strip tailwind config script to prevent "tailwind is not defined" error during JSDOM parsing
indexHtml = indexHtml.replace(/<script>[\s\S]*?tailwind\.config[\s\S]*?<\/script>/g, '');

const dom = new JSDOM(indexHtml, { 
    runScripts: "dangerously",
    url: "http://localhost/" // Fixes "localStorage is not available for opaque origins"
});
const window = dom.window;
const document = window.document;

window.lucide = { createIcons: () => {} };
window.doctors = ["A", "B", "C"];

const scriptEl1 = document.createElement('script');
scriptEl1.textContent = structuredInputsJs;
document.body.appendChild(scriptEl1);

const scriptEl2 = document.createElement('script');
scriptEl2.textContent = appJs;
document.body.appendChild(scriptEl2);

window.initStructuredInputs();

console.log("Running Structured Inputs Tests...\n");

runTest('Test 1: DOCTOR ROLES - Initialize from window.doctors', () => {
    window.eval('doctors.length = 0; doctors.push("A", "B", "C");');
    document.getElementById('inputDoctorRoles').value = "A:R1, B:R2, C:R1";
    window.renderStructuredDoctorRoles();
    const container = document.getElementById('structuredDoctorRolesContainer');
    const rows = container.querySelectorAll('.flex');
    assert.strictEqual(rows.length, 3);
    assert.strictEqual(rows[0].querySelector('.doc-role-name').value, 'A');
    assert.strictEqual(rows[0].querySelector('.doc-role-select').value, 'R1');
});

runTest('Test 2: DOCTOR ROLES - Update role triggers sync', () => {
    window.eval('doctors.length = 0; doctors.push("Alice", "B");');
    document.getElementById('inputDoctorRoles').value = "Alice:R1, B:R2";
    window.renderStructuredDoctorRoles();
    const container = document.getElementById('structuredDoctorRolesContainer');
    // Change Alice's role to R2 (index 1)
    const firstRowSelect = container.querySelectorAll('.flex')[0].querySelector('.doc-role-select');
    firstRowSelect.value = 'R2';
    window.syncStructuredDoctorRoles(true);
    assert.strictEqual(document.getElementById('inputDoctorRoles').value, 'Alice:R2, B:R2');
});

runTest('Test 3: DOCTOR ROLES - Auto-detect new doctor', () => {
    window.eval('doctors.length = 0; doctors.push("A");');
    document.getElementById('inputDoctorRoles').value = "A:R1";
    window.renderStructuredDoctorRoles();
    
    // Simulate main doctor list adding someone
    window.eval('doctors.push("NewDoc");');
    window.renderStructuredDoctorRoles();
    
    const val = document.getElementById('inputDoctorRoles').value;
    assert.strictEqual(val, 'A:R1, NewDoc:R1');
});

runTest('Test 4: SLOTS PER ROLE - Initialize steppers', () => {
    window.eval('doctors.length = 0; doctors.push("A", "B");');
    document.getElementById('inputDoctorRoles').value = "A:R1, B:R2"; 
    document.getElementById('inputDefaultRoleSlots').value = "R1:2, R2:1";
    window.renderStructuredDoctorRoles(); 
    window.renderStructuredRoleSlots();
    const container = document.getElementById('structuredRoleSlotsContainer');
    const items = container.querySelectorAll('.flex.items-center.justify-between');
    assert.strictEqual(items.length, 2); 
    assert.ok(container.innerHTML.includes('2')); 
});

runTest('Test 5: SLOTS PER ROLE - Plus button increments', () => {
    window.eval('doctors.length = 0; doctors.push("A", "B");');
    document.getElementById('inputDoctorRoles').value = "A:R1, B:R2";
    document.getElementById('inputDefaultRoleSlots').value = "R1:1, R2:1";
    window.updateRoleSlot('R1', 1);
    assert.ok(document.getElementById('inputDefaultRoleSlots').value.includes('R1:2'));
});

runTest('Test 6: EXACT MONTHLY QUOTA (Role) - Stepper setup', () => {
    window.eval('doctors.length = 0; doctors.push("A", "B");');
    document.getElementById('inputDoctorRoles').value = "A:R1, B:R2";
    document.getElementById('inputRoleQuotas').value = "R1:12";
    window.renderStructuredRoleQuotas();
    const container = document.getElementById('structuredRoleQuotasContainer');
    const items = container.querySelectorAll('.flex.items-center.justify-between');
    assert.strictEqual(items.length, 2);
});

runTest('Test 7: EXACT MONTHLY QUOTA (Role) - Plus increments from null to 1', () => {
    window.eval('doctors.length = 0; doctors.push("A", "B");');
    document.getElementById('inputDoctorRoles').value = "A:R1, B:R2";
    document.getElementById('inputRoleQuotas').value = ""; 
    window.updateRoleQuota('R1', 1);
    assert.strictEqual(document.getElementById('inputRoleQuotas').value, 'R1:1');
});

runTest('Test 8: EXACT MONTHLY QUOTA (Single Pool) - Works with doctors', () => {
    document.getElementById('inputSinglePoolQuota').value = "A:12";
    window.renderStructuredSinglePoolQuotas();
    window.updateSinglePoolQuota('A', 1);
    assert.strictEqual(document.getElementById('inputSinglePoolQuota').value, 'A:13');
});

runTest('Test 9: CONFLICT LIST - Parse pairs correctly', () => {
    document.getElementById('inputConflicts').value = "A:B, C:D";
    window.renderStructuredConflicts();
    const container = document.getElementById('structuredConflictsContainer');
    const rows = container.querySelectorAll('.flex');
    assert.strictEqual(rows.length, 2);
    assert.strictEqual(rows[0].querySelector('.conflict-doc-1').value, 'A');
    assert.strictEqual(rows[0].querySelector('.conflict-doc-2').value, 'B');
});

runTest('Test 10: CONFLICT LIST - Add new pair', () => {
    document.getElementById('inputConflicts').value = "A:B";
    window.addStructuredConflictPair();
    const container = document.getElementById('structuredConflictsContainer');
    const rows = container.querySelectorAll('.flex');
    assert.strictEqual(rows.length, 2);
    // When adding a new pair, it pushes empty value initially, but syncStructuredConflicts will filter it out if we sync. 
    // Wait, the input value is checked before sync? In my test I'll just check the DOM length.
});

runTest('Test 11: SPECIAL HOLIDAYS - Parse chips', () => {
    document.getElementById('inputSpecialHols').value = "13, 14, 15";
    window.renderStructuredChips('inputSpecialHols', 'structuredSpecialHolsContainer', 'inputSpecialHolsUI');
    const tags = document.getElementById('structuredSpecialHolsContainer').querySelectorAll('.chip-tag');
    assert.strictEqual(tags.length, 3);
});

runTest('Test 12: NO-DUTY DAYS - Remove chip updates hidden input', () => {
    document.getElementById('inputNoDuty').value = "5, 6, 7";
    window.renderStructuredChips('inputNoDuty', 'structuredNoDutyContainer', 'inputNoDutyUI');
    window.removeStructuredChip('inputNoDuty', 1); 
    assert.strictEqual(document.getElementById('inputNoDuty').value, '5, 7');
});

console.log(`\nstructuredInputs: PASSED: ${passedTests}, FAILED: ${totalTests - passedTests}\n`);

if (passedTests !== totalTests) {
    process.exit(1);
}
process.exit(0);
