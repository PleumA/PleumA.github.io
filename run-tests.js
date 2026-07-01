const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const testsDir = path.join(__dirname, 'tests');
const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.js'));

let allPassed = true;

console.log(`Found ${testFiles.length} test files to run in ./tests/\n`);

for (const file of testFiles) {
    console.log(`========================================================`);
    console.log(`▶️  RUNNING SUITE: ${file}`);
    console.log(`========================================================`);

    // Use spawnSync so we can capture both stdout and stderr
    const result = spawnSync('node', [path.join(testsDir, file)], { encoding: 'utf8' });
    const output = (result.stdout || '') + (result.stderr || '');
    process.stdout.write(output);

    // Detect any FAILED lines in output regardless of exit code
    const hasFailed = result.status !== 0 || /❌.*FAILED/.test(output) || /FAILED:\s*[1-9]/.test(output);
    if (hasFailed) {
        allPassed = false;
        if (result.status !== 0) process.stdout.write(`\n❌ [FAILED] ${file} exited with code ${result.status}\n`);
    }
    console.log('\n'); // Spacing between suites
}

console.log(`========================================================`);
if (allPassed) {
    console.log("🎉 ALL TEST SUITES PASSED SUCCESSFULLY!");
    process.exit(0);
} else {
    console.log("💥 SOME TEST SUITES FAILED. Check the output logs above.");
    process.exit(1);
}
