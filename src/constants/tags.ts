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
];
