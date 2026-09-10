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
    <div className="p-4">
      <div className="flex min-w-0 flex-col gap-4">
        <button type="button" onClick={onBack} className="button w-fit md:hidden">
          <span aria-hidden="true">←</span>&nbsp; All tags
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
              {selectedTag ? "Edit tag" : "New tag"}
            </p>
            <h3 className="mt-1 text-base font-medium text-foreground [overflow-wrap:anywhere]">
              {selectedTag ? selectedTag.label : "Create a custom tag"}
            </h3>
          </div>
          <span
            aria-live="polite"
            className={
              feedback
                ? "border border-success/40 bg-success/10 px-2 py-1 text-xs text-success"
                : "sr-only"
            }
          >
            {feedback}
          </span>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
          <form
            className="min-w-0 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <label className="block text-xs font-medium text-foreground">
              Tag
              <input
                ref={tagInputRef}
                value={draft.label}
                onChange={(event) => onDraftChange({ ...draft, label: event.target.value })}
                placeholder="Example: Writing brief"
                className="field mt-1.5"
              />
            </label>

            <label className="block text-xs font-medium text-foreground">
              Hint
              <textarea
                value={draft.hint}
                onChange={(event) => onDraftChange({ ...draft, hint: event.target.value })}
                rows={4}
                placeholder="Describe when this tag should be used."
                className="field mt-1.5 resize-none leading-6"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="button button-primary">
                {selectedTag ? "Save changes" : "Add tag"}
              </button>
              {selectedTag ? (
                <button type="button" onClick={onDelete} className="button button-danger">
                  Delete tag
                </button>
              ) : null}
            </div>
          </form>

          <div className="min-w-0 space-y-4 border-t border-line pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
                Generated pair
              </p>
              <p className="mt-2 text-xs leading-5 text-muted">
                Open and close tags are always derived automatically from the tag name.
              </p>
            </div>

            <div className="space-y-3 border border-line bg-canvas p-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Open</p>
                <code className="mt-1 block break-all text-xs leading-5 text-foreground">
                  {preview.openTag || "<TAG_NAME>"}
                </code>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Close</p>
                <code className="mt-1 block break-all text-xs leading-5 text-foreground">
                  {preview.closeTag || "</TAG_NAME>"}
                </code>
              </div>
            </div>

            <div className="border-t border-line pt-3">
              <p className="text-xs font-medium text-foreground">Reset defaults</p>
              <p className="mt-2 text-xs leading-5 text-muted">
                This restores the built-in tag set and removes custom tags and edits.
              </p>
              <button type="button" onClick={onResetRequest} className="button mt-3">
                Reset defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
