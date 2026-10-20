# Vibecoding Project Tracker — Design

**Status:** Hackathon starter design doc · fill in the **`<TODO>`** sections before you tag `design-done`.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with.

`The tracker should leave the user feeling comfortable over its design philosophy choice regarding its ease-of-use and accessibility`

Two or three references that capture the vibe (links to dribbble shots, screenshots of apps you admire, Pinterest boards — anything visual):

- `![kanban-inspo.png](img/kanban-inspo.png)`
- `![accessible-colours.jpg](img/accessible-colours.jpg)`
- `![minimilsm.jpg](img/minimilsm.jpg)`

Anti-references — what we are explicitly **not** trying to look like:

- `![ai-slop.jpg](img/ai-slop.jpg)`

## 2. Color palette

These are the colors the build milestones will reference. Once chosen, paste the hex values into `tailwind.config.js` so the rest of the team can use Tailwind utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#04635F` | Header, "+" button, focus rings |
| `brand-accent` | `#D35400` | Highlights, hover states, links |
| `surface-page` | `#F8F9FA` | Page background |
| `surface-card` | `#FFFFFF` | Card background |
| `text-primary` | `#343A40` | Body text |
| `text-muted` | `#6C757D` | Captions, dates, counts |



### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#0D9488` | Cards tagged `feature` (accent stripe + icon) |
| `type-bug` | `#DC2626` | Cards tagged `bug` (accent stripe + icon) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#0D9488` | More than 2 days out |
| `due-warning` | `#D97706` | Less than 24 hours |
| `due-overdue` | `#B91C1C` | Past due |
| `due-neutral` | `#6C757D` | Done (overrides date) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | `Inter` | `Inter is widely regarded as one of the best sans-serif typefaces for user interfaces, optimized specifically for computer screens to maximize legibility across varying weights.` |
| Body | `Inter` | `Inter is widely regarded as one of the best sans-serif typefaces for user interfaces, optimized specifically for computer screens to maximize legibility across varying weights.` |
| Monospace (tags, badges, code) | `JetBrains Mono` | `JetBrains Mono provides clear differentiation between similar-looking characters (such as 0 and O), making it ideal for compact metadata, tags, and code snippets in a busy kanban interface.` |

Suggested sizes (override only if the design demands it):

- Page title: 24 px / semibold
- Section header: 16 px / semibold uppercase
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** `Crisp white surfaces bounded by a subtle 1px neutral border and a clean shadow that elevates only on hover.` (e.g. "Light, almost weightless; the only weight is from a 1px border, no shadow except on hover.")
- **Buttons:** `Solid fills with generous padding, sharp rounded corners, and clear interactive hover states.` (e.g. "Solid fill, no gradient, generous padding, rounded-md.")
- **Modal:** `Centered with a contained maximum width and a darkened translucent backdrop for deep focus.` (e.g. "Centered, max-width-md, slate-900 backdrop at 50% opacity.")
- **Empty states:** `Bounded by a light dashed border with muted, encouraging guidance instead of illustrations.` (e.g. "Dashed border, muted text, never sad.")
- **Drag affordance (if used):** `None — status changes and reordering are handled cleanly via status dropdowns.` (e.g. "None — we use a status dropdown.")

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | `Add Task...` (e.g. "+ Task" or "Add task" or "New") |
| Empty column placeholder | `Seems Empty, add a Task?` (e.g. "Nothing here yet — keep going.") |
| Toast after "Copy as Prompt Context" | `Copies to Clipboard` (e.g. "Copied. Now paste it into the AI.") |
| Confirm-delete message | `Confirm deletion, it cannot be undone...` (e.g. "Delete this task? You can't undo.") |
| Handoff toast (M7 `task-owner`) | `Task assigned to {name here}` (e.g. "Handed off to {name}. They've got it.") |

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** `Citrus` (match PRD §11 team identity)
- **Wordmark style:** `Citrus` (e.g. "Just the name in the heading font, brand-primary color, no icon.")

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-starter v1*
