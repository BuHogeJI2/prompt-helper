import { Fragment, useMemo } from "react";
import type { ClipboardEvent, RefObject } from "react";

import type { EditorSelection } from "@/utils/editor";
import { getSelectionOffsets, readPlainTextFromEditable, tokenizeEditorLine } from "@/utils/editor";

type EditorPanelProps = {
  editorText: string;
  editorRef: RefObject<HTMLDivElement | null> | null;
  status: string;
  onCopy: () => void;
  onClearRequest: () => void;
  onSelectionChange: (selection: EditorSelection | null) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (text: string, selection: EditorSelection | null) => void;
  onInsertLineBreak: () => void;
  onInsertText: (text: string) => void;
  onDeleteBackward: () => void;
  onDeleteForward: () => void;
};

export default function EditorPanel({
  editorText,
  editorRef,
  status,
  onCopy,
  onClearRequest,
  onSelectionChange,
  onCompositionStart,
  onCompositionEnd,
  onInsertLineBreak,
  onInsertText,
  onDeleteBackward,
  onDeleteForward,
}: EditorPanelProps) {
  const renderedLines = useMemo(() => editorText.split("\n"), [editorText]);

  const syncSelection = () => {
    const root = editorRef?.current;
    if (!root) {
      onSelectionChange(null);
      return;
    }

    onSelectionChange(getSelectionOffsets(root));
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const plainText = event.clipboardData.getData("text/plain");
    if (!plainText) {
      return;
    }

    onInsertText(plainText);
  };

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

      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        data-editor-surface="true"
        data-empty={editorText.length === 0}
        data-placeholder="Start with a Task block, then layer the rest of the prompt around it."
        className="editor-surface mt-5 h-[58vh] min-h-[26rem] w-full overflow-y-auto rounded-[1.65rem] border border-ink/10 bg-[#fffdf9] p-5 text-sm leading-7 text-cinder shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] focus:border-ember/45 focus:outline-none focus:ring-2 focus:ring-ember/25"
        onBeforeInput={(event) => {
          if (event.nativeEvent.isComposing) {
            return;
          }

          switch (event.nativeEvent.inputType) {
            case "insertText":
              event.preventDefault();
              onInsertText(event.nativeEvent.data ?? "");
              return;
            case "insertCompositionText":
              return;
            case "insertParagraph":
            case "insertLineBreak":
              event.preventDefault();
              onInsertLineBreak();
              return;
            case "insertFromPaste":
              event.preventDefault();
              onInsertText(event.nativeEvent.data ?? "");
              return;
            case "insertReplacementText":
              event.preventDefault();
              onInsertText(event.nativeEvent.data ?? "");
              return;
            case "deleteContentBackward":
              event.preventDefault();
              onDeleteBackward();
              return;
            case "deleteContentForward":
              event.preventDefault();
              onDeleteForward();
              return;
            default:
              event.preventDefault();
          }
        }}
        onPaste={handlePaste}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onInsertLineBreak();
            return;
          }

          if (event.key === "Backspace") {
            event.preventDefault();
            onDeleteBackward();
            return;
          }

          if (event.key === "Delete") {
            event.preventDefault();
            onDeleteForward();
            return;
          }

          if (
            event.key.length === 1 &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.altKey
          ) {
            event.preventDefault();
            onInsertText(event.key);
          }
        }}
        onKeyUp={syncSelection}
        onMouseUp={syncSelection}
        onFocus={syncSelection}
        onBlur={syncSelection}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={(event) => {
          const root = event.currentTarget;
          onCompositionEnd(readPlainTextFromEditable(root), getSelectionOffsets(root));
        }}
      >
        {renderedLines.map((line, lineIndex) => {
          const tokens = tokenizeEditorLine(line);

          return (
            <Fragment key={`line-${lineIndex}`}>
              {tokens.map((token, tokenIndex) => (
                <span
                  key={`token-${lineIndex}-${tokenIndex}`}
                  className={token.type === "tag" ? "font-semibold text-ink" : undefined}
                >
                  {token.value}
                </span>
              ))}
              {lineIndex < renderedLines.length - 1 ? <br /> : null}
            </Fragment>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-[1.5rem] border border-ink/8 bg-[#fffaf4] p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm leading-6 text-cinder/66">
          <p>{status || "Copy status and editor safety actions show here."}</p>
          <p>
            Tip: use Shift+Enter for tight paragraphs, and Alt+Shift+letter to insert
            built-in tags without leaving the editor.
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
