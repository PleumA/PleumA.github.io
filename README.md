# Arnun Polsuksiri — Physician × Computer Science × AI

Personal portfolio of **Arnun Polsuksiri**, an MD graduate transitioning toward Computer Science, Artificial Intelligence, and technical healthcare research.

🌐 **Portfolio:** https://pleuma.github.io/
💻 **GitHub:** https://github.com/PleumA
🔗 **LinkedIn:** https://www.linkedin.com/in/arnun-polsuksiri/

## About

I am a physician with a growing focus on **Computer Science, Artificial Intelligence, and healthcare technology**.

My goal is to build intelligent systems that connect real-world healthcare problems with:

* Computer Science
* Artificial Intelligence
* Machine Learning
* Data Science
* Medical Imaging
* Healthcare Data
* Clinical Research

I am particularly interested in developing strong technical foundations in algorithms, software engineering, statistics, machine learning, and AI systems.

## Portfolio Architecture

This repository contains the source code for my personal portfolio.

Projects are automatically discovered from my public GitHub repositories using repository topics.

```text
GitHub repositories
        ↓
Repository topics
        ↓
GitHub Actions
        ↓
fetch-github-projects.js
        ↓
data/projects.json
        ↓
Portfolio
```

A repository can be added to the portfolio by adding the `portfolio` topic.

Use the `featured` topic to highlight a project.

## Project Categories

Projects can be categorized through GitHub topics:

* `medical-ai` → Medical AI
* `machine-learning` → Medical AI
* `deep-learning` → Medical AI
* `computer-vision` → Medical AI
* `nlp` → Medical AI
* `research` → Research
* `clinical-research` → Research
* `software` → Software
* `web-development` → Software
* `data-science` → Data Science
* `data-analysis` → Data Science

## Featured Project

### Doctor Scheduler

An automatic, zero-backend, client-side on-call and night-shift scheduler for hospital doctors and medical staff, featuring Monte Carlo simulation and constraint management.

* Repository: https://github.com/PleumA/doctor-scheduler
* Live application: https://pleuma.github.io/doctor-scheduler/

## Technology

The portfolio currently uses:

* HTML
* CSS
* JavaScript
* GitHub Actions
* GitHub Pages
* GitHub REST API

No backend server is required for the portfolio.

## Development

Run the portfolio locally:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Generate the latest GitHub project data:

```bash
node scripts/fetch-github-projects.js
```

The generated project data is stored in:

```text
data/projects.json
```

## Deployment

Deployment is handled through **GitHub Actions**.

The workflow:

```text
.github/workflows/deploy.yml
```

generates the project data and deploys the portfolio to GitHub Pages.

## License

This portfolio is personal work by Arnun Polsuksiri.
