import { describe, expect, it } from "vitest";

import { createDefaultTags } from "@/constants/tags";
import { normalizeStoredTags } from "@/utils/tags";

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
