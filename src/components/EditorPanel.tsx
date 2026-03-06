import type { Dispatch, RefObject, SetStateAction } from "react";

type EditorPanelProps = {
  editorText: string;
  setEditorText: Dispatch<SetStateAction<string>>;
  textareaRef: RefObject<HTMLTextAreaElement | null> | null;
  status: string;
  onCopy: () => void;
  onClearRequest: () => void;
  isMac: boolean;
};

export default function EditorPanel({
  editorText,
  setEditorText,
  textareaRef,
  status,
  onCopy,
  onClearRequest,
  isMac,
}: EditorPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/65 bg-white/80 p-5 shadow-panel backdrop-blur md:p-6">
      <div className="flex flex-col gap-4 border-b border-ink/8 pb-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cinder/45">
            Editor
          </p>
          <h2 className="text-2xl font-semibold text-cinder">Compose with visible structure.</h2>
          <p className="max-w-2xl text-sm leading-6 text-cinder/65">
            Every inserted block starts on a new line, includes one blank line between
            tags, and returns the cursor to the writable space inside the block.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <span className="rounded-full border border-ink/10 bg-sand/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cinder/55">
            {editorText.length} characters
          </span>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center justify-center rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white transition hover:bg-ember/92 focus:outline-none focus:ring-2 focus:ring-ember/30"
          >
            Quick copy
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={editorText}
        onChange={(event) => setEditorText(event.target.value)}
        placeholder="Start with a Task block, then layer the rest of the prompt around it."
        className="mt-5 h-[58vh] min-h-[26rem] w-full resize-none rounded-[1.65rem] border border-ink/10 bg-[#fffdf9] p-5 text-sm leading-7 text-cinder shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] focus:border-ember/45 focus:outline-none focus:ring-2 focus:ring-ember/25"
      />

      <div className="mt-5 flex flex-col gap-4 rounded-[1.5rem] border border-ink/8 bg-[#fffaf4] p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm leading-6 text-cinder/66">
          <p>{status || "Copy status and editor safety actions show here."}</p>
          <p>
            Tip: use Shift+Enter for tight paragraphs, and {isMac ? "Cmd" : "Ctrl"}+Shift
            +letter to insert built-in tags without leaving the editor.
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-900">
          <p className="font-semibold">Danger zone</p>
          <p className="mt-1 text-rose-900/75">
            Clear removes the entire editor after a confirmation step.
          </p>
          <button
            type="button"
            onClick={onClearRequest}
            className="mt-3 inline-flex items-center justify-center rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300/60"
          >
            Clear editor
          </button>
        </div>
      </div>
    </section>
  );
}
