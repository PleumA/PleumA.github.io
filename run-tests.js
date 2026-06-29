const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const testsDir = path.join(__dirname, 'tests');
const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.js'));

let allPassed = true;

console.log(`Found ${testFiles.length} test files to run in ./tests/\n`);

for (const file of testFiles) {
    console.log(`========================================================`);
    console.log(`▶️  RUNNING SUITE: ${file}`);
    console.log(`========================================================`);
    try {
        // Execute each test file synchronously, piping output directly to the console
        execSync(`node "${path.join(testsDir, file)}"`, { encoding: 'utf8', stdio: 'inherit' });
    } catch (err) {
        allPassed = false;
        console.error(`\n❌ [FAILED] ${file} exited with code ${err.status}`);
    }
    console.log('\n'); // Spacing between suites
}

console.log(`========================================================`);
if (allPassed) {
    console.log("🎉 ALL TEST SUITES PASSED SUCCESSFULLY!");
    process.exit(0);
} else {
    console.error("💥 SOME TEST SUITES FAILED. Check the output logs above.");
    process.exit(1);
}
