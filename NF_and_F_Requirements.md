Citrus — Functional, Non-Functional and Data Requirements

1. Functional requirements

FR-01
Requirement: The system shall display project tasks on a Kanban board.
Priority: Must

FR-02
Requirement: The board shall contain four columns in this order: To Do, In Progress, Review and Done.
Priority: Must

FR-03
Requirement: The system shall allow a user to create a task using an add-task control and form/modal.
Priority: Must

FR-04
Requirement: The system shall allow a user to view and edit an existing task.
Priority: Must

FR-05
Requirement: The system shall allow a user to delete a task.
Priority: Must

FR-06
Requirement: Each task shall have a title and description.
Priority: Must

FR-07
Requirement: Each task shall have a type of feature or bug, with visual styling that distinguishes the two types.
Priority: Must

FR-08
Requirement: Each task shall have a status corresponding to one of the four Kanban columns.
Priority: Must

FR-09
Requirement: Each task shall have an assignee selected from the teammate names configured for the project.
Priority: Must

FR-10
Requirement: The system shall allow a user to change a task's status as work progresses.
Priority: Must

FR-11
Requirement: The system shall allow a user to set or update a task's due date.
Priority: Must

FR-12
Requirement: The system shall visually distinguish due dates that are safe, approaching, overdue or neutral, following the design rules. Completed tasks shall not continue to appear overdue.
Priority: Must

FR-13
Requirement: The system shall record the date a task was created.
Priority: Must

FR-14
Requirement: Each task shall provide a context field for a curated briefing that helps another teammate or AI assistant continue the work.
Priority: Must

FR-15
Requiement: The context field shall support selection of the tool associated with the context: Claude, ChatGPT, Cursor, Lovable, Replit or Other.
Priority: Should

FR-16
Requirement: The system shall record the date and time when task context is saved or updated.
Priority: Must

FR-17
Requirement: The system shall provide a Copy as Prompt Context action that formats relevant task details and saved context into text that can be pasted into an AI chat or handed to a teammate.
Priority: Must

FR-18
Requirement: The system shall provide a persistent deliverables area, referred to in the PRD as the Anchor Board.
Priority: Must

FR-19
Requirement: The Anchor Board shall provide four deliverable slots: Presentation, Demo, Report and Documentation.
Priority: Must

FR-20
Requirement: The system shall allow users to enter and update a URL for each deliverable.
Priority: Must

FR-21
Requirement: The system shall indicate whether a deliverable link has been supplied.
Priority: Should

FR-22
Requirement: The system shall save task and deliverable changes persistently and restore them when the application is reopened.
Priority: Must

FR-23
Requirement: The system shall allow users to hand a task to another configured teammate by changing its assignee.
Priority: Must

FR-24
Requirement: The system shall provide clear feedback when actions succeed, when input is invalid, or when a save/API operation fails.
Priority: Should

FR-25
Requirement: Where the current implementation provides a project overview or task-health panel, it shall identify useful follow-up work, such as overdue tasks, tasks awaiting review, missing context/next steps and missing deliverable links.
Priority: Should

2. Non-functional requirements

NFR-01 — Usability
Requirement: The application shall be easy for project teammates to understand and use.
Acceptance criteria: Core actions—adding, editing, changing the status of and deleting a task—are available through clearly labelled controls.

NFR-02 — Accessibility
Requirement: The interface shall support accessible use.
Acceptance criteria: Text remains readable; interactive controls have accessible names; form fields have labels; keyboard focus is visible; status and due-date meaning is not conveyed by colour alone.

NFR-03 — Visual consistency
Requirement: The interface shall follow the Citrus design system in DESIGN.md.
Acceptance criteria: The interface uses the defined palette: primary teal #04635F, accent orange #D35400, page surface #F8F9FA, card surface #FFFFFF, primary text #343A40 and muted text #6C757D.

NFR-04 — Clarity
Requirement: The UI shall avoid unnecessary complexity and generic template styling.
Acceptance criteria: The Kanban board, task cards, due-date indicators and Anchor Board use consistent, purposeful visual patterns.

NFR-05 — Performance
Requirement: Common interactions shall feel responsive under normal conditions.
Acceptance criteria: As a proposed test target, local UI actions should respond within 200 ms; network-dependent saves should provide visible progress/feedback if they take longer. This target requires testing and is not a claim of measured performance.

NFR-06 — Reliability
Requirement: Successfully saved data shall persist between sessions.
Acceptance criteria: After a refresh or restart, saved tasks and deliverable links remain available when the configured persistence service is available.

NFR-07 — Data integrity
Requirement: The system shall maintain valid task and deliverable records.
Acceptance criteria: Required values are validated; IDs are unique; task status and type values are restricted to permitted values; failed writes are not reported as successful.

NFR-08 — Error handling
Requirement: Failures shall be communicated without misleading the user.
Acceptance criteria: API/database errors result in a clear message or state, and the UI does not silently discard changes while claiming they were saved.

NFR-09 — Maintainability
Requirement: The code shall be organised so the UI, task data model and persistence/API logic can be maintained separately.
Acceptance criteria: Changes to data persistence do not require unnecessary rewrites of unrelated UI components.

NFR-10 — Compatibility
Requirement: The application shall run in its intended modern desktop-browser environment.
Acceptance criteria: The production build loads and core board, task and deliverable actions work in a supported modern browser.

NFR-11 — Security
Requirement: The application shall handle user input and database access safely.
Acceptance criteria: SQL operations use safe parameter handling; secrets and database credentials are not exposed in client-side code or public responses; invalid requests are rejected.

NFR-12 — Deployment
Requirement: The application shall be buildable and deployable using the project's configured hosting workflow.
Acceptance criteria: The deployed frontend can reach the intended API routes and persistence service; deployment configuration and environment variables are documented.

NFR-13 — Scope control

Requirement: The aplication shall remain appropriate to the project's small-team use case.
Acceptance criteria: Authentication, multi-team management and real-time collaboration are not required unless the project scope is formally changed.

NFR-14 — Feedback
Requirement: The application shall make the result of user actions clear.
Acceptance criteria: Validation errors, save failures and destructive actions are communicated clearly; deletion should be protected against accidental activation where appropriate.

3. Data Requirements

id
Type / format: String
Requirement: Required and unique. May be a UUID or timestamp-based string, as allowed by the PRD.

title
Type / format: String
Requirement: Required; concise name of the task.

description
Type / format: String
Requirement: Stores a description of the work.

type
Type / format: Enum
Requirement: Required; feature or bug.

status
Type / format: Enum
Requirement: Required; todo, in-progress, review or done. These values map to the UI labels To Do, In Progress, Review and Done.

assignee
Type / format: String
Requirement: Identifies the teammate responsible for the task. The original PRD restricts values to the configured teammate names.

dueDate
Type / format: Date string or null
Requirement: Optional; when present, use ISO date format YYYY-MM-DD.

createdDate
Type / format: Date string
Requirement: Required; ISO date format YYYY-MM-DD.

context
Type / format: String
Requirement: Stores the curated context/briefing for the next AI assistant or teammate. May be empty if no context has been added.

contextTool
Type / format: String or null
Requirement: Optional; one of Claude, ChatGPT, Cursor, Lovable, Replit or Other.

contextUpdatedAt
Type / format: ISO timestamp or null
Requirement: Set automatically when context is saved or updated.

4.  Data validation and integrity rules

Each task must have a unique ID.

Task status must be one of the four supported workflow states.

Task type must be either feature or bug, as specified by the PRD.

Assignee values should be limited to the configured teammate names.

Due dates must be valid ISO dates or null.

createdDate must be stored consistently as an ISO date.

contextTool must be one of the supported tool names or null.

contextUpdatedAt must be a valid timestamp or null; it should be updated automatically when context is saved.

Exactly four predefined deliverable slots should be available, with unique IDs and stable labels.

Deliverable URLs may be empty, but non-empty values should be validated as URLs before saving.

Data must be persisted using the storage approach adopted by the current version of the application. The original PRD specifies localStorage; the current repository includes backend/API and PostgreSQL support.

If a save operation fails, the application must not falsely indicate that the new data has been persisted.

If tasks are deleted, they must no longer appear on the board or be returned as active task records.

5. Acceptance summary

The Kanban board displays the four required workflow columns.

Users can create, edit, delete and update task status and assignee.

Task type and due-date states are visually distinguishable and consistent with the design specification.

Task context can be saved and copied as prompt context for a teammate or AI tool.

The Anchor Board displays Presentation, Demo, Report and Documentation and allows links to be saved.

Tasks and deliverable links persist across reloads using the active storage implementation.

Invalid input and API/database failures are handled without falsely reporting success.

The deployed application loads without errors and the core workflow can be demonstrated.