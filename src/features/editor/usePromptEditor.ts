import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useTransientStatus } from "@/hooks/useTransientStatus";
import type { TagDefinition } from "@/types/tags";
import { loadEditor, saveEditor } from "@/utils/storage";

export function usePromptEditor() {
  const [editorText, setEditorText] = useState(() => loadEditor());
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingSelectionRef = useRef<number | null>(null);
  const { status, showStatus } = useTransientStatus();

  useEffect(() => {
    saveEditor(editorText);
  }, [editorText]);

  useLayoutEffect(() => {
    if (pendingSelectionRef.current === null) return;

    const position = pendingSelectionRef.current;
    pendingSelectionRef.current = null;
    editorRef.current?.focus();
    editorRef.current?.setSelectionRange(position, position);
  }, [editorText]);

  const updateEditorText = useCallback((text: string) => {
    setEditorText(text);
  }, []);

  const insertTag = useCallback(
    (tag: Pick<TagDefinition, "openTag" | "closeTag">) => {
      const editor = editorRef.current;
      const start = editor?.selectionStart ?? editorText.length;
      const end = editor?.selectionEnd ?? editorText.length;
      const before = editorText.slice(0, start);
      const after = editorText.slice(end);
      const prefix = before.length === 0 || before.endsWith("\n") ? "" : "\n";
      const block = `${prefix}${tag.openTag}\n\n${tag.closeTag}\n`;
      const cursorPosition = (before + prefix + tag.openTag + "\n").length;

      pendingSelectionRef.current = cursorPosition;
      setEditorText(before + block + after);
    },
    [editorText],
  );

  const copyPrompt = useCallback(async () => {
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
  }, [editorText, showStatus]);

  const clearPrompt = useCallback(() => {
    pendingSelectionRef.current = 0;
    setEditorText("");
    showStatus("Editor cleared.");
  }, [showStatus]);

  return {
    editorText,
    editorRef,
    hasEditorContent: Boolean(editorText.trim()),
    status,
    showStatus,
    updateEditorText,
    insertTag,
    copyPrompt,
    clearPrompt,
  };
}
