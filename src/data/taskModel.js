/**
 * Canonical Citrus task model.
 *
 * Keep this plain data separate from React so the same shape can be validated
 * and stored by a future backend/API.
 */

export const TASK_STATUSES = [
  { value: "backlog", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

export const TASK_TYPES = [
  { value: "feature", label: "Feature" },
  { value: "bug", label: "Bug" },
  { value: "research", label: "Research" },
  { value: "prompt", label: "Prompt" },
];

export const TASK_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function createTask(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    status: "backlog",
    type: "feature",
    priority: "medium",
    owner: "",
    milestone: "",
    dueDate: "",
    tags: [],
    usefulPrompt: "",
    result: "",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function normalizeTask(task) {
  const now = new Date().toISOString();
  return {
    ...createTask(),
    ...task,
    id: task?.id || crypto.randomUUID(),
    tags: Array.isArray(task?.tags) ? task.tags : [],
    createdAt: task?.createdAt || now,
    updatedAt: task?.updatedAt || now,
  };
}

export function getDueState(task, now = new Date()) {
  if (task.status === "done") return "neutral";
  if (!task.dueDate) return "none";

  // Interpret date-only values as local end-of-day to avoid treating a task as
  // overdue at midnight on its due date.
  const due = new Date(`${task.dueDate}T23:59:59`);
  const diffMs = due.getTime() - now.getTime();

  if (diffMs < 0) return "overdue";
  if (diffMs < 24 * 60 * 60 * 1000) return "warning";
  if (diffMs > 2 * 24 * 60 * 60 * 1000) return "safe";
  return "none";
}

export function formatDueDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function buildPromptContext(task) {
  return [
    `Project task: ${task.title}`,
    task.description ? `Description: ${task.description}` : "",
    task.milestone ? `Milestone: ${task.milestone}` : "",
    task.usefulPrompt ? `Useful prompt:\n${task.usefulPrompt}` : "",
    task.result ? `Recorded result:\n${task.result}` : "",
    task.tags?.length ? `Tags: ${task.tags.join(", ")}` : "",
  ].filter(Boolean).join("\n\n");
}
