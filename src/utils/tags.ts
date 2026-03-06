import { createDefaultTags, DEFAULT_TAGS_BY_ID } from "@/constants/tags";
import type {
  LegacyTagDefinition,
  TagDefinition,
  TagShortcut,
  TagSource,
} from "@/types/tags";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown) => (typeof value === "string" ? value : "");

const trimOrUndefined = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const createTagId = (label: string, existingIds: Set<string>) => {
  const baseId = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const fallback = `tag-${Date.now()}`;

  const baseSlug = baseId || fallback;
  let candidate = baseSlug;
  let counter = 2;

  while (existingIds.has(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
};

export const slugifyTagLabel = (label: string) =>
  label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");

export const buildTagPair = (label: string) => {
  const slug = slugifyTagLabel(label);

  return {
    openTag: slug ? `<${slug}>` : "",
    closeTag: slug ? `</${slug}>` : "",
  };
};

const normalizeBuiltInTag = (
  storedTag: Record<string, unknown>,
  fallback: TagDefinition,
): TagDefinition => ({
  ...fallback,
  label: readString(storedTag.label).trim() || fallback.label,
  openTag: readString(storedTag.openTag).trim() || fallback.openTag,
  closeTag: readString(storedTag.closeTag).trim() || fallback.closeTag,
  hint: trimOrUndefined(readString(storedTag.hint)) ?? fallback.hint,
});

const normalizeUserTag = (storedTag: Record<string, unknown>): TagDefinition | null => {
  const id = readString(storedTag.id).trim();
  const label = readString(storedTag.label).trim();
  const openTag = readString(storedTag.openTag).trim();
  const closeTag = readString(storedTag.closeTag).trim();
  const hint = trimOrUndefined(readString(storedTag.hint));

  if (!id || !label || !openTag || !closeTag) {
    return null;
  }

  const source: TagSource = "user";

  return {
    id,
    label,
    openTag,
    closeTag,
    hint,
    groupId: "custom",
    source,
  };
};

const normalizeStoredTag = (value: unknown): TagDefinition | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id).trim();
  if (!id) {
    return null;
  }

  const fallback = DEFAULT_TAGS_BY_ID.get(id);
  if (fallback) {
    return normalizeBuiltInTag(value, fallback);
  }

  return normalizeUserTag(value);
};

export const normalizeStoredTags = (value: unknown) => {
  if (!Array.isArray(value)) {
    return createDefaultTags();
  }

  const normalized = value
    .map((tag) => normalizeStoredTag(tag as LegacyTagDefinition))
    .filter((tag): tag is TagDefinition => tag !== null);

  return normalized.length ? normalized : createDefaultTags();
};

export const formatShortcutLabel = (shortcut: TagShortcut) => shortcut.displayLabel;
