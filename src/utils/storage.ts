import { DEFAULT_TAGS } from "@/constants/tags";
import { STORAGE_KEYS } from "@/constants/storage";
import type { TagDefinition } from "@/types/tags";

export function loadTags() {
  if (typeof window === "undefined") return DEFAULT_TAGS;

  const raw = window.localStorage.getItem(STORAGE_KEYS.tags);
  if (!raw) return DEFAULT_TAGS;

  try {
    const parsed = JSON.parse(raw) as TagDefinition[];
    return parsed.length ? parsed : DEFAULT_TAGS;
  } catch {
    return DEFAULT_TAGS;
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
