import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  type PromptSection,
  getCurrentSection,
  getPromptSections,
} from "@/features/editor/parsePromptSections";
import { scrollToEditorPosition } from "@/features/editor/scrollToEditorPosition";
import { useTransientStatus } from "@/hooks/useTransientStatus";
import type { TagDefinition } from "@/types/tags";
import { loadEditor, saveEditor } from "@/utils/storage";

export function usePromptEditor() {
  const [editorText, setEditorText] = useState(() => loadEditor());
  const [cursorPosition, setCursorPosition] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingSelectionRef = useRef<number | null>(null);
  const { status, showStatus } = useTransientStatus();
  const outlineSections = useMemo(() => getPromptSections(editorText), [editorText]);
  const currentSection = getCurrentSection(outlineSections, cursorPosition);

  const updateSelection = useCallback(() => {
    const editor = editorRef.current;
    if (editor) {
      setCursorPosition(
        editor.selectionDirection === "backward" ? editor.selectionStart : editor.selectionEnd,
      );
    }
  }, []);

  const navigateToSection = useCallback((section: PromptSection) => {
    const editor = editorRef.current;
    if (!editor) return;
    const position = Math.min(section.contentStart, section.end);
    editor.focus({ preventScroll: true });
    editor.setSelectionRange(position, position);
    scrollToEditorPosition(editor, position);
    setCursorPosition(position);
  }, []);

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
      setCursorPosition(cursorPosition);
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
    setCursorPosition(0);
    setEditorText("");
    showStatus("Editor cleared.");
  }, [showStatus]);

  return {
    editorText,
    editorRef,
    outlineSections,
    currentSection,
    updateSelection,
    navigateToSection,
    hasEditorContent: Boolean(editorText.trim()),
    status,
    showStatus,
    updateEditorText,
    insertTag,
    copyPrompt,
    clearPrompt,
  };
}
