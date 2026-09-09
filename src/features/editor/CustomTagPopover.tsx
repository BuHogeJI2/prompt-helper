import * as Popover from "@radix-ui/react-popover";

import { type ReactNode, type RefObject, useId, useRef, useState } from "react";

import type { TagDefinition } from "@/types/tags";
import { buildTagPair } from "@/utils/tags";

interface ICustomTagPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  onInsertTag: (tag: Pick<TagDefinition, "openTag" | "closeTag">) => void;
  children: ReactNode;
}

export default function CustomTagPopover({
  open,
  onOpenChange,
  editorRef,
  onInsertTag,
  children,
}: ICustomTagPopoverProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef({
    start: 0,
    end: 0,
    direction: "none" as "forward" | "backward" | "none",
  });
  const insertedRef = useRef(false);
  const descriptionId = useId();
  const errorId = useId();
  const pair = buildTagPair(name);

  const restoreSelection = () => {
    const { start, end, direction } = selectionRef.current;
    editorRef.current?.setSelectionRange(start, end, direction);
  };

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange} modal>
      <div className="relative">
        {children}
        <Popover.Anchor className="absolute left-5 top-5" />
      </div>
      <Popover.Portal>
        <Popover.Content
          aria-label="Insert custom tag"
          aria-describedby={descriptionId}
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            const editor = editorRef.current;
            if (editor) {
              selectionRef.current = {
                start: editor.selectionStart,
                end: editor.selectionEnd,
                direction: editor.selectionDirection,
              };
            }
            insertedRef.current = false;
            setName("");
            setError("");
            inputRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            editorRef.current?.focus();
            if (!insertedRef.current) restoreSelection();
          }}
          className="z-[60] w-[min(22rem,calc(100vw-2rem))] rounded-[1.1rem] border border-ink/10 bg-white p-4 text-cinder shadow-panel outline-none"
        >
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!pair.openTag) {
                setError("Enter a tag name with at least one English letter or number.");
                inputRef.current?.focus();
                return;
              }

              restoreSelection();
              insertedRef.current = true;
              onInsertTag(pair);
              onOpenChange(false);
            }}
          >
            <label className="block text-sm font-semibold">
              Tag name
              <input
                ref={inputRef}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && event.nativeEvent.isComposing) {
                    event.preventDefault();
                  }
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                placeholder="Example: My tag"
                autoComplete="off"
                className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm font-medium focus:border-ember/35 focus:outline-none focus:ring-2 focus:ring-ember/20"
              />
            </label>
            <p id={descriptionId} className="text-xs leading-5 text-cinder/70">
              Enter to insert. Escape to cancel. This tag is only added to your prompt.
            </p>
            {pair.openTag ? (
              <pre className="rounded-lg bg-sand/55 p-3 text-xs whitespace-pre-wrap break-all">
                {`${pair.openTag}\n\n${pair.closeTag}`}
              </pre>
            ) : null}
            {error ? (
              <p id={errorId} role="alert" className="text-xs text-rose-900">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Popover.Close className="rounded-full border border-ink/10 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ember/30">
                Cancel
              </Popover.Close>
              <button
                type="submit"
                className="rounded-full bg-ember px-3 py-2 text-sm font-semibold text-ink hover:bg-ember/85 focus:outline-none focus:ring-2 focus:ring-ember/30"
              >
                Insert tag
              </button>
            </div>
          </form>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
