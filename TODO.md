# UX/UI Updates

## ✅ Completed
- **Drag-and-Drop Swap**: Replaced the cumbersome double-click requirement. Manual edits can now be performed seamlessly by dragging and dropping doctors between calendar cells, reducing click-fatigue significantly.
- **Mobile-First Calendar**: The month grid now gracefully collapses into a vertical daily scroll layout on narrow screens (`< 768px`), ensuring doctors can actually read their schedules on their smartphones without zooming out.
- **Undo / History Stack**: Added a 20-step undo memory. Users can now simply press `Ctrl+Z` (or `Cmd+Z`) to revert accidental manual swaps or cell resets, preventing schedule corruption.

## ⏳ To-Do (Pending Implementation)
- **Person-Centric View**: Add a toggle to pivot the table from a date-centric grid (columns = days) to a person-centric grid (rows = doctors, columns = highlighted shift days). *Requires writing a new `renderPersonCentricView` function and a dedicated tab button.*
- **Inline Constraint Explainer**: When a manual override causes a conflict (or when the solver leaves a shortage), the warning toast or cell badge should be clickable to reveal exactly *why* it failed (e.g., "Dr. A worked yesterday" or "Dr. B is R2 but this slot requires R1"). *Requires running the specific `generateSingleScheduleCandidate` filter rules individually against a manual swap and capturing the rejection reason.*
