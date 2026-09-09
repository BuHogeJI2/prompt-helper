import type { PromptSection } from "@/features/editor/parsePromptSections";
import type { TagDefinition } from "@/types/tags";

export type MoveDirection = "up" | "down";

export interface EditorSelection {
  start: number;
  end: number;
  direction: "forward" | "backward" | "none";
}

export function wrapPromptSelection(
  text: string,
  selection: EditorSelection,
  tag: Pick<TagDefinition, "openTag" | "closeTag">,
) {
  if (selection.start === selection.end) return null;
  const before = text.slice(0, selection.start);
  const selected = text.slice(selection.start, selection.end);
  const after = text.slice(selection.end);
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  const opening = `${before && !before.endsWith("\n") ? newline : ""}${tag.openTag}${newline}`;
  const closing = `${selected.endsWith("\n") ? "" : newline}${tag.closeTag}${after.startsWith("\n") || after.startsWith("\r\n") ? "" : newline}`;

  return {
    text: before + opening + selected + closing + after,
    selection: {
      ...selection,
      start: selection.start + opening.length,
      end: selection.end + opening.length,
    },
  };
}

export function getMoveTarget(
  sections: PromptSection[],
  section: PromptSection | undefined,
  direction: MoveDirection,
) {
  if (!section?.isComplete) return undefined;
  const siblings = sections.filter((candidate) => candidate.parentStart === section.parentStart);
  const index = siblings.indexOf(section);
  if (index < 0) return undefined;
  const target = siblings[index + (direction === "up" ? -1 : 1)];
  return target?.isComplete ? target : undefined;
}

function getSectionBounds(text: string, section: PromptSection) {
  const start = text.lastIndexOf("\n", section.start - 1) + 1;
  const newline = text.indexOf("\n", section.end);
  const lineEnd = newline < 0 ? text.length : newline;
  const end = text[lineEnd - 1] === "\r" ? lineEnd - 1 : lineEnd;
  return { start, end };
}

export function movePromptSection(
  text: string,
  sections: PromptSection[],
  section: PromptSection,
  direction: MoveDirection,
  selection: EditorSelection,
) {
  const target = getMoveTarget(sections, section, direction);
  if (!target) return null;
  const source = getSectionBounds(text, section);
  const destination = getSectionBounds(text, target);
  const [first, second] = direction === "up" ? [destination, source] : [source, destination];
  const firstText = text.slice(first.start, first.end);
  const secondText = text.slice(second.start, second.end);
  const between = text.slice(first.end, second.start);
  const newStart =
    direction === "up" ? first.start : first.start + secondText.length + between.length;
  const offset = newStart - source.start;
  const selectedInside = selection.start >= source.start && selection.end <= source.end;

  return {
    text: text.slice(0, first.start) + secondText + between + firstText + text.slice(second.end),
    selection: selectedInside
      ? { ...selection, start: selection.start + offset, end: selection.end + offset }
      : {
          start: section.contentStart + offset,
          end: section.contentStart + offset,
          direction: "none" as const,
        },
  };
}
