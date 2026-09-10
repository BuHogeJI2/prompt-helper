import type { RefObject } from "react";

import type { TagDefinition } from "@/types/tags";

interface ITagListProps {
  tags: TagDefinition[];
  selectedId: string | null;
  createButtonRef: RefObject<HTMLButtonElement | null>;
  onCreateNew: () => void;
  onSelectTag: (tag: TagDefinition) => void;
}

export default function TagList({
  tags,
  selectedId,
  createButtonRef,
  onCreateNew,
  onSelectTag,
}: ITagListProps) {
  return (
    <aside className="border-b border-line bg-canvas p-3 md:min-h-full md:border-b-0 md:border-r">
      <button
        ref={createButtonRef}
        type="button"
        onClick={onCreateNew}
        className={`w-full border px-3 py-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none ${
          selectedId === null
            ? "border-accent bg-accent/10"
            : "border-control bg-surface hover:border-muted hover:bg-hover"
        }`}
      >
        <span className="block text-xs font-medium text-foreground">Create new tag</span>
        <span className="mt-1 block text-xs leading-5 text-muted">
          Start a custom tag using the shared form.
        </span>
      </button>

      <div className="mt-3 space-y-1.5">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onSelectTag(tag)}
            className={`w-full border px-3 py-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none ${
              selectedId === tag.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-control bg-surface hover:border-muted hover:bg-hover"
            }`}
          >
            <div className="flex min-w-0 items-start justify-between gap-2">
              <span className="min-w-0 text-xs font-medium [overflow-wrap:anywhere]">
                {tag.label}
              </span>
              <span
                className={`shrink-0 px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                  selectedId === tag.id ? "bg-surface text-foreground" : "bg-elevated text-muted"
                }`}
              >
                {tag.source === "builtin" ? "Built-in" : "Custom"}
              </span>
            </div>
            <span
              className={`mt-1.5 block break-all text-xs leading-5 ${
                selectedId === tag.id ? "text-foreground" : "text-muted"
              }`}
            >
              {tag.openTag}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
