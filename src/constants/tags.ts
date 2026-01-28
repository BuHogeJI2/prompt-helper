import type { TagDefinition } from "@/types/tags";

export const DEFAULT_TAGS: TagDefinition[] = [
  {
    id: "task",
    label: "Task",
    openTag: "<TASK>",
    closeTag: "</TASK>",
    hint: "What should the model do?",
  },
  {
    id: "reference",
    label: "Reference",
    openTag: "<REFERENCE>",
    closeTag: "</REFERENCE>",
    hint: "Relevant context, sources, or links.",
  },
  {
    id: "example",
    label: "Example",
    openTag: "<EXAMPLE>",
    closeTag: "</EXAMPLE>",
    hint: "Show the desired style or output.",
  },
  {
    id: "criteria",
    label: "Criteria",
    openTag: "<CRITERIA>",
    closeTag: "</CRITERIA>",
    hint: "Rules or quality checks.",
  },
  {
    id: "constraints",
    label: "Constraints",
    openTag: "<CONSTRAINTS>",
    closeTag: "</CONSTRAINTS>",
    hint: "Limits or things to avoid.",
  },
  {
    id: "output",
    label: "Output",
    openTag: "<OUTPUT>",
    closeTag: "</OUTPUT>",
    hint: "Required output format.",
  },
  {
    id: "details",
    label: "Details",
    openTag: "<DETAILS>",
    closeTag: "</DETAILS>",
    hint: "Extra specifics or background.",
  },
  {
    id: "issue",
    label: "Issue",
    openTag: "<ISSUE>",
    closeTag: "</ISSUE>",
    hint: "Problem statement or bug report.",
  },
  {
    id: "comment",
    label: "Comment",
    openTag: "<COMMENT>",
    closeTag: "</COMMENT>",
    hint: "Notes, observations, or side remarks.",
  },
  {
    id: "important-note",
    label: "Important note",
    openTag: "<IMPORTANT_NOTE>",
    closeTag: "</IMPORTANT_NOTE>",
    hint: "Critical details or warnings.",
  },
];
