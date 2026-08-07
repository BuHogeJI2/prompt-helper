import * as Dialog from "@radix-ui/react-dialog";

import { useMemo, useState } from "react";

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
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const { status: feedback, showStatus, clearStatus } = useTransientStatus();

  const selectedTag = useMemo(
    () => tags.find((tag) => tag.id === selectedId) ?? null,
    [selectedId, tags],
  );

  const resetEditor = () => {
    setSelectedId(null);
    setDraft(EMPTY_DRAFT);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);

    if (!open) {
      resetEditor();
      clearStatus();
      setIsResetConfirmOpen(false);
    }
  };

  const handleSelectTag = (tag: TagDefinition) => {
    setSelectedId(tag.id);
    setDraft({ label: tag.label, hint: tag.hint ?? "" });
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
    showStatus("Tag deleted.");
  };

  const handleReset = () => {
    onResetTags();
    resetEditor();
    setIsResetConfirmOpen(false);
    showStatus("Default tags restored.");
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/55 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] flex max-h-[88vh] w-[min(94vw,72rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2rem] border border-white/40 bg-[#fcf7ef] shadow-[0_40px_90px_-45px_rgba(13,27,30,0.62)] focus:outline-none">
            <div className="flex items-start justify-between gap-4 border-b border-ink/8 px-5 py-5 md:px-6">
              <div className="space-y-2">
                <Dialog.Title className="text-2xl font-semibold text-cinder">
                  Manage tags
                </Dialog.Title>
                <Dialog.Description className="max-w-2xl text-sm leading-6 text-cinder/66">
                  Edit any saved tag, create a new one from the same form, or reset the collection
                  back to the built-in defaults.
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-full border border-ink/12 bg-white px-3 py-2 text-sm font-semibold text-cinder transition hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-ember/30">
                Close
              </Dialog.Close>
            </div>

            <div className="grid gap-0 overflow-y-auto md:grid-cols-[18rem_minmax(0,1fr)]">
              <TagList
                tags={tags}
                selectedId={selectedId}
                onCreateNew={resetEditor}
                onSelectTag={handleSelectTag}
              />
              <TagEditor
                selectedTag={selectedTag}
                draft={draft}
                feedback={feedback}
                onDraftChange={setDraft}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                onResetRequest={() => setIsResetConfirmOpen(true)}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmationDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="Reset all tags?"
        description="This will remove custom tags and revert edited built-in tags back to the default set."
        confirmLabel="Reset tags"
        onConfirm={handleReset}
      />
    </>
  );
}
