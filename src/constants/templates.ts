export interface PromptTemplate {
  id: string;
  name: string;
  text: string;
}

const createTemplateText = (sections: string[]) =>
  sections.map((section) => `<${section}>\n\n</${section}>\n`).join("\n");

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "bug",
    name: "Bug",
    text: createTemplateText(["TASK", "ISSUE", "DETAILS", "CRITERIA"]),
  },
  {
    id: "feature",
    name: "Feature",
    text: createTemplateText(["TASK", "DETAILS", "CONSTRAINTS", "CRITERIA"]),
  },
  {
    id: "refactor",
    name: "Refactor",
    text: createTemplateText(["TASK", "REFERENCE", "CONSTRAINTS", "CRITERIA"]),
  },
  {
    id: "question",
    name: "Question",
    text: createTemplateText(["TASK", "REFERENCE", "OUTPUT"]),
  },
];
