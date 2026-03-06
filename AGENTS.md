# AI Agent Guide

This file is named `AGENTS.md`, which is the expected convention for agent instructions in this repo.

## Project summary
Prompt Helper is a React + TypeScript SPA that helps users compose AI prompts with structured tags. Built-in tags are grouped into collapsible sections above the editor, can be inserted by click or keyboard shortcut, and always drop an opening and closing block with the cursor placed between them for immediate editing. A primary "Quick copy" action copies the full editor content.

## Key behaviors
- Tag insertion always starts on a new line and adds a blank line between open and close tags.
- Cursor is repositioned between tags after insertion.
- Built-in tags are grouped by intent and expose `Ctrl/Cmd + Shift + Letter` shortcuts.
- Clearing the editor and resetting tags to defaults both require confirmation.
- Editor content and tag definitions are persisted to local storage.

## Local storage keys
- `prompt-helper:editor`: editor text
- `prompt-helper:tags`: tag definitions

## Important files
- `src/App.tsx`: main layout, prompt editor state, clipboard copy, clear confirmation, hotkeys
- `src/components/TagsPanel.tsx`: grouped tag palette and accordion UI
- `src/components/ManageTagsModal.tsx`: tag management dialog, shared add/edit form, reset flow
- `src/components/EditorPanel.tsx`: editor card, quick copy action, danger-zone clear action
- `src/components/ConfirmationDialog.tsx`: shared confirmation dialog used for destructive actions
- `src/constants/tags.ts`: built-in tag definitions, groups, and shortcut metadata
- `src/utils/storage.ts`: local storage load/save with backward-compatible normalization
- `src/utils/tags.ts`: tag ID generation, tag-pair generation, storage normalization, shortcut labels
- `src/index.css`: global styles and font setup
- `tailwind.config.js`: Tailwind theme tokens and motion primitives

## Run commands
```bash
npm install
npm run dev
```
