import type { TagDefinition } from "@/types/tags";

interface ITagListProps {
  tags: TagDefinition[];
  selectedId: string | null;
  onCreateNew: () => void;
  onSelectTag: (tag: TagDefinition) => void;
}

export default function TagList({ tags, selectedId, onCreateNew, onSelectTag }: ITagListProps) {
  return (
    <aside className="border-b border-ink/8 bg-white/55 p-4 md:border-b-0 md:border-r">
      <button
        type="button"
        onClick={onCreateNew}
        className={`w-full rounded-[1.2rem] border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-ember/30 ${
          selectedId === null
            ? "border-ember/35 bg-ember/10"
            : "border-ink/10 bg-white hover:border-ink/15"
        }`}
      >
        <span className="block text-sm font-semibold text-cinder">Create new tag</span>
        <span className="mt-1 block text-xs text-cinder/58">
          Start a custom tag using the shared form.
        </span>
      </button>

      <div className="mt-4 space-y-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onSelectTag(tag)}
            className={`w-full rounded-[1.2rem] border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-ember/30 ${
              selectedId === tag.id
                ? "border-cinder bg-cinder text-white"
                : "border-ink/10 bg-white hover:border-ink/15"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{tag.label}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  selectedId === tag.id ? "bg-white/15 text-white" : "bg-sand/75 text-cinder/55"
                }`}
              >
                {tag.source === "builtin" ? "Built-in" : "Custom"}
              </span>
            </div>
            <span
              className={`mt-2 block text-xs ${
                selectedId === tag.id ? "text-white/75" : "text-cinder/55"
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
