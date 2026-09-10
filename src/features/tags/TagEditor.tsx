import { type RefObject, useMemo } from "react";

import type { ITagDraft } from "@/features/tags/types";
import type { TagDefinition } from "@/types/tags";
import { buildTagPair } from "@/utils/tags";

interface ITagEditorProps {
  selectedTag: TagDefinition | null;
  draft: ITagDraft;
  feedback: string;
  tagInputRef: RefObject<HTMLInputElement | null>;
  onBack: () => void;
  onDraftChange: (draft: ITagDraft) => void;
  onSubmit: () => void;
  onDelete: () => void;
  onResetRequest: () => void;
}

export default function TagEditor({
  selectedTag,
  draft,
  feedback,
  tagInputRef,
  onBack,
  onDraftChange,
  onSubmit,
  onDelete,
  onResetRequest,
}: ITagEditorProps) {
  const preview = useMemo(() => buildTagPair(draft.label), [draft.label]);

  return (
    <div className="p-5 md:p-6">
      <div className="flex flex-col gap-6">
        <button type="button" onClick={onBack} className="button w-fit md:hidden">
          <span aria-hidden="true">←</span>&nbsp; All tags
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              {selectedTag ? "Edit tag" : "New tag"}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">
              {selectedTag ? selectedTag.label : "Create a custom tag"}
            </h3>
          </div>
          <span
            aria-live="polite"
            className={
              feedback
                ? "border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success"
                : "sr-only"
            }
          >
            {feedback}
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <label className="block text-sm font-semibold text-foreground">
              Tag
              <input
                ref={tagInputRef}
                value={draft.label}
                onChange={(event) => onDraftChange({ ...draft, label: event.target.value })}
                placeholder="Example: Writing brief"
                className="field mt-2 px-4 py-3"
              />
            </label>

            <label className="block text-sm font-semibold text-foreground">
              Hint
              <textarea
                value={draft.hint}
                onChange={(event) => onDraftChange({ ...draft, hint: event.target.value })}
                rows={4}
                placeholder="Describe when this tag should be used."
                className="field mt-2 resize-none px-4 py-3 leading-6"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="button button-primary px-5 py-2.5">
                {selectedTag ? "Save changes" : "Add tag"}
              </button>
              {selectedTag ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="button button-danger px-5 py-2.5"
                >
                  Delete tag
                </button>
              ) : null}
            </div>
          </form>

          <div className="space-y-4 border border-line bg-surface p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Generated pair
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Open and close tags are always derived automatically from the tag name.
              </p>
            </div>

            <div className="space-y-3 bg-canvas p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Open
                </p>
                <code className="mt-1 block text-sm text-foreground">
                  {preview.openTag || "<TAG_NAME>"}
                </code>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Close
                </p>
                <code className="mt-1 block text-sm text-foreground">
                  {preview.closeTag || "</TAG_NAME>"}
                </code>
              </div>
            </div>

            <div className="border border-line bg-canvas p-4">
              <p className="text-sm font-semibold text-foreground">Reset defaults</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                This restores the built-in tag set and removes custom tags and edits.
              </p>
              <button type="button" onClick={onResetRequest} className="button mt-4 px-4">
                Reset defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
