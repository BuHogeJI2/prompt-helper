import * as Dialog from "@radix-ui/react-dialog";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import TagEditor from "@/features/tags/TagEditor";
import TagList from "@/features/tags/TagList";
import type { ITagDraft } from "@/features/tags/types";
import { useTransientStatus } from "@/hooks/useTransientStatus";
import type { TagDefinition } from "@/types/tags";

interface IManageTagsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tags: TagDefinition[];
  onCreateTag: (draft: ITagDraft) => TagDefinition | null;
  onUpdateTag: (id: string, draft: ITagDraft) => boolean;
  onDeleteTag: (id: string) => void;
  onResetTags: () => void;
}

const EMPTY_DRAFT: ITagDraft = {
  label: "",
  hint: "",
};

export default function ManageTagsModal({
  isOpen,
  onOpenChange,
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onResetTags,
}: IManageTagsModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [isEditorView, setIsEditorView] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const { status: feedback, showStatus, clearStatus } = useTransientStatus();

  const selectedTag = useMemo(
    () => tags.find((tag) => tag.id === selectedId) ?? null,
    [selectedId, tags],
  );

  const resetEditor = () => {
    setSelectedId(null);
    setDraft(EMPTY_DRAFT);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;

    if (isEditorView) {
      tagInputRef.current?.focus();
      return;
    }

    createButtonRef.current?.focus();
  }, [isEditorView, isOpen, selectedId]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);

    if (!open) {
      resetEditor();
      setIsEditorView(false);
      clearStatus();
      setIsDeleteConfirmOpen(false);
      setIsResetConfirmOpen(false);
    }
  };

  const handleCreateNew = () => {
    resetEditor();
    clearStatus();
    setIsEditorView(true);
  };

  const handleSelectTag = (tag: TagDefinition) => {
    setSelectedId(tag.id);
    setDraft({ label: tag.label, hint: tag.hint ?? "" });
    clearStatus();
    setIsEditorView(true);
  };

  const handleBackToList = () => {
    clearStatus();
    setIsEditorView(false);
  };

  const handleSubmit = () => {
    if (selectedId) {
      if (!onUpdateTag(selectedId, draft)) {
        showStatus("Enter a tag name to generate the pair.");
        return;
      }

      showStatus("Tag updated.");
      return;
    }

    const tag = onCreateTag(draft);
    if (!tag) {
      showStatus("Enter a tag name to generate the pair.");
      return;
    }

    setSelectedId(tag.id);
    setDraft({ label: tag.label, hint: tag.hint ?? "" });
    showStatus("Tag added.");
  };

  const handleDelete = () => {
    if (!selectedId) return;
    onDeleteTag(selectedId);
    resetEditor();
    setIsEditorView(false);
    setIsDeleteConfirmOpen(false);
    showStatus("Tag deleted.");
  };

  const handleReset = () => {
    onResetTags();
    resetEditor();
    setIsEditorView(false);
    setIsResetConfirmOpen(false);
    showStatus("Default tags restored.");
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-canvas/80" />
          <Dialog.Content
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              createButtonRef.current?.focus();
            }}
            className="fixed left-1/2 top-1/2 z-[60] flex max-h-[88vh] w-[min(94vw,72rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden border border-control bg-surface focus:outline-none"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 md:px-6">
              <div className="space-y-2">
                <Dialog.Title className="text-2xl font-semibold text-foreground">
                  Manage tags
                </Dialog.Title>
                <Dialog.Description className="max-w-2xl text-sm leading-6 text-muted">
                  Create, edit, delete, or restore prompt blocks.
                </Dialog.Description>
              </div>
              <Dialog.Close className="button">Close</Dialog.Close>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 overflow-hidden md:grid-cols-[18rem_minmax(0,1fr)]">
              <div
                className={`${isEditorView ? "hidden" : "block"} min-h-0 overflow-y-auto md:block`}
              >
                <TagList
                  tags={tags}
                  selectedId={selectedId}
                  createButtonRef={createButtonRef}
                  onCreateNew={handleCreateNew}
                  onSelectTag={handleSelectTag}
                />
              </div>
              <div
                className={`${isEditorView ? "block" : "hidden"} min-h-0 overflow-y-auto md:block`}
              >
                <TagEditor
                  selectedTag={selectedTag}
                  draft={draft}
                  feedback={feedback}
                  tagInputRef={tagInputRef}
                  onBack={handleBackToList}
                  onDraftChange={setDraft}
                  onSubmit={handleSubmit}
                  onDelete={() => setIsDeleteConfirmOpen(true)}
                  onResetRequest={() => setIsResetConfirmOpen(true)}
                />
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title={`Delete ${selectedTag?.label ?? "this tag"}?`}
        description="This removes the tag from the palette and cannot be undone. Your editor content will not change."
        confirmLabel="Delete tag"
        onConfirm={handleDelete}
        confirmFocusRef={createButtonRef}
      />

      <ConfirmationDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="Reset all tags?"
        description="This will remove custom tags and revert edited built-in tags back to the default set."
        confirmLabel="Reset tags"
        onConfirm={handleReset}
        confirmFocusRef={createButtonRef}
      />
    </>
  );
}
