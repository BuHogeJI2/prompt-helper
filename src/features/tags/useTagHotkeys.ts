import { useEffect, useMemo } from "react";

import type { TagDefinition } from "@/types/tags";

interface IUseTagHotkeysOptions {
  tags: TagDefinition[];
  disabled: boolean;
  onInsertTag: (tag: TagDefinition) => void;
  onTagInserted: (tag: TagDefinition) => void;
}

export function useTagHotkeys({
  tags,
  disabled,
  onInsertTag,
  onTagInserted,
}: IUseTagHotkeysOptions) {
  const shortcutMap = useMemo(
    () =>
      new Map(
        tags.filter((tag) => tag.shortcut).map((tag) => [tag.shortcut!.key.toUpperCase(), tag]),
      ),
    [tags],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled || event.isComposing) return;
      if (!event.altKey || !event.shiftKey || event.metaKey || event.ctrlKey) return;

      const code = event.code.startsWith("Key") ? event.code.slice(3).toUpperCase() : "";
      const tag = shortcutMap.get(code);
      if (!tag) return;

      event.preventDefault();
      onInsertTag(tag);
      onTagInserted(tag);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onInsertTag, onTagInserted, shortcutMap]);
}
