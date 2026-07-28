# Contributing to the Doctor Scheduler Project

Thank you for your interest in improving the Automatic On-Call & Night Shift Doctor Scheduler! 

As this project is currently maintained by two core contributors—**Arnun Polsuksiri (PleumA)** and **Antigravity** (an AI coding assistant)—we welcome contributions that keep the app performant, secure, and user-friendly.

## 🛠️ Tech Stack & Architecture

The application is built entirely on the client side:
- **Structure:** HTML5 (`index.html`)
- **Styling:** Tailwind CSS — local build (`dist/output.css`) via PostCSS pipeline; CDN fallback during development
- **Logic:** Vanilla JavaScript (`app.js`, `structuredInputs.js`, `translations.js`)
- **Excel Exports:** SheetJS (`xlsx.full.min.js` via CDN)
- **Icons:** Lucide Icons (via CDN)

For a detailed walkthrough of the Monte Carlo simulation logic and constraints, please review [How the algorithm works (Technical Logic Report)](logic_report.md) before making core changes.

## 🚀 How to Run Locally & Run Tests

### Prerequisites
- **Node.js ≥ 20** and **npm ≥ 10**. Install via [nvm](https://github.com/nvm-sh/nvm) or from [nodejs.org](https://nodejs.org).

### Setup
```bash
# 1. Clone the repository
git clone <repo-url> && cd Web

# 2. Install all dependencies (runtime + dev)
npm install
```

### Running locally
```bash
# Serve with a lightweight local server
npx serve .

# Or open index.html directly in any modern browser
```

### Building Tailwind CSS
The production CSS is compiled from `src/input.css` → `dist/output.css`:
```bash
npm run build        # one-shot minified build
npm run build:watch  # watch mode for development
```
After building, swap the CDN `<script>` tag in `index.html` for the local CSS link:
```html
<link href="./dist/output.css" rel="stylesheet">
```

### Linting & Formatting
```bash
npm run lint      # ESLint check
npm run lint:fix  # ESLint auto-fix
npm run format    # Prettier format all files
```

### Running Tests
The project has two test runners:
```bash
npm test          # Node.js built-in runner (run-tests.js) – fast, no config
npm run test:jest # Jest runner (requires npm install to complete)
```


## 📝 Guidelines

### Code Quality & Standards
- Keep the application serverless. All logic should run locally on the client thread.
- Avoid introducing heavy npm packages or build configurations unless absolutely necessary.
- Follow modern JavaScript best practices (clean async loops, $O(1)$ lookups with `Set`, defensive cloning of state).
- **Internationalization (i18n)**: All new UI elements must support dual-language toggling via `data-i18n` attributes. Do not hardcode Thai or English text into the HTML structure. Always add translation keys to the `translations` map in `translations.js`.
- **Date Handling**: Respect the `isCustomDateRange` global state. Avoid assuming a rigid 1-to-31 day iteration loop; instead, resolve real calendar `Date` objects using the `scheduleDates` array if custom mode is active, and always output dates in `DD/MM/YYYY` format using `formatShortDate`. Ensure that day labels in views reset at month boundaries when spanning across multiple calendar months.

### UX/UI & Mobile First
- Make sure all controls work perfectly on mobile screens (viewport width $< 768\text{px}$). Use the bottom sheet overlay (`#mobileDoctorSheet`) instead of standard dropdown menus.
- Ensure all interactive elements have touch targets of at least $48\text{px}$.

### Security
- Always pass user-inputted strings (like doctor names and role tags) through the `esc()` sanitizer when dynamically building DOM content.
- Use index-based event handling instead of passing raw string arguments through inline HTML attributes.

## 📬 Submitting Changes

1. Fork the repo and create your branch from `main`.
2. Implement your changes, ensuring code is documented and clean.
3. Test your changes locally on both desktop and mobile layouts.
4. Submit a Pull Request describing your changes clearly.
