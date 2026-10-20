import express from "express";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";

const DELIVERABLE_KEYS = ["presentation", "demo", "report", "documentation"];
const VALID_STATUSES = new Set(["backlog", "in_progress", "review", "done"]);
const VALID_TYPES = new Set(["feature", "bug", "research", "prompt"]);
const VALID_PRIORITIES = new Set(["low", "medium", "high", "urgent"]);

let sqlClient;
let schemaPromise;

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured. Add your Neon PostgreSQL connection string to the environment variables.");
  }
  if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL);
  return sqlClient;
}

export async function ensureDatabase({ seed = true } = {}) {
  const sql = getSql();
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'backlog',
        type TEXT NOT NULL DEFAULT 'feature',
        priority TEXT NOT NULL DEFAULT 'medium',
        owner TEXT NOT NULL DEFAULT '',
        milestone TEXT NOT NULL DEFAULT '',
        "dueDate" TEXT NOT NULL DEFAULT '',
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        "usefulPrompt" TEXT NOT NULL DEFAULT '',
        result TEXT NOT NULL DEFAULT '',
        context TEXT NOT NULL DEFAULT '',
        "nextAction" TEXT NOT NULL DEFAULT '',
        "contextTool" TEXT NOT NULL DEFAULT '',
        "contextUpdatedAt" TEXT NOT NULL DEFAULT '',
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL
      )`;
      await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS context TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "contextTool" TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "nextAction" TEXT NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "contextUpdatedAt" TEXT NOT NULL DEFAULT ''`;
      await sql`CREATE TABLE IF NOT EXISTS project_deliverables (
        key TEXT PRIMARY KEY,
        url TEXT NOT NULL DEFAULT '',
        "updatedAt" TEXT NOT NULL
      )`;
      for (const key of DELIVERABLE_KEYS) {
        await sql`INSERT INTO project_deliverables (key, url, "updatedAt") VALUES (${key}, '', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
      }
      const counts = await sql`SELECT COUNT(*)::int AS count FROM tasks`;
      if (seed && Number(counts[0]?.count ?? 0) === 0) {
        const now = new Date().toISOString();
        const demos = [
          { id: "demo-1", title: "Define the project data model", description: "Agree which details each task needs before connecting persistence.", status: "done", type: "feature", priority: "high", owner: "You", milestone: "M4 · Data model", dueDate: "", tags: ["architecture", "planning"], usefulPrompt: "Design a task model for a vibe-coding tracker that records useful prompts and their results.", result: "Task shape agreed: status, type, priority, milestone, due date, prompt, result and tags.", context: "", nextAction: "", contextTool: "", contextUpdatedAt: "", createdAt: now, updatedAt: now },
          { id: "demo-2", title: "Build the Kanban board", description: "Create a calm, accessible board with clear task status controls.", status: "in_progress", type: "feature", priority: "high", owner: "You", milestone: "M5 · Board view", dueDate: "", tags: ["ui", "kanban"], usefulPrompt: "Build a responsive Kanban board using the Citrus design tokens. Do not add drag and drop.", result: "", context: "", nextAction: "", contextTool: "", contextUpdatedAt: "", createdAt: now, updatedAt: now },
          { id: "demo-3", title: "Review due-date behaviour", description: "Check that safe, warning, overdue and completed states are clear.", status: "review", type: "research", priority: "medium", owner: "", milestone: "M8 · Due-date tint", dueDate: "", tags: ["accessibility"], usefulPrompt: "", result: "", context: "", nextAction: "", contextTool: "", contextUpdatedAt: "", createdAt: now, updatedAt: now },
          { id: "demo-4", title: "Connect task storage to an API", description: "Replace browser-only storage with a backend and database.", status: "backlog", type: "feature", priority: "medium", owner: "", milestone: "Backend integration", dueDate: "", tags: ["backend", "database"], usefulPrompt: "", result: "", context: "", nextAction: "", contextTool: "", contextUpdatedAt: "", createdAt: now, updatedAt: now }
        ];
        for (const task of demos) {
          // Ignore an ID inserted by another cold start while the first request seeds the database.
          await sql`INSERT INTO tasks (
            id, title, description, status, type, priority, owner, milestone, "dueDate", tags,
            "usefulPrompt", result, context, "nextAction", "contextTool", "contextUpdatedAt", "createdAt", "updatedAt"
          ) VALUES (
            ${task.id}, ${task.title}, ${task.description}, ${task.status}, ${task.type}, ${task.priority},
            ${task.owner}, ${task.milestone}, ${task.dueDate}, ${JSON.stringify(task.tags)}::jsonb,
            ${task.usefulPrompt}, ${task.result}, ${task.context}, ${task.nextAction}, ${task.contextTool},
            ${task.contextUpdatedAt}, ${task.createdAt}, ${task.updatedAt}
          ) ON CONFLICT (id) DO NOTHING`;
        }
      }
    })().catch(error => {
      schemaPromise = undefined;
      throw error;
    });
  }
  await schemaPromise;
}

function fromRow(row) {
  let tags = row.tags ?? [];
  if (typeof tags === "string") {
    try { tags = JSON.parse(tags); } catch { tags = []; }
  }
  return { ...row, tags: Array.isArray(tags) ? tags : [] };
}

function normalize(input, existing = {}) {
  const title = String(input.title ?? existing.title ?? "").trim();
  if (!title) throw new Error("A task title is required.");
  const status = input.status ?? existing.status ?? "backlog";
  const type = input.type ?? existing.type ?? "feature";
  const priority = input.priority ?? existing.priority ?? "medium";
  if (!VALID_STATUSES.has(status)) throw new Error("Invalid task status.");
  if (!VALID_TYPES.has(type)) throw new Error("Invalid task type.");
  if (!VALID_PRIORITIES.has(priority)) throw new Error("Invalid task priority.");
  const now = new Date().toISOString();
  const rawTags = input.tags ?? existing.tags ?? [];
  return {
    id: existing.id || input.id || randomUUID(),
    title: title.slice(0, 140),
    description: String(input.description ?? existing.description ?? "").trim(),
    status,
    type,
    priority,
    owner: String(input.owner ?? existing.owner ?? "").trim().slice(0, 80),
    milestone: String(input.milestone ?? existing.milestone ?? "").trim().slice(0, 100),
    dueDate: String(input.dueDate ?? existing.dueDate ?? ""),
    tags: Array.isArray(rawTags) ? rawTags.map(String).map(value => value.trim()).filter(Boolean) : [],
    usefulPrompt: String(input.usefulPrompt ?? existing.usefulPrompt ?? "").trim(),
    result: String(input.result ?? existing.result ?? "").trim(),
    context: String(input.context ?? existing.context ?? ""),
    nextAction: String(input.nextAction ?? existing.nextAction ?? "").trim().slice(0, 1000),
    contextTool: String(input.contextTool ?? existing.contextTool ?? "").trim().slice(0, 40),
    contextUpdatedAt: String(input.contextUpdatedAt ?? existing.contextUpdatedAt ?? ""),
    createdAt: existing.createdAt || input.createdAt || now,
    updatedAt: now
  };
}

async function insertTask(sql, task) {
  const row = await sql`INSERT INTO tasks (
    id, title, description, status, type, priority, owner, milestone, "dueDate", tags,
    "usefulPrompt", result, context, "nextAction", "contextTool", "contextUpdatedAt", "createdAt", "updatedAt"
  ) VALUES (
    ${task.id}, ${task.title}, ${task.description}, ${task.status}, ${task.type}, ${task.priority},
    ${task.owner}, ${task.milestone}, ${task.dueDate}, ${JSON.stringify(task.tags)}::jsonb,
    ${task.usefulPrompt}, ${task.result}, ${task.context}, ${task.nextAction}, ${task.contextTool},
    ${task.contextUpdatedAt}, ${task.createdAt}, ${task.updatedAt}
  ) RETURNING *`;
  return fromRow(row[0]);
}

async function updateTask(sql, task) {
  const rows = await sql`UPDATE tasks SET
    title = ${task.title}, description = ${task.description}, status = ${task.status}, type = ${task.type},
    priority = ${task.priority}, owner = ${task.owner}, milestone = ${task.milestone}, "dueDate" = ${task.dueDate},
    tags = ${JSON.stringify(task.tags)}::jsonb, "usefulPrompt" = ${task.usefulPrompt}, result = ${task.result},
    context = ${task.context}, "nextAction" = ${task.nextAction}, "contextTool" = ${task.contextTool},
    "contextUpdatedAt" = ${task.contextUpdatedAt}, "updatedAt" = ${task.updatedAt}
    WHERE id = ${task.id} RETURNING *`;
  return rows[0] ? fromRow(rows[0]) : null;
}

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(async (_req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    console.error("Citrus database initialisation failed:", error.message);
    res.status(503).json({ error: process.env.DATABASE_URL ? "Citrus could not connect to its database. Check the DATABASE_URL setting and database status." : "Citrus database is not configured yet. Add DATABASE_URL in Vercel project environment variables." });
  }
});

app.get("/api/health", async (_req, res) => {
  try {
    const result = await getSql()`SELECT NOW() AS server_time`;
    res.json({ status: "ok", database: "postgresql", serverTime: result[0]?.server_time });
  } catch (error) {
    console.error("Citrus health check failed:", error.message);
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.get("/api/deliverables", async (_req, res) => {
  try {
    const rows = await getSql()`SELECT key, url, "updatedAt" FROM project_deliverables ORDER BY CASE key WHEN 'presentation' THEN 1 WHEN 'demo' THEN 2 WHEN 'report' THEN 3 ELSE 4 END`;
    res.json(rows);
  } catch (error) {
    console.error("Could not load deliverables:", error.message);
    res.status(500).json({ error: "Could not load project deliverables." });
  }
});

app.put("/api/deliverables/:key", async (req, res) => {
  const key = String(req.params.key || "");
  if (!DELIVERABLE_KEYS.includes(key)) return res.status(404).json({ error: "Unknown deliverable." });
  const url = String(req.body?.url ?? "").trim();
  if (url && !/^https?:\/\//i.test(url)) return res.status(400).json({ error: "Enter a URL starting with http:// or https://." });
  const deliverable = { key, url: url.slice(0, 2048), updatedAt: new Date().toISOString() };
  try {
    const rows = await getSql()`INSERT INTO project_deliverables (key, url, "updatedAt") VALUES (${deliverable.key}, ${deliverable.url}, ${deliverable.updatedAt}) ON CONFLICT (key) DO UPDATE SET url = EXCLUDED.url, "updatedAt" = EXCLUDED."updatedAt" RETURNING key, url, "updatedAt"`;
    res.json(rows[0]);
  } catch (error) {
    console.error("Could not save deliverable:", error.message);
    res.status(500).json({ error: "Could not save project deliverable." });
  }
});

app.get("/api/tasks", async (_req, res) => {
  try {
    const rows = await getSql()`SELECT * FROM tasks ORDER BY "createdAt" DESC`;
    res.json(rows.map(fromRow));
  } catch (error) {
    console.error("Could not load tasks:", error.message);
    res.status(500).json({ error: "Could not load tasks." });
  }
});

app.post("/api/tasks", async (req, res) => {
  let task;
  try { task = normalize(req.body || {}); }
  catch (error) { return res.status(400).json({ error: error.message || "Could not create task." }); }
  try {
    res.status(201).json(await insertTask(getSql(), task));
  } catch (error) {
    console.error("Could not create task:", error.message);
    res.status(500).json({ error: "Could not create task." });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const sql = getSql();
    const found = await sql`SELECT * FROM tasks WHERE id = ${req.params.id} LIMIT 1`;
    if (!found[0]) return res.status(404).json({ error: "Task not found." });
    let task;
    try { task = normalize(req.body || {}, fromRow(found[0])); }
    catch (error) { return res.status(400).json({ error: error.message || "Could not update task." }); }
    const updated = await updateTask(sql, task);
    if (!updated) return res.status(404).json({ error: "Task not found." });
    res.json(updated);
  } catch (error) {
    console.error("Could not update task:", error.message);
    res.status(500).json({ error: "Could not update task." });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const rows = await getSql()`DELETE FROM tasks WHERE id = ${req.params.id} RETURNING id`;
    if (!rows.length) return res.status(404).json({ error: "Task not found." });
    res.status(204).end();
  } catch (error) {
    console.error("Could not delete task:", error.message);
    res.status(500).json({ error: "Could not delete task." });
  }
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled Citrus API error:", error.message);
  res.status(500).json({ error: "An unexpected API error occurred." });
});

export default app;
