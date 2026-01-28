import type { Dispatch, RefObject, SetStateAction } from "react";

import type { TagDefinition } from "@/types/tags";

type EditorPanelProps = {
  editorText: string;
  setEditorText: Dispatch<SetStateAction<string>>;
  tagHelp: TagDefinition[];
  textareaRef: RefObject<HTMLTextAreaElement | null> | null;
};

export default function EditorPanel({
  editorText,
  setEditorText,
  tagHelp,
  textareaRef,
}: EditorPanelProps) {
  return (
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
        <span>{tagHelp.map((tag) => tag.label).join(" • ")} tags are ready for quick use.</span>
      </div>
    </section>
  );
}
