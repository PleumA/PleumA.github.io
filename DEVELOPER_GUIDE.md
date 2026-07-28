# Developer Guide

Quick-start guide for working on **ระบบจัดตารางเวรอัตโนมัติ** (Automatic Duty Schedule Generator).

---

## Prerequisites

| Tool | Minimum Version | Install |
|------|-----------------|---------|
| Node.js | 20 | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| npm | 10 | bundled with Node |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## Setup

```bash
git clone <repo-url>
cd Web
npm install        # installs runtime + all devDependencies
```

---

## Development Workflow

### 1. Serve locally

```bash
npx serve .
# → http://localhost:3000
```

Open `index.html` directly in a browser as a zero-config alternative.

### 2. Edit & watch Tailwind

```bash
npm run build:watch
# Watches src/input.css → rebuilds dist/output.css on every save
```

To use the locally-built CSS instead of the CDN, replace the CDN `<script>` tag in `index.html`:

```html
<!-- Remove: -->
<script async src="https://cdn.tailwindcss.com"></script>

<!-- Add: -->
<link href="./dist/output.css" rel="stylesheet">
```

### 3. Run tests

```bash
npm test           # fast built-in runner — runs all tests/**.test.js
npm run test:jest  # Jest runner (same files, with coverage)
```

### 4. Lint & format

```bash
npm run lint       # ESLint — check for errors
npm run lint:fix   # ESLint — auto-fix safe issues
npm run format     # Prettier — reformat all files
```

### 5. Build for production

```bash
npm run build      # generates dist/output.css (minified)
```

---

## Project Structure

```
Web/
├── index.html          # Single-page app entry point
├── app.js              # Core scheduler logic & UI handlers (~4 000 lines)
├── structuredInputs.js # Structured input components (tag chips, steppers, …)
├── translations.js     # i18n dictionaries (Thai / English)
├── sw.js               # Service Worker (PWA offline support)
├── manifest.json       # PWA manifest
│
├── src/
│   └── input.css       # Tailwind CSS entry point (@tailwind directives)
├── dist/
│   └── output.css      # ⬅ Generated — do not edit manually
│
├── tests/              # 20 unit test files
│
├── tailwind.config.js  # Tailwind config (darkMode: class, custom colours)
├── postcss.config.js   # PostCSS config (tailwindcss + autoprefixer)
├── jest.config.js      # Jest config (80 % coverage threshold)
├── babel.config.cjs    # Babel config (for Jest transform)
├── .eslintrc.cjs       # ESLint config
├── .prettierrc         # Prettier config
│
├── .github/
│   └── workflows/
│       └── ci.yml      # GitHub Actions: lint → test → build
│
├── DESIGN_SYSTEM.md    # Component classes & design tokens
├── CHANGELOG.md        # Keep-a-Changelog format
├── CONTRIBUTING.md     # Contribution guidelines
└── ROADMAP.md          # AI-executable feature roadmap
```

---

## Key Architectural Rules

1. **Serverless** — All logic runs client-side. No backend, no database.
2. **i18n** — Every UI string uses `data-i18n` attributes and a key in `translations.js`. Never hardcode Thai or English text in HTML.
3. **Sanitisation** — Always pass user inputs through `esc()` before inserting into the DOM.
4. **Date handling** — Use the `scheduleDates` array, not raw day numbers. Output via `formatShortDate()` → `DD/MM/YYYY`.
5. **Dark mode** — Implemented via Tailwind's `darkMode: 'class'`; toggled by `toggleDarkMode()`.
6. **Accessibility** — All icon-only buttons need `aria-label`; all decorative icons get `aria-hidden="true"`.

---

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on every push and PR:

1. `npm ci` — clean install
2. `npm run lint` — ESLint check (fails on error)
3. `npm test` — full test suite (fails on any failing test)
4. `npm run build` — Tailwind CSS build (fails if config is broken)

---

## Releasing

```bash
git tag -a v1.7.0 -m "chore: SEO, Tailwind refactor, accessibility, CI"
git push origin v1.7.0
```

Update `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) before tagging.
