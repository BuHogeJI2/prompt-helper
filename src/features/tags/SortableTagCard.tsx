import { useSortable } from "@dnd-kit/react/sortable";

import { useCallback } from "react";

import InfoPopover from "@/features/tags/InfoPopover";
import type { TagDefinition } from "@/types/tags";
import { formatShortcutLabel } from "@/utils/tags";

interface ISortableTagCardProps {
  tag: TagDefinition;
  index: number;
  groupTitle: string;
  itemCount: number;
  isReorderable: boolean;
  instructionId: string;
  onInsertTag: (tag: TagDefinition) => void;
  onHandleRef: (tagId: string, element: HTMLButtonElement | null) => void;
}

export default function SortableTagCard({
  tag,
  index,
  groupTitle,
  itemCount,
  isReorderable,
  instructionId,
  onInsertTag,
  onHandleRef,
}: ISortableTagCardProps) {
  const { ref, handleRef, isDragSource, isDropTarget } = useSortable({
    id: tag.id,
    index,
    disabled: !isReorderable,
    data: {
      label: tag.label,
      groupTitle,
      itemCount,
    },
  });
  const setHandleRef = useCallback(
    (element: HTMLButtonElement | null) => {
      handleRef(element);
      onHandleRef(tag.id, element);
    },
    [handleRef, onHandleRef, tag.id],
  );
  const shortcutLabel = tag.shortcut ? formatShortcutLabel(tag.shortcut) : null;

  return (
    <li
      ref={isReorderable ? ref : undefined}
      data-tag-id={tag.id}
      className={`flex min-h-[3.25rem] items-center gap-1 border border-line bg-surface p-1.5 transition motion-reduce:transition-none ${
        isDragSource ? "z-10 opacity-60" : ""
      } ${
        isDropTarget && !isDragSource ? "outline outline-2 outline-offset-2 outline-accent" : ""
      }`}
    >
      <button
        type="button"
        aria-label={`Insert ${tag.label} block`}
        onClick={() => onInsertTag(tag)}
        className="flex h-10 min-w-0 flex-1 items-center justify-between gap-2 px-2.5 text-left transition hover:bg-hover focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none"
      >
        <code className="min-w-0 truncate text-xs font-medium text-foreground">{tag.openTag}</code>
        {shortcutLabel ? (
          <span className="shrink-0 px-1 py-1 text-[10px] font-medium leading-4 text-muted">
            {shortcutLabel}
          </span>
        ) : null}
      </button>

      <InfoPopover label={`About ${tag.openTag}`} title={tag.label}>
        {tag.hint ? <p>{tag.hint}</p> : null}
        <div className="border border-line bg-canvas p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Generated block
          </p>
          <code className="mt-2 block whitespace-pre-wrap text-xs leading-5 text-foreground">
            {`${tag.openTag}\n\n${tag.closeTag}`}
          </code>
        </div>
        {shortcutLabel ? (
          <p>
            Keyboard shortcut:{" "}
            <span className="font-semibold text-foreground">{shortcutLabel}</span>
          </p>
        ) : null}
      </InfoPopover>

      {isReorderable ? (
        <button
          ref={setHandleRef}
          type="button"
          aria-label={`Reorder ${tag.label} block`}
          aria-describedby={instructionId}
          className={`inline-flex size-10 shrink-0 touch-none items-center justify-center border text-foreground transition focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none ${
            isDragSource
              ? "cursor-grabbing border-accent bg-accent/15"
              : "cursor-grab border-control bg-elevated hover:border-accent hover:bg-hover"
          }`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
            <circle cx="8" cy="6" r="1.5" />
            <circle cx="16" cy="6" r="1.5" />
            <circle cx="8" cy="12" r="1.5" />
            <circle cx="16" cy="12" r="1.5" />
            <circle cx="8" cy="18" r="1.5" />
            <circle cx="16" cy="18" r="1.5" />
          </svg>
        </button>
      ) : null}
    </li>
  );
}
