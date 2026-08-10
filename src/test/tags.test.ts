import { describe, expect, it } from "vitest";

import { createDefaultTags } from "@/constants/tags";
import type { TagDefinition, TagGroupId } from "@/types/tags";
import { normalizeStoredTags, reorderTagsWithinGroup } from "@/utils/tags";

const createTag = (id: string, groupId: TagGroupId): TagDefinition => ({
  id,
  label: id,
  openTag: `<${id}>`,
  closeTag: `</${id}>`,
  groupId,
  source: "builtin",
});

const createInterleavedTags = () => [
  createTag("core-a", "core"),
  createTag("context-a", "context"),
  createTag("core-b", "core"),
  createTag("notes-a", "notes"),
  createTag("core-c", "core"),
];

describe("tag ordering", () => {
  it.each([
    {
      fromIndex: 0,
      toIndex: 2,
      expectedIds: ["core-b", "context-a", "core-c", "notes-a", "core-a"],
    },
    {
      fromIndex: 2,
      toIndex: 0,
      expectedIds: ["core-c", "context-a", "core-a", "notes-a", "core-b"],
    },
  ])(
    "moves a tag from $fromIndex to $toIndex within its group",
    ({ fromIndex, toIndex, expectedIds }) => {
      const tags = createInterleavedTags();

      const reordered = reorderTagsWithinGroup(tags, "core", fromIndex, toIndex);

      expect(reordered.map((tag) => tag.id)).toEqual(expectedIds);
      expect(reordered[1]).toBe(tags[1]);
      expect(reordered[3]).toBe(tags[3]);
      expect(reordered.every((tag) => tags.includes(tag))).toBe(true);
    },
  );

  it.each([
    { fromIndex: 0, toIndex: 0 },
    { fromIndex: -1, toIndex: 1 },
    { fromIndex: 0, toIndex: 3 },
    { fromIndex: 0.5, toIndex: 1 },
    { fromIndex: 0, toIndex: Number.NaN },
  ])("returns the original array for an invalid or unchanged move", ({ fromIndex, toIndex }) => {
    const tags = createInterleavedTags();

    expect(reorderTagsWithinGroup(tags, "core", fromIndex, toIndex)).toBe(tags);
  });

  it("keeps a reordered sequence through storage normalization", () => {
    const reordered = reorderTagsWithinGroup(createDefaultTags(), "notes", 2, 0);
    const storedValue = JSON.parse(JSON.stringify(reordered)) as unknown;

    expect(normalizeStoredTags(storedValue).map((tag) => tag.id)).toEqual(
      reordered.map((tag) => tag.id),
    );
  });
});

describe("tag storage normalization", () => {
  it("restores built-in metadata and upgrades valid legacy custom tags", () => {
    const normalized = normalizeStoredTags([
      {
        id: "task",
        label: "Renamed task",
        openTag: "<RENAMED_TASK>",
        closeTag: "</RENAMED_TASK>",
        hint: "Updated hint",
      },
      {
        id: "legacy-custom",
        label: "Legacy custom",
        openTag: "<LEGACY_CUSTOM>",
        closeTag: "</LEGACY_CUSTOM>",
      },
      { id: "invalid-custom" },
    ]);

    expect(normalized).toHaveLength(2);
    expect(normalized[0]).toMatchObject({
      id: "task",
      label: "Renamed task",
      groupId: "core",
      source: "builtin",
      shortcut: { key: "T" },
    });
    expect(normalized[1]).toMatchObject({
      id: "legacy-custom",
      groupId: "custom",
      source: "user",
    });
  });

  it("falls back to fresh defaults when stored data has no valid tags", () => {
    expect(normalizeStoredTags([])).toEqual(createDefaultTags());
    expect(normalizeStoredTags("invalid")).toEqual(createDefaultTags());
  });
});
