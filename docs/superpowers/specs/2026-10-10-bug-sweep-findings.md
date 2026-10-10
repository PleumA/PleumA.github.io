# Bug Sweep: Findings (spec)

**Date:** 2026-10-10
**Source:** a whole-project review by three parallel reviewers. Each finding below was reproduced, by a script or an exact code trace. The controller re-ran or code-checked all six Critical findings.
**Goal:** fix every finding in four waves, in this order, each with a failing test written first.
**Branch:** `fix/bug-sweep`, cut from `feat/workbench-layout` HEAD.
**Repro scripts** (scratch, not in the repo; port the relevant ones into real tests):
`/tmp/claude-1000/-mnt-Data-program-doctor-scheduler/6fd8789a-1d8d-469a-9f2d-4ee8f45a933d/scratchpad/review-solver/` (`h.js` is the mock-DOM loader; also `t1.js`, `t2.js`, `t3.js`), `review-ui/` (`r1.js`, `r3.js`, `r4.js`, `r5.js`, `r6.js`) and `review-misc/` (`si.js`, `ics.js`, `i18n.js`, `html.js`).

Line numbers are approximate as of `c7e95ea`. Find code by its content, not by line number.

## Wave 1: Security and data hygiene

**C2. HTML/script injection.** Doctor names, notes and imported data reach `innerHTML` unescaped.
- **app.js:**
  - The note text built by `updateDayNote` (for example "⚠️ <name> requested Off", conflict notes, role-mismatch notes and the locked badge) is split on `/` and inserted raw, along with a `title="${text}"` attribute, in `renderTableView`, `updateTargetedCellDOM` and `renderCalendarView`.
  - Override names that aren't in `doctors` are shown raw (`displayDoc = d`) in the table and calendar views.
  - `renderOffRequests` inserts `value="${req.date}"` and `${selectedNames.join(', ')}` raw.
- **structuredInputs.js:** it never calls `esc()`.
  - Role rows, slot rows, role-quota rows and single-pool quota rows are affected. The single-pool rows also use an inline `onclick="updateSinglePoolQuota('${doc}', …)"`, which a quote in the name breaks.
  - Conflict `<option>`s and the chip `<span>${item}</span>` are affected too.
- **Trigger:** a doctor named `<img src=x onerror=alert(1)>`. Alternatively, an imported JSON with `"manualOverrides":{"2":{"0":"<svg onload=alert(2)>"}}`, or with `offData[0].date = "\"><img src=x onerror=alert(3)>"`.
- **Expected:** the text renders as text, and no element is created. Inline handlers receive an index, not a name string.
- **Repro:** `review-ui/r1.js` and `review-misc/si.js`.

**C5. A malformed JSON import wedges the app.** `importConfigJSON` only checks that `doctors`, `offData` and `extraSlotsData` are arrays. It assigns the globals before validating, and nothing rolls back.
- **Trigger:** any of these:
  - `{"doctors":["X","Y","Z"],"manualOverrides":{"1":null}}`
  - `{"offData":[null]}`
  - `{"offData":[{"id":1,"date":"1"}]}` (no `names`)
  - `{"doctors":[1,2,3]}`
- **Expected:** a bad file is rejected with a clear error toast and the previous state is kept untouched. Valid parts are coerced to the right types: strings for names, plain objects of string values for overrides, and the `{id, date, names}` shape for offData.
- **Repro:** `review-ui/r3.js`.

**M-names. Doctor-name hygiene.** Apply the same rules in `addDoctor`, the comma/Enter keydown path, the doctors textarea sync and the import path:
- Reject or strip the characters `:` `;` `,` and newlines. They break the `name:role` and `A:B` parsing.
- Trim whitespace.
- Remove duplicates. Import currently accepts `["X","X","Y"]`.

## Wave 2: Scheduling correctness

**C3. A removed doctor is still scheduled as the locked special doctor.** `removeDoctor` never updates `#inputSpecialDocs`, and `parseUIConfig` never filters special docs against `doctors`.
- **Expected:** `parseUIConfig` filters `specialDocs` to doctors that still exist, and `removeDoctor` also strips the name from `#inputSpecialDocs` and re-renders that checkbox list.
- **Repro:** `review-solver/t1.js` test 2.

**C4. The special-doctor pick skips the hard rules.** In `generateSingleScheduleCandidate`, `availableSpecial` checks only the off request. It does not check conflicts against `chosenToday`, the off-duty rest window, consecutive-holiday duty or the day before an off day.
- **Trigger:** role mode with conflicts `A:D, B:D`, D special on every day, R1:1 and R2:1. D shares a day with A or B on 31 of 31 days.
- **Expected:** a special pick must obey the same hard rules as a normal pick. If no special doctor is eligible that day, fall back the way the cascade does for a normal slot.
- **Repro:** `t1.js` tests 3 and 3b.

**C6. An empty shift-slot input crashes.** `parseInt(x) ?? 1` gives NaN, because `??` only catches null and undefined. `expandSlots` then throws "Invalid array length".
- **Expected:** an empty or invalid value falls back to the default of 1, clamped to 0–10.
- **Repro:** `t1.js` test 1.

**I3. Off-day notes only work for single-number off requests.** `updateDayNote` uses `parseInt(req.date)` instead of `config.offMap`, so ranges ("2-4"), lists ("10,12") and custom-mode dates get no "requested Off" note, or get it on the wrong day.
- **Expected:** use `config.offMap`, with DD/MM/YYYY keys in custom mode.
- **Repro:** `t1.js` test 4.

**I4. `explainSlotFailure` reads `config.isCustomDateRange`, which `parseUIConfig`'s `configObj` never sets.** As a result, custom-mode off warnings never fire.
- **Expected:** include `isCustomDateRange` in the config object.
- **Repro:** `t1.js` test 5.

**I5. The role-quota feasibility check divides the quota by the number of doctors in the role.** Everywhere else, a role quota means a per-doctor quota.
- **Expected:** `checkQuotaFeasibility` treats the role quota per doctor, so impossible quotas are flagged.
- **Repro:** `review-solver/t2.js`.

**I8. An unbounded off-request range loop.** A range like `1-50000000`, or a custom span of decades, only shows a toast and then loops over every value until it runs out of memory.
- **Expected:** clamp the loop to the schedule length, or skip the entry after warning about it.
- **Repro:** `t2.js`.

**M-year. Year validation.** A year of "26" or "0" is treated as 1926 or 1900, and an empty year gives zero days with no message.
- **Expected:** reject years below 1000 after the Buddhist-era conversion, with a toast.
- **Repro:** `t2.js`.

**M-utc. UTC date parsing.** `new Date("YYYY-MM-DD")` parses as UTC midnight, and the code then reads the date in local time. This appears in the custom-range `scheduleDates`, in `handleCustomDateRangeChange` and in the chip date picker in `structuredInputs.js`. In time zones west of UTC the dates shift one day earlier.
- **Expected:** parse by splitting the string and using `new Date(y, m - 1, d)`.
- **Repro:** `review-solver/t3.js`, run with `TZ=America/New_York`.

## Wave 3: Editing and state

**C1. Undo doesn't revert the schedule.** `undoLastAction` restores `manualOverrides` and re-applies the remaining overrides, but never resets slots from `globalResult.originalSchedule`. An undone edit stays in the table.
- **Expected:** after undo, the table, the summary and the fairness row match the state before the edit, and the auto-assigned doctor comes back.
- **Repro:** `review-ui/r4.js`.

**I1. Overrides and undo history survive a change of period.** They persist across month, year and custom-range changes and across imports, because overrides are keyed only by day index and slot.
- **Expected:** keep a period key alongside the overrides (month+year, or start+end). Clear `manualOverrides` and the undo stack when the period changes or a config is imported. A config import may bring its own overrides, and those apply.
- **Repro:** `r4.js` (Feb line).

**I2. A regenerate request is dropped while a calculation runs.** `generateSchedule` returns early when `isCalculating` is set, so a change made mid-calculation is lost. `scheduleDates` is also built before the `await`, while the month and year are read after it.
- **Expected:** a request made during a calculation is queued and runs once the current one finishes, with the latest inputs. Read all inputs once, at the start of a run.
- **Repro:** `review-ui/r6.js`.

**I6. Language toggle in custom-range mode shows wrong weekdays.** `updateDayNamesLanguage` rebuilds `dayName` from the month input plus the row index instead of from `scheduleDates`. `dayDisplay` also keeps the old BE/AD year.
- **Expected:** use `scheduleDates[row.day - 1]` when a custom range is active, and rebuild `dayDisplay` too.
- **Repro:** `review-ui/r5.js`.

**I7. Backspace in the empty doctor input removes a doctor without cleanup.** It calls `doctors.pop()` directly, which skips the override, offData and special-docs cleanup.
- **Expected:** route it through `removeDoctor(doctors.length - 1)`.

**M-ux. Smaller editing issues.**
- Ctrl+Z is hijacked even while typing in an input, textarea or contenteditable. It should skip those.
- `isDragAndDropOperation` is not reset in a `finally`.
- Clipboard calls (`copyScheduleForExcel`, `copySummary`) don't check that `navigator.clipboard` exists. Show an error toast when it's missing.
- `showToast` timers stack, so an old timeout hides a newer toast. Clear the previous timer.
- `copySummary` and `exportToExcel` labels and the file name ignore the custom range. Use the range when one is active.

## Wave 4: Deploy and test hygiene, plus remaining cleanup

**I9. The service worker never updates.** `sw.js` is cache-first with a hard-coded cache name and has no update path.
- **Expected:** same-origin requests use network-first, falling back to the cache when offline.
- Add `self.skipWaiting()` and `clients.claim()`.
- Pin `lucide` to an exact version in both `index.html` and `sw.js`, instead of `@latest`.
- Cache CDN entries individually, so one failed request doesn't abort the install.
- The fetch handler gets a `.catch` that returns the cached `./index.html` for navigations.

**I10. Tests can falsely pass.**
- `tests/quotaSinglePool.test.js`'s `.catch` prints without failing. Set `process.exitCode = 1`.
- `run-tests.js` should also treat `UNHANDLED` as a failure.
- `tests/manualOverrides.test.js` swallows the error from `updateDoctorAssignment` (commented "known bug offMap.has is not a function"). Fix the underlying error, or the mock, and remove the empty catch.

**Pre-existing test noise.** Nine suites print caught `TypeError: sel.options is not iterable` errors, and `quotaUnified` prints `classList.contains is not a function`, because their mock DOM is missing those members. Add the missing members to the mocks. No suite may print a `TypeError` or `ReferenceError`.

**Remaining minors:**
- Calendar export: revoke the Blob URL after about 60 seconds, not 1. If `window.open` returns `null` (pop-up blocked), show a toast with the Google import link.
- The conflict editor loses half-filled rows. Re-render from the DOM rows, not from the hidden input.
- Remove the dead `btnConfirmChanges` references, or restore the button.
- `DESIGN_SYSTEM.md` still documents labels as `uppercase tracking-wide`. Update it.
- `tests/workbenchLayout.test.js`'s phone-card test should also assert `min-width: 60%`, which is what actually makes the layout work.
- The phone header uses `position: static !important`. Change the header's `sticky` class to `md:sticky` and drop the `!important` rule.
- Four English-only `aria-label`s on the header buttons (dark mode, language, manual, generate) need translating. Add an `data-i18n-aria` mechanism next to `data-i18n-title`.

## Constraints (all waves)

- No new npm dependencies. No ES modules.
- Only real Tailwind classes. `tests/tailwindClasses.test.js` must pass.
- Every user-visible string goes in both `translations.th` and `translations.en`. `tests/translationsCopy.test.js` must pass.
- Keep existing element ids and `onclick` handlers.
- After every task, `npm run lint` shows 0 errors and `npm test` passes. If any class changed, run `npm run build` and commit `dist/output.css`.
- Write each fix's test first and watch it fail.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
