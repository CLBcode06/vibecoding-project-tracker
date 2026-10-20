# Citrus — Milestone 9: Task Context

React + Vite frontend backed by an Express API and a persistent SQLite database.

## Run locally

Install Node.js LTS, then run from this folder:

```bash
npm install
npm run dev
```

The `dev` command starts both services:
- Frontend: http://localhost:5173
- API: http://localhost:3001
- Health check: http://localhost:3001/api/health

The backend creates `data/citrus.sqlite` automatically and inserts four mock tasks only when the database is empty. Tasks live in SQLite, not browser localStorage, so changes survive refreshes and browser restarts. Keep the SQLite file to retain your tasks.

## Included

- Add button opens a modal with title, description, status, type, priority, due date, owner/assignee, milestone, tags, task context, AI tool, useful prompt and result/notes.
- The Context section stores Markdown-friendly handoff notes and the optional AI tool (Claude, ChatGPT, Cursor, Lovable, Replit or Other) in SQLite. New tasks start with a Background / Constraints / Tried so far / Pick up from here template.
- Editing task context updates `contextUpdatedAt`; the modal displays a relative last-updated hint. Context and AI tool survive reloads and reopening a task.
- Copy prompt context includes the saved task context and selected AI tool, ready to paste into an AI assistant.
- Clicking anywhere on a card opens the same modal pre-filled for editing. Enter/Space works when the card itself is focused.
- Delete confirmation and persistent deletion.
- Status can be changed from the dropdown or by dragging a task card into another status column. Drag-and-drop status changes are persisted through the API to SQLite.
- Express CRUD API with basic field validation.

If the page reports that it cannot connect to the API, run `npm run dev` from the project root and keep that terminal open. The API is for local single-user development; authentication and multi-user access are not implemented yet.


## Milestone 10 — Copy Context

Task cards and the task modal provide a **Copy Context** button. It copies a clean Markdown briefing containing the task title, description, and full saved/current Context field, with the selected AI tool included when set. See `MILESTONE-10-TESTS.md` for acceptance checks.


## Milestone 11 — Markdown context preview and drag-and-drop

- Each task card includes **View Context**, which opens a rendered Markdown preview of the task briefing (title, description, full context, and selected AI tool).
- The preview supports headings, paragraphs, lists, inline bold/italic/code, and fenced code blocks, and includes a **Copy Context** action.
- Drag cards between Backlog, In Progress, Review and Done. The destination column highlights while dragging, and the new status is saved through the existing API/SQLite path. The status dropdown remains available as an alternative.
- See `MILESTONE-11-TESTS.md` for the manual acceptance checklist.

## Phase 3 — Deliverable Anchor Board

The Deliverable Anchor banner stays above the Kanban board and contains URL fields for Presentation, Demo, Report, and Documentation. Each field saves to the Express API and SQLite database when it loses focus (press Enter to save immediately). A hollow dot and “Empty” label indicate no URL; a teal filled dot and “Linked” indicate a URL is present. Saved URLs load again after a page refresh and are not cleared when the API restarts. Only `http://` and `https://` URLs are accepted.

Run the manual checks in `MILESTONE-11-DELIVERABLES-TESTS.md` before tagging this milestone.
