import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import ConfirmationDialog from "@/components/ConfirmationDialog";
import EditorPanel from "@/components/EditorPanel";
import Header from "@/components/Header";
import ManageTagsModal from "@/components/ManageTagsModal";
import TagsPanel from "@/components/TagsPanel";
import { STATUS_TIMEOUT_MS } from "@/constants/app";
import { TAG_GROUPS } from "@/constants/tags";
import type { TagDefinition } from "@/types/tags";
import type { EditorSelection } from "@/utils/editor";
import {
  deleteBackwardInSelection,
  deleteForwardInSelection,
  getSelectionOffsets,
  replaceTextInSelection,
  restoreSelection,
} from "@/utils/editor";
import { loadEditor, loadTags, saveEditor, saveTags } from "@/utils/storage";

export default function App() {
  const [tags, setTags] = useState<TagDefinition[]>(() => loadTags());
  const [editorText, setEditorText] = useState<string>(() => loadEditor());
  const [status, setStatus] = useState<string>("");
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const pendingSelection = useRef<EditorSelection | null>(null);
  const selectionRef = useRef<EditorSelection | null>(null);
  const isComposingRef = useRef(false);
  const statusTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    saveEditor(editorText);
  }, [editorText]);

  useEffect(() => {
    saveTags(tags);
  }, [tags]);

  useLayoutEffect(() => {
    if (pendingSelection.current === null) return;
    const selection = pendingSelection.current;
    pendingSelection.current = null;

    if (isComposingRef.current) {
      return;
    }

    const el = editorRef.current;
    if (!el) {
      return;
    }

    el.focus();
    restoreSelection(el, selection);
  }, [editorText]);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current !== null) {
        window.clearTimeout(statusTimeoutRef.current);
      }
    };
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

  const getCurrentSelection = useCallback((): EditorSelection => {
    const liveSelection = editorRef.current ? getSelectionOffsets(editorRef.current) : null;
    const fallbackSelection = liveSelection ?? selectionRef.current;

    if (fallbackSelection) {
      return fallbackSelection;
    }

    return {
      start: editorText.length,
      end: editorText.length,
    };
  }, [editorText.length]);

  const insertTag = useCallback((tag: TagDefinition) => {
    const currentSelection = getCurrentSelection();
    const start = Math.min(currentSelection.start, currentSelection.end);
    const end = Math.max(currentSelection.start, currentSelection.end);
    const before = editorText.slice(0, start);
    const after = editorText.slice(end);
    const prefix = before.length === 0 || before.endsWith("\n") ? "" : "\n";
    const block = `${prefix}${tag.openTag}\n\n${tag.closeTag}\n`;
    const nextText = before + block + after;
    const cursorPosition = (before + prefix + tag.openTag + "\n").length;

    setEditorText(nextText);
    const nextSelection = {
      start: cursorPosition,
      end: cursorPosition,
    };
    selectionRef.current = nextSelection;
    pendingSelection.current = nextSelection;
  }, [editorText, getCurrentSelection]);

  const insertTextAtSelection = useCallback(
    (insertedText: string) => {
      const currentSelection = getCurrentSelection();
      const nextState = replaceTextInSelection(editorText, currentSelection, insertedText);

      setEditorText(nextState.text);
      selectionRef.current = nextState.selection;
      pendingSelection.current = nextState.selection;
    },
    [editorText, getCurrentSelection],
  );

  const deleteBackwardAtSelection = useCallback(() => {
    const currentSelection = getCurrentSelection();
    const nextState = deleteBackwardInSelection(editorText, currentSelection);

    setEditorText(nextState.text);
    selectionRef.current = nextState.selection;
    pendingSelection.current = nextState.selection;
  }, [editorText, getCurrentSelection]);

  const deleteForwardAtSelection = useCallback(() => {
    const currentSelection = getCurrentSelection();
    const nextState = deleteForwardInSelection(editorText, currentSelection);

    setEditorText(nextState.text);
    selectionRef.current = nextState.selection;
    pendingSelection.current = nextState.selection;
  }, [editorText, getCurrentSelection]);

  const handleEditorSelectionChange = useCallback((selection: EditorSelection | null) => {
    selectionRef.current = selection;
  }, []);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (nextText: string, selection: EditorSelection | null) => {
      isComposingRef.current = false;

      const resolvedSelection =
        selection ??
        selectionRef.current ?? {
          start: nextText.length,
          end: nextText.length,
        };

      selectionRef.current = resolvedSelection;
      setEditorText(nextText);
      pendingSelection.current = resolvedSelection;
    },
    [],
  );

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

      if (isComposingRef.current) {
        return;
      }

      if (!event.altKey || !event.shiftKey || event.metaKey || event.ctrlKey) {
        return;
      }

      const code = event.code.startsWith("Key") ? event.code.slice(3).toUpperCase() : "";
      const tag = shortcutMap.get(code);
      if (!tag) {
        return;
      }

      event.preventDefault();
      insertTag(tag);
      showStatus(`${tag.label} inserted.`);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isClearConfirmOpen, isManageOpen, insertTag, shortcutMap, showStatus]);

  return (
    <div className="min-h-screen bg-page px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:gap-6">
        <Header
          onManageTags={() => setIsManageOpen(true)}
          totalTags={tags.length}
          customTagsCount={customTagsCount}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-start">
          <TagsPanel sections={groupedTags} insertTag={insertTag} />
          <EditorPanel
            editorText={editorText}
            editorRef={editorRef}
            status={status}
            onCopy={handleCopy}
            onClearRequest={requestClear}
            onSelectionChange={handleEditorSelectionChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onInsertLineBreak={() => insertTextAtSelection("\n")}
            onInsertText={insertTextAtSelection}
            onDeleteBackward={deleteBackwardAtSelection}
            onDeleteForward={deleteForwardAtSelection}
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
