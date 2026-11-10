# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A zero-backend static portfolio site deployed to GitHub Pages. No bundler, no dependencies, no `package.json` — `index.html`, `styles.css`, and `app.js` are served as-is. Project cards are data-driven from `data/projects.json`, which is regenerated from GitHub repository topics.

## Commands

```bash
# Serve locally (fetch() of data/projects.json fails under file://)
python3 -m http.server 8000

# Regenerate data/projects.json from GitHub topics (Node 18+ for global fetch)
node scripts/fetch-github-projects.js
```

There is no test suite or linter in the repo. Verification is manual: load the page, confirm filters render and cards show the expected projects.

## Data flow

```
GitHub repo topics → scripts/fetch-github-projects.js → data/projects.json → app.js → #projects-grid
```

- A repo appears only if it has the `portfolio` topic and is not a fork (`scripts/fetch-github-projects.js`).
- `featured` topic sorts a project first; otherwise sorted by `updated_at` descending.
- Category is derived from topics in `getCategory()` — first match wins in this priority order: **Medical AI** (`medical-ai`, `machine-learning`, `deep-learning`, `computer-vision`, `nlp`) → **Research** (`research`, `clinical-research`) → **Software** (`software`, `web-development`) → **Data Science** (`data-science`, `data-analysis`) → **Other**.
- Project APIs used: unauthenticated GitHub REST `users/:user/repos?per_page=100`, so max 100 repos and 60 requests/hour per IP.

**`data/projects.json` is generated — do not hand-edit it.** To change what appears, change the GitHub repo's topics and re-run the script (the deploy workflow does this automatically).

## Frontend conventions

- `app.js` renders everything by string interpolation into `innerHTML`; every dynamic value passes through `escapeHTML()`. Preserve that for any new fields (descriptions/topics come from GitHub and are untrusted input).
- Filter buttons are rebuilt on each click (`renderFilters()` re-renders and re-binds) — the active category lives in the module-level `activeCategory` variable.
- The `#projects-grid` on load shows a fallback "Projects could not be loaded" message if the fetch fails.
- Sections in `index.html` are hand-written static content (hero, research, about, stack, contact) and are not data-driven.

## CI/CD

- **Deploy** (`.github/workflows/deploy.yml`) triggers on pushes to `main` (the default branch). It regenerates `data/projects.json`, uploads the repo root as the Pages artifact, and deploys. No build step.
- That is the only workflow — there is no lint, test, or build job.
