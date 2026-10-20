import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, ArrowUpRight, CalendarDays, Check, ChevronDown, CircleHelp,
  Clipboard, Clock3, Code2, Copy, Flag, Layers3, Plus, Search, Sparkles,
  Tag, Trash2, X
} from "lucide-react";
import {
  buildPromptContext, createTask, formatDueDate, getDueState,
  TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES
} from "./data/taskModel.js";
import { loadTasks, saveTasks } from "./data/taskStore.js";

const EMPTY_FORM = {
  title: "", description: "", status: "backlog", type: "feature",
  priority: "medium", owner: "", milestone: "", dueDate: "",
  tagsText: "", usefulPrompt: "", result: ""
};

const STATUS_HINTS = {
  backlog: "Seems Empty, add a Task?",
  in_progress: "Seems Empty, add a Task?",
  review: "Seems Empty, add a Task?",
  done: "Seems Empty, add a Task?"
};

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function dueClass(state) {
  return {
    safe: "due-safe",
    warning: "due-warning",
    overdue: "due-overdue",
    neutral: "due-neutral",
  }[state] || "due-none";
}

function TypeMark({ type }) {
  const icon = type === "bug" ? <AlertCircle size={13} /> :
    type === "research" ? <CircleHelp size={13} /> :
    type === "prompt" ? <Sparkles size={13} /> : <Code2 size={13} />;
  return (
    <span className={classNames("type-mark", `type-${type}`)}>
      {icon}<span>{TASK_TYPES.find((item) => item.value === type)?.label || "Feature"}</span>
    </span>
  );
}

function TaskCard({ task, onEdit, onStatusChange, onDelete, onCopy }) {
  const dueState = getDueState(task);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <article className="task-card">
      <div className="task-card-top">
        <TypeMark type={task.type} />
        <div className="card-menu-wrap">
          <button className="icon-button card-menu-trigger" aria-label={`Options for ${task.title}`} onClick={() => setShowMenu(!showMenu)}>
            <ChevronDown size={16} />
          </button>
          {showMenu && (
            <div className="card-menu">
              <button onClick={() => { onEdit(task); setShowMenu(false); }}>Edit task</button>
              <button onClick={() => { onCopy(task); setShowMenu(false); }}>Copy prompt context</button>
              <button className="danger-menu-item" onClick={() => { onDelete(task); setShowMenu(false); }}>Delete task</button>
            </div>
          )}
        </div>
      </div>

      <button className="task-title-button" onClick={() => onEdit(task)}>{task.title}</button>
      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-meta">
        <span className={classNames("priority-pill", `priority-${task.priority}`)}>
          <span className="priority-dot" />{task.priority}
        </span>
        {task.milestone && <span className="milestone-pill"><Flag size={12} />{task.milestone}</span>}
      </div>

      {task.tags?.length > 0 && (
        <div className="tag-row">
          {task.tags.slice(0, 3).map((tag) => <span className="tag-chip" key={tag}>{tag}</span>)}
          {task.tags.length > 3 && <span className="tag-overflow">+{task.tags.length - 3}</span>}
        </div>
      )}

      {(task.dueDate || task.owner || task.usefulPrompt || task.result) && <div className="task-card-divider" />}

      <div className="task-footer">
        {task.dueDate ? (
          <span className={classNames("due-date", dueClass(dueState))}>
            <CalendarDays size={13} />{formatDueDate(task.dueDate)}
          </span>
        ) : <span className="task-footer-spacer" />}
        {task.owner && <span className="owner-avatar" title={task.owner}>{task.owner.trim().slice(0, 2).toUpperCase()}</span>}
      </div>

      {(task.usefulPrompt || task.result) && (
        <div className="task-notes-indicator">
          {task.usefulPrompt && <span><Sparkles size={12} /> Prompt saved</span>}
          {task.result && <span><Check size={12} /> Result saved</span>}
        </div>
      )}

      <label className="status-select-label">
        <span>Move to</span>
        <select value={task.status} onChange={(event) => onStatusChange(task.id, event.target.value)} aria-label={`Change status for ${task.title}`}>
          {TASK_STATUSES.map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}
        </select>
      </label>
    </article>
  );
}

function TaskModal({ initialTask, onClose, onSave }) {
  const [form, setForm] = useState(() => initialTask ? {
    ...EMPTY_FORM,
    ...initialTask,
    tagsText: (initialTask.tags || []).join(", ")
  } : { ...EMPTY_FORM });
  const [error, setError] = useState("");

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Give this task a short, clear title.");
      return;
    }
    const tags = form.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean);
    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      owner: form.owner.trim(),
      milestone: form.milestone.trim(),
      usefulPrompt: form.usefulPrompt.trim(),
      result: form.result.trim(),
      tags
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <header className="modal-header">
          <div>
            <p className="eyebrow">{initialTask ? "UPDATE YOUR WORK" : "MAKE PROGRESS"}</p>
            <h2 id="task-modal-title">{initialTask ? "Edit task" : "Add Task..."}</h2>
            <p className="modal-subtitle">Keep the goal, useful prompts and results together.</p>
          </div>
          <button className="icon-button close-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button>
        </header>

        <form onSubmit={submit} className="task-form">
          <div className="form-field">
            <label htmlFor="task-title">Task title <span className="required-mark">*</span></label>
            <input id="task-title" autoFocus value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Add sign-in validation" maxLength={140} />
            {error && <span className="field-error">{error}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="task-description">Description</label>
            <textarea id="task-description" rows="2" value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="What needs to happen, and why?" />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="task-status">Status</label>
              <select id="task-status" value={form.status} onChange={(event) => update("status", event.target.value)}>
                {TASK_STATUSES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="task-type">Task type</label>
              <select id="task-type" value={form.type} onChange={(event) => update("type", event.target.value)}>
                {TASK_TYPES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" value={form.priority} onChange={(event) => update("priority", event.target.value)}>
                {TASK_PRIORITIES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="task-due">Due date</label>
              <input id="task-due" type="date" value={form.dueDate || ""} onChange={(event) => update("dueDate", event.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="task-owner">Owner</label>
              <input id="task-owner" value={form.owner || ""} onChange={(event) => update("owner", event.target.value)} placeholder="Name (optional)" maxLength={80} />
            </div>
            <div className="form-field">
              <label htmlFor="task-milestone">Milestone</label>
              <input id="task-milestone" value={form.milestone || ""} onChange={(event) => update("milestone", event.target.value)} placeholder="e.g. M5 · Board view" maxLength={100} />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="task-tags">Tags <span className="label-hint">comma-separated</span></label>
            <input id="task-tags" value={form.tagsText || ""} onChange={(event) => update("tagsText", event.target.value)} placeholder="frontend, auth, research" />
          </div>

          <div className="form-field">
            <label htmlFor="task-prompt">Useful prompt</label>
            <textarea id="task-prompt" rows="4" value={form.usefulPrompt || ""} onChange={(event) => update("usefulPrompt", event.target.value)} placeholder="Save the prompt that produced a useful direction or result..." />
          </div>

          <div className="form-field">
            <label htmlFor="task-result">Result / notes</label>
            <textarea id="task-result" rows="3" value={form.result || ""} onChange={(event) => update("result", event.target.value)} placeholder="What did the prompt produce? What worked, failed or changed?" />
          </div>

          <footer className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary"><Check size={16} />{initialTask ? "Save changes" : "Add task"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function DeleteModal({ task, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
        <div className="confirm-icon"><Trash2 size={21} /></div>
        <h2 id="delete-title">Delete this task?</h2>
        <p>Confirm deletion, it cannot be undone... <strong>{task.title}</strong></p>
        <div className="modal-actions">
          <button className="button button-secondary" onClick={onCancel}>Keep task</button>
          <button className="button button-danger" onClick={onConfirm}>Delete task</button>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [modalTask, setModalTask] = useState(undefined);
  const [deleteTask, setDeleteTask] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [toast, setToast] = useState("");

  useEffect(() => { saveTasks(tasks); }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesType = typeFilter === "all" || task.type === typeFilter;
      const haystack = [task.title, task.description, task.milestone, task.owner, task.usefulPrompt, task.result, ...(task.tags || [])].join(" ").toLowerCase();
      return matchesType && (!query || haystack.includes(query));
    });
  }, [tasks, search, typeFilter]);

  const stats = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter((task) => task.status === "in_progress").length,
    overdue: tasks.filter((task) => getDueState(task) === "overdue").length,
    done: tasks.filter((task) => task.status === "done").length,
  }), [tasks]);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function saveTask(form) {
    const now = new Date().toISOString();
    if (modalTask && modalTask !== "new" && !modalTask._new) {
      setTasks((current) => current.map((task) => task.id === modalTask.id
        ? { ...task, ...form, updatedAt: now }
        : task));
    } else {
      setTasks((current) => [{ ...createTask(), ...form, createdAt: now, updatedAt: now }, ...current]);
    }
    setModalTask(undefined);
    showToast(modalTask && modalTask !== "new" && !modalTask._new ? "Task updated." : "Task added.");
  }

  function updateStatus(id, status) {
    setTasks((current) => current.map((task) => task.id === id
      ? { ...task, status, updatedAt: new Date().toISOString() }
      : task));
  }

  async function copyContext(task) {
    const context = buildPromptContext(task);
    try {
      await navigator.clipboard.writeText(context);
      showToast("Copies to Clipboard");
    } catch {
      showToast("Clipboard access unavailable. Open the task to copy its notes.");
    }
  }

  function confirmDelete() {
    setTasks((current) => current.filter((task) => task.id !== deleteTask.id));
    setDeleteTask(null);
    showToast("Task deleted.");
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <a className="wordmark" href="#" aria-label="Citrus home">Citrus</a>
          <span className="header-divider" />
          <span className="header-section">Project tracker</span>
          <div className="header-spacer" />
          <span className="project-status"><span /> Project workspace</span>
          <button className="button button-primary header-add" onClick={() => setModalTask("new")}><Plus size={17} />Add Task...</button>
        </div>
      </header>

      <main className="main-content">
        <section className="page-heading">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>Project board</h1>
            <p className="page-subtitle">A clear view of what you're building, what you've learned, and what's next.</p>
          </div>
          <button className="button button-primary mobile-add" onClick={() => setModalTask("new")}><Plus size={17} />Add Task...</button>
        </section>

        <section className="summary-grid" aria-label="Project summary">
          <div className="summary-card"><span className="summary-label">All tasks</span><strong>{stats.total}</strong><Layers3 size={18} /></div>
          <div className="summary-card"><span className="summary-label">In progress</span><strong>{stats.active}</strong><Clock3 size={18} /></div>
          <div className="summary-card"><span className="summary-label">Completed</span><strong>{stats.done}</strong><Check size={18} /></div>
          <div className="summary-card"><span className="summary-label">Overdue</span><strong className={stats.overdue ? "overdue-number" : ""}>{stats.overdue}</strong><CalendarDays size={18} /></div>
        </section>

        <section className="board-toolbar" aria-label="Board filters">
          <div className="board-title-group">
            <h2>Tasks <span>{filteredTasks.length}</span></h2>
            <p>Move work forward, one task at a time.</p>
          </div>
          <div className="toolbar-controls">
            <label className="search-field">
              <Search size={16} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks, prompts..." aria-label="Search tasks and prompts" />
              {search && <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search"><X size={14} /></button>}
            </label>
            <label className="filter-select">
              <Tag size={15} />
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by task type">
                <option value="all">All types</option>
                {TASK_TYPES.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="kanban-board" aria-label="Kanban task board">
          {TASK_STATUSES.map((status) => {
            const columnTasks = filteredTasks.filter((task) => task.status === status.value);
            return (
              <section className={`kanban-column column-${status.value}`} key={status.value} aria-labelledby={`heading-${status.value}`}>
                <header className="column-header">
                  <div className="column-title">
                    <span className={`column-dot dot-${status.value}`} />
                    <h3 id={`heading-${status.value}`}>{status.label}</h3>
                    <span className="column-count">{columnTasks.length}</span>
                  </div>
                  <button className="icon-button column-add" aria-label={`Add task to ${status.label}`} title={`Add task to ${status.label}`} onClick={() => setModalTask({ ...createTask(), _new: true, status: status.value, title: "" })}><Plus size={17} /></button>
                </header>
                <div className="column-body">
                  {columnTasks.length ? columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={setModalTask} onStatusChange={updateStatus} onDelete={setDeleteTask} onCopy={copyContext} />
                  )) : (
                    <div className="empty-column">
                      <span className="empty-icon"><Layers3 size={17} /></span>
                      <p>{STATUS_HINTS[status.value]}</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </section>

        <footer className="page-footer">
          <span><Sparkles size={14} /> Keep useful prompts and results attached to the work.</span>
          <span>Changes saved in this browser for now</span>
        </footer>
      </main>

      {modalTask !== undefined && (
        <TaskModal
          key={modalTask === "new" ? "new" : modalTask.id}
          initialTask={modalTask === "new" ? null : modalTask}
          onClose={() => setModalTask(undefined)}
          onSave={saveTask}
        />
      )}
      {deleteTask && <DeleteModal task={deleteTask} onCancel={() => setDeleteTask(null)} onConfirm={confirmDelete} />}
      {toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}
    </div>
  );
}
