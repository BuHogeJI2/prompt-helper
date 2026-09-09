# TODO

## First priority: editor space and prompt navigation

- [x] Replace the introductory headings and tag counts with a compact toolbar.
- [x] Make the tag palette collapsible and let the editor use the remaining screen height.
- [x] Keep the Copy prompt action visible while editing long prompts.
- [x] Add an outline of sections in the current prompt, with click-to-jump navigation and a current-section highlight.

## Organizing existing text

- Add an explicit Wrap selection in a tag action for organizing pasted notes or existing text.
- Allow moving a complete prompt section up or down, including its content and tag pair.
- Consider section folding if outline navigation is not enough for long prompts.

## Optional starting structures

- Offer editable starting structures while keeping the blank-prompt flow available.
- Add an Implement a feature structure: Task, Context, Scope, Constraints, Acceptance criteria.
- Add an Investigate a bug structure: Observed behavior, Expected behavior, Reproduction, Relevant context.
- Review overlapping built-in labels such as Details, Comment, and Important note to make their purposes clearer.

## Recent drafts

- If revisiting or reusing prompts becomes a frequent need, add a small draft switcher with titles, autosave status, and a Duplicate action.
- Preserve the current draft when starting another prompt.

## Reliability and light guidance

- Handle local storage failures and show a persistent warning when changes cannot be saved.
- Warn before closing the tag manager with unsaved changes.
- Consider optional hints for unmatched tag pairs or empty sections. Allow custom tag names and keep copying immediate, without a validation dialog.
