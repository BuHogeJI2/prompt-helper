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
      className={`flex min-h-[3.25rem] items-center gap-1 rounded-[1rem] border border-ink/10 bg-white p-1.5 transition motion-reduce:transition-none ${
        isDragSource ? "z-10 opacity-60 shadow-panel" : ""
      } ${
        isDropTarget && !isDragSource
          ? "outline outline-2 outline-offset-2 outline-ember/60 shadow-soft"
          : ""
      }`}
    >
      <button
        type="button"
        aria-label={`Insert ${tag.label} block`}
        onClick={() => onInsertTag(tag)}
        className="flex h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-[0.75rem] px-2.5 text-left transition hover:bg-sand/55 focus:outline-none focus:ring-2 focus:ring-ember/30 motion-reduce:transition-none"
      >
        <code className="min-w-0 truncate text-xs font-medium text-cinder">{tag.openTag}</code>
        {shortcutLabel ? (
          <span className="shrink-0 rounded-full bg-cinder px-2 py-1 text-[9px] font-semibold uppercase leading-4 tracking-[0.04em] text-white">
            {shortcutLabel}
          </span>
        ) : null}
      </button>

      <InfoPopover label={`About ${tag.openTag}`} title={tag.label}>
        {tag.hint ? <p>{tag.hint}</p> : null}
        <div className="rounded-xl border border-ink/8 bg-[#fffaf3] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cinder/55">
            Generated block
          </p>
          <code className="mt-2 block whitespace-pre-wrap text-xs leading-5 text-cinder">
            {`${tag.openTag}\n\n${tag.closeTag}`}
          </code>
        </div>
        {shortcutLabel ? (
          <p>
            Keyboard shortcut: <span className="font-semibold text-cinder">{shortcutLabel}</span>
          </p>
        ) : null}
      </InfoPopover>

      {isReorderable ? (
        <button
          ref={setHandleRef}
          type="button"
          aria-label={`Reorder ${tag.label} block`}
          aria-describedby={instructionId}
          className={`inline-flex size-10 shrink-0 touch-none items-center justify-center rounded-full border text-cinder transition focus:outline-none focus:ring-2 focus:ring-ember/40 motion-reduce:transition-none ${
            isDragSource
              ? "cursor-grabbing border-ember/40 bg-ember/15 shadow-soft"
              : "cursor-grab border-ink/10 bg-sand/70 hover:border-ember/35 hover:bg-sand"
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
