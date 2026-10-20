# Citrus — Kanban board starter

A React + Vite + Tailwind CSS starter for the Citrus vibe-coding project tracker.

## Included
- A four-column task board (Backlog, In Progress, Review, Done)
- A task model for prompts, AI results, milestones, ownership, tags, type, priority and due dates
- Add/edit task modal
- Status changes through dropdowns (no drag-and-drop, per `DESIGN.md`)
- Copy a task's prompt context to the clipboard
- Delete confirmation
- Local browser persistence as a temporary development adapter

## Run
```bash
npm install
npm run dev
```

## Install
Copy these files into the root of your existing Vite + React project. If it already has a `package.json`, merge the dependencies/scripts rather than replacing unrelated configuration.

## Backend/database note
The board currently uses `localStorage` behind `src/data/taskStore.js` so the UI works before a backend is chosen. The task model is kept separate from the UI, making it straightforward to replace the store with API calls later. Do not treat localStorage as the final multi-user persistence layer.
