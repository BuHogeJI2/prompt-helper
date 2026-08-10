import * as Accordion from "@radix-ui/react-accordion";

import SortableTagGroup from "@/features/tags/SortableTagGroup";
import type { ITagSection } from "@/features/tags/types";
import type { TagDefinition, TagGroupId } from "@/types/tags";

interface ITagsPanelProps {
  sections: ITagSection[];
  onInsertTag: (tag: TagDefinition) => void;
  onReorderTag: (groupId: TagGroupId, fromIndex: number, toIndex: number) => void;
}

export default function TagsPanel({ sections, onInsertTag, onReorderTag }: ITagsPanelProps) {
  return (
    <section className="rounded-[1.7rem] border border-white/60 bg-white/75 p-4 shadow-panel backdrop-blur md:p-5">
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cinder/65">
            Prompt blocks
          </p>
          <div>
            <h2 className="text-xl font-semibold text-cinder">Choose a block.</h2>
            <p className="max-w-2xl text-sm leading-6 text-cinder/70">
              Select a tag to insert it at the cursor, or use its handle to reorder the group.
            </p>
          </div>
        </div>
        <div className="max-w-sm rounded-[1.2rem] border border-sand/80 bg-sand/60 px-3 py-2 text-xs font-medium leading-5 text-cinder/72">
          Alt+Shift+letter inserts built-ins. To reorder, focus a handle and use Space, arrows, then
          Space.
        </div>
      </div>

      <Accordion.Root type="multiple" defaultValue={["core"]} className="mt-4 space-y-2.5">
        {sections.map((section) => (
          <Accordion.Item
            key={section.group.id}
            value={section.group.id}
            className="overflow-hidden rounded-[1.3rem] border border-ink/8 bg-[#fffaf3]"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-white/80 md:px-5 motion-reduce:transition-none">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-cinder">
                      {section.group.title}
                    </span>
                    <span className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cinder/65">
                      {section.tags.length}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-cinder/70 sm:text-sm">
                    {section.group.description}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="text-cinder/65 transition group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                >
                  ▼
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="border-t border-ink/8 px-4 pb-3 pt-3 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none md:px-5">
              <SortableTagGroup
                section={section}
                onInsertTag={onInsertTag}
                onReorderTag={onReorderTag}
              />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
