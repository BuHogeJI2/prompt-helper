import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  type EditorSelection,
  type MoveDirection,
  getMoveTarget,
  movePromptSection,
  wrapPromptSelection,
} from "@/features/editor/organizePrompt";
import {
  type PromptSection,
  getCurrentSection,
  getPromptSections,
} from "@/features/editor/parsePromptSections";
import { scrollToEditorPosition } from "@/features/editor/scrollToEditorPosition";
import { useTransientStatus } from "@/hooks/useTransientStatus";
import type { TagDefinition } from "@/types/tags";
import { loadEditor, saveEditor } from "@/utils/storage";

function focusEditorSelection(editor: HTMLTextAreaElement | null, selection: EditorSelection) {
  if (!editor) return;
  const { start, end, direction } = selection;
  editor.focus({ preventScroll: true });
  editor.setSelectionRange(start, end, direction);
  scrollToEditorPosition(editor, direction === "backward" ? start : end);
}

export function usePromptEditor() {
  const [editorText, setEditorText] = useState(() => loadEditor());
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hasSelection, setHasSelection] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingSelectionRef = useRef<EditorSelection | null>(null);
  const { status, showStatus } = useTransientStatus();
  const outlineSections = useMemo(() => getPromptSections(editorText), [editorText]);
  const currentSection = getCurrentSection(outlineSections, cursorPosition);

  const updateSelection = useCallback(() => {
    const editor = editorRef.current;
    if (editor) {
      setHasSelection(editor.selectionStart !== editor.selectionEnd);
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
    setHasSelection(false);
  }, []);

  useEffect(() => {
    saveEditor(editorText);
  }, [editorText]);

  useLayoutEffect(() => {
    if (pendingSelectionRef.current === null) return;

    const selection = pendingSelectionRef.current;
    pendingSelectionRef.current = null;
    focusEditorSelection(editorRef.current, selection);
  }, [editorText]);

  const applyEdit = useCallback(
    (edit: { text: string; selection: EditorSelection }) => {
      if (edit.text === editorText) {
        focusEditorSelection(editorRef.current, edit.selection);
      } else {
        pendingSelectionRef.current = edit.selection;
      }
      setCursorPosition(
        edit.selection.direction === "backward" ? edit.selection.start : edit.selection.end,
      );
      setHasSelection(edit.selection.start !== edit.selection.end);
      setEditorText(edit.text);
    },
    [editorText],
  );

  const wrapSelection = useCallback(
    (tag: Pick<TagDefinition, "openTag" | "closeTag">) => {
      const editor = editorRef.current;
      if (!editor) return;
      const edit = wrapPromptSelection(
        editorText,
        {
          start: editor.selectionStart,
          end: editor.selectionEnd,
          direction: editor.selectionDirection,
        },
        tag,
      );
      if (!edit) return;
      applyEdit(edit);
      showStatus("Selection wrapped.");
    },
    [editorText, applyEdit, showStatus],
  );

  const moveSection = useCallback(
    (direction: MoveDirection) => {
      const editor = editorRef.current;
      if (!editor || !currentSection) return;
      const edit = movePromptSection(editorText, outlineSections, currentSection, direction, {
        start: editor.selectionStart,
        end: editor.selectionEnd,
        direction: editor.selectionDirection,
      });
      if (!edit) return;
      applyEdit(edit);
      showStatus(`${currentSection.name} moved ${direction}.`);
    },
    [editorText, outlineSections, currentSection, applyEdit, showStatus],
  );

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

      applyEdit({
        text: before + block + after,
        selection: { start: cursorPosition, end: cursorPosition, direction: "none" },
      });
    },
    [editorText, applyEdit],
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
    pendingSelectionRef.current = { start: 0, end: 0, direction: "none" };
    setCursorPosition(0);
    setHasSelection(false);
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
    hasSelection,
    wrapSelection,
    moveSection,
    canMoveUp: Boolean(getMoveTarget(outlineSections, currentSection, "up")),
    canMoveDown: Boolean(getMoveTarget(outlineSections, currentSection, "down")),
    hasEditorContent: Boolean(editorText.trim()),
    status,
    showStatus,
    updateEditorText,
    insertTag,
    copyPrompt,
    clearPrompt,
  };
}
