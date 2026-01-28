import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { STATUS_TIMEOUT_MS } from "@/constants/app";
import { DEFAULT_TAGS } from "@/constants/tags";
import type { TagDefinition } from "@/types/tags";

const createTagId = (label: string, existingIds: Set<string>) => {
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

const slugifyLabel = (label: string) =>
  label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");

const buildTagPair = (label: string) => {
  const slug = slugifyLabel(label);
  return {
    openTag: slug ? `<${slug}>` : "",
    closeTag: slug ? `</${slug}>` : "",
  };
};

type ManageTagsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tags: TagDefinition[];
  setTags: Dispatch<SetStateAction<TagDefinition[]>>;
  setStatus: Dispatch<SetStateAction<string>>;
};

export default function ManageTagsModal({
  isOpen,
  onClose,
  tags,
  setTags,
  setStatus,
}: ManageTagsModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState({
    label: "",
    openTag: "",
    closeTag: "",
    hint: "",
  });
  const [editingTag, setEditingTag] = useState({
    label: "",
    openTag: "",
    closeTag: "",
    hint: "",
  });

  const editingSource = useMemo(
    () => tags.find((tag) => tag.id === editingId) ?? null,
    [editingId, tags],
  );

  if (!isOpen) return null;

  const handleTagDelete = (id: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingTag({ label: "", openTag: "", closeTag: "", hint: "" });
    }
  };

  const handleTagReset = () => {
    setTags(DEFAULT_TAGS);
    setStatus("Tags reset to defaults.");
    setTimeout(() => setStatus(""), STATUS_TIMEOUT_MS);
  };

  const handleTagAdd = () => {
    const label = newTag.label.trim();
    const openTag = newTag.openTag.trim();
    const closeTag = newTag.closeTag.trim();
    const hint = newTag.hint.trim();

    if (!label || !openTag || !closeTag) {
      setStatus("Add label, open tag, and close tag.");
      setTimeout(() => setStatus(""), STATUS_TIMEOUT_MS);
      return;
    }

    const existingIds = new Set(tags.map((tag) => tag.id));
    const id = createTagId(label, existingIds);

    setTags((prev) => [
      ...prev,
      {
        id,
        label,
        openTag,
        closeTag,
        hint: hint || undefined,
      },
    ]);
    setNewTag({ label: "", openTag: "", closeTag: "", hint: "" });
    setStatus("Tag added.");
    setTimeout(() => setStatus(""), STATUS_TIMEOUT_MS);
  };

  const handleEditSelect = (tag: TagDefinition) => {
    setEditingId(tag.id);
    setEditingTag({
      label: tag.label,
      openTag: tag.openTag,
      closeTag: tag.closeTag,
      hint: tag.hint ?? "",
    });
  };

  const handleEditChange = (label: string, hint: string) => {
    const { openTag, closeTag } = buildTagPair(label);
    setEditingTag({
      label,
      openTag,
      closeTag,
      hint,
    });
  };

  const handleEditSave = () => {
    if (!editingId) return;
    const label = editingTag.label.trim();
    const openTag = editingTag.openTag.trim();
    const closeTag = editingTag.closeTag.trim();
    const hint = editingTag.hint.trim();

    if (!label || !openTag || !closeTag) {
      setStatus("Add label, open tag, and close tag.");
      setTimeout(() => setStatus(""), STATUS_TIMEOUT_MS);
      return;
    }

    setTags((prev) =>
      prev.map((tag) =>
        tag.id === editingId
          ? { ...tag, label, openTag, closeTag, hint: hint || undefined }
          : tag,
      ),
    );
    setStatus("Tag updated.");
    setTimeout(() => setStatus(""), STATUS_TIMEOUT_MS);
  };

  const handleNewLabelChange = (label: string) => {
    const { openTag, closeTag } = buildTagPair(label);
    setNewTag((prev) => ({
      ...prev,
      label,
      openTag,
      closeTag,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-fog bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-ink/60">
            Manage tags
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/20 bg-white px-3 py-1 text-xs font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Close
          </button>
        </div>
        <div className="mt-4 space-y-4 text-xs text-ink/70">
          <div className="rounded-lg border border-fog/70 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/50">
              Edit tag
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleEditSelect(tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg ${
                    editingId === tag.id
                      ? "border-ember/40 bg-ember text-white"
                      : "border-ink/10 bg-white text-ink"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
            {editingSource ? (
              <div className="mt-3 grid gap-2">
                <label className="text-xs text-ink/60">
                  Tag
                  <input
                    value={editingTag.label}
                    onChange={(event) => handleEditChange(event.target.value, editingTag.hint)}
                    className="mt-1 w-full rounded-lg border border-fog bg-white/90 px-2 py-1 text-xs text-ink focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                  />
                </label>
                <label className="text-xs text-ink/60">
                  Open tag
                  <input
                    value={editingTag.openTag}
                    readOnly
                    className="mt-1 w-full rounded-lg border border-fog/60 bg-white/60 px-2 py-1 text-xs text-ink/70"
                  />
                </label>
                <label className="text-xs text-ink/60">
                  Close tag
                  <input
                    value={editingTag.closeTag}
                    readOnly
                    className="mt-1 w-full rounded-lg border border-fog/60 bg-white/60 px-2 py-1 text-xs text-ink/70"
                  />
                </label>
                <label className="text-xs text-ink/60">
                  Hint
                  <input
                    value={editingTag.hint}
                    onChange={(event) =>
                      handleEditChange(editingTag.label, event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-fog bg-white/90 px-2 py-1 text-xs text-ink focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleEditSave}
                    className="rounded-full border border-ink/10 bg-ember px-3 py-1 text-xs font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingId) handleTagDelete(editingId);
                    }}
                    disabled={!editingId}
                    className="rounded-full border border-ink/20 bg-white px-3 py-1 text-xs font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-ink/50">Select a tag to edit.</p>
            )}
          </div>
          <div className="rounded-lg border border-fog/70 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/50">
              New tag
            </p>
            <div className="mt-2 grid gap-2">
              <label className="text-xs text-ink/60">
                Tag
                <input
                  value={newTag.label}
                  onChange={(event) => handleNewLabelChange(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-fog bg-white/90 px-2 py-1 text-xs text-ink focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                />
              </label>
              <label className="text-xs text-ink/60">
                Open tag
                <input
                  value={newTag.openTag}
                  readOnly
                  className="mt-1 w-full rounded-lg border border-fog/60 bg-white/60 px-2 py-1 text-xs text-ink/70"
                />
              </label>
              <label className="text-xs text-ink/60">
                Close tag
                <input
                  value={newTag.closeTag}
                  readOnly
                  className="mt-1 w-full rounded-lg border border-fog/60 bg-white/60 px-2 py-1 text-xs text-ink/70"
                />
              </label>
              <label className="text-xs text-ink/60">
                Hint
                <input
                  value={newTag.hint}
                  onChange={(event) =>
                    setNewTag((prev) => ({
                      ...prev,
                      hint: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-fog bg-white/90 px-2 py-1 text-xs text-ink focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleTagAdd}
                className="rounded-full border border-ink/10 bg-ember px-3 py-1 text-xs font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Add tag
              </button>
              <button
                type="button"
                onClick={handleTagReset}
                className="rounded-full border border-ink/20 bg-white px-3 py-1 text-xs font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Reset defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
