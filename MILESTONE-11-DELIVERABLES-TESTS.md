# Milestone 11 — Deliverable Anchor Board tests

## Setup
1. Run `npm install` and `npm run dev`.
2. Open the Vite URL shown in the terminal.

## Acceptance checklist
- [ ] Presentation, Demo, Report, and Documentation cards are visible above the Kanban board.
- [ ] Each card has one URL field and an empty/filled dot with a matching status label.
- [ ] Enter a valid `https://` URL in each field and press Enter or click elsewhere. Each shows “Linked” after saving.
- [ ] Click each “Open link” link and confirm it opens the saved destination in a new tab.
- [ ] Refresh the page and confirm all four URLs and filled dots remain.
- [ ] Restart the API/server and refresh again; confirm saved URLs remain (the server must not reset existing deliverable rows).
- [ ] Clear one URL and leave the field; confirm its dot returns to empty and the empty value survives a refresh.
- [ ] Try a non-HTTP URL (for example `not-a-url`); confirm it is rejected and the API displays an error.
- [ ] Check the layout at desktop and narrow/mobile widths.

## Tag
After the checklist passes and the changes are committed, create and push the milestone tag:

```bash
git tag project-deliverables
git push origin project-deliverables
```

Do not create/push the tag until the checks pass.
