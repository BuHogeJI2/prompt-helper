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
      <section className={isSheet ? "pb-1" : "bg-surface p-2"}>
        <div className="flex min-h-11 items-center justify-between gap-2 border-b border-line px-2">
          {isSheet ? (
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Browse prompt blocks
            </p>
          ) : (
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted">
              Prompt blocks
            </h2>
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

        <Accordion.Root type="multiple" defaultValue={["core"]} className="mt-2 space-y-1">
          {sections.map((section) => {
            const itemCountLabel = `${section.tags.length} ${
              section.tags.length === 1 ? "block" : "blocks"
            }`;

            return (
              <Accordion.Item
                key={section.group.id}
                value={section.group.id}
                className="overflow-hidden border-b border-line last:border-b-0"
              >
                <Accordion.Header className="flex items-center">
                  <Accordion.Trigger
                    aria-label={`${section.group.title}, ${itemCountLabel}`}
                    className="group flex min-h-11 min-w-0 flex-1 items-center justify-between gap-2 px-2 py-2 text-left transition hover:bg-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent motion-reduce:transition-none lg:min-h-9"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 break-words text-xs font-medium text-foreground">
                        {section.group.title}
                      </span>
                      <span className="shrink-0 text-[10px] tabular-nums text-muted">
                        {section.tags.length}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-xs text-muted transition group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                    >
                      ▼
                    </span>
                  </Accordion.Trigger>
                  <InfoPopover label={`About ${section.group.title}`} title={section.group.title}>
                    <p>{section.group.description}</p>
                  </InfoPopover>
                </Accordion.Header>
                <Accordion.Content className="p-1 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
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
