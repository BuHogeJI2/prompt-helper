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
    <aside className="border-b border-line bg-surface p-4 md:border-b-0 md:border-r">
      <button
        ref={createButtonRef}
        type="button"
        onClick={onCreateNew}
        className={`w-full border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none ${
          selectedId === null
            ? "border-accent bg-accent/10"
            : "border-control bg-surface hover:border-muted hover:bg-hover"
        }`}
      >
        <span className="block text-sm font-semibold text-foreground">Create new tag</span>
        <span className="mt-1 block text-xs text-muted">
          Start a custom tag using the shared form.
        </span>
      </button>

      <div className="mt-4 space-y-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onSelectTag(tag)}
            className={`w-full border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none ${
              selectedId === tag.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-control bg-surface hover:border-muted hover:bg-hover"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{tag.label}</span>
              <span
                className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  selectedId === tag.id ? "bg-surface text-foreground" : "bg-elevated text-muted"
                }`}
              >
                {tag.source === "builtin" ? "Built-in" : "Custom"}
              </span>
            </div>
            <span
              className={`mt-2 block text-xs ${
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
