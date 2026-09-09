import { describe, expect, it } from "vitest";

import {
  getMoveTarget,
  movePromptSection,
  wrapPromptSelection,
} from "@/features/editor/organizePrompt";
import { getPromptSections } from "@/features/editor/parsePromptSections";

const tag = { openTag: "<NOTE>", closeTag: "</NOTE>" };

describe("wrapping existing text", () => {
  it("preserves partial-line text, whitespace, and backward selection", () => {
    const text = "Before  first\nsecond  after";
    const selection = { start: 7, end: 20, direction: "backward" as const };
    const edit = wrapPromptSelection(text, selection, tag)!;

    expect(edit.text).toBe("Before \n<NOTE>\n first\nsecond\n</NOTE>\n  after");
    expect(edit.text.slice(edit.selection.start, edit.selection.end)).toBe(text.slice(7, 20));
    expect(edit.selection.direction).toBe("backward");
    expect(getPromptSections(edit.text)[0].isComplete).toBe(true);
  });

  it.each(["\n", "\r\n"])("keeps existing line endings with %j", (newline) => {
    const text = `first${newline}second${newline}`;
    const edit = wrapPromptSelection(text, { start: 0, end: text.length, direction: "none" }, tag)!;
    expect(edit.text).toBe(`<NOTE>${newline}${text}</NOTE>${newline}`);
    expect(edit.text.slice(edit.selection.start, edit.selection.end)).toBe(text);
  });

  it("does not add an extra line before trailing text already on its own line", () => {
    expect(
      wrapPromptSelection("Note\nAfter", { start: 0, end: 4, direction: "none" }, tag)?.text,
    ).toBe("<NOTE>\nNote\n</NOTE>\nAfter");
    expect(wrapPromptSelection("Note", { start: 2, end: 2, direction: "none" }, tag)).toBeNull();
  });
});

describe("moving prompt sections", () => {
  it.each(["\n", "\r\n"])(
    "moves nested contents and indentation, preserving surrounding text with %j",
    (newline) => {
      const first = ["  <TASK>", "Text", "    <NOTE>", "Nested", "    </NOTE>", "  </TASK>  "].join(
        newline,
      );
      const second = ["<OUTPUT>", "Result", "</OUTPUT>"].join(newline);
      const prefix = `Intro${newline}`;
      const gap = `${newline}${newline}Between${newline}`;
      const text = prefix + first + gap + second;
      const selection = {
        start: text.indexOf("Nested"),
        end: text.indexOf("Nested") + 6,
        direction: "backward" as const,
      };
      const sections = getPromptSections(text);
      const edit = movePromptSection(text, sections, sections[0], "down", selection)!;

      expect(edit.text).toBe(prefix + second + gap + first);
      expect(edit.text.slice(edit.selection.start, edit.selection.end)).toBe("Nested");
      expect(edit.selection.direction).toBe("backward");
      const movedSections = getPromptSections(edit.text);
      expect(
        movePromptSection(edit.text, movedSections, movedSections[1], "up", edit.selection)?.text,
      ).toBe(text);
    },
  );

  it("moves repeated nested siblings without crossing parent boundaries", () => {
    const text =
      "<TASK>\n<NOTE>\nFirst\n</NOTE>\n<NOTE>\nSecond\n</NOTE>\n</TASK>\n<OUTPUT>\n<NOTE>\nThird\n</NOTE>\n</OUTPUT>";
    const sections = getPromptSections(text);
    const edit = movePromptSection(text, sections, sections[2], "up", {
      start: 0,
      end: 0,
      direction: "none",
    })!;

    expect(edit.text).toBe(
      text.replace("First", "TEMP").replace("Second", "First").replace("TEMP", "Second"),
    );
    expect(edit.selection.start).toBe(edit.text.indexOf("Second"));
    expect(getMoveTarget(sections, sections[1], "up")).toBeUndefined();
    expect(getMoveTarget(sections, sections[2], "down")).toBeUndefined();
    expect(getMoveTarget(sections, sections[4], "up")).toBeUndefined();
  });

  it.each([
    "<BROKEN>\nUnclosed",
    "<BROKEN>\n<INNER>\nMissing close\n</BROKEN>",
    "<BROKEN>\n</UNKNOWN>\n</BROKEN>",
  ])("does not move across an incomplete or malformed section: %s", (broken) => {
    const text = `<TASK>\nValid\n</TASK>\n${broken}`;
    const sections = getPromptSections(text);
    expect(sections[0].isComplete).toBe(true);
    expect(sections[1].isComplete).toBe(false);
    expect(getMoveTarget(sections, sections[0], "down")).toBeUndefined();
    expect(
      movePromptSection(text, sections, sections[1], "up", { start: 0, end: 0, direction: "none" }),
    ).toBeNull();
  });

  it("keeps code examples inside their section and ignores their tag-like contents", () => {
    const first = "<TASK>\n```xml\n<EXAMPLE>\n</OTHER>\n```\n</TASK>";
    const second = "<OUTPUT>\nResult\n</OUTPUT>";
    const text = `${first}\n${second}`;
    const sections = getPromptSections(text);
    expect(sections).toHaveLength(2);
    expect(
      movePromptSection(text, sections, sections[0], "down", {
        start: 7,
        end: 7,
        direction: "none",
      })?.text,
    ).toBe(`${second}\n${first}`);
  });
});
