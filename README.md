# Doctor Scheduler
## Automatic On-Call & Night Shift Doctor Scheduler

> **This website was developed by Vibe Code using Antigravity model Gemini 3.1 Pro, combined with Claude Sonnet 4.6 (Thinking) for allocating night-shift doctor duties.**

📖 **[How the algorithm works (Technical Logic Report)](logic_report.md)** — A detailed, deep-dive technical reference on the Monte Carlo solver engine, constraint cascades, scoring metrics, and system architecture. Essential reading for anyone auditing or extending this medical scheduling tool.

📖 **[Link to web](https://pleuma.github.io)**

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
  - **Dynamic Role Header Promotion**: When Role-Based Mode is enabled, the assigned role label is moved up to the column header (e.g. Duty 1 (R1) or a sub-header `R1`), leaving individual cell doctor chips completely free of role suffixes. Suffixes are also moved to headers in exported Excel spreadsheets and copied clipboard data.
  - **Dynamic Role Badges (Person-Centric View)**: In the Person-Centric grid, doctor names in the left-hand column are decorated with color-coded, dynamic role badges mapping to their roles.
- **Exact Shift Quotas (Unified Quota System)**: Enforces exact shift quotas per role when Role-Based mode is ON (e.g., `R1:12, R2:10`), or per doctor when Role-Based mode is OFF (e.g., `A:5, B:4`).
  - **Pre-Flight Check**: Aborts computation if the sum of all active doctor quotas does not perfectly match the total available slots for the schedule range (unless **Allow Blank Days** is toggled ON).
  - **Strict Quota Enforcement**: Doctors (or roles) who have reached their exact quota are immediately removed from the available pool for all subsequent shifts.
  - **Graceful Dead-end Fallback**: If a slot cannot be filled due to quota lockouts, the system outputs `ขาดคน` (Missing) without crashing and displays a warning toast.
- **Dynamic Doctors per Day**: Allows defining a global default slot count or custom slot numbers for specific days. Seamlessly collapses role-specific slot configurations into general pool slots when Role-Based Mode is toggled off.
- **Custom Date Ranges**: Easily pivot from generating rigid month-based schedules to arbitrary custom date ranges (e.g. Mid-month to mid-month, or quarterly schedules up to 90 days), with the core solver array seamlessly expanding or contracting. Day labels in Calendar and Person views automatically reset at month boundaries for chronological clarity instead of continuous index increments.
- **Allow Blank Days (Toggleable)**: When **ON**, allows unassigned slots (`ขาดคน`) if no eligible doctor is available due to constraints. When **OFF** (default), a 5-level **Must-Fill cascade** progressively relaxes spacing, conflict, and off-request rules to force-fill the slot.
- **Strict Deduplication**: Enforces a strict uniqueness check to ensure the exact same doctor cannot be scheduled for multiple slots on the same day, even during forced Must-Fill cascades.
- **Conflict / Hate List**: Excludes incompatible doctors (e.g., `A:B` or `A conflicts with B`) from working the same shift.
- **Off Requests**: Enforces days off; no shifts are allocated on requested off days or on the day prior to an off day.
- **Holiday Spacing**: Prevents doctors from working consecutive weekend/holiday shifts.
- **Queue Locking**: Supports locking a specific group of doctors to cover special slots in two modes:
  - **First N Days (default)**: Locks the group to a contiguous day range. A configurable *Start Day* allows partial-month windows (e.g. days 7 – 14) — not just "from day 1". Locked doctors are exempt from off-duty period constraints so they work every day in the range without gaps.
  - **Every [Weekday]**: Locks the group onto every occurrence of a chosen weekday (e.g. every Sunday) within the schedule range, correctly spanning custom multi-month ranges. A warning toast is displayed if no matching weekdays exist.
- **Shift-Based Mode (Morning, Afternoon, Night)**: Organizes the daily schedule into three distinct, consecutive shifts with adjustable slot counts (Morning: 08:00 - 16:00, Afternoon: 16:00 - 24:00, and Night: 24:00 - 08:00).
  - **Night-to-Morning Spacing Safeguard**: Strictly prevents a doctor assigned to any Night shift slot on Day $d-1$ from working a Morning shift slot on Day $d$.
  - **Off Requests (Off Period) Integration**: If a doctor has Day $d$ off, they are blocked from all slots on Day $d$, and blocked from **Night shift slots only** on Day $d-1$ (permitting Morning and Afternoon shifts on the day before requested off).
  - **Shift Alternation & Rotation**: Employs a shift type variance penalty to ensure that doctors rotate and alternate shifts fairly rather than getting stuck on a single type.
  - **Concurrency & Role-Based Compatibility**: Shift-Based Mode and Role-Based Mode can run concurrently, mapping role requirements onto the shifts.
  - **Detailed Individual Summary Table**: Displays Morning (M), Afternoon (A), and Night (N) counts for each doctor under Shift-Based Mode. Supported in exports and copy commands.
  - **No Numbers in Table**: Shift slot suffix numbers (e.g. `1`, `2`) are removed from headers and badges to keep layout cells clean.

### 3. Interactive UI & Customization
- **Structured Interactive Inputs**: All configuration settings (Doctor Roles, Quotas, Conflict Lists, Holidays, Off Requests) use intuitive structured components (steppers, dropdowns, and chips) to eliminate formatting errors, syncing seamlessly to the internal scheduling engine.
- **Table, Calendar, & Person Views**: View duties in a clean date-list format, an interactive month calendar, or a pivoted person-centric grid.
- **Inline Constraint Explainer**: Manual schedule overrides are proactively validated against active rules. If an administrator assigns a shift that breaks constraints (e.g. insufficient rest periods or off requests), an exact explanation is proactively displayed.
- **Manual Overrides & Drag-and-Drop**: Easily correct schedules manually. Instead of rigid dropdown menus, you can natively **drag and drop** a doctor's name from one slot to another in the calendar to effortlessly execute 2-way shift swaps.
- **Undo / History Stack**: Safely navigate manual corrections. The app tracks a 20-step deep memory stack allowing you to press `Ctrl+Z` to seamlessly revert accidental cell edits and resets.
- **Targeted DOM Updates & Real-Time Sync**: The core rendering engine is optimized so that manual cell updates do not repaint the surrounding grid. The global Stats Dashboard and Individual Duty Summary table update automatically and immediately in real time, keeping the interface responsive and metrics instantly accurate.
- **Real-Time Recalculation**: Schedule configurations (e.g., month, year, doctors per day, constraints) immediately trigger the smart solver to re-calculate the ideal schedule without needing manual confirmations. Recalculation automatically fires when both custom range dates are filled or changed.
- **Save/Load Configuration**: Export all application settings, quotas, constraints, and **manual cell overrides** into a `.json` backup file, and instantly import them later to restore your precise environment without re-typing.
- **Excel Export**: Quick copy or `.xlsx` download support (via SheetJS).
- **Clipping-Free Sidebar Dropdowns**: Removed container overflow boundaries on the Off Requests list, allowing dropdown menus to render cleanly on top of other sidebar panels rather than clipping.
- **Localization & Theme**: Supports dynamic switching between Thai (TH) and English (EN) languages, along with a sleek system-synced Dark Mode. Automatically detects browser/system language and system dark mode preferences on initial load, while strictly preserving manual user overrides via `localStorage`.

### 4. Installable PWA & Offline Support
- **Offline Capability**: Features a service worker (`sw.js`) and a web app manifest (`manifest.json`) caching all layout resources, stylesheets, custom fonts, and third-party libraries (Tailwind CSS, SheetJS, Lucide Icons) for complete offline reliability in hospital wards with spotty Wi-Fi.
- **Installable App**: Fully compliant standard web app configurations allow installing the scheduler directly onto mobile and desktop home screens.

---

## 🚀 Quick Start

```bash
git clone https://github.com/PleumA/PleumA.github.io
cd PleumA.github.io
npm install          # install all dependencies
npm run build        # compile Tailwind CSS → dist/output.css
npm test             # run all 20 test suites (all should pass ✅)
npx serve .          # serve locally at http://localhost:3000
```

For a full contributor setup guide, see [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md).

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

| File | Purpose |
|------|---------|
| `index.html` | Single-page app shell — layout, Tailwind classes, modals, PWA manifest link, service worker registration |
| `app.js` | Scheduling state, Monte Carlo solver, UI handlers, focus-trap utility (~4 300 lines) |
| `structuredInputs.js` | Dynamic structured components — chips, dropdowns, steppers |
| `translations.js` | Dual-language (Thai / English) translation dictionaries |
| `sw.js` | Service worker — caches key assets for offline use |
| `manifest.json` | PWA manifest — install config, theme colour |
| `src/input.css` | Tailwind CSS entry point (`@tailwind` directives) |
| `dist/output.css` | **Generated** — compiled & minified Tailwind CSS (run `npm run build`) |
| `tailwind.config.js` | Tailwind config: `darkMode: 'class'`, extended colours |
| `postcss.config.js` | PostCSS pipeline: tailwindcss + autoprefixer |
| `jest.config.js` | Jest config: 80% coverage threshold |
| `babel.config.cjs` | Babel preset for Jest transforms |
| `.eslintrc.cjs` | ESLint rules (eslint:recommended + prettier) |
| `.prettierrc` | Prettier formatting config |
| `.github/workflows/ci.yml` | GitHub Actions CI: lint → test → build |
| `sitemap.xml` | Single-page sitemap for SEO |
| `robots.txt` | Crawler permission file |
| `tests/*.test.js` | **20 unit test suites** covering solver logic, UI DOM, quota enforcement, XSS, shift-based mode, accessibility, and more. Run with `npm test`. |
| `run-tests.js` | Built-in test runner — no Jest required |
| `DESIGN_SYSTEM.md` | Reusable component classes and colour tokens |
| `DEVELOPER_GUIDE.md` | Full contributor setup, build, lint, test, and release guide |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CHANGELOG.md` | Version history (Keep a Changelog format) |
| `logic_report.md` | Deep-dive technical reference on the Monte Carlo solver |
