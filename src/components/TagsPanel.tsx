import type { TagDefinition } from "@/types/tags";

type TagsPanelProps = {
  tags: TagDefinition[];
  insertTag: (tag: TagDefinition) => void;
};

export default function TagsPanel({ tags, insertTag }: TagsPanelProps) {
  return (
    <aside className="rounded-2xl border border-fog bg-white/80 p-4 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Tags</p>
        <span className="text-xs text-ink/40">{tags.length}</span>
      </div>
      <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => insertTag(tag)}
            className="flex w-full flex-col rounded-xl border border-transparent bg-linen px-3 py-2 text-left transition hover:border-ember/40 hover:bg-white"
          >
            <span className="text-sm font-semibold text-ink">{tag.label}</span>
            <span className="text-xs text-ink/50">{tag.openTag}</span>
            {tag.hint ? <span className="text-[11px] text-ink/40">{tag.hint}</span> : null}
          </button>
        ))}
      </div>
    </aside>
  );
}
