import { normalizeTask } from "./taskModel.js";

const STORAGE_KEY = "citrus.tasks.v1";

const demoTasks = [
  {
    id: "demo-1",
    title: "Define the project data model",
    description: "Agree which details each task needs before connecting persistence.",
    status: "done",
    type: "feature",
    priority: "high",
    owner: "You",
    milestone: "M4 · Data model",
    dueDate: "",
    tags: ["architecture", "planning"],
    usefulPrompt: "Design a task model for a vibe-coding tracker that records useful prompts and their results.",
    result: "Task shape agreed: status, type, priority, milestone, due date, prompt, result and tags.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "demo-2",
    title: "Build the Kanban board",
    description: "Create a calm, accessible board with clear task status controls.",
    status: "in_progress",
    type: "feature",
    priority: "high",
    owner: "You",
    milestone: "M5 · Board view",
    dueDate: "",
    tags: ["ui", "kanban"],
    usefulPrompt: "Build a responsive Kanban board using the Citrus design tokens. Do not add drag and drop.",
    result: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "demo-3",
    title: "Review due-date behaviour",
    description: "Check that safe, warning, overdue and completed states are clear.",
    status: "review",
    type: "research",
    priority: "medium",
    owner: "",
    milestone: "M8 · Due-date tint",
    dueDate: "",
    tags: ["accessibility"],
    usefulPrompt: "",
    result: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "demo-4",
    title: "Connect task storage to an API",
    description: "Replace the browser-only store after the backend and database are chosen.",
    status: "backlog",
    type: "feature",
    priority: "medium",
    owner: "",
    milestone: "Backend integration",
    dueDate: "",
    tags: ["backend", "database"],
    usefulPrompt: "",
    result: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(normalizeTask) : [];
    }
  } catch (error) {
    console.error("Could not load Citrus tasks:", error);
  }
  return demoTasks.map(normalizeTask);
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save Citrus tasks:", error);
  }
}
