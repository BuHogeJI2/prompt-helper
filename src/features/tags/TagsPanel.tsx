import * as Accordion from "@radix-ui/react-accordion";
import * as Tooltip from "@radix-ui/react-tooltip";

import InfoPopover from "@/features/tags/InfoPopover";
import SortableTagGroup from "@/features/tags/SortableTagGroup";
import type { ITagSection } from "@/features/tags/types";
import type { TagDefinition, TagGroupId } from "@/types/tags";

interface ITagsPanelProps {
  variant?: "sidebar" | "sheet";
  sections: ITagSection[];
  onInsertTag: (tag: TagDefinition) => void;
  onReorderTag: (groupId: TagGroupId, fromIndex: number, toIndex: number) => void;
}

export default function TagsPanel({
  variant = "sidebar",
  sections,
  onInsertTag,
  onReorderTag,
}: ITagsPanelProps) {
  const isSheet = variant === "sheet";

  return (
    <Tooltip.Provider delayDuration={350} skipDelayDuration={150}>
      <section
        className={
          isSheet
            ? "pb-1"
            : "rounded-[1.7rem] border border-white/60 bg-white/75 p-3.5 shadow-panel backdrop-blur md:p-4"
        }
      >
        <div className="flex min-h-10 items-center justify-between gap-3 px-1">
          {isSheet ? (
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cinder/60">
              Browse prompt blocks
            </p>
          ) : (
            <h2 className="text-lg font-semibold text-cinder">Prompt blocks</h2>
          )}
          <InfoPopover label="Prompt block help" title="Using prompt blocks">
            <p>Select a block to insert it at the editor cursor.</p>
            <p>Built-in blocks support Alt+Shift+letter shortcuts.</p>
            <p>
              To reorder a block, focus its drag handle, press Space or Enter, move it with the
              arrow keys, and press Space or Enter again to drop it.
            </p>
          </InfoPopover>
        </div>

        <Accordion.Root type="multiple" defaultValue={["core"]} className="mt-3 space-y-2">
          {sections.map((section) => {
            const itemCountLabel = `${section.tags.length} ${
              section.tags.length === 1 ? "block" : "blocks"
            }`;

            return (
              <Accordion.Item
                key={section.group.id}
                value={section.group.id}
                className="overflow-hidden rounded-[1.15rem] border border-ink/8 bg-[#fffaf3]"
              >
                <Accordion.Header className="flex items-center pr-2">
                  <Accordion.Trigger
                    aria-label={`${section.group.title}, ${itemCountLabel}`}
                    className="group flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-l-[1.15rem] px-3 py-2 text-left transition hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ember/30 motion-reduce:transition-none"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="text-base font-semibold text-cinder">
                        {section.group.title}
                      </span>
                      <span className="rounded-full border border-ink/10 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cinder/65">
                        {section.tags.length}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-xs text-cinder/65 transition group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                    >
                      ▼
                    </span>
                  </Accordion.Trigger>
                  <InfoPopover label={`About ${section.group.title}`} title={section.group.title}>
                    <p>{section.group.description}</p>
                  </InfoPopover>
                </Accordion.Header>
                <Accordion.Content className="border-t border-ink/8 px-2.5 pb-2.5 pt-2.5 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
                  <SortableTagGroup
                    section={section}
                    onInsertTag={onInsertTag}
                    onReorderTag={onReorderTag}
                  />
                </Accordion.Content>
              </Accordion.Item>
            );
          })}
        </Accordion.Root>
      </section>
    </Tooltip.Provider>
  );
}
