# 🩺 On-Call Scheduler: Beginner-Friendly Guide & Logic Report

Welcome! This guide is written so that **anyone—even a beginner programmer—can easily clone, run, understand, and modify** this Automatic On-Call & Night Shift Doctor Scheduler.

---

## 🚀 Quick Start: How to Clone & Run Locally

This application is built as a **Static Single Page Web App (SPA)**. This means it runs entirely in the web browser. There is **no database** to set up, **no backend server** to run, and **no complex installation** steps!

### Step 1: Clone the Project
Open your terminal (Zsh, Bash, or command prompt) and run:
```bash
git clone git@github.com:PleumA/PleumA.github.io.git
cd PleumA.github.io
```

### Step 2: Run the Web App
Because it's a static site, you have two options to open it:

*   **Option A (Easiest)**: Just double-click the `index.html` file in your file explorer to open it directly in Google Chrome, Safari, or Firefox.
*   **Option B (Recommended for developers)**: Run a simple local server to prevent browser security blocks (CORS) with local files. If you have Node.js installed, run:
    ```bash
    npx serve .
    ```
    Or, if you use VS Code, install the **Live Server** extension and click **"Go Live"**.

---

## 📦 Simple Project Structure

The entire application consists of only 3 main files:

```text
├── index.html       # The structure & visual design (uses Tailwind CSS for styling)
├── app.js           # The "brain" (handles calculations, translation, and user clicks)
└── README.md        # Documentation for the project
```

---

## 🧠 How the Scheduling Logic Works (The Simple Version)

Imagine you want to assign night shifts to 10 doctors for 30 days. You have strict rules (e.g., "Doctor A cannot work two days in a row" and "Doctor B has requested October 5th off"). 

Writing code that calculates this perfectly on the first try is very hard. Instead, our scheduler uses a technique called **Monte Carlo simulation**. Here is how it behaves:

1.  **The Guessing Game**: The computer makes a random guess for Day 1, then Day 2, and so on, building a full 30-day schedule candidate.
2.  **The Scoring Phase**: Once a 30-day candidate is made, the computer grades it:
    *   It gives **penalty points** for things we don't want (like a doctor working twice in a row, or a doctor getting 12 shifts while another gets only 2).
3.  **Repeat 300 Times**: The computer does this 300 times in less than a second!
4.  **Pick the Best**: It selects the candidate schedule with the **lowest penalty points** and displays it to you.

---

## ⚙️ Essential Functions in `app.js`

Here is a simplified dictionary of the most important JavaScript functions:

### 1. `generateSchedule()` (The Conductor)
This function triggers when you click the "Generate" button or change settings. It runs the 300-iteration loop, scores the candidates, sets the best one as the winner, and calls functions to refresh the visual grids.

### 2. `generateSingleScheduleCandidate(config)` (The Attempt Builder)
This function tries to build one schedule candidate. It loops from Day 1 to the end of the month. On each day, it looks at the available doctors and applies the **Must-Fill Cascade**:
*   **Level 1 (Strict)**: Only choose doctors who obey every rule (no consecutive shifts, not on their off-days, no conflicts).
*   **Level 2 to 4 (Relaxing Rules)**: If no doctors fit Level 1, the program gradually ignores less important guidelines (like rest day gaps) so the schedule doesn't end up blank.
*   **Level 5 (Last Resort)**: If still stuck, it ignores almost all soft rules. It only respects **hard rules** (a doctor's exact quota limit, role mapping, and the exact day off requested).

### 3. `updateDoctorAssignment(day, slotIndex, doctorIndex)` (The Override Handler)
When you click a cell on the calendar/table and choose a new doctor manually:
*   It updates the `manualOverrides` state object.
*   It immediately updates that specific box on your screen (instant DOM update).
*   When the solver recalculates, it reads your manual changes and locks them in so they aren't overwritten by the computer.

### 4. `exportConfigJSON()` & `importConfigJSON()` (Save & Load)
*   **Export**: Gathers all your inputs, checkboxes, list of doctors, off-requests, and your **manual cell overrides** and downloads them as a file named `schedule_config.json`.
*   **Import**: Reads that JSON file, fills in all UI settings, restores your manual adjustments, and automatically triggers the calculator so you don't lose your work.

---

## 🎨 Third-Party Tools Used

To keep the project lightweight, we load these tools directly from secure web links (CDNs) inside `index.html`:

1.  **Tailwind CSS**: Used to design the interface (colors, grid columns, dark mode, buttons) without writing a separate CSS file.
2.  **Lucide Icons**: Renders clean, modern icons (like trash cans, gears, calendar grids).
3.  **SheetJS (XLSX)**: Converts your schedule array into a real Excel file format and triggers the download.
