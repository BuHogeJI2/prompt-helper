# Prompt Helper

Prompt Helper is a lightweight React + TypeScript single-page app for composing AI prompts with structured tags. Click a tag to insert an opening and closing block on a new line, with the cursor placed between the tags so you can type immediately. A single "Quick copy" button copies the full prompt.

## Features
- Tag palette for common blocks (Task, Reference, Example, Criteria, etc.)
- Editor that inserts tags on a new line with cursor placement between brackets
- One-click copy to clipboard
- Local storage persistence for editor content and tag definitions

## Tech stack
- React + TypeScript
- Vite
- Tailwind CSS

## Getting started
```bash
npm install
npm run dev
```

## Local storage
The app persists state in `localStorage`:
- `prompt-helper:editor` stores the editor text
- `prompt-helper:tags` stores tag definitions

## Project structure
```
src/
  App.tsx        # main UI and tag insertion logic
  index.css      # global styles and Tailwind imports
public/
```
