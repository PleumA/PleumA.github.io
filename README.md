# PleumA.github.io
## Automatic On-Call & Night Shift Doctor Scheduler

> **This website was developed by Vibe Code using Antigravity model Gemini 3.1 Pro, combined with Claude Opus 4.6 version for allocating night-shift doctor duties.**

📖 **[How the algorithm works (Technical Logic Report)](logic_report.md)** — A detailed, deep-dive technical reference on the Monte Carlo solver engine, constraint cascades, scoring metrics, and system architecture. Essential reading for anyone auditing or extending this medical scheduling tool.


## 🌟 Core Features

### 1. Smart Solver (Monte Carlo Simulation)
- Evaluates candidate schedules through **300 iterations** of a randomized greedy search.
- Selects the schedule with the highest fairness rating based on custom scoring criteria.
- Scores evaluate:
  - **Shortages**: Penalizes unassigned slots.
  - **Workload Balance**: Minimizes the Standard Deviation of weekday and holiday duties (can be toggled on/off).
  - **Gaps**: Penalizes shifts with only a 1-day rest period in between to prevent fatigue.

### 2. Constraints & Rules Engine
- **Role-Based Calculation (Toggleable)**: When **ON**, maps doctors to roles (e.g., `A:R1, B:R2`) and calculates duty separately for each role pool. When **OFF**, treats all doctors as a single pool.
- **Exact Shift Quotas**: Enforces an exact shift quota per role (e.g., `R1:12, R2:10, R3:6`). 
  - **Pre-Flight Check**: Aborts computation if the sum of all quotas does not perfectly match the total available slots for the month (unless **Allow Blank Days** is toggled ON to support unbalanced quotas/shortages).
  - **Strict Quota Enforcement**: Doctors who have reached their exact quota are immediately removed from the available pool for all subsequent shifts.
  - **Graceful Dead-end Fallback**: If a day cannot be filled due to quota lockouts, the system outputs `ขาดคน` (Missing) without crashing and shows a warning toast pointing out constraint conflicts.
- **Dynamic Doctors per Day**: Allows defining a global default slot count or custom slot numbers for specific days. Seamlessly collapses role-specific slot configurations into general pool slots when Role-Based Mode is toggled off.
- **Custom Date Ranges**: Easily pivot from generating rigid month-based schedules to arbitrary custom date ranges (e.g. Mid-month to mid-month, or quarterly schedules up to 90 days), with the core solver array seamlessly expanding or contracting. Day labels in Calendar and Person views automatically reset at month boundaries for chronological clarity instead of continuous index increments.
- **Allow Blank Days (Toggleable)**: When **ON**, allows unassigned slots (`ขาดคน`) if no eligible doctor is available due to constraints. When **OFF** (default), a 5-level **Must-Fill cascade** progressively relaxes spacing, conflict, and off-request rules to force-fill the slot.
- **Strict Deduplication**: Enforces a strict uniqueness check to ensure the exact same doctor cannot be scheduled for multiple slots on the same day, even during forced Must-Fill cascades.
- **Conflict / Hate List**: Excludes incompatible doctors (e.g., `A:B` or `A conflicts with B`) from working the same shift.
- **Off Requests**: Enforces days off; no shifts are allocated on requested off days or on the day prior to an off day.
- **Holiday Spacing**: Prevents doctors from working consecutive weekend/holiday shifts.
- **Queue Locking**: Supports locking a specific group of doctors to cover special slots in two modes:
  - **First N Days (default)**: Locks the group to a contiguous day range. A configurable *Start Day* allows partial-month windows (e.g. days 7 – 14) — not just "from day 1". Locked doctors are exempt from consecutive-shift constraints so they work every day in the range without gaps.
  - **Every [Weekday]**: Locks the group onto every occurrence of a chosen weekday (e.g. every Sunday) within the schedule range, correctly spanning custom multi-month ranges. A warning toast is displayed if no matching weekdays exist.

### 3. Interactive UI & Customization
- **Table, Calendar, & Person Views**: View duties in a clean date-list format, an interactive month calendar, or a pivoted person-centric grid.
- **Inline Constraint Explainer**: Manual schedule overrides are proactively validated against active rules. If an administrator assigns a shift that breaks constraints (e.g. consecutive days or off requests), an exact explanation is proactively displayed.
- **Manual Overrides & Drag-and-Drop**: Easily correct schedules manually. Instead of rigid dropdown menus, you can natively **drag and drop** a doctor's name from one slot to another in the calendar to effortlessly execute 2-way shift swaps.
- **Undo / History Stack**: Safely navigate manual corrections. The app tracks a 20-step deep memory stack allowing you to press `Ctrl+Z` to seamlessly revert accidental cell edits and resets.
- **Targeted DOM Updates & Deferred Sync**: The core rendering engine is optimized so that manual interactions do not repaint the surrounding grid. The global Stats Dashboard and Summary Table updates are deferred until the user explicitly clicks the "Confirm Changes" button, keeping interactions buttery smooth.
- **Real-Time Recalculation**: Schedule configurations (e.g., month, year, doctors per day, constraints) immediately trigger the smart solver to re-calculate the ideal schedule without needing manual confirmations. Recalculation automatically fires when both custom range dates are filled or changed.
- **Save/Load Configuration**: Export all application settings, quotas, constraints, and **manual cell overrides** into a `.json` backup file, and instantly import them later to restore your precise environment without re-typing.
- **Excel Export**: Quick copy or `.xlsx` download support (via SheetJS).
- **Clipping-Free Sidebar Dropdowns**: Removed container overflow boundaries on the Off Requests list, allowing dropdown menus to render cleanly on top of other sidebar panels rather than clipping.
- **Localization & Theme**: Supports dynamic switching between Thai (TH) and English (EN) languages, along with a sleek system-synced Dark Mode. Automatically detects browser/system language and system dark mode preferences on initial load, while strictly preserving manual user overrides via `localStorage`.

### 4. Installable PWA & Offline Support
- **Offline Capability**: Features a service worker (`sw.js`) and a web app manifest (`manifest.json`) caching all layout resources, stylesheets, custom fonts, and third-party libraries (Tailwind CSS, SheetJS, Lucide Icons) for complete offline reliability in hospital wards with spotty Wi-Fi.
- **Installable App**: Fully compliant standard web app configurations allow installing the scheduler directly onto mobile and desktop home screens.

---

## 📱 Mobile Performance Optimizations

Designed with mobile first-class support in mind to ensure zero stutters on phone browsers:
1. **Config Parser Extraction (`parseUIConfig`)**: All DOM elements, rules, arrays, and quotas are compiled exactly once into a static state block (`parseUIConfig`) before the calculation runs. This prevents thousands of slow, redundant DOM lookups and key array allocations from occurring inside the Monte Carlo simulation's hot inner loop or rendering loops.
2. **Native SVG Rendering**: Inside dynamic loops like `renderTableView` and `renderCalendarView`, standard inline `<svg>` strings are utilized. This eliminates reliance on automatic DOM-scanning icon libraries (e.g., Lucide) which are notorious for causing layout thrashing and application freezing during table updates.
3. **Deferred Stats Dashboard Recalculation**: Changing a doctor assignment bypasses global array counting overheads until the user is finished editing and actively requests a UI state sync.
4. **$O(1)$ Lookups**: Utilizes JavaScript `Set` structures for conflict checking, holiday checking, and off-day requests instead of traversing nested arrays, improving search execution speeds.
5. **Main Thread Yielding**: The solver operates asynchronously in batches. It yields control back to the browser event loop (`setTimeout(..., 0)`) sequentially after chunks of iteration logic, maintaining a fluid 60FPS UI and allowing loaders to spin.
6. **Input Capping**: Implements a hard processing limit (capped at 50 slots per day) to prevent accidental typos in the custom slot input fields from creating endless loops that could freeze the browser engine.
7. **Touch-Scrolling**: Containers support horizontal swiping with `-webkit-overflow-scrolling: touch` and minimum viewport widths to prevent layout squishing on mobile portrait screens.
8. **Deterministic & Stable Sorting**: The doctor sorting algorithm assigns a pre-calculated, fixed random noise value to each doctor at the start of a sort operation. This ensures transitive and deterministic sort comparisons (avoiding unstable inline `Math.random()` tie-breakers in the `.sort()` callback), which prevents infinite loops or crashes in modern browser sorting engines.
9. **Touch-Optimized Bottom Sheet (Viewport `< 768px`)**: Replaces cramped inline absolute cell dropdowns on mobile screens with a full-screen blurred Bottom Sheet. Doctor selection elements inside are scaled to a minimum of 48px height with generous touch padding for error-free mobile interaction.
10. **Mobile-First Responsive Calendar**: The 7-column Calendar View dynamically collapses into a highly readable, vertical daily-scroll list layout on narrow mobile viewports, entirely eliminating horizontal overflow zooming.

---

## 🛡️ Robustness & Web Standards

Built for high reliability, clean execution, and security:
1. **Escaping & XSS Sanitization**: Doctor and role names are treated as user input; for UI badges, names are bound securely via `textContent`, or formatted using a custom escaping helper (`esc(...)`) when injected into template-literal dynamic DOM trees (e.g. Schedule cells, calendar grid, stats summary) to prevent cross-site scripting (XSS).
2. **Robust Event Handlers (No String Eval)**: Inline click events like `removeDoctor`, `updateDoctorAssignment`, and `toggleSpecialDoc` reference stable doctor indices (integers) rather than raw name strings, eliminating execution bugs caused by names containing quotes or apostrophes (e.g., O'Connor).
3. **Modern Clipboard Integration**: Replaced deprecated `document.execCommand` methods with the modern, asynchronous `navigator.clipboard.writeText` API, assuring future-proof support and clean error handling via toasts.
4. **Config Schema Validation**: The JSON import tool checks the schema's shape (verifying arrays for doctors, off requests, and extra slots data) before applying any state. This prevents application crashes from malformed, corrupted, or incompatible configuration files.
5. **Circular Dependency Prevention**: Decoupled dynamic list rendering from global DOM translation sweeps (`applyTranslations()`), resolving potential browser-freezing infinite recursion loops.

---

## 📂 Architecture

- **`index.html`**: Structures the dashboard layout using Tailwind CSS, including settings for basic config, advanced constraints, role management, and the interactive manual instruction modal. Links `manifest.json` and registers the service worker.
- **`app.js`**: Contains the scheduling state, Monte Carlo solver search loops, dynamic HTML renderers, and the dual-language translation dictionaries.
- **`manifest.json`**: Standard web app manifest defining PWA configuration, installable setups, and colors.
- **`sw.js`**: Service worker script caching key assets for reliable offline performance.
- **`tests/*.test.js`**: A comprehensive, lightweight Node.js unit testing suite (11 test files, 66+ tests) that verifies corner-case solver behaviors (e.g., circular conflicts, quota sums, and impossible constraints in `solver.test.js`), UI DOM interactions (JSON export/import in `jsonRoundTrip.test.js`), state management (undo stacks in `manualOverrides.test.js`), Lock Special Duty scheduling logic — including Every Weekday mode, custom start day range, and consecutive shift enforcement — in `lockSpecialDuty.test.js`, and security (XSS assertions in `xss.test.js`). The tests utilize a custom decoupled mock-DOM evaluation pattern to run without requiring heavy frameworks like Jest, reporting clean outputs in a unified `PASSED: X, FAILED: Y` format.
- **`run-tests.js`**: Orchestrates test suite execution and aggregates outputs and exit statuses across files.
