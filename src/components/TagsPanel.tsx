import * as Accordion from "@radix-ui/react-accordion";

import type { TagDefinition, TagGroup } from "@/types/tags";
import { formatShortcutLabel } from "@/utils/tags";

type TagSection = {
  group: TagGroup;
  tags: TagDefinition[];
};

type TagsPanelProps = {
  sections: TagSection[];
  insertTag: (tag: TagDefinition) => void;
};

export default function TagsPanel({ sections, insertTag }: TagsPanelProps) {
  return (
    <section className="rounded-[1.7rem] border border-white/60 bg-white/75 p-4 shadow-panel backdrop-blur md:p-5">
      <div className="flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cinder/50">
            Prompt blocks
          </p>
          <div>
            <h2 className="text-xl font-semibold text-cinder">Keep the structure visible.</h2>
            <p className="max-w-2xl text-sm leading-6 text-cinder/68">
              Built-in tags are grouped by intent and stay one click away. Shortcuts mirror
              the same blocks, so the editor stays fast without hiding the palette behind a
              scrolling panel.
            </p>
          </div>
        </div>
        <div className="rounded-[1.2rem] border border-sand/80 bg-sand/60 px-3 py-2 text-xs font-medium text-cinder/72">
          Use Alt+Shift+letter for built-in tags.
        </div>
      </div>

      <Accordion.Root
        type="multiple"
        defaultValue={["core"]}
        className="mt-4 space-y-2.5"
      >
        {sections.map((section) => (
          <Accordion.Item
            key={section.group.id}
            value={section.group.id}
            className="overflow-hidden rounded-[1.3rem] border border-ink/8 bg-[#fffaf3]"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-white/80 md:px-5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-cinder">{section.group.title}</span>
                    <span className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cinder/45">
                      {section.tags.length}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-cinder/60 sm:text-sm">
                    {section.group.description}
                  </p>
                </div>
                <span className="text-cinder/45 transition group-data-[state=open]:rotate-180">
                  ▼
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="border-t border-ink/8 px-4 pb-3 pt-3 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down md:px-5">
              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                {section.tags.map((tag) => {
                  const shortcutLabel = tag.shortcut ? formatShortcutLabel(tag.shortcut) : null;

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => insertTag(tag)}
                      className="group flex min-h-[7.25rem] flex-col rounded-[1.15rem] border border-ink/10 bg-white px-3.5 py-3 text-left transition hover:-translate-y-0.5 hover:border-ember/35 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-ember/30"
                    >
                      <div className="flex flex-col items-start gap-2">
                        <span className="text-sm font-semibold text-cinder">{tag.label}</span>
                        {shortcutLabel ? (
                          <span className="rounded-full bg-cinder px-2 py-1 text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-white">
                            {shortcutLabel}
                          </span>
                        ) : null}
                      </div>
                      <code className="mt-2 text-[11px] text-cinder/55">{tag.openTag}</code>
                      <p className="mt-auto pt-2 text-xs leading-5 text-cinder/60">{tag.hint}</p>
                    </button>
                  );
                })}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
