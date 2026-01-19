# AI Agent Guide

This file is named `AGENTS.md`, which is the expected convention for agent instructions in this repo.

## Project summary
Prompt Helper is a React + TypeScript SPA that helps users compose AI prompts with structured tags. Clicking a tag inserts an opening and closing block on a new line, with the cursor placed between the tags for immediate editing. A "Quick copy" button copies the full editor content.

## Key behaviors
- Tag insertion always starts on a new line and adds a blank line between open and close tags.
- Cursor is repositioned between tags after insertion.
- Editor content and tag definitions are persisted to local storage.

## Local storage keys
- `prompt-helper:editor`: editor text
- `prompt-helper:tags`: tag definitions

## Important files
- `src/App.tsx`: main UI, tag list, editor logic, clipboard copy
- `src/index.css`: global styles and font setup
- `tailwind.config.js`: Tailwind theme tokens
- `postcss.config.js`: Tailwind/PostCSS setup

## Run commands
```bash
npm install
npm run dev
```
