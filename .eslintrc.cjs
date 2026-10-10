module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'script', // app.js is a plain browser script, not an ES module
  },
  globals: {
    // Third-party globals loaded via CDN
    tailwind: 'readonly',
    lucide: 'readonly',
    XLSX: 'readonly',
    // App globals exposed on window
    generateSchedule: 'writable',
    toggleDarkMode: 'writable',
    toggleLanguage: 'writable',
    openManualModal: 'writable',
    closeManualModal: 'writable',
    addOffRow: 'writable',
    addExtraSlotRow: 'writable',
    exportConfigJSON: 'writable',
    importConfigJSON: 'writable',
    addStructuredConflictPair: 'writable',
    toggleSpecialRuleUI: 'writable',
    toggleLockConditionUI: 'writable',
    // Shared across the plain <script> files (translations.js, structuredInputs.js, app.js)
    currentLang: 'writable',
    translations: 'readonly',
    SHORTAGE_MARKER: 'readonly',
    esc: 'readonly',
    doctors: 'writable',
    isCustomDateRange: 'writable',
    initStructuredInputs: 'readonly',
    renderStructuredDoctorRoles: 'readonly',
    explainSlotFailure: 'readonly',
    pushToUndoStack: 'readonly',
    // calendarExport.js
    buildICS: 'readonly',
    parseCalendarScope: 'readonly',
    listCalendarScopes: 'readonly',
    collectDutyEvents: 'readonly',
  },
  overrides: [
    {
      // Tests eval() translations.js + app.js, so app globals are invisible to ESLint
      files: ['tests/**/*.js'],
      rules: { 'no-undef': 'off' },
    },
  ],
  rules: {
    // Prettier handles formatting; keep these off to avoid conflicts
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'src/'],
};
