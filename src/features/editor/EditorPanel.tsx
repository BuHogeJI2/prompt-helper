import type { RefObject } from "react";

import CustomTagPopover from "@/features/editor/CustomTagPopover";
import PromptOutline from "@/features/editor/PromptOutline";
import type { PromptSection } from "@/features/editor/parsePromptSections";
import type { TagDefinition } from "@/types/tags";

interface IEditorPanelProps {
  editorText: string;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  status: string;
  onEditorTextChange: (text: string) => void;
  outlineSections: PromptSection[];
  currentSection: PromptSection | undefined;
  onSelectionChange: () => void;
  onNavigate: (section: PromptSection) => void;
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
  outlineSections,
  currentSection,
  onSelectionChange,
  onNavigate,
  onClearRequest,
  isCustomTagOpen,
  onCustomTagOpenChange,
  onInsertTag,
}: IEditorPanelProps) {
  return (
    <section
      aria-label="Prompt workspace"
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/65 bg-white/80 shadow-panel"
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="order-2 flex min-h-0 min-w-0 flex-1 lg:order-1">
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
              onChange={(event) => {
                onEditorTextChange(event.target.value);
                onSelectionChange();
              }}
              onSelect={onSelectionChange}
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
              className="min-h-0 w-full flex-1 resize-none border-0 bg-[#fffdf9] p-4 text-sm leading-7 text-cinder focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ember/25 sm:p-5"
            />
          </CustomTagPopover>
        </div>
        <div className="order-1 flex min-h-0 shrink-0 flex-col lg:order-2">
          <PromptOutline
            sections={outlineSections}
            currentSection={currentSection}
            onNavigate={onNavigate}
          />
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-ink/8 px-3 py-2 text-xs text-cinder/60 sm:px-4">
        <p
          role="status"
          aria-label="Editor status"
          aria-live="polite"
          aria-atomic="true"
          className="min-h-4 text-moss"
        >
          {status}
        </p>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden xl:inline">
            Alt+Shift+letter: built-in tags · Alt+Shift+U: custom tag
          </span>
          <span className="tabular-nums">{editorText.length} characters</span>
          <button
            type="button"
            onClick={onClearRequest}
            className="rounded-lg px-2 py-1.5 font-medium text-rose-900 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300/60"
          >
            Clear editor
          </button>
        </div>
      </div>
    </section>
  );
}
