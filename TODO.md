# TODO

## Data safety

- Add tag deletion confirmation or a short-lived undo action.
- Reject duplicate tag labels and generated tag pairs.
- Warn before closing the tag manager with unsaved changes.
- Catch local storage write failures and show a persistent warning when changes cannot be saved.

## Core product

- Add accessible tag reordering inside groups with drag handles, keyboard move controls, persisted order, and screen-reader announcements.
- Add structured-prompt validation for unmatched, incorrectly nested, empty, and unknown tags, with a warning before copying invalid prompts.

## Quality

- Add Playwright coverage for native editor input, caret placement after tag insertion, modal focus behavior, and the core mobile layout.
- Add CI checks for tests, lint, typecheck, and production build on every pull request.
