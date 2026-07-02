# Changelog

All notable changes to the Automatic On-Call & Night Shift Doctor Scheduler will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-07-02
### Added
- **Person-Centric Drag and Drop**: Implemented drag-and-drop shift reassignment for the Person-Centric View. Users can intuitively click and drag a doctor's shift badge to another doctor on the same day, or drop it on a different day to swap shifts across days or fill a shortage.
- **F8 Structured UI Inputs**: Replaced all 6 legacy free-text comma-separated string inputs (Doctor Roles, Slots Per Role, Exact Monthly Quota, Conflict List, Special Holidays, No-Duty Days) with structured, interactive UI components. This eliminates syntax errors (like missing commas or typos) by providing dropdowns, chips, and stepper buttons for configuration.
- **Quota Density Sorting Heuristic**: Implemented a density-based sorting heuristic in the solver (`sortDoctors`) to prioritize doctors with higher `remainingQuota / remainingAvailableDays`, preventing late-month shortages for doctors with off requests (e.g. the `failed_case` configuration).
- **UI Auto-Updating**: Enabled immediate auto-recalculation and re-rendering of the Individual Duty Summary table and Stats Dashboard when manual edits, cell auto-resets, or undo actions occur.

### Fixed
- **Reset All Overrides Button Overlap**: Fixed a layout bug in the schedule header where the "Reset All Overrides" action button overlapped with the view switching tabs on narrower desktop screens by applying flexible container wrapping.
- **Reset Button View Synchronization**: Fixed an issue where resetting a manually assigned cell back to the automatic solver failed to instantly re-render the Person-Centric view.
- **Lexical Scoping Bug in sortDoctors**: Fixed a bug where `sortDoctors` (defined outside the scheduling loop) read the block-scoped loop variable `day` resulting in `undefined`. It now correctly receives `day` as `currentDay`.
- **Manual Override Constraint Checking Crash**: Fixed a `TypeError: offMap.has is not a function` crash during manual cell assignment updates by correctly querying the inner `Set` using `offMap[dayKey].has(doc)`.

## [1.2.0] - 2026-07-01
### Added
- **Off Request Date Ranges**: Supported comma-separated multiple entries (e.g. `5, 12`) and spanning date ranges (e.g. `2-10` or `25/02/2026-04/03/2026`) in both Standard and Custom Date Range modes.
- **Off Request Validation**: Proactively throws warning toasts if an off-request range spans more than 90 days, and displays error toasts for inverted range inputs (where start > end).
- **Flexible UI Inputs**: Upgraded UI fields from number inputs to text inputs, automatically rendering localized helper placeholders for Thai/English.
- **Off Request Date Range Unit Tests**: Wrote comprehensive unit tests (`tests/offRequest.test.js`) evaluating all input formats, comma separations, spanning limits, and inversion rules.

## [1.1.0] - 2026-07-01
### Added
- **Mobile View Schedule Floating Button**: Added a floating "View Schedule" button for narrow screens (< 1024px) that appears after the schedule calculation completes, allowing users to smooth-scroll down to the results section. The button automatically hides when the user scrolls down to the results section.
- **Role to Column Header feature**: Moved role labels from individual schedule cells to the column header (e.g., displaying the role name below the Duty column in List/Table view) when Role-Based Mode is active.
- **Dynamic Role Badges (Person-Centric View)**: Added color-coded role badges next to doctor names in the Person-Centric view's left column.
- **Role Display Unit Tests**: Created `tests/roleHeaderDisplay.test.js` to assert role-related headers, cells, TSV copying, and XLSX exports in both ON/OFF states.
- **Unified Quota System**: Unified `roleQuotas` and per-doctor quotas into a single module-scope `quota` state variable. Added an "Exact Quota Per Doctor" (`inputSinglePoolQuota`) field under "Doctors per Day" in the UI (visible when Role-Based mode is OFF). Both modes now route through a single pre-flight validation check, check active limits on candidate searches, and draw dynamic quota indicators. Supports seamless `.json` config backup migration of legacy `roleQuota` fields to the new schema. Added `tests/quotaUnified.test.js` unit test suite.

### Changed
- **Sticky Right Panel Layout on Desktop**: Implemented a responsive two-column layout for screen viewports >= 1024px (`lg:` breakpoint) where the configuration sidebar and results panel scroll independently within the viewport limit (`calc(100vh - 150px)` height boundary), keeping the right panel sticky and header visible at all times.
- **Excel & Clipboard Export Formats**: Copied spreadsheet data (TSV) and exported Excel files now dynamically format headers with their corresponding role suffix (e.g. `Duty 1 (R1)`), keeping individual data cells cleanly limited to doctor names.

### Fixed
- **Left Sidebar Element Clipping**: Solved an issue where nested element cards in the left config sidebar were shrunk and clipped out of view by changing the layout to block/space-y, rendering all input fields and toggles fully reachable by scroll.
- **Floating Button Visibility on Desktop**: Fixed specificity of the floating mobile button's CSS selector, wrapping it in a mobile media query to ensure it never displays on desktop viewports.

## [1.0.4] - 2026-07-01
### Added
- **Lock Special Duty — Every Weekday Mode**: Added a new lock condition type selector (`firstNDays` / `everyWeekday`) under the Lock Special Duty toggle. When set to *Every [Weekday]*, the solver locks exactly one doctor from the special pool onto every occurrence of the chosen weekday (e.g. every Sunday) across the schedule range — including custom date ranges spanning multiple months.
- **Lock Special Duty — Custom Start Day**: The "First N Days" lock mode now accepts a configurable *Start Day* input (`inputSpecialStartDay`), enabling partial-month range locks (e.g. days 7 – 14). When start day = 1, behaviour is unchanged from the previous version.
- **Warning Toast — No Matching Weekdays**: If "Every Weekday" mode is selected but the chosen weekday has zero occurrences in the active schedule range, a non-fatal toast warns the user and the solver continues normally.

### Changed
- **Lock Special Duty — Consecutive Shifts Enforced**: The locked doctor is now **exempt** from the consecutive-holiday and `preventConsecutiveAll` constraints, ensuring they work every locked day without gaps. All other doctors continue to respect those constraints normally.
- **Doctors per Day — Role-Based Visibility**: The DEFAULT SLOTS input is now hidden when Role-Based Mode is ON and shown when it is OFF. The last entered value is preserved across visibility toggles. CUSTOM DAILY SLOTS remains visible regardless of mode.
- **Doctors per Day — Undefined Values Fixed**: Custom Daily Slots and Off Requests fields no longer display `undefined` when the corresponding data is absent; they now safely fall back to an empty string.

### Fixed
- **Save / Load — New Lock Fields**: `lockConditionType`, `selectLockWeekday`, and `inputSpecialStartDay` are now saved into the exported JSON and restored on import. Old JSON files without these fields silently default to `firstNDays`, weekday `0` (Sunday), and start day `1`.
- **Test Suite — Mock DOM Completeness**: The Node.js mock DOM in `tests/lockSpecialDuty.test.js` now auto-patches `dispatchEvent`, `querySelectorAll`, `insertBefore`, and `appendChild` on any element returned by `getElementById`, eliminating spurious "Error parsing JSON" noise during config-import tests.

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
