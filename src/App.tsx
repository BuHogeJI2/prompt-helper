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

  const {
    tags,
    sections,
    customTagsCount,
    createTag,
    updateTag,
    deleteTag,
    reorderTag,
    resetTags,
  } = useTagCollection();

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
    <div className="min-h-screen bg-page px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:gap-6">
        <Header
          onManageTags={() => setIsManageOpen(true)}
          totalTags={tags.length}
          customTagsCount={customTagsCount}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="min-w-0 lg:order-2">
            {!isDesktop ? (
              <div className="mb-3">
                <MobileTagsDrawer
                  quickTags={quickTags}
                  sections={sections}
                  editorRef={editorRef}
                  onInsertTag={insertTag}
                  onReorderTag={reorderTag}
                  onOpenStateChange={setIsMobileTagsOpen}
                />
              </div>
            ) : null}
            <EditorPanel
              editorText={editorText}
              editorRef={editorRef}
              status={status}
              onEditorTextChange={updateEditorText}
              onCopy={copyPrompt}
              onClearRequest={requestClear}
              isCustomTagOpen={isCustomTagOpen}
              onCustomTagOpenChange={setIsCustomTagOpen}
              onInsertTag={insertTag}
            />
          </div>
          {isDesktop ? (
            <div className="min-w-0 lg:order-1">
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
