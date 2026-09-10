import { type RefObject, useState } from "react";

import CustomTagPopover from "@/features/editor/CustomTagPopover";
import PromptOutline from "@/features/editor/PromptOutline";
import type { MoveDirection } from "@/features/editor/organizePrompt";
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
  tags: TagDefinition[];
  hasSelection: boolean;
  onWrapSelection: (tag: Pick<TagDefinition, "openTag" | "closeTag">) => void;
  onMoveSection: (direction: MoveDirection) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
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
  tags,
  hasSelection,
  onWrapSelection,
  onMoveSection,
  canMoveUp,
  canMoveDown,
}: IEditorPanelProps) {
  const [tagMode, setTagMode] = useState<"insert" | "wrap">("insert");
  return (
    <section
      aria-label="Prompt workspace"
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-line bg-surface"
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-3 py-2 sm:px-4">
        <button
          type="button"
          disabled={!hasSelection}
          onClick={() => {
            setTagMode("wrap");
            onCustomTagOpenChange(true);
          }}
          className="button shrink-0 py-1.5"
        >
          Wrap selection
        </button>
        <span className="text-xs text-muted">
          {hasSelection
            ? "Choose a tag for the selected text."
            : "Select text to wrap it in a tag."}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="order-2 flex min-h-0 min-w-0 flex-1 lg:order-1">
          <CustomTagPopover
            open={isCustomTagOpen}
            onOpenChange={onCustomTagOpenChange}
            editorRef={editorRef}
            onInsertTag={tagMode === "wrap" ? onWrapSelection : onInsertTag}
            mode={tagMode}
            tags={tagMode === "wrap" ? tags : undefined}
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
                setTagMode("insert");
                onCustomTagOpenChange(true);
              }}
              aria-keyshortcuts="Alt+Shift+U"
              placeholder="Start with a Task block, then layer the rest of the prompt around it."
              className="min-h-0 w-full flex-1 resize-none border-0 bg-canvas p-4 text-sm leading-7 text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent sm:p-5"
            />
          </CustomTagPopover>
        </div>
        <div className="order-1 flex min-h-0 shrink-0 flex-col lg:order-2">
          <PromptOutline
            sections={outlineSections}
            currentSection={currentSection}
            onNavigate={onNavigate}
            onMoveSection={onMoveSection}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          />
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line px-3 py-2 text-xs text-muted sm:px-4">
        <p
          role="status"
          aria-label="Editor status"
          aria-live="polite"
          aria-atomic="true"
          className="min-h-4 text-success"
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
            className="button button-danger px-2 py-1.5"
          >
            Clear editor
          </button>
        </div>
      </div>
    </section>
  );
}
