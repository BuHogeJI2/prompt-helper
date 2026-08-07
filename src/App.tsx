import { useCallback, useState } from "react";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import Header from "@/components/Header";
import EditorPanel from "@/features/editor/EditorPanel";
import { usePromptEditor } from "@/features/editor/usePromptEditor";
import ManageTagsModal from "@/features/tags/ManageTagsModal";
import TagsPanel from "@/features/tags/TagsPanel";
import { useTagCollection } from "@/features/tags/useTagCollection";
import { useTagHotkeys } from "@/features/tags/useTagHotkeys";
import type { TagDefinition } from "@/types/tags";

export default function App() {
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const { tags, sections, customTagsCount, createTag, updateTag, deleteTag, resetTags } =
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
  } = usePromptEditor();

  const announceTagInsertion = useCallback(
    (tag: TagDefinition) => showStatus(`${tag.label} inserted.`),
    [showStatus],
  );

  useTagHotkeys({
    tags,
    disabled: isManageOpen || isClearConfirmOpen,
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

  return (
    <div className="min-h-screen bg-page px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:gap-6">
        <Header
          onManageTags={() => setIsManageOpen(true)}
          totalTags={tags.length}
          customTagsCount={customTagsCount}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-start">
          <TagsPanel sections={sections} onInsertTag={insertTag} />
          <EditorPanel
            editorText={editorText}
            editorRef={editorRef}
            status={status}
            onEditorTextChange={updateEditorText}
            onCopy={copyPrompt}
            onClearRequest={requestClear}
          />
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
