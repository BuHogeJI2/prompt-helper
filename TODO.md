# TODO

## First priority: named drafts / tabs

- [ ] Keep several named task drafts and switch between them using tabs or a compact draft switcher.
- [ ] Preserve the current draft when starting a blank prompt or a prompt from a template.
- [ ] Autosave each draft independently and restore drafts after reopening the app.
- [ ] Add a Duplicate action to try another version of a prompt.

## Second priority: reliable undo and redo

- [ ] Support undo and redo for typing, pasting, tag insertion, wrapping selections, moving sections, clearing, and loading templates.
- [ ] Restore the cursor or selection along with the text.
- [ ] Keep editing history separate for each draft.

## Reusable content

- [ ] Save, edit, and insert named text snippets for repeated instructions or project context.
- [ ] Support snippets such as discussion-before-planning instructions and review rules.
- [ ] Add Save as template to turn the current prompt into a reusable named starting structure.
- [ ] Let users choose, edit, and delete saved templates while keeping the blank-prompt flow available.

## Section actions and guidance

- [ ] Add Copy section to the outline for sending one block in an ongoing AI conversation.
- [ ] Mark empty blocks and unmatched tags in the outline without blocking copying or restricting custom tag names.

## Reliability

- [ ] Handle local storage failures and show a persistent warning when changes cannot be saved.
- [ ] Show autosave status so users can tell whether their latest edits are saved.
- [ ] Warn before closing the tag manager with unsaved changes.

## Later ideas

- [ ] Consider section folding if outline navigation is not enough for long prompts.
- [ ] Add an Investigate a bug template: Observed behavior, Expected behavior, Reproduction, Relevant context.
- [ ] Consider a more detailed Implement a feature template: Task, Context, Scope, Constraints, Acceptance criteria.
- [ ] Review overlapping built-in labels such as Details, Comment, and Important note to make their purposes clearer.

## Completed

- [x] Replace the introductory headings and tag counts with a compact toolbar.
- [x] Make the tag palette collapsible and let the editor use the remaining screen height.
- [x] Keep the Copy prompt action visible while editing long prompts.
- [x] Add an outline of sections in the current prompt, with click-to-jump navigation and a current-section highlight.
- [x] Add an explicit Wrap selection in a tag action for organizing pasted notes or existing text.
- [x] Allow moving a complete prompt section up or down, including its content and tag pair.
- [x] Offer editable starting structures while keeping the blank-prompt flow available.
- [x] Add a New task template with Task, Description, Criteria, and prefilled Next Step instructions to discuss details before creating an implementation plan.
- [x] Confirm before replacing existing editor text with a template and place the cursor inside Task after loading.
