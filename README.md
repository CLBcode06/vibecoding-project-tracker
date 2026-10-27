# Citrus — Milestone 9: Task Context

React + Vite frontend backed by an Express API and PostgreSQL (Neon) for persistent hosting. SQLite remains supported as a read-only source for the one-time data migration.

## Run locally

Install Node.js 20 or newer, create a Neon PostgreSQL database, set `DATABASE_URL` in your local `.env` file, then run from this folder:

```bash
npm install
npm run dev
```

The `dev` command starts both services:
- Frontend: http://localhost:5173
- API: http://localhost:3001
- Health check: http://localhost:3001/api/health

The API uses the PostgreSQL database named by `DATABASE_URL`. On first start it creates the required tables and inserts four example tasks only if the task table is empty. The database is shared between deployments and survives serverless restarts.

## Included

- Add button opens a modal with title, description, status, type, priority, due date, owner/assignee, milestone, tags, task context, AI tool, useful prompt and result/notes.
- The Context section stores Markdown-friendly handoff notes and the optional AI tool (Claude, ChatGPT, Cursor, Lovable, Replit or Other) in SQLite. New tasks start with a Background / Constraints / Tried so far / Pick up from here template.
- Editing task context updates `contextUpdatedAt`; the modal displays a relative last-updated hint. Context and AI tool survive reloads and reopening a task.
- Copy prompt context includes the saved task context and selected AI tool, ready to paste into an AI assistant.
- Clicking anywhere on a card opens the same modal pre-filled for editing. Enter/Space works when the card itself is focused.
- Delete confirmation and persistent deletion.
- Status can be changed from the dropdown or by dragging a task card into another status column. Drag-and-drop status changes are persisted through the API to SQLite.
- Express CRUD API with basic field validation.

If the page reports that it cannot connect to the API locally, make sure `DATABASE_URL` is set and run `npm run dev` from the project root. Authentication and multi-user access are not implemented yet.


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


## Milestone 12 — Project Pulse (`secret-sauce`)

Project Pulse appears between the Deliverable Anchor and project summary. It surfaces overdue tasks, tasks due in the next 48 hours, tasks waiting in Review, active tasks without useful context, active tasks without a recorded next action, and missing Presentation / Demo / Report / Documentation links. Each task item opens its task editor; each missing deliverable item scrolls to and focuses its URL field. Counts update from the current task and deliverable data without an AI service.

Tasks now include a persistent **Next action** field. Existing SQLite databases are migrated automatically with an empty `nextAction` column, without deleting existing task data. The next action is included in copied Markdown context. See `MILESTONE-12-TESTS.md` for manual acceptance checks.


## Milestone 13 — Vercel API + PostgreSQL

The app now has a Vercel catch-all function at `api/[...path].js`, which forwards `/api/*` requests to the Express API. The API stores tasks and deliverable URLs in Neon PostgreSQL through `@neondatabase/serverless`; it no longer depends on a writable SQLite file at runtime. `vercel.json` sets the Vite build and `dist` output directory.

### Set up the hosted database

1. In the Vercel dashboard, open this project and choose **Storage** / **Marketplace Integrations**. Add **Neon Postgres** and create a database (the free tier may be available; check the provider's current terms).
2. In the Vercel project's **Settings → Environment Variables**, ensure the connection string is available as `DATABASE_URL` for Production, Preview, and Development as appropriate. Use the pooled connection string supplied by Neon. Do not commit the real value to Git.
3. Redeploy the project after setting the environment variable. The first API request creates the tables automatically.
4. Verify `https://YOUR-DEPLOYMENT.vercel.app/api/health`, `/api/tasks`, and `/api/deliverables`. Health should report `database: "postgresql"`; task and deliverable endpoints should return JSON rather than Vercel 404 pages.

### Import existing local SQLite data

Back up `data/citrus.sqlite` before migration. After installing dependencies, copy `.env.example` to `.env` and put your Neon connection string in `DATABASE_URL`. Set `$env:CITRUS_SQLITE_PATH` in PowerShell to your existing SQLite file if it is outside this project, then run `npm run migrate:sqlite`. The script reads the SQLite file read-only and upserts tasks and deliverable links into PostgreSQL. By default it reads `data/citrus.sqlite`. Run this before using the new hosted database for new edits, because matching task IDs are updated from the SQLite source.

Example local `.env` (never commit the actual secret):

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

The first install regenerates `package-lock.json` for the new PostgreSQL driver. Run `npm install` before committing the change.
