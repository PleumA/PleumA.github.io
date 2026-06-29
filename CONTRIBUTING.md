# Contributing to the Doctor Scheduler Project

Thank you for your interest in improving the Automatic On-Call & Night Shift Doctor Scheduler! 

As this project is currently maintained by two core contributors—**Arnun Polsuksiri (PleumA)** and **Antigravity** (an AI coding assistant)—we welcome contributions that keep the app performant, secure, and user-friendly.

## 🛠️ Tech Stack & Architecture

The application is built entirely on the client side with a minimal, zero-build tech stack:
- **Structure:** HTML5 (`index.html`)
- **Styling:** Tailwind CSS (loaded via CDN)
- **Logic:** Vanilla JavaScript (`app.js`)
- **Excel Exports:** SheetJS (`xlsx.full.min.js` via CDN)
- **Icons:** Lucide Icons (via CDN)

For a detailed walkthrough of the Monte Carlo simulation logic and constraints, please review [How the algorithm works (Technical Logic Report)](logic_report.md) before making core changes.

## 🚀 How to Run Locally & Run Tests

Since there are no build steps, you can run the project instantly:
1. Clone the repository.
2. Open `index.html` directly in any modern browser.
3. Alternatively, serve it using a lightweight local server:
   ```bash
   npx serve .
   ```

### Running Tests
The project features a local Node.js unit testing suite targeting the core solver algorithm. You can run the tests using Node:
```bash
node tests/solver.test.js
```

## 📝 Guidelines

### Code Quality & Standards
- Keep the application serverless. All logic should run locally on the client thread.
- Avoid introducing heavy npm packages or build configurations unless absolutely necessary.
- Follow modern JavaScript best practices (clean async loops, $O(1)$ lookups with `Set`, defensive cloning of state).

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
