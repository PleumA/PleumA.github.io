# Changelog

All notable changes to the Automatic On-Call & Night Shift Doctor Scheduler will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-07-29
### Added
- **Accessibility**: Added descriptive `aria-label` and `aria-hidden` attributes to dynamic schedule slot buttons to support screen readers, making the click-to-swap interface fully accessible to visually impaired users.
- **Offline Reliability (PWA)**: Implemented Progressive Web App configurations via `manifest.json` and a Service Worker (`sw.js`). The app caches layout resources and CDN files, ensuring it functions seamlessly on hospital wards with unstable Wi-Fi.
- **Test Suite**: Introduced a standalone Node.js test runner (`tests/solver.test.js`) to prevent regressions in boundary cases (e.g., handling circular conflict chains, identifying impossible configurations).
- **Person-Centric View**: Added a new data view mode that pivots the schedule into a person-centric grid (rows representing doctors, columns representing days), making it effortless for individuals to visually track their exact working days across the month.
- **Inline Constraint Explainer**: Manual schedule overrides are now actively validated. If an administrator assigns a shift that breaks constraints (e.g. consecutive days, requested off days, double-booking), a proactive toast notification precisely explains why the assignment is flagged.
- **Undo / History Stack**: Added a 20-step memory stack allowing users to safely undo manual cell swaps or resets by pressing `Ctrl+Z` (or `Cmd+Z`), preventing accidental schedule corruption.
- **Drag-and-Drop Editing**: Replaced the previous rigid click-to-swap behavior with intuitive drag-and-drop manipulation on calendar cells, significantly reducing click fatigue during manual editing.
- **Mobile-First Calendar Layout**: The calendar grid now dynamically collapses from a 7-column grid into a highly readable, vertical daily-scroll layout on narrow mobile screens.

### Changed
- **Error Diagnostics**: Replaced the generic "Constraint conflict" quota error toast with a prescriptive, mathematically exact message (e.g., "Quotas sum to 120 but there are 62 slots — remove 58 shifts").

## [1.0.0] - 2026-06-29
### Added
- **Mobile Bottom Sheet**: Implemented a full-screen, blurred modal container (`#mobileDoctorSheet`) that replaces cramped inline dropdown menus on viewports `< 768px`, dramatically improving touch-target precision for mobile users.
- **Input Helpers**: Added inline syntax examples (e.g., `A:R1, B:R2`) and dynamic placeholder text directly below the Role and Conflict configuration input textareas to prevent formatting typos.
- **Auditing Documentation**: Authored `logic_report.md`, a deep-dive technical reference on the Monte Carlo solver engine, constraint cascades, and scoring metrics for administrative and developer auditing.
- **Contributing Guide**: Created `CONTRIBUTING.md` standardizing pull-request procedures and architectural guidelines.
