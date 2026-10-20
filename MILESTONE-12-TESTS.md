# Milestone 12 — Project Pulse acceptance checks

## Project Pulse
- [ ] Project Pulse appears above the project summary and uses the Citrus palette and existing typography.
- [ ] The panel shows counts for overdue, due within 48 hours, waiting for Review, missing useful context, missing next action, and missing deliverable links.
- [ ] A task due yesterday appears under Overdue, but not under Due in the next 48 hours.
- [ ] A task due today or tomorrow appears under Due in the next 48 hours.
- [ ] Tasks in Done do not appear as overdue/due-soon or as missing context/next action.
- [ ] A task in Review appears under Waiting for review.
- [ ] The default empty context template alone is treated as missing useful context; actual notes, a useful prompt, or result/notes count as context.
- [ ] Clicking a task alert opens that task's editor.
- [ ] Clicking a missing deliverable opens/focuses its corresponding URL field.
- [ ] Filling a missing field updates the relevant count after the save completes; refreshing preserves the saved data.
- [ ] With no outstanding items, each category shows its empty-state message and the panel says All clear.
- [ ] Panel remains readable and keyboard-operable at desktop, tablet, and mobile widths.

## Next action field and persistence
- [ ] Add a task with a Next action, save, refresh, and confirm it remains present.
- [ ] Edit an existing task, add/change its Next action, save, refresh, and confirm it remains present.
- [ ] Existing database tasks and deliverable links remain intact after the automatic `nextAction` schema migration.
- [ ] Copy Context includes the saved Next action when present.
- [ ] Search matches text in Next action.

## Regression checks
- [ ] Add/edit/delete tasks still work.
- [ ] Drag-and-drop still changes status and persists it.
- [ ] Context, selected AI tool, useful prompt, and result/notes still persist.
- [ ] Deliverable URLs remain saved across reloads and server restarts.
