# Milestone 11 — Markdown context preview and drag-and-drop

## Context preview
- [ ] Each task card has a **View Context** button.
- [ ] Clicking it opens a Markdown-rendered preview containing the task title, description, full context, and selected AI tool when present.
- [ ] Headings, paragraphs, bullet/numbered lists, inline bold/italic/code, and fenced code blocks render readably.
- [ ] The preview's **Copy Context** button copies the Markdown briefing to the clipboard.
- [ ] Closing the preview returns to the board without changing task data.

## Drag and drop
- [ ] Drag a card from Backlog to In Progress; it moves to that column.
- [ ] Drop a card into Review and Done; each status change persists to SQLite.
- [ ] Column highlights while a card is dragged over it.
- [ ] Card status dropdown continues to work as an accessible alternative.
- [ ] Reload the page and confirm moved tasks remain in their destination columns.
- [ ] Dropping a task in its existing column does not create an error.

## Run
1. `npm install`
2. `npm run dev`
3. Complete the checks above.
4. After verification, commit and push the `markdown-context-drag-drop` tag if that is the agreed tag name.
