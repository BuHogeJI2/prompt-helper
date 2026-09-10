import { useCallback, useState } from "react";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import Header from "@/components/Header";
import EditorPanel from "@/features/editor/EditorPanel";
import { usePromptEditor } from "@/features/editor/usePromptEditor";
import ManageTagsModal from "@/features/tags/ManageTagsModal";
import MobileTagsDrawer from "@/features/tags/MobileTagsDrawer";
import TagsPanel from "@/features/tags/TagsPanel";
import { useTagCollection } from "@/features/tags/useTagCollection";
import { useTagHotkeys } from "@/features/tags/useTagHotkeys";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { TagDefinition } from "@/types/tags";

export default function App() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isMobileTagsOpen, setIsMobileTagsOpen] = useState(false);
  const [isCustomTagOpen, setIsCustomTagOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);

  const { tags, sections, createTag, updateTag, deleteTag, reorderTag, resetTags } =
    useTagCollection();

  const {
    editorText,
    editorRef,
    hasEditorContent,
    status,
    showStatus,
    updateEditorText,
    insertTag,
    copyPrompt,
    clearPrompt,
    outlineSections,
    currentSection,
    updateSelection,
    navigateToSection,
    hasSelection,
    wrapSelection,
    moveSection,
    canMoveUp,
    canMoveDown,
  } = usePromptEditor();

  const announceTagInsertion = useCallback(
    (tag: TagDefinition) => showStatus(`${tag.label} inserted.`),
    [showStatus],
  );

  useTagHotkeys({
    tags,
    disabled:
      isManageOpen || isClearConfirmOpen || isCustomTagOpen || (!isDesktop && isMobileTagsOpen),
    onInsertTag: insertTag,
    onTagInserted: announceTagInsertion,
  });

  const requestClear = () => {
    if (!hasEditorContent) {
      showStatus("Editor is already empty.");
      return;
    }

    setIsClearConfirmOpen(true);
  };

  const handleClear = () => {
    clearPrompt();
    setIsClearConfirmOpen(false);
  };

  const quickTags = sections.find((section) => section.group.id === "core")?.tags.slice(0, 2) ?? [];

  return (
    <div className="h-dvh overflow-hidden bg-canvas p-2 sm:p-3">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-2 sm:gap-3">
        <Header
          onManageTags={() => setIsManageOpen(true)}
          onCopy={copyPrompt}
          isDesktop={isDesktop}
          isPaletteOpen={isPaletteOpen}
          onTogglePalette={() => setIsPaletteOpen((open) => !open)}
        />

        <div className="flex min-h-0 flex-1 gap-3">
          <div className="order-2 flex min-h-0 min-w-0 flex-1 flex-col gap-2">
            {!isDesktop ? (
              <MobileTagsDrawer
                quickTags={quickTags}
                sections={sections}
                editorRef={editorRef}
                onInsertTag={insertTag}
                onReorderTag={reorderTag}
                onOpenStateChange={setIsMobileTagsOpen}
              />
            ) : null}
            <EditorPanel
              editorText={editorText}
              editorRef={editorRef}
              status={status}
              onEditorTextChange={updateEditorText}
              outlineSections={outlineSections}
              currentSection={currentSection}
              onSelectionChange={updateSelection}
              onNavigate={navigateToSection}
              onClearRequest={requestClear}
              isCustomTagOpen={isCustomTagOpen}
              onCustomTagOpenChange={setIsCustomTagOpen}
              onInsertTag={insertTag}
              tags={tags}
              hasSelection={hasSelection}
              onWrapSelection={wrapSelection}
              onMoveSection={moveSection}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
          </div>
          {isDesktop ? (
            <div
              id="tag-palette"
              hidden={!isPaletteOpen}
              className="order-1 w-80 shrink-0 overflow-y-auto overscroll-contain"
            >
              <TagsPanel sections={sections} onInsertTag={insertTag} onReorderTag={reorderTag} />
            </div>
          ) : null}
        </div>
      </div>

      <ManageTagsModal
        isOpen={isManageOpen}
        onOpenChange={setIsManageOpen}
        tags={tags}
        onCreateTag={createTag}
        onUpdateTag={updateTag}
        onDeleteTag={deleteTag}
        onResetTags={resetTags}
      />

      <ConfirmationDialog
        open={isClearConfirmOpen}
        onOpenChange={setIsClearConfirmOpen}
        title="Clear the editor?"
        description="This removes the current prompt from the editor. Your tags stay saved."
        confirmLabel="Clear editor"
        onConfirm={handleClear}
      />
    </div>
  );
}
