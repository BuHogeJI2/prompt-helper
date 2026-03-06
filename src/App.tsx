import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import EditorPanel from "@/components/EditorPanel";
import Header from "@/components/Header";
import ManageTagsModal from "@/components/ManageTagsModal";
import TagsPanel from "@/components/TagsPanel";
import { STATUS_TIMEOUT_MS } from "@/constants/app";
import { TAG_GROUPS } from "@/constants/tags";
import type { TagDefinition } from "@/types/tags";
import { loadEditor, loadTags, saveEditor, saveTags } from "@/utils/storage";

export default function App() {
  const [tags, setTags] = useState<TagDefinition[]>(() => loadTags());
  const [editorText, setEditorText] = useState<string>(() => loadEditor());
  const [status, setStatus] = useState<string>("");
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingSelection = useRef<number | null>(null);
  const statusTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    saveEditor(editorText);
  }, [editorText]);

  useEffect(() => {
    saveTags(tags);
  }, [tags]);

  useEffect(() => {
    if (pendingSelection.current === null) return;
    const pos = pendingSelection.current;
    pendingSelection.current = null;
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }, [editorText]);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current !== null) {
        window.clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  const isMac = useMemo(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
  }, []);

  const groupedTags = useMemo(
    () =>
      TAG_GROUPS.map((group) => ({
        group,
        tags: tags.filter((tag) => tag.groupId === group.id),
      })).filter((section) => section.tags.length > 0),
    [tags],
  );

  const shortcutMap = useMemo(
    () =>
      new Map(
        tags
          .filter((tag) => tag.shortcut)
          .map((tag) => [tag.shortcut!.key.toUpperCase(), tag]),
      ),
    [tags],
  );

  const customTagsCount = useMemo(
    () => tags.filter((tag) => tag.source === "user").length,
    [tags],
  );

  const showStatus = useCallback((message: string) => {
    setStatus(message);
    if (statusTimeoutRef.current !== null) {
      window.clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = window.setTimeout(() => setStatus(""), STATUS_TIMEOUT_MS);
  }, []);

  const insertTag = useCallback((tag: TagDefinition) => {
    const el = textareaRef.current;
    const currentText = editorText;
    const selectionStart = el?.selectionStart ?? currentText.length;
    const selectionEnd = el?.selectionEnd ?? currentText.length;
    const before = currentText.slice(0, selectionStart);
    const after = currentText.slice(selectionEnd);
    const prefix = before.length === 0 || before.endsWith("\n") ? "" : "\n";
    const block = `${prefix}${tag.openTag}\n\n${tag.closeTag}\n`;
    const nextText = before + block + after;
    const cursorPosition = (before + prefix + tag.openTag + "\n").length;

    setEditorText(nextText);
    pendingSelection.current = cursorPosition;
  }, [editorText]);

  const handleCopy = async () => {
    if (!editorText.trim()) {
      showStatus("Nothing to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(editorText);
      showStatus("Copied to clipboard.");
    } catch {
      showStatus("Clipboard blocked. Select and copy manually.");
    }
  };

  const requestClear = () => {
    if (!editorText.trim()) {
      showStatus("Editor is already empty.");
      return;
    }

    setIsClearConfirmOpen(true);
  };

  const handleClear = () => {
    setEditorText("");
    setIsClearConfirmOpen(false);
    showStatus("Editor cleared.");
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isManageOpen || isClearConfirmOpen) {
        return;
      }

      const modifierPressed = isMac ? event.metaKey : event.ctrlKey;
      if (!modifierPressed || !event.shiftKey || event.altKey) {
        return;
      }

      const tag = shortcutMap.get(event.key.toUpperCase());
      if (!tag) {
        return;
      }

      event.preventDefault();
      insertTag(tag);
      showStatus(`${tag.label} inserted.`);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isClearConfirmOpen, isMac, isManageOpen, insertTag, shortcutMap, showStatus]);

  return (
    <div className="min-h-screen bg-page px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
        <Header
          onManageTags={() => setIsManageOpen(true)}
          totalTags={tags.length}
          customTagsCount={customTagsCount}
        />

        <div className="space-y-6">
          <TagsPanel sections={groupedTags} insertTag={insertTag} isMac={isMac} />
          <EditorPanel
            editorText={editorText}
            setEditorText={setEditorText}
            textareaRef={textareaRef}
            status={status}
            onCopy={handleCopy}
            onClearRequest={requestClear}
            isMac={isMac}
          />
        </div>
      </div>

      <ManageTagsModal
        isOpen={isManageOpen}
        onOpenChange={setIsManageOpen}
        tags={tags}
        setTags={setTags}
      />

      <ConfirmationDialog
        open={isClearConfirmOpen}
        onOpenChange={setIsClearConfirmOpen}
        title="Clear the editor?"
        description="This removes the current prompt from the editor. Your tags stay saved."
        confirmLabel="Clear editor"
        onConfirm={handleClear}
      />
    </div>
  );
}
