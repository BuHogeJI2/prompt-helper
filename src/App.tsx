import { useEffect, useMemo, useRef, useState } from "react";

import { STATUS_TIMEOUT_MS, TAG_HELP_COUNT } from "@/constants/app";
import type { TagDefinition } from "@/types/tags";
import { loadEditor, loadTags, saveEditor } from "@/utils/storage";

export default function App() {
  const tags = useMemo(() => loadTags(), []);
  const [editorText, setEditorText] = useState<string>(() => loadEditor());
  const [status, setStatus] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingSelection = useRef<number | null>(null);

  useEffect(() => {
    saveEditor(editorText);
  }, [editorText]);

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
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-moss">
              Prompt Helper
            </p>
            <h1 className="text-4xl font-semibold text-ink sm:text-5xl">
              Tag-driven prompt composer.
            </h1>
            <p className="max-w-xl text-sm text-ink/70">
              Click a tag to drop open and close brackets into the editor. The cursor lands between
              them, ready for your text.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-ink/60">{status}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-full border border-ink/10 bg-ember px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Quick copy
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full border border-ink/20 bg-white px-5 py-2 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Clear
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-fog bg-white/80 p-4 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Tags</p>
              <span className="text-xs text-ink/40">{tags.length}</span>
            </div>
            <div className="mt-4 space-y-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => insertTag(tag)}
                  className="flex w-full flex-col rounded-xl border border-transparent bg-linen px-3 py-2 text-left transition hover:border-ember/40 hover:bg-white"
                >
                  <span className="text-sm font-semibold text-ink">{tag.label}</span>
                  <span className="text-xs text-ink/50">{tag.openTag}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex flex-col gap-4 rounded-2xl border border-fog bg-white/90 p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">Editor</h2>
                <p className="text-sm text-ink/60">
                  Every tag inserts on a new line with a blank line between the brackets.
                </p>
              </div>
              <span className="text-xs text-ink/50">{editorText.length} characters</span>
            </div>

            <textarea
              ref={textareaRef}
              value={editorText}
              onChange={(event) => setEditorText(event.target.value)}
              placeholder="Click a tag to start. Keep one idea per block."
              className="h-[60vh] w-full resize-none rounded-2xl border border-fog bg-white/90 p-4 text-sm leading-6 text-ink shadow-inner focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/30"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink/60">
              <span>Tip: use shift+enter inside a block to keep tight paragraphs.</span>
              <span>
                {tagHelp.map((tag) => tag.label).join(" • ")} tags are ready for quick use.
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
