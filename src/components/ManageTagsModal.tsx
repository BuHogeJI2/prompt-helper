import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import { STATUS_TIMEOUT_MS } from "@/constants/app";
import { createDefaultTags } from "@/constants/tags";
import type { TagDefinition } from "@/types/tags";
import { buildTagPair, createTagId } from "@/utils/tags";

type ManageTagsModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tags: TagDefinition[];
  setTags: Dispatch<SetStateAction<TagDefinition[]>>;
};

const EMPTY_FORM = {
  label: "",
  hint: "",
};

export default function ManageTagsModal({
  isOpen,
  onOpenChange,
  tags,
  setTags,
}: ManageTagsModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState("");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const feedbackTimeoutRef = useRef<number | null>(null);

  const selectedTag = useMemo(
    () => tags.find((tag) => tag.id === selectedId) ?? null,
    [selectedId, tags],
  );

  const nextTagPreview = useMemo(() => buildTagPair(form.label), [form.label]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const showFeedback = (message: string) => {
    setFeedback(message);
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(""), STATUS_TIMEOUT_MS);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);

    if (!open) {
      setSelectedId(null);
      setForm(EMPTY_FORM);
      setFeedback("");
      setIsResetConfirmOpen(false);
    }
  };

  const handleSelectTag = (tag: TagDefinition) => {
    setSelectedId(tag.id);
    setForm({
      label: tag.label,
      hint: tag.hint ?? "",
    });
  };

  const handleCreateNew = () => {
    setSelectedId(null);
    setForm(EMPTY_FORM);
  };

  const handleTagDelete = (id: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
    setSelectedId(null);
    setForm(EMPTY_FORM);
    showFeedback("Tag deleted.");
  };

  const handleTagReset = () => {
    setTags(createDefaultTags());
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setIsResetConfirmOpen(false);
    showFeedback("Default tags restored.");
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/55 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] flex max-h-[88vh] w-[min(94vw,72rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2rem] border border-white/40 bg-[#fcf7ef] shadow-[0_40px_90px_-45px_rgba(13,27,30,0.62)] focus:outline-none">
            <div className="flex items-start justify-between gap-4 border-b border-ink/8 px-5 py-5 md:px-6">
              <div className="space-y-2">
                <Dialog.Title className="text-2xl font-semibold text-cinder">
                  Manage tags
                </Dialog.Title>
                <Dialog.Description className="max-w-2xl text-sm leading-6 text-cinder/66">
                  Edit any saved tag, create a new one from the same form, or reset the
                  collection back to the built-in defaults.
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-full border border-ink/12 bg-white px-3 py-2 text-sm font-semibold text-cinder transition hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-ember/30">
                Close
              </Dialog.Close>
            </div>

            <div className="grid gap-0 overflow-y-auto md:grid-cols-[18rem_minmax(0,1fr)]">
              <aside className="border-b border-ink/8 bg-white/55 p-4 md:border-b-0 md:border-r">
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className={`w-full rounded-[1.2rem] border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-ember/30 ${
                    selectedId === null
                      ? "border-ember/35 bg-ember/10"
                      : "border-ink/10 bg-white hover:border-ink/15"
                  }`}
                >
                  <span className="block text-sm font-semibold text-cinder">Create new tag</span>
                  <span className="mt-1 block text-xs text-cinder/58">
                    Start a custom tag using the shared form.
                  </span>
                </button>

                <div className="mt-4 space-y-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleSelectTag(tag)}
                      className={`w-full rounded-[1.2rem] border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-ember/30 ${
                        selectedId === tag.id
                          ? "border-cinder bg-cinder text-white"
                          : "border-ink/10 bg-white hover:border-ink/15"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{tag.label}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                            selectedId === tag.id
                              ? "bg-white/15 text-white"
                              : "bg-sand/75 text-cinder/55"
                          }`}
                        >
                          {tag.source === "builtin" ? "Built-in" : "Custom"}
                        </span>
                      </div>
                      <span
                        className={`mt-2 block text-xs ${
                          selectedId === tag.id ? "text-white/75" : "text-cinder/55"
                        }`}
                      >
                        {tag.openTag}
                      </span>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="p-5 md:p-6">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cinder/45">
                        {selectedTag ? "Edit tag" : "New tag"}
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-cinder">
                        {selectedTag ? selectedTag.label : "Create a custom tag"}
                      </h3>
                    </div>
                    {feedback ? (
                      <span className="rounded-full border border-moss/15 bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
                        {feedback}
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <form
                      className="space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();

                        const label = form.label.trim();
                        const hint = form.hint.trim();
                        const { openTag, closeTag } = buildTagPair(label);

                        if (!label || !openTag || !closeTag) {
                          showFeedback("Enter a tag name to generate the pair.");
                          return;
                        }

                        if (selectedId) {
                          setTags((prev) =>
                            prev.map((tag) =>
                              tag.id === selectedId
                                ? {
                                    ...tag,
                                    label,
                                    hint: hint || undefined,
                                    openTag,
                                    closeTag,
                                  }
                                : tag,
                            ),
                          );
                          showFeedback("Tag updated.");
                          return;
                        }

                        const existingIds = new Set(tags.map((tag) => tag.id));
                        const id = createTagId(label, existingIds);

                        setTags((prev) => [
                          ...prev,
                          {
                            id,
                            label,
                            hint: hint || undefined,
                            openTag,
                            closeTag,
                            source: "user",
                            groupId: "custom",
                          },
                        ]);
                        setSelectedId(id);
                        setForm({
                          label,
                          hint,
                        });
                        showFeedback("Tag added.");
                      }}
                    >
                      <label className="block text-sm font-semibold text-cinder">
                        Tag
                        <input
                          value={form.label}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              label: event.target.value,
                            }))
                          }
                          placeholder="Example: Writing brief"
                          className="mt-2 w-full rounded-[1.2rem] border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-cinder focus:border-ember/35 focus:outline-none focus:ring-2 focus:ring-ember/20"
                        />
                      </label>

                      <label className="block text-sm font-semibold text-cinder">
                        Hint
                        <textarea
                          value={form.hint}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              hint: event.target.value,
                            }))
                          }
                          rows={4}
                          placeholder="Describe when this tag should be used."
                          className="mt-2 w-full resize-none rounded-[1.2rem] border border-ink/10 bg-white px-4 py-3 text-sm leading-6 text-cinder focus:border-ember/35 focus:outline-none focus:ring-2 focus:ring-ember/20"
                        />
                      </label>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          className="rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ember/92 focus:outline-none focus:ring-2 focus:ring-ember/30"
                        >
                          {selectedTag ? "Save changes" : "Add tag"}
                        </button>
                        {selectedTag ? (
                          <button
                            type="button"
                            onClick={() => handleTagDelete(selectedTag.id)}
                            className="rounded-full border border-rose-300 bg-white px-5 py-2.5 text-sm font-semibold text-rose-900 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300/50"
                          >
                            Delete tag
                          </button>
                        ) : null}
                      </div>
                    </form>

                    <div className="space-y-4 rounded-[1.5rem] border border-ink/10 bg-white p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cinder/45">
                          Generated pair
                        </p>
                        <p className="mt-2 text-sm leading-6 text-cinder/63">
                          Open and close tags are always derived automatically from the tag
                          name.
                        </p>
                      </div>

                      <div className="space-y-3 rounded-[1.2rem] bg-[#f7f2e8] p-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cinder/45">
                            Open
                          </p>
                          <code className="mt-1 block text-sm text-cinder">
                            {nextTagPreview.openTag || "<TAG_NAME>"}
                          </code>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cinder/45">
                            Close
                          </p>
                          <code className="mt-1 block text-sm text-cinder">
                            {nextTagPreview.closeTag || "</TAG_NAME>"}
                          </code>
                        </div>
                      </div>

                      <div className="rounded-[1.2rem] border border-ink/10 bg-[#fffaf2] p-4">
                        <p className="text-sm font-semibold text-cinder">Reset defaults</p>
                        <p className="mt-2 text-sm leading-6 text-cinder/63">
                          This restores the built-in tag set and removes custom tags and
                          edits.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsResetConfirmOpen(true)}
                          className="mt-4 rounded-full border border-ink/12 bg-white px-4 py-2 text-sm font-semibold text-cinder transition hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-ember/30"
                        >
                          Reset defaults
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmationDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="Reset all tags?"
        description="This will remove custom tags and revert edited built-in tags back to the default set."
        confirmLabel="Reset tags"
        onConfirm={handleTagReset}
      />
    </>
  );
}
