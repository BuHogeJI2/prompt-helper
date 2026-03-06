import { STORAGE_KEYS } from "@/constants/storage";
import { createDefaultTags } from "@/constants/tags";
import type { TagDefinition } from "@/types/tags";
import { normalizeStoredTags } from "@/utils/tags";

export function loadTags() {
  if (typeof window === "undefined") return createDefaultTags();

  const raw = window.localStorage.getItem(STORAGE_KEYS.tags);
  if (!raw) return createDefaultTags();

  try {
    const parsed = JSON.parse(raw) as TagDefinition[];
    return normalizeStoredTags(parsed);
  } catch {
    return createDefaultTags();
  }
}

export function loadEditor() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEYS.editor) ?? "";
}

export function saveEditor(text: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.editor, text);
}

export function saveTags(tags: TagDefinition[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(tags));
}
