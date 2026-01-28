import { useEffect, useMemo, useRef, useState } from "react";

import EditorPanel from "@/components/EditorPanel";
import Header from "@/components/Header";
import ManageTagsModal from "@/components/ManageTagsModal";
import TagsPanel from "@/components/TagsPanel";
import { STATUS_TIMEOUT_MS, TAG_HELP_COUNT } from "@/constants/app";
import type { TagDefinition } from "@/types/tags";
import { loadEditor, loadTags, saveEditor, saveTags } from "@/utils/storage";

export default function App() {
  const [tags, setTags] = useState<TagDefinition[]>(() => loadTags());
  const [editorText, setEditorText] = useState<string>(() => loadEditor());
  const [status, setStatus] = useState<string>("");
  const [isManageOpen, setIsManageOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingSelection = useRef<number | null>(null);

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

  const tagHelp = useMemo(() => {
    return tags.filter((tag) => tag.hint).slice(0, TAG_HELP_COUNT);
  }, [tags]);

  const insertTag = (tag: TagDefinition) => {
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
  };

  const handleCopy = async () => {
    if (!editorText.trim()) {
      setStatus("Nothing to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(editorText);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Clipboard blocked. Select and copy manually.");
    }
    setTimeout(() => setStatus(""), STATUS_TIMEOUT_MS);
  };

  const handleClear = () => {
    if (!editorText.trim()) {
      setStatus("Editor is already empty.");
      setTimeout(() => setStatus(""), STATUS_TIMEOUT_MS);
      return;
    }
    setEditorText("");
    setStatus("Cleared.");
    setTimeout(() => setStatus(""), STATUS_TIMEOUT_MS);
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Header
          status={status}
          onCopy={handleCopy}
          onClear={handleClear}
          onManageTags={() => setIsManageOpen(true)}
        />

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <TagsPanel tags={tags} insertTag={insertTag} />
          <EditorPanel
            editorText={editorText}
            setEditorText={setEditorText}
            tagHelp={tagHelp}
            textareaRef={textareaRef}
          />
        </div>
      </div>
      <ManageTagsModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        tags={tags}
        setTags={setTags}
        setStatus={setStatus}
      />
    </div>
  );
}
