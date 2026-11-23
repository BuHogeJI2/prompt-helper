---
priority: low
created: 2026-11-23
where: [.gitignore]
---

# Retire the .tmp folder

## Description

This is a personal project, so agent notes belong in the tracked `docs/` folder. `.tmp/` should not
exist. Right now `.tmp/plans/` holds three untracked plans: `compact-prompt-workspace.md`,
`drag_&_drop.md`, and `terminal-design-plan.md`. They are not in git, so they are not backed up.

`.gitignore:26` ignores `.tmp`. The `node_modules/.tmp` paths in `tsconfig.app.json` and
`tsconfig.node.json` are a different folder, and `node_modules/` covers them.

## Reasoning

Low: nothing in the app breaks. The risk is losing the untracked plans.

## Possible fix

1. Move `.tmp/plans/*.md` to `docs/plans/`, rename `drag_&_drop.md` to a kebab-case name, and
   commit them.
2. Remove `.tmp/` and the `.tmp` line in `.gitignore`. First check that nothing else relies on that
   line.
