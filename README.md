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
- Status dropdown in the modal; no drag-and-drop. Status changes on cards are persisted too.
- Express CRUD API with basic field validation.

If the page reports that it cannot connect to the API, run `npm run dev` from the project root and keep that terminal open. The API is for local single-user development; authentication and multi-user access are not implemented yet.
