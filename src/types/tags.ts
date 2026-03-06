export type TagGroupId = "core" | "context" | "guardrails" | "notes" | "custom";

export type TagSource = "builtin" | "user";

export type TagShortcut = {
  key: string;
  displayLabel: string;
};

export type TagDefinition = {
  id: string;
  label: string;
  openTag: string;
  closeTag: string;
  hint?: string;
  groupId: TagGroupId;
  source: TagSource;
  shortcut?: TagShortcut;
};

export type TagGroup = {
  id: TagGroupId;
  title: string;
  description: string;
};

export type LegacyTagDefinition = {
  id: string;
  label: string;
  openTag: string;
  closeTag: string;
  hint?: string;
};
