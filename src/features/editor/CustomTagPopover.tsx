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
  mode?: "insert" | "wrap";
  tags?: TagDefinition[];
}

export default function CustomTagPopover({
  open,
  onOpenChange,
  editorRef,
  onInsertTag,
  children,
  mode = "insert",
  tags = [],
}: ICustomTagPopoverProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef({
    start: 0,
    end: 0,
    direction: "none" as "forward" | "backward" | "none",
  });
  const insertedRef = useRef(false);
  const descriptionId = useId();
  const errorId = useId();
  const pair = tags.find((tag) => tag.id === selectedTagId) ?? buildTagPair(name);
  const isWrapping = mode === "wrap";

  const restoreSelection = () => {
    const { start, end, direction } = selectionRef.current;
    editorRef.current?.setSelectionRange(start, end, direction);
  };

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange} modal>
      <div className="relative flex min-h-0 min-w-0 flex-1">
        {children}
        <Popover.Anchor className="absolute left-5 top-5" />
      </div>
      <Popover.Portal>
        <Popover.Content
          aria-label={isWrapping ? "Wrap selection in a tag" : "Insert custom tag"}
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
            setSelectedTagId("");
            setError("");
            inputRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            setSelectedTagId("");
            editorRef.current?.focus();
            if (!insertedRef.current) restoreSelection();
          }}
          className="z-[60] max-h-[var(--radix-popover-content-available-height)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto border border-control bg-surface p-4 text-foreground outline-none"
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
            {isWrapping ? (
              <label className="block text-sm font-semibold">
                Use tag
                <select
                  value={selectedTagId}
                  onChange={(event) => {
                    setSelectedTagId(event.target.value);
                    setError("");
                  }}
                  className="field mt-2"
                >
                  <option value="">Custom tag name</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {!selectedTagId ? (
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
                  className="field mt-2 aria-[invalid=true]:border-danger"
                />
              </label>
            ) : null}
            <p id={descriptionId} className="text-xs leading-5 text-muted">
              {isWrapping
                ? "Your selected text stays inside the tags. Escape to cancel."
                : "Enter to insert. Escape to cancel. This tag is only added to your prompt."}
            </p>
            {pair.openTag ? (
              <pre className="bg-elevated p-3 text-xs whitespace-pre-wrap break-all">
                {`${pair.openTag}\n${isWrapping ? "Selected text" : ""}\n${pair.closeTag}`}
              </pre>
            ) : null}
            {error ? (
              <p id={errorId} role="alert" className="text-xs text-danger">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Popover.Close className="button">Cancel</Popover.Close>
              <button type="submit" className="button button-primary">
                {isWrapping ? "Wrap selection" : "Insert tag"}
              </button>
            </div>
          </form>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
