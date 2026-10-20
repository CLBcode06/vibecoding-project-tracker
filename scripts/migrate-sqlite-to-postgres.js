import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDatabase, getSql } from "../server/app.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const sqlitePath = process.env.CITRUS_SQLITE_PATH
  ? path.resolve(process.env.CITRUS_SQLITE_PATH)
  : path.join(projectDir, "data", "citrus.sqlite");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Set it to your Neon PostgreSQL connection string first.");
  process.exit(1);
}

let sqlite;
try {
  sqlite = new Database(sqlitePath, { readonly: true, fileMustExist: true });
} catch (error) {
  console.error(`Could not open SQLite database at ${sqlitePath}: ${error.message}`);
  console.error("Copy your existing data/citrus.sqlite into this project or set CITRUS_SQLITE_PATH to its full path.");
  process.exit(1);
}

const hasTable = name => Boolean(sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(name));
const columns = hasTable("tasks") ? new Set(sqlite.pragma("table_info(tasks)").map(column => column.name)) : new Set();
const sql = getSql();

try {
  // Create tables without demo records so the local SQLite contents remain authoritative.
  await ensureDatabase({ seed: false });

  let tasksImported = 0;
  if (hasTable("tasks")) {
    const rows = sqlite.prepare("SELECT * FROM tasks").all();
    for (const row of rows) {
      let tags = row.tags ?? "[]";
      if (typeof tags === "string") {
        try { tags = JSON.parse(tags); } catch { tags = []; }
      }
      if (!Array.isArray(tags)) tags = [];
      const now = new Date().toISOString();
      const task = {
        id: String(row.id),
        title: String(row.title ?? "Untitled task"),
        description: String(row.description ?? ""),
        status: String(row.status ?? "backlog"),
        type: String(row.type ?? "feature"),
        priority: String(row.priority ?? "medium"),
        owner: String(row.owner ?? ""),
        milestone: String(row.milestone ?? ""),
        dueDate: String(row.dueDate ?? ""),
        tags,
        usefulPrompt: String(row.usefulPrompt ?? ""),
        result: String(row.result ?? ""),
        context: columns.has("context") ? String(row.context ?? "") : "",
        nextAction: columns.has("nextAction") ? String(row.nextAction ?? "") : "",
        contextTool: columns.has("contextTool") ? String(row.contextTool ?? "") : "",
        contextUpdatedAt: columns.has("contextUpdatedAt") ? String(row.contextUpdatedAt ?? "") : "",
        createdAt: String(row.createdAt ?? now),
        updatedAt: String(row.updatedAt ?? now)
      };
      await sql`INSERT INTO tasks (
        id, title, description, status, type, priority, owner, milestone, "dueDate", tags,
        "usefulPrompt", result, context, "nextAction", "contextTool", "contextUpdatedAt", "createdAt", "updatedAt"
      ) VALUES (
        ${task.id}, ${task.title}, ${task.description}, ${task.status}, ${task.type}, ${task.priority},
        ${task.owner}, ${task.milestone}, ${task.dueDate}, ${JSON.stringify(task.tags)}::jsonb,
        ${task.usefulPrompt}, ${task.result}, ${task.context}, ${task.nextAction}, ${task.contextTool},
        ${task.contextUpdatedAt}, ${task.createdAt}, ${task.updatedAt}
      ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status,
        type = EXCLUDED.type, priority = EXCLUDED.priority, owner = EXCLUDED.owner,
        milestone = EXCLUDED.milestone, "dueDate" = EXCLUDED."dueDate", tags = EXCLUDED.tags,
        "usefulPrompt" = EXCLUDED."usefulPrompt", result = EXCLUDED.result, context = EXCLUDED.context,
        "nextAction" = EXCLUDED."nextAction", "contextTool" = EXCLUDED."contextTool",
        "contextUpdatedAt" = EXCLUDED."contextUpdatedAt", "createdAt" = EXCLUDED."createdAt", "updatedAt" = EXCLUDED."updatedAt"`;
      tasksImported += 1;
    }
  }

  let deliverablesImported = 0;
  if (hasTable("project_deliverables")) {
    const rows = sqlite.prepare("SELECT key, url, updatedAt FROM project_deliverables").all();
    for (const row of rows) {
      await sql`INSERT INTO project_deliverables (key, url, "updatedAt")
        VALUES (${String(row.key)}, ${String(row.url ?? "")}, ${String(row.updatedAt ?? new Date().toISOString())})
        ON CONFLICT (key) DO UPDATE SET url = EXCLUDED.url, "updatedAt" = EXCLUDED."updatedAt"`;
      deliverablesImported += 1;
    }
  }

  console.log(`SQLite migration complete. Imported ${tasksImported} task(s) and ${deliverablesImported} deliverable link(s).`);
  console.log("The local SQLite file was opened read-only and was not modified.");
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  sqlite.close();
}
