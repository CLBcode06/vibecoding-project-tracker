import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, Bug, CalendarDays, Check, ChevronDown, Clock3, Flag, Layers3,
  Lightbulb, Plus, Search, Sparkles, Tag, Telescope, Trash2, UserRound, X
} from "lucide-react";
import {
  buildPromptContext, createTask, formatDueDate, getDueState,
  TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES
} from "./data/taskModel.js";
import { loadTasks, createTaskRequest, updateTaskRequest, deleteTaskRequest } from "./data/taskStore.js";

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

// Owner display: initials avatar with a stable colour per person (same name -> same colour).
function ownerInitials(name) {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.trim().slice(0, 2)).toUpperCase();
}
function ownerHue(name) {
  let hash = 0;
  for (const ch of name.trim().toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) % 6;
  return hash;
}

function OwnerChip({ owner, onClick, label }) {
  const name = (owner || "").trim();
  const Tag = onClick ? "button" : "span";
  return (
    <Tag className={classNames("owner-chip", name ? `owner-hue-${ownerHue(name)}` : "owner-unassigned")} onClick={onClick} aria-label={label} title={onClick ? "Hand off to…" : undefined}>
      <span className="owner-avatar">{name ? ownerInitials(name) : <UserRound size={12} aria-hidden="true" />}</span>
      <span className="owner-name">{name || "Unassigned"}</span>
    </Tag>
  );
}

// Single source of truth for task-type icons. Colours live in index.css
// (.type-feature, .type-bug, ...) and are shared by every place a type shows.
const TYPE_ICONS = { feature: Lightbulb, bug: Bug, research: Telescope, prompt: Sparkles };

function typeKey(type) {
  return TYPE_ICONS[type] ? type : "feature";
}

function TypeMark({ type, size = 13 }) {
  const key = typeKey(type);
  const Icon = TYPE_ICONS[key];
  return (
    <span className={classNames("type-mark", `type-${key}`)}>
      <Icon size={size} aria-hidden="true" />
      <span>{TASK_TYPES.find((item) => item.value === key)?.label}</span>
    </span>
  );
}

function TaskCard({ task, justHandedOff, onEdit, onStatusChange, onDelete, onCopy, onHandOff }) {
  const dueState = getDueState(task);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <article className={classNames("task-card task-card-clickable", `type-${typeKey(task.type)}`, justHandedOff && "task-card-handed-off")} role="button" tabIndex={0} aria-label={`Edit task: ${task.title}`} onClick={() => onEdit(task)} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onEdit(task); } }}>
      <div className="task-card-top">
        <TypeMark type={task.type} />
        <div className="card-menu-wrap">
          <button className="icon-button card-menu-trigger" aria-label={`Options for ${task.title}`} onClick={(event) => { event.stopPropagation(); setShowMenu(!showMenu); }}>
            <ChevronDown size={16} />
          </button>
          {showMenu && (
            <div className="card-menu" onClick={(event) => event.stopPropagation()}>
              <button onClick={() => { onEdit(task); setShowMenu(false); }}>Edit task</button>
              <button onClick={() => { onHandOff(task); setShowMenu(false); }}>Hand off to…</button>
              <button onClick={() => { onCopy(task); setShowMenu(false); }}>Copy prompt context</button>
              <button className="danger-menu-item" onClick={() => { onDelete(task); setShowMenu(false); }}>Delete task</button>
            </div>
          )}
        </div>
      </div>

      <button className="task-title-button" onClick={(event) => { event.stopPropagation(); onEdit(task); }}>{task.title}</button>
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

      <div className="task-card-divider" />

      <div className="task-footer">
        {task.dueDate ? (
          <span className={classNames("due-date", dueClass(dueState))}>
            <CalendarDays size={13} />{formatDueDate(task.dueDate)}
          </span>
        ) : <span className="task-footer-spacer" />}
        <span onClick={(event) => event.stopPropagation()}>
          <OwnerChip owner={task.owner} onClick={() => onHandOff(task)} label={task.owner ? `Owner: ${task.owner}. Hand off to someone else` : "Unassigned. Hand off to someone"} />
        </span>
      </div>

      {(task.usefulPrompt || task.result) && (
        <div className="task-notes-indicator">
          {task.usefulPrompt && <span><Sparkles size={12} /> Prompt saved</span>}
          {task.result && <span><Check size={12} /> Result saved</span>}
        </div>
      )}

      <label className="status-select-label" onClick={(event) => event.stopPropagation()}>
        <span>Move to</span>
        <select value={task.status} onClick={(event) => event.stopPropagation()} onChange={(event) => onStatusChange(task.id, event.target.value)} aria-label={`Change status for ${task.title}`}>
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
      <section className={classNames("task-modal", `type-${typeKey(form.type)}`)} role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <header className="modal-header">
          <div>
            <div className="modal-type-row">
              <TypeMark type={form.type} />
              <p className="eyebrow">{initialTask ? "UPDATE YOUR WORK" : "MAKE PROGRESS"}</p>
            </div>
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
            <div className={classNames("form-field", "type-field", `type-${typeKey(form.type)}`)}>
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
              <label htmlFor="task-owner">Assignee</label>
              <input id="task-owner" value={form.owner || ""} onChange={(event) => update("owner", event.target.value)} placeholder="Name (optional)" maxLength={80} />
            </div>
            <div className="form-field">
              <label htmlFor="task-milestone">Milestone</label>
              <input id="task-milestone" value={form.milestone || ""} onChange={(event) => update("milestone", event.target.value)} placeholder="e.g. M5 · Board view" maxLength={100} />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="task-created">Created date</label>
            <input
              id="task-created"
              value={initialTask?.createdAt ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(initialTask.createdAt)) : "Set automatically when saved"}
              readOnly
              aria-readonly="true"
            />
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

function HandoffModal({ task, people, onCancel, onConfirm }) {
  const [name, setName] = useState("");
  const next = name.trim();
  const unchanged = next.toLowerCase() === (task.owner || "").trim().toLowerCase();
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <form className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="handoff-title" onSubmit={(event) => { event.preventDefault(); if (next && !unchanged) onConfirm(next); }}>
        <div className="handoff-icon"><UserRound size={21} /></div>
        <h2 id="handoff-title">Hand off to…</h2>
        <TypeMark type={task.type} />
        <p><strong>{task.title}</strong><br />Currently with: {task.owner ? task.owner : "nobody"}</p>
        <div className="form-field">
          <label htmlFor="handoff-name">New owner</label>
          <input id="handoff-name" autoFocus list="handoff-people" value={name} onChange={(event) => setName(event.target.value)} placeholder="Type a name" maxLength={80} />
          <datalist id="handoff-people">{people.filter((person) => person !== task.owner).map((person) => <option value={person} key={person} />)}</datalist>
        </div>
        {people.filter((person) => person !== task.owner).length > 0 && (
          <div className="handoff-suggestions">
            {people.filter((person) => person !== task.owner).map((person) => (
              <button type="button" key={person} className={classNames("owner-chip", `owner-hue-${ownerHue(person)}`)} onClick={() => setName(person)}>
                <span className="owner-avatar">{ownerInitials(person)}</span><span className="owner-name">{person}</span>
              </button>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={!next || unchanged}>Hand off</button>
        </div>
      </form>
    </div>
  );
}

function DeleteModal({ task, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
        <div className="confirm-icon"><Trash2 size={21} /></div>
        <h2 id="delete-title">Delete this task?</h2>
        <TypeMark type={task.type} />
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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [modalTask, setModalTask] = useState(undefined);
  const [deleteTask, setDeleteTask] = useState(null);
  const [handoffTask, setHandoffTask] = useState(null);
  const [handedOffId, setHandedOffId] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [toast, setToast] = useState("");

  useEffect(() => {
    let active = true;
    loadTasks().then((items) => { if (active) { setTasks(items); setApiError(""); } })
      .catch((error) => { if (active) setApiError(`Cannot connect to the Citrus API. Start the app with npm run dev. (${error.message})`); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

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

  async function saveTask(form) {
    const isEditing = modalTask && modalTask !== "new" && !modalTask._new;
    try {
      if (isEditing) {
        const saved = await updateTaskRequest(modalTask.id, { ...modalTask, ...form, updatedAt: new Date().toISOString() });
        setTasks(current => current.map(task => task.id === saved.id ? saved : task));
        showToast("Task updated.");
      } else {
        const saved = await createTaskRequest({ ...createTask(), ...form });
        setTasks(current => [saved, ...current]);
        showToast("Task added.");
      }
      setModalTask(undefined); setApiError("");
    } catch (error) { setApiError(`Could not save task: ${error.message}`); }
  }

  async function updateStatus(id, status) {
    const task = tasks.find(item => item.id === id); if (!task) return;
    try {
      const saved = await updateTaskRequest(id, { ...task, status });
      setTasks(current => current.map(item => item.id === id ? saved : item)); setApiError("");
    } catch (error) { setApiError(`Could not update task status: ${error.message}`); }
  }

  const people = useMemo(() => {
    const seen = new Map();
    tasks.forEach((task) => { const name = (task.owner || "").trim(); if (name && !seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name); });
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  async function handOff(task, name) {
    try {
      const saved = await updateTaskRequest(task.id, { ...task, owner: name, updatedAt: new Date().toISOString() });
      setTasks(current => current.map(item => item.id === saved.id ? saved : item));
      setHandoffTask(null); setApiError("");
      showToast(`Task assigned to ${name}`);
      setHandedOffId(task.id);
      window.setTimeout(() => setHandedOffId((id) => id === task.id ? null : id), 2000);
    } catch (error) { setApiError(`Could not hand off task: ${error.message}`); }
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

  async function confirmDelete() {
    try {
      await deleteTaskRequest(deleteTask.id);
      setTasks(current => current.filter(task => task.id !== deleteTask.id));
      setDeleteTask(null); setApiError(""); showToast("Task deleted.");
    } catch (error) { setApiError(`Could not delete task: ${error.message}`); }
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
        {apiError && <div className="api-error" role="alert"><AlertCircle size={17} /><span>{apiError}</span></div>}
        {loading && <div className="loading-banner" role="status">Loading tasks from the Citrus database…</div>}
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
                    <TaskCard key={task.id} task={task} onEdit={setModalTask} onStatusChange={updateStatus} onDelete={setDeleteTask} onCopy={copyContext} onHandOff={setHandoffTask} justHandedOff={handedOffId === task.id} />
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
          <span>Changes saved to the Citrus database</span>
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
      {handoffTask && <HandoffModal key={handoffTask.id} task={handoffTask} people={people} onCancel={() => setHandoffTask(null)} onConfirm={(name) => handOff(handoffTask, name)} />}
      {deleteTask && <DeleteModal task={deleteTask} onCancel={() => setDeleteTask(null)} onConfirm={confirmDelete} />}
      {toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}
    </div>
  );
}
