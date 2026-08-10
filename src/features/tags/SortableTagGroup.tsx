import { Accessibility } from "@dnd-kit/dom";
import {
  DragDropProvider,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";

import { useCallback, useMemo, useRef } from "react";

import SortableTagCard from "@/features/tags/SortableTagCard";
import type { ITagSection } from "@/features/tags/types";
import type { TagDefinition, TagGroupId } from "@/types/tags";

interface ISortableTagGroupProps {
  section: ITagSection;
  onInsertTag: (tag: TagDefinition) => void;
  onReorderTag: (groupId: TagGroupId, fromIndex: number, toIndex: number) => void;
}

type TDragSource = DragEndEvent["operation"]["source"];

const getAnnouncementContext = (source: TDragSource, useInitialPosition = false) => {
  if (!source || !isSortable(source)) return null;

  const label = typeof source.data.label === "string" ? source.data.label : String(source.id);
  const groupTitle =
    typeof source.data.groupTitle === "string" ? source.data.groupTitle : "this group";
  const itemCount =
    typeof source.data.itemCount === "number" ? source.data.itemCount : source.index + 1;
  const position = (useInitialPosition ? source.initialIndex : source.index) + 1;

  return { label, groupTitle, itemCount, position };
};

const formatPosition = ({
  position,
  itemCount,
  groupTitle,
}: NonNullable<ReturnType<typeof getAnnouncementContext>>) =>
  `position ${position} of ${itemCount} in ${groupTitle}`;

const createAccessibilityPlugin = (groupId: TagGroupId) =>
  Accessibility.configure({
    id: `tag-order-${groupId}`,
    debounce: 150,
    screenReaderInstructions: {
      draggable:
        "To reorder a prompt block, focus its reorder handle and press Space or Enter. While dragging, use the arrow keys to move it within its group. Press Space or Enter again to drop it, or press Escape to cancel.",
    },
    announcements: {
      dragstart({ operation: { source } }: DragStartEvent) {
        const context = getAnnouncementContext(source);
        if (!context) return;

        return `Picked up ${context.label}, ${formatPosition(context)}.`;
      },
      dragover({ operation: { source } }: DragOverEvent) {
        const context = getAnnouncementContext(source);
        if (!context) return;

        return `${context.label} moved to ${formatPosition(context)}.`;
      },
      dragend({ operation: { source }, canceled }: DragEndEvent) {
        const context = getAnnouncementContext(source, canceled);
        if (!context) return;

        if (canceled) {
          return `Reordering ${context.label} canceled. It remains at ${formatPosition(context)}.`;
        }

        const initialContext = getAnnouncementContext(source, true);
        if (initialContext?.position === context.position) {
          return `${context.label} remains at ${formatPosition(context)}.`;
        }

        return `${context.label} placed at ${formatPosition(context)}.`;
      },
    },
  });

export default function SortableTagGroup({
  section,
  onInsertTag,
  onReorderTag,
}: ISortableTagGroupProps) {
  const accessibilityPlugin = useMemo(
    () => createAccessibilityPlugin(section.group.id),
    [section.group.id],
  );
  const handleElements = useRef(new Map<string, HTMLButtonElement>());
  const isReorderable = section.tags.length > 1;

  const registerHandle = useCallback((tagId: string, element: HTMLButtonElement | null) => {
    if (element) {
      handleElements.current.set(tagId, element);
    } else {
      handleElements.current.delete(tagId);
    }
  }, []);

  const restoreKeyboardFocus = useCallback((event: DragEndEvent) => {
    const { activatorEvent, source } = event.operation;
    if (!(activatorEvent instanceof KeyboardEvent) || !source) return;

    const sourceId = String(source.id);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => handleElements.current.get(sourceId)?.focus());
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { source } = event.operation;
      restoreKeyboardFocus(event);
      if (event.canceled || !source || !isSortable(source) || source.initialIndex === source.index)
        return;

      onReorderTag(section.group.id, source.initialIndex, source.index);
    },
    [onReorderTag, restoreKeyboardFocus, section.group.id],
  );

  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults.filter((plugin) => plugin !== Accessibility),
        accessibilityPlugin,
      ]}
      onDragEnd={handleDragEnd}
    >
      <ul
        aria-label={`${section.group.title} prompt blocks`}
        className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3"
      >
        {section.tags.map((tag, index) => (
          <SortableTagCard
            key={tag.id}
            tag={tag}
            index={index}
            groupTitle={section.group.title}
            itemCount={section.tags.length}
            isReorderable={isReorderable}
            onInsertTag={onInsertTag}
            onHandleRef={registerHandle}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
}
