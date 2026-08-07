# AI Agent Guide

This file is named `AGENTS.md`, which is the expected convention for agent instructions in this repo.

## Project summary

Prompt Helper is a React + TypeScript SPA for composing AI prompts with structured tags. Built-in tags are grouped into collapsible sections beside a native textarea, can be inserted by click or keyboard shortcut, and always add an opening and closing block with the cursor placed between them. A primary "Quick copy" action copies the full editor content.

## Key behaviors

- Tag insertion always starts on a new line and adds a blank line between open and close tags.
- Cursor is repositioned between tags after insertion.
- Direct editing uses native textarea behavior for new lines, selection, paste, undo, and IME input.
- Built-in tags are grouped by intent and expose `Alt + Shift + Letter` shortcuts.
- Clearing the editor and resetting tags to defaults both require confirmation.
- Editor content and tag definitions are persisted to local storage.

## Local storage keys

- `prompt-helper:editor`: editor text
- `prompt-helper:tags`: tag definitions

## Important files

- `src/App.tsx`: page composition and confirmation-dialog orchestration
- `src/features/editor/EditorPanel.tsx`: native textarea, quick copy, status, and clear action UI
- `src/features/editor/usePromptEditor.ts`: editor persistence, tag insertion, caret placement, copy, and clear behavior
- `src/features/tags/useTagCollection.ts`: tag persistence, grouping, counts, and CRUD/reset operations
- `src/features/tags/useTagHotkeys.ts`: built-in tag keyboard shortcuts
- `src/features/tags/ManageTagsModal.tsx`: tag-management dialog orchestration
- `src/features/tags/TagList.tsx`: saved-tag selection list
- `src/features/tags/TagEditor.tsx`: shared add/edit form, generated preview, and reset action
- `src/features/tags/TagsPanel.tsx`: grouped tag palette and accordion UI
- `src/components/ConfirmationDialog.tsx`: shared confirmation dialog used for destructive actions
- `src/hooks/useTransientStatus.ts`: reusable timed status-message lifecycle
- `src/constants/tags.ts`: built-in tag definitions, groups, and shortcut metadata
- `src/utils/storage.ts`: local storage load/save with backward-compatible normalization
- `src/utils/tags.ts`: tag ID generation, tag-pair generation, storage normalization, shortcut labels
- `src/test/App.test.tsx`: user-observable editor and tag-management regression coverage
- `src/test/tags.test.ts`: stored-tag normalization coverage
- `src/index.css`: global styles and font setup
- `tailwind.config.js`: Tailwind theme tokens and motion primitives

## Run commands

```bash
npm install
npm run dev
npm test
npm run lint
npm run typecheck
npm run build
```

The Husky pre-commit hook runs lint, typecheck, and the Vitest suite.
