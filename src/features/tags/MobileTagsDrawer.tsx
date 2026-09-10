import * as Dialog from "@radix-ui/react-dialog";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

import TagsPanel from "@/features/tags/TagsPanel";
import type { ITagSection } from "@/features/tags/types";
import type { TagDefinition, TagGroupId } from "@/types/tags";

interface IMobileTagsDrawerProps {
  quickTags: TagDefinition[];
  sections: ITagSection[];
  editorRef: RefObject<HTMLTextAreaElement | null>;
  onInsertTag: (tag: TagDefinition) => void;
  onReorderTag: (groupId: TagGroupId, fromIndex: number, toIndex: number) => void;
  onOpenStateChange: (isOpen: boolean) => void;
}

export default function MobileTagsDrawer({
  quickTags,
  sections,
  editorRef,
  onInsertTag,
  onReorderTag,
  onOpenStateChange,
}: IMobileTagsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const insertedTagRef = useRef(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onOpenStateChange(isOpen);
  }, [isOpen, onOpenStateChange]);

  useEffect(
    () => () => {
      onOpenStateChange(false);
    },
    [onOpenStateChange],
  );

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen) insertedTagRef.current = false;
    setIsOpen(nextOpen);
  }, []);

  const handleDrawerInsertion = useCallback(
    (tag: TagDefinition) => {
      insertedTagRef.current = true;
      onInsertTag(tag);
      setIsOpen(false);
    },
    [onInsertTag],
  );

  const handleCloseAutoFocus = useCallback(
    (event: Event) => {
      if (!insertedTagRef.current) return;

      event.preventDefault();
      insertedTagRef.current = false;
      requestAnimationFrame(() => editorRef.current?.focus());
    },
    [editorRef],
  );

  const keepDrawerOpenDuringKeyboardDrag = useCallback((event: Event) => {
    if (contentRef.current?.querySelector('[aria-grabbed="true"]')) {
      event.preventDefault();
    }
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <section
        aria-label="Prompt block shortcuts"
        className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] gap-2 border border-line bg-surface p-2"
      >
        <div className="flex min-w-0 gap-1.5 overflow-x-auto">
          {quickTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              aria-label={`Insert ${tag.label} block`}
              onClick={() => onInsertTag(tag)}
              className="min-h-11 min-w-0 flex-1 truncate border border-control bg-canvas px-3 text-left text-xs font-medium text-foreground transition hover:border-accent hover:bg-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent motion-reduce:transition-none"
            >
              <code>{tag.openTag}</code>
            </button>
          ))}
        </div>

        <Dialog.Trigger asChild>
          <button type="button" className="button min-h-11 shrink-0">
            All blocks
          </button>
        </Dialog.Trigger>
      </section>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-canvas/80 data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in motion-reduce:animate-none" />
        <Dialog.Content
          ref={contentRef}
          onCloseAutoFocus={handleCloseAutoFocus}
          onEscapeKeyDown={keepDrawerOpenDuringKeyboardDrag}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] max-w-3xl flex-col border border-b-0 border-control bg-surface px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 outline-none data-[state=closed]:animate-sheet-down data-[state=open]:animate-sheet-up motion-reduce:animate-none sm:px-5"
        >
          <div aria-hidden="true" className="mx-auto h-1 w-12 bg-control" />
          <div className="flex min-h-14 items-center justify-between gap-3 px-1">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              All blocks
            </Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="button min-h-11">
                Close
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Select a prompt block to insert it, or reorder blocks within a group.
          </Dialog.Description>

          <div className="min-h-0 overflow-y-auto overscroll-contain pb-1">
            <TagsPanel
              variant="sheet"
              sections={sections}
              onInsertTag={handleDrawerInsertion}
              onReorderTag={onReorderTag}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
