# Prompt Helper

Prompt Helper is a lightweight React + TypeScript single-page app for composing AI prompts with structured tags. Click a tag to insert an opening and closing block on a new line, with the cursor placed between the tags so you can type immediately. A single "Quick copy" button copies the full prompt.

## Features

- Compact, responsive tag palette with mobile quick actions and a full bottom drawer
- Grouped prompt blocks for common needs (Task, Reference, Example, Criteria, etc.)
- Pointer, touch, and keyboard block reordering within groups, with persisted order
- Native textarea editing with reliable new lines, selection, paste, undo, and IME input
- Tag insertion on a new line with the cursor placed inside the generated pair
- `Alt+Shift+letter` shortcuts for built-in tags
- Create, edit, safely delete, and reset tag definitions
- One-click copy to clipboard
- Local storage persistence for editor content and tag definitions

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Vitest + React Testing Library

## Getting started

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

The pre-commit hook runs tests, lint, and typecheck.

## Local storage

The app persists state in `localStorage`:

- `prompt-helper:editor` stores the editor text
- `prompt-helper:tags` stores tag definitions

## Project structure

```
src/
  App.tsx                  # page composition and dialogs
  components/              # shared header and confirmation UI
  features/
    editor/                # textarea UI and editor behavior
    tags/                  # responsive tag palette, sorting, management, state, and hotkeys
  hooks/                   # shared status and responsive UI behavior
  constants/               # storage keys and built-in tag definitions
  types/                   # tag domain types
  utils/                   # storage and tag normalization helpers
  test/                    # integration and utility regression tests
  index.css                # global styles and Tailwind imports
```
