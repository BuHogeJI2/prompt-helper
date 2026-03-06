import type { TagDefinition, TagGroup } from "@/types/tags";

export const TAG_GROUPS: TagGroup[] = [
  {
    id: "core",
    title: "Core blocks",
    description: "Set the task and the required output shape first.",
  },
  {
    id: "context",
    title: "Context",
    description: "Feed references, examples, and supporting detail into the prompt.",
  },
  {
    id: "guardrails",
    title: "Guardrails",
    description: "Constrain behavior and define success criteria.",
  },
  {
    id: "notes",
    title: "Notes",
    description: "Capture side information, issues, and important callouts.",
  },
  {
    id: "custom",
    title: "Custom tags",
    description: "Your saved tags live here and stay available across sessions.",
  },
];

const createBuiltinTag = (tag: TagDefinition): TagDefinition => ({
  ...tag,
  source: "builtin",
  shortcut: tag.shortcut ? { ...tag.shortcut } : undefined,
});

export const DEFAULT_TAGS: TagDefinition[] = [
  createBuiltinTag({
    id: "task",
    label: "Task",
    openTag: "<TASK>",
    closeTag: "</TASK>",
    hint: "What should the model do?",
    groupId: "core",
    shortcut: {
      key: "T",
      displayLabel: "Ctrl/Cmd+Shift+T",
    },
    source: "builtin",
  }),
  createBuiltinTag({
    id: "output",
    label: "Output",
    openTag: "<OUTPUT>",
    closeTag: "</OUTPUT>",
    hint: "Required output format.",
    groupId: "core",
    shortcut: {
      key: "O",
      displayLabel: "Ctrl/Cmd+Shift+O",
    },
    source: "builtin",
  }),
  createBuiltinTag({
    id: "reference",
    label: "Reference",
    openTag: "<REFERENCE>",
    closeTag: "</REFERENCE>",
    hint: "Relevant context, sources, or links.",
    groupId: "context",
    shortcut: {
      key: "R",
      displayLabel: "Ctrl/Cmd+Shift+R",
    },
    source: "builtin",
  }),
  createBuiltinTag({
    id: "example",
    label: "Example",
    openTag: "<EXAMPLE>",
    closeTag: "</EXAMPLE>",
    hint: "Show the desired style or output.",
    groupId: "context",
    shortcut: {
      key: "E",
      displayLabel: "Ctrl/Cmd+Shift+E",
    },
    source: "builtin",
  }),
  createBuiltinTag({
    id: "details",
    label: "Details",
    openTag: "<DETAILS>",
    closeTag: "</DETAILS>",
    hint: "Extra specifics or background.",
    groupId: "context",
    shortcut: {
      key: "D",
      displayLabel: "Ctrl/Cmd+Shift+D",
    },
    source: "builtin",
  }),
  createBuiltinTag({
    id: "criteria",
    label: "Criteria",
    openTag: "<CRITERIA>",
    closeTag: "</CRITERIA>",
    hint: "Rules or quality checks.",
    groupId: "guardrails",
    shortcut: {
      key: "C",
      displayLabel: "Ctrl/Cmd+Shift+C",
    },
    source: "builtin",
  }),
  createBuiltinTag({
    id: "constraints",
    label: "Constraints",
    openTag: "<CONSTRAINTS>",
    closeTag: "</CONSTRAINTS>",
    hint: "Limits or things to avoid.",
    groupId: "guardrails",
    shortcut: {
      key: "N",
      displayLabel: "Ctrl/Cmd+Shift+N",
    },
    source: "builtin",
  }),
  createBuiltinTag({
    id: "issue",
    label: "Issue",
    openTag: "<ISSUE>",
    closeTag: "</ISSUE>",
    hint: "Problem statement or bug report.",
    groupId: "notes",
    shortcut: {
      key: "I",
      displayLabel: "Ctrl/Cmd+Shift+I",
    },
    source: "builtin",
  }),
  createBuiltinTag({
    id: "comment",
    label: "Comment",
    openTag: "<COMMENT>",
    closeTag: "</COMMENT>",
    hint: "Notes, observations, or side remarks.",
    groupId: "notes",
    shortcut: {
      key: "M",
      displayLabel: "Ctrl/Cmd+Shift+M",
    },
    source: "builtin",
  }),
  createBuiltinTag({
    id: "important-note",
    label: "Important note",
    openTag: "<IMPORTANT_NOTE>",
    closeTag: "</IMPORTANT_NOTE>",
    hint: "Critical details or warnings.",
    groupId: "notes",
    shortcut: {
      key: "P",
      displayLabel: "Ctrl/Cmd+Shift+P",
    },
    source: "builtin",
  }),
];

export const DEFAULT_TAGS_BY_ID = new Map(DEFAULT_TAGS.map((tag) => [tag.id, tag]));

export const createDefaultTags = () =>
  DEFAULT_TAGS.map((tag) => ({
    ...tag,
    shortcut: tag.shortcut ? { ...tag.shortcut } : undefined,
  }));
