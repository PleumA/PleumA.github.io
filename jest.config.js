/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.test.js'],
  // Coverage thresholds per roadmap Phase 5
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: ['*.js', '!jest.config.js', '!postcss.config.js', '!tailwind.config.js'],
};
