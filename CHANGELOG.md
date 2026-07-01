# Changelog

All notable changes to the Automatic On-Call & Night Shift Doctor Scheduler will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-07-01
### Added
- **Auto-Calculate on Date Change**: Automatically triggers `generateSchedule()` when both start/end dates are populated, when dates are edited, or when the custom date range mode is toggled off/on.
- **Auto-Detect Dark Mode**: Automatically detects browser/system light/dark preference on load and applies it, while preserving manual preference overrides.

### Changed
- **Heuristics Tuning**: Refined the solver's `balanceShifts` workload heuristic to evaluate any non-zero difference in total shifts, removing the previous `0.4` threshold to ensure more deterministic workload balancing.
- **Prescriptive Error Toasts**: Ensured that the actual validation error message (e.g. quota mismatch) is passed directly to the UI toast instead of being swallowed.
- **Test Suite Formats**: Standardized all test files to output in the unified `PASSED: X, FAILED: Y` format, and updated `run-tests.js` to combine stdout/stderr streams to prevent swallowed errors.

### Fixed
- **Custom Range Month Boundaries**: Fixed a bug where Calendar and Person views printed day labels as continuous indexes (e.g. "32 Sat") when spanning across month boundaries. The day labels now correctly reset at month boundaries.
- **Quota Single Pool Test Suite**: Standardized `quotaSinglePool.test.js` to use aligned global variables and correct DOM mock definitions to avoid silent failures.

## [1.0.2] - 2026-07-30
### Added
- **Accessibility**: Added descriptive `aria-label` and `aria-hidden` attributes to dynamic schedule slot buttons to support screen readers, making the click-to-swap interface fully accessible to visually impaired users.
- **Language Auto-Detection**: Automatically detects browser/system language on initial load (defaulting to Thai if Thai-based language is set, otherwise English). Persists the detected value or manual overrides in `localStorage` to ensure auto-detection never overwrites user preferences.
- **Offline Reliability (PWA)**: Implemented Progressive Web App configurations via `manifest.json` and a Service Worker (`sw.js`). The app caches layout resources and CDN files, ensuring it functions seamlessly on hospital wards with unstable Wi-Fi.
- **Test Suite**: Significantly expanded the standalone Node.js test runner with comprehensive test suites (54 tests across 8 files) covering edge cases for cascade fallback logic, configuration JSON round-trips, undo stack limits, off-request boundaries, and XSS sanitization.
- **Person-Centric View**: Added a new data view mode that pivots the schedule into a person-centric grid (rows representing doctors, columns representing days), making it effortless for individuals to visually track their exact working days across the month.
- **Inline Constraint Explainer**: Manual schedule overrides are now actively validated. If an administrator assigns a shift that breaks constraints (e.g. consecutive days, requested off days, double-booking), a proactive toast notification precisely explains why the assignment is flagged.
- **Undo / History Stack**: Added a 20-step memory stack allowing users to safely undo manual cell swaps or resets by pressing `Ctrl+Z` (or `Cmd+Z`), preventing accidental schedule corruption.
- **Custom Date Ranges**: Added a new toggle in Basic Settings allowing users to compute schedules for arbitrary start and end dates (up to 90 days) instead of being locked to a single calendar month.
- **Strict DD/MM/YYYY Output**: All UI components, date pickers, and export utilities now strictly output dates in the standard `DD/MM/YYYY` format using `en-GB` HTML lang attributes to override browser defaults.
- **Drag-and-Drop Editing**: Replaced the previous rigid click-to-swap behavior with intuitive drag-and-drop manipulation on calendar cells, significantly reducing click fatigue during manual editing.
- **Mobile-First Calendar Layout**: The calendar grid now dynamically collapses from a 7-column grid into a highly readable, vertical daily-scroll layout on narrow mobile screens.

### Changed
- **Error Diagnostics**: Replaced the generic "Constraint conflict" quota error toast with a prescriptive, mathematically exact message (e.g., "Quotas sum to 120 but there are 62 slots — remove 58 shifts").
- **Data Export**: Upgraded the `Copy Schedule` and `Export .xlsx` features. The Date column now natively formats as a short-date (e.g. `1 ก.ค. 69` or `1 Jul 26`) instead of a single day number for better calendar clarity.

### Fixed
- **Manual Translation Rendering**: Fixed a bug where English translations of the User Manual stripped out embedded `<code>` tags, causing the remainder of paragraphs to fall back to Thai.
- **View Container Layout**: Fixed a DOM nesting issue in `calendarViewContainer` that caused the Person-Centric View to render far below the tabs instead of right beneath them.
- **Export Year Normalization**: Fixed a bug where the exported file name and date columns could incorrectly use the Buddhist Era (BE) year format when exporting in English, or the A.D. year format when exporting in Thai. The years are now strictly normalized based on the active language.
- **Complete Internationalization**: Fixed various input placeholders and HTML elements that were previously hardcoded in Thai, ensuring the English Mode UI is 100% translated for international users.
- **Dark Mode Date Picker**: Fixed a styling issue where the native HTML5 `<input type="date">` calendar icon was invisible on dark backgrounds by utilizing the `color-scheme` CSS rule natively.
- **Date Validation**: Fixed an issue where the custom date range erroneously permitted identical start and end dates.
- **Cascade Fallback Logic**: Fixed a bug where Cascade Level 4 incorrectly dropped hard off-day rules.
- **XSS Vulnerability**: Neutralized a security vulnerability by passing array indices rather than raw doctor names into HTML attributes for drag-and-drop functionality, preventing arbitrary script execution.


## [1.0.0] - 2026-06-29
### Added
- **Multi-Sheet Export**: The Excel Export `.xlsx` file now automatically generates a second worksheet named `Summary` (`สรุปจำนวนเวร`), embedding the Individual Duty Summary right alongside the primary schedule table.
- **Mobile Bottom Sheet**: Implemented a full-screen, blurred modal container (`#mobileDoctorSheet`) that replaces cramped inline dropdown menus on viewports `< 768px`, dramatically improving touch-target precision for mobile users.
- **Input Helpers**: Added inline syntax examples (e.g., `A:R1, B:R2`) and dynamic placeholder text directly below the Role and Conflict configuration input textareas to prevent formatting typos.
- **Auditing Documentation**: Authored `logic_report.md`, a deep-dive technical reference on the Monte Carlo solver engine, constraint cascades, and scoring metrics for administrative and developer auditing.
- **Contributing Guide**: Created `CONTRIBUTING.md` standardizing pull-request procedures and architectural guidelines.
