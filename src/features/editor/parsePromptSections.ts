export interface PromptSection {
  name: string;
  start: number;
  contentStart: number;
  end: number;
  line: number;
  depth: number;
  parentStart: number | null;
  isComplete: boolean;
}

export function getPromptSections(text: string): PromptSection[] {
  const sections: PromptSection[] = [];
  const stack: PromptSection[] = [];
  const malformed = new Set<PromptSection>();
  let offset = 0;
  let fence: { marker: string; length: number } | null = null;

  for (const [lineIndex, line] of text.split("\n").entries()) {
    const trimmed = line.trim();
    const fenceMatch = /^(`{3,}|~{3,})(.*)$/.exec(trimmed);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      const length = fenceMatch[1].length;
      if (!fence) {
        fence = { marker, length };
      } else if (marker === fence.marker && length >= fence.length && !fenceMatch[2].trim()) {
        fence = null;
      }
    } else if (!fence) {
      // Standalone tags avoid treating inline code and prose as prompt sections.
      const tag = /^<(\/?)([\w][\w:.-]*)>$/.exec(trimmed);
      if (tag) {
        const start = offset + line.indexOf("<");
        if (!tag[1]) {
          const section: PromptSection = {
            name: tag[2],
            start,
            contentStart: Math.min(offset + line.length + 1, text.length),
            end: text.length + 1,
            line: lineIndex + 1,
            depth: stack.length,
            parentStart: stack.at(-1)?.start ?? null,
            isComplete: false,
          };
          sections.push(section);
          stack.push(section);
        } else {
          const matchIndex = stack.map((section) => section.name).lastIndexOf(tag[2]);
          if (matchIndex !== stack.length - 1 || matchIndex < 0) {
            stack.forEach((section) => malformed.add(section));
          }
          if (matchIndex >= 0) {
            for (const section of stack.splice(matchIndex)) {
              section.end = section.name === tag[2] ? start + trimmed.length : start;
              section.isComplete = section.name === tag[2] && !malformed.has(section);
            }
          }
        }
      }
    }
    offset += line.length + 1;
  }

  return sections;
}

export function getCurrentSection(sections: PromptSection[], position: number) {
  for (let index = sections.length - 1; index >= 0; index -= 1) {
    const section = sections[index];
    if (position >= section.start && position < section.end) return section;
  }
}
