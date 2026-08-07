import { useMemo } from "react";

import type { ITagDraft } from "@/features/tags/types";
import type { TagDefinition } from "@/types/tags";
import { buildTagPair } from "@/utils/tags";

interface ITagEditorProps {
  selectedTag: TagDefinition | null;
  draft: ITagDraft;
  feedback: string;
  onDraftChange: (draft: ITagDraft) => void;
  onSubmit: () => void;
  onDelete: () => void;
  onResetRequest: () => void;
}

export default function TagEditor({
  selectedTag,
  draft,
  feedback,
  onDraftChange,
  onSubmit,
  onDelete,
  onResetRequest,
}: ITagEditorProps) {
  const preview = useMemo(() => buildTagPair(draft.label), [draft.label]);

  return (
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
          <span
            aria-live="polite"
            className={
              feedback
                ? "rounded-full border border-moss/15 bg-moss/10 px-3 py-1 text-xs font-semibold text-moss"
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
            <label className="block text-sm font-semibold text-cinder">
              Tag
              <input
                value={draft.label}
                onChange={(event) => onDraftChange({ ...draft, label: event.target.value })}
                placeholder="Example: Writing brief"
                className="mt-2 w-full rounded-[1.2rem] border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-cinder focus:border-ember/35 focus:outline-none focus:ring-2 focus:ring-ember/20"
              />
            </label>

            <label className="block text-sm font-semibold text-cinder">
              Hint
              <textarea
                value={draft.hint}
                onChange={(event) => onDraftChange({ ...draft, hint: event.target.value })}
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
                  onClick={onDelete}
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
                Open and close tags are always derived automatically from the tag name.
              </p>
            </div>

            <div className="space-y-3 rounded-[1.2rem] bg-[#f7f2e8] p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cinder/45">
                  Open
                </p>
                <code className="mt-1 block text-sm text-cinder">
                  {preview.openTag || "<TAG_NAME>"}
                </code>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cinder/45">
                  Close
                </p>
                <code className="mt-1 block text-sm text-cinder">
                  {preview.closeTag || "</TAG_NAME>"}
                </code>
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-ink/10 bg-[#fffaf2] p-4">
              <p className="text-sm font-semibold text-cinder">Reset defaults</p>
              <p className="mt-2 text-sm leading-6 text-cinder/63">
                This restores the built-in tag set and removes custom tags and edits.
              </p>
              <button
                type="button"
                onClick={onResetRequest}
                className="mt-4 rounded-full border border-ink/12 bg-white px-4 py-2 text-sm font-semibold text-cinder transition hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-ember/30"
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
