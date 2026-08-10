import { useSortable } from "@dnd-kit/react/sortable";

import { useCallback } from "react";

import type { TagDefinition } from "@/types/tags";
import { formatShortcutLabel } from "@/utils/tags";

interface ISortableTagCardProps {
  tag: TagDefinition;
  index: number;
  groupTitle: string;
  itemCount: number;
  isReorderable: boolean;
  onInsertTag: (tag: TagDefinition) => void;
  onHandleRef: (tagId: string, element: HTMLButtonElement | null) => void;
}

export default function SortableTagCard({
  tag,
  index,
  groupTitle,
  itemCount,
  isReorderable,
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
      className={`relative min-h-[6.5rem] rounded-[1.15rem] transition motion-reduce:transition-none ${
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
        className={`flex h-full min-h-[6.5rem] w-full flex-col rounded-[1.15rem] border border-ink/10 bg-white px-3.5 py-3 text-left transition motion-safe:hover:-translate-y-0.5 hover:border-ember/35 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-ember/30 motion-reduce:transition-none ${
          isReorderable ? "pr-14" : ""
        }`}
      >
        <div className="flex flex-col items-start gap-2">
          <span className="text-sm font-semibold text-cinder">{tag.label}</span>
          {shortcutLabel ? (
            <span className="rounded-full bg-cinder px-2 py-1 text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-white">
              {shortcutLabel}
            </span>
          ) : null}
        </div>
        <code className="mt-2 text-[11px] text-cinder/70">{tag.openTag}</code>
        {tag.hint ? (
          <p className="mt-auto pt-2 text-xs leading-5 text-cinder/70">{tag.hint}</p>
        ) : null}
      </button>

      {isReorderable ? (
        <button
          ref={setHandleRef}
          type="button"
          aria-label={`Reorder ${tag.label} block`}
          className={`absolute right-2.5 top-2.5 inline-flex size-10 touch-none items-center justify-center rounded-full border text-cinder transition focus:outline-none focus:ring-2 focus:ring-ember/40 motion-reduce:transition-none ${
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
