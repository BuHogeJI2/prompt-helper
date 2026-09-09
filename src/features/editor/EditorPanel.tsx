import type { RefObject } from "react";

import CustomTagPopover from "@/features/editor/CustomTagPopover";
import type { TagDefinition } from "@/types/tags";

interface IEditorPanelProps {
  editorText: string;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  status: string;
  onEditorTextChange: (text: string) => void;
  onCopy: () => void;
  onClearRequest: () => void;
  isCustomTagOpen: boolean;
  onCustomTagOpenChange: (open: boolean) => void;
  onInsertTag: (tag: Pick<TagDefinition, "openTag" | "closeTag">) => void;
}

export default function EditorPanel({
  editorText,
  editorRef,
  status,
  onEditorTextChange,
  onCopy,
  onClearRequest,
  isCustomTagOpen,
  onCustomTagOpenChange,
  onInsertTag,
}: IEditorPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/65 bg-white/80 p-5 shadow-panel backdrop-blur md:p-6">
      <div className="flex flex-col gap-4 border-b border-ink/8 pb-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cinder/65">Editor</p>
          <h2 className="text-2xl font-semibold text-cinder">Compose with visible structure.</h2>
          <p className="max-w-2xl text-sm leading-6 text-cinder/70">
            Insert a block and start writing between its tags.
          </p>
        </div>

        <div className="flex min-w-fit flex-col items-start gap-2 md:items-end">
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <span className="rounded-full border border-ink/10 bg-sand/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cinder/70">
              {editorText.length} characters
            </span>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center justify-center rounded-full bg-ember px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ember/85 focus:outline-none focus:ring-2 focus:ring-ember/30 motion-reduce:transition-none"
            >
              Quick copy
            </button>
          </div>
          <p
            role="status"
            aria-label="Editor status"
            aria-live="polite"
            aria-atomic="true"
            className="min-h-5 text-xs font-medium text-moss"
          >
            {status}
          </p>
        </div>
      </div>

      <CustomTagPopover
        open={isCustomTagOpen}
        onOpenChange={onCustomTagOpenChange}
        editorRef={editorRef}
        onInsertTag={onInsertTag}
      >
        <textarea
          ref={editorRef}
          aria-label="Prompt editor"
          value={editorText}
          onChange={(event) => onEditorTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.nativeEvent.isComposing ||
              event.repeat ||
              !event.altKey ||
              !event.shiftKey ||
              event.ctrlKey ||
              event.metaKey ||
              event.code !== "KeyU"
            ) {
              return;
            }

            event.preventDefault();
            onCustomTagOpenChange(true);
          }}
          aria-keyshortcuts="Alt+Shift+U"
          placeholder="Start with a Task block, then layer the rest of the prompt around it."
          className="mt-5 h-[58vh] min-h-[26rem] w-full resize-none rounded-[1.65rem] border border-ink/10 bg-[#fffdf9] p-5 text-sm leading-7 text-cinder shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] focus:border-ember/45 focus:outline-none focus:ring-2 focus:ring-ember/25"
        />
      </CustomTagPopover>

      <div className="mt-4 flex flex-col gap-3 border-t border-ink/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-cinder/70">
          Use Enter for new lines, Alt+Shift+letter for built-in tags, and Alt+Shift+U for a custom
          tag.
        </p>
        <button
          type="button"
          onClick={onClearRequest}
          className="inline-flex shrink-0 items-center justify-center self-start rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300/60 motion-reduce:transition-none sm:self-auto"
        >
          Clear editor
        </button>
      </div>
    </section>
  );
}
