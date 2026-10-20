import express from "express";
import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "citrus.sqlite"));
db.pragma("journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS tasks (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'backlog', type TEXT NOT NULL DEFAULT 'feature',
 priority TEXT NOT NULL DEFAULT 'medium', owner TEXT NOT NULL DEFAULT '',
 milestone TEXT NOT NULL DEFAULT '', dueDate TEXT NOT NULL DEFAULT '',
 tags TEXT NOT NULL DEFAULT '[]', usefulPrompt TEXT NOT NULL DEFAULT '',
 result TEXT NOT NULL DEFAULT '', createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
)`);
const VALID_STATUSES = new Set(["backlog", "in_progress", "review", "done"]);
const VALID_TYPES = new Set(["feature", "bug", "research", "prompt"]);
const VALID_PRIORITIES = new Set(["low", "medium", "high", "urgent"]);
const fromRow = row => ({ ...row, tags: JSON.parse(row.tags || "[]") });
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
  id: existing.id || input.id || randomUUID(), title: title.slice(0,140),
  description: String(input.description ?? existing.description ?? "").trim(), status, type, priority,
  owner: String(input.owner ?? existing.owner ?? "").trim().slice(0,80),
  milestone: String(input.milestone ?? existing.milestone ?? "").trim().slice(0,100),
  dueDate: String(input.dueDate ?? existing.dueDate ?? ""),
  tags: Array.isArray(rawTags) ? rawTags.map(String).map(x=>x.trim()).filter(Boolean) : [],
  usefulPrompt: String(input.usefulPrompt ?? existing.usefulPrompt ?? "").trim(),
  result: String(input.result ?? existing.result ?? "").trim(),
  createdAt: existing.createdAt || input.createdAt || now, updatedAt: now
 };
}
const insert = db.prepare(`INSERT INTO tasks (id,title,description,status,type,priority,owner,milestone,dueDate,tags,usefulPrompt,result,createdAt,updatedAt) VALUES (@id,@title,@description,@status,@type,@priority,@owner,@milestone,@dueDate,@tags,@usefulPrompt,@result,@createdAt,@updatedAt)`);
const update = db.prepare(`UPDATE tasks SET title=@title,description=@description,status=@status,type=@type,priority=@priority,owner=@owner,milestone=@milestone,dueDate=@dueDate,tags=@tags,usefulPrompt=@usefulPrompt,result=@result,updatedAt=@updatedAt WHERE id=@id`);
const encode = task => ({...task,tags:JSON.stringify(task.tags)});
const demos = [
 {id:"demo-1",title:"Define the project data model",description:"Agree which details each task needs before connecting persistence.",status:"done",type:"feature",priority:"high",owner:"You",milestone:"M4 · Data model",tags:["architecture","planning"],usefulPrompt:"Design a task model for a vibe-coding tracker that records useful prompts and their results.",result:"Task shape agreed: status, type, priority, milestone, due date, prompt, result and tags."},
 {id:"demo-2",title:"Build the Kanban board",description:"Create a calm, accessible board with clear task status controls.",status:"in_progress",type:"feature",priority:"high",owner:"You",milestone:"M5 · Board view",tags:["ui","kanban"],usefulPrompt:"Build a responsive Kanban board using the Citrus design tokens. Do not add drag and drop.",result:""},
 {id:"demo-3",title:"Review due-date behaviour",description:"Check that safe, warning, overdue and completed states are clear.",status:"review",type:"research",priority:"medium",owner:"",milestone:"M8 · Due-date tint",tags:["accessibility"],usefulPrompt:"",result:""},
 {id:"demo-4",title:"Connect task storage to an API",description:"Replace browser-only storage with a backend and database.",status:"backlog",type:"feature",priority:"medium",owner:"",milestone:"Backend integration",tags:["backend","database"],usefulPrompt:"",result:""}
];
if (db.prepare("SELECT COUNT(*) count FROM tasks").get().count === 0) {
 const seed = db.transaction(() => demos.forEach(d => { const t=normalize(d); insert.run(encode(t)); })); seed();
}
const app=express(); app.use(express.json({limit:"1mb"}));
app.get("/api/health",(_req,res)=>res.json({status:"ok",database:"sqlite"}));
app.get("/api/tasks",(_req,res)=>res.json(db.prepare("SELECT * FROM tasks ORDER BY createdAt DESC").all().map(fromRow)));
app.post("/api/tasks",(req,res)=>{try{const t=normalize(req.body||{});insert.run(encode(t));res.status(201).json(t);}catch(e){res.status(400).json({error:e.message||"Could not create task."});}});
app.put("/api/tasks/:id",(req,res)=>{const row=db.prepare("SELECT * FROM tasks WHERE id=?").get(req.params.id);if(!row)return res.status(404).json({error:"Task not found."});try{const t=normalize(req.body||{},fromRow(row));update.run(encode(t));res.json(t);}catch(e){res.status(400).json({error:e.message||"Could not update task."});}});
app.delete("/api/tasks/:id",(req,res)=>{const r=db.prepare("DELETE FROM tasks WHERE id=?").run(req.params.id);if(!r.changes)return res.status(404).json({error:"Task not found."});res.status(204).end();});
const port=Number(process.env.API_PORT||3001);app.listen(port,()=>console.log(`Citrus API running at http://localhost:${port}\nSQLite database: ${path.join(dataDir,"citrus.sqlite")}`));
