export function scrollToEditorPosition(editor: HTMLTextAreaElement, position: number) {
  const style = getComputedStyle(editor);
  const mirror = document.createElement("div");
  const marker = document.createElement("span");

  for (const property of [
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "font-variant",
    "line-height",
    "letter-spacing",
    "word-spacing",
    "text-indent",
    "text-transform",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "tab-size",
  ]) {
    mirror.style.setProperty(property, style.getPropertyValue(property));
  }
  Object.assign(mirror.style, {
    position: "fixed",
    top: "0",
    left: "0",
    visibility: "hidden",
    pointerEvents: "none",
    boxSizing: "border-box",
    width: `${editor.clientWidth}px`,
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
  });
  mirror.textContent = editor.value.slice(0, position);
  marker.textContent = editor.value.slice(position) || "\u200b";
  mirror.append(marker);
  document.body.append(mirror);

  try {
    // Measure wrapped text with the editor's actual width and typography.
    const top = marker.getBoundingClientRect().top - mirror.getBoundingClientRect().top;
    editor.scrollTop = Math.max(0, top - editor.clientHeight / 3);
  } finally {
    mirror.remove();
  }
}
