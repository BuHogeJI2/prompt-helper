import { useCallback, useEffect, useMemo, useState } from "react";

import { TAG_GROUPS, createDefaultTags } from "@/constants/tags";
import type { ITagDraft } from "@/features/tags/types";
import type { TagDefinition, TagGroupId } from "@/types/tags";
import { loadTags, saveTags } from "@/utils/storage";
import { buildTagPair, createTagId, reorderTagsWithinGroup } from "@/utils/tags";

const normalizeDraft = (draft: ITagDraft) => {
  const label = draft.label.trim();
  const hint = draft.hint.trim();
  const pair = buildTagPair(label);

  if (!label || !pair.openTag || !pair.closeTag) return null;

  return { label, hint, ...pair };
};

export function useTagCollection() {
  const [tags, setTags] = useState<TagDefinition[]>(() => loadTags());

  useEffect(() => {
    saveTags(tags);
  }, [tags]);

  const sections = useMemo(
    () =>
      TAG_GROUPS.map((group) => ({
        group,
        tags: tags.filter((tag) => tag.groupId === group.id),
      })).filter((section) => section.tags.length > 0),
    [tags],
  );

  const customTagsCount = useMemo(() => tags.filter((tag) => tag.source === "user").length, [tags]);

  const createTag = useCallback(
    (draft: ITagDraft) => {
      const normalized = normalizeDraft(draft);
      if (!normalized) return null;

      const id = createTagId(normalized.label, new Set(tags.map((tag) => tag.id)));
      const tag: TagDefinition = {
        id,
        label: normalized.label,
        hint: normalized.hint || undefined,
        openTag: normalized.openTag,
        closeTag: normalized.closeTag,
        source: "user",
        groupId: "custom",
      };

      setTags((current) => [...current, tag]);
      return tag;
    },
    [tags],
  );

  const updateTag = useCallback((id: string, draft: ITagDraft) => {
    const normalized = normalizeDraft(draft);
    if (!normalized) return false;

    setTags((current) =>
      current.map((tag) =>
        tag.id === id
          ? {
              ...tag,
              label: normalized.label,
              hint: normalized.hint || undefined,
              openTag: normalized.openTag,
              closeTag: normalized.closeTag,
            }
          : tag,
      ),
    );

    return true;
  }, []);

  const deleteTag = useCallback((id: string) => {
    setTags((current) => current.filter((tag) => tag.id !== id));
  }, []);

  const reorderTag = useCallback((groupId: TagGroupId, fromIndex: number, toIndex: number) => {
    setTags((current) => reorderTagsWithinGroup(current, groupId, fromIndex, toIndex));
  }, []);

  const resetTags = useCallback(() => {
    setTags(createDefaultTags());
  }, []);

  return {
    tags,
    sections,
    customTagsCount,
    createTag,
    updateTag,
    deleteTag,
    reorderTag,
    resetTags,
  };
}
