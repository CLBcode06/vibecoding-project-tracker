# Milestone 13 — Vercel API + PostgreSQL acceptance checks

## Deployment setup
- [ ] A Neon PostgreSQL database is connected to the Vercel project.
- [ ] `DATABASE_URL` is configured for each required Vercel environment and contains the Neon connection string.
- [ ] The Vercel deployment completes successfully with the Vite output directory set to `dist`.

## API smoke checks
- [ ] `GET /api/health` returns `200` and JSON containing `"database":"postgresql"`.
- [ ] `GET /api/tasks` returns a JSON array.
- [ ] `GET /api/deliverables` returns the four deliverable records.
- [ ] Creating, editing, and deleting a task updates the hosted database.
- [ ] Saving each deliverable link survives a refresh and a new deployment.
- [ ] After a redeploy, tasks and links remain present.

## SQLite migration (if needed)
- [ ] Back up the local `data/citrus.sqlite` file.
- [ ] Set `DATABASE_URL` locally without committing it.
- [ ] Run `npm run migrate:sqlite` before editing production data.
- [ ] Confirm task and deliverable counts in the app match the local SQLite source.

## Important
The production API no longer reads or writes `data/citrus.sqlite`. That file is used only by the one-time migration script. The app still does not implement authentication; do not treat the deployment as private or multi-user secure.
