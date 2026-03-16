export type EditorSelection = {
  start: number;
  end: number;
};

export type EditorToken =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "tag";
      value: string;
    };

const TAG_TOKEN_PATTERN = /<\/?[A-Z0-9_]+>/g;
const BLOCK_ELEMENT_NAMES = new Set(["DIV", "P"]);

const getNodeTextLength = (node: Node): number => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.length ?? 0;
  }

  if (node.nodeName === "BR") {
    return 1;
  }

  let length = 0;
  node.childNodes.forEach((child) => {
    length += getNodeTextLength(child);
  });
  return length;
};

const getOffsetWithinElement = (node: Node, offset: number) => {
  let total = 0;

  for (let index = 0; index < offset; index += 1) {
    const child = node.childNodes.item(index);
    if (child) {
      total += getNodeTextLength(child);
    }
  }

  return total;
};

const getOffsetForPoint = (root: HTMLElement, container: Node, offset: number) => {
  let total = 0;
  let resolvedOffset: number | null = null;

  const visit = (node: Node) => {
    if (resolvedOffset !== null) {
      return;
    }

    if (node === container) {
      if (node.nodeType === Node.TEXT_NODE) {
        resolvedOffset = total + offset;
        return;
      }

      resolvedOffset = total + getOffsetWithinElement(node, offset);
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      total += node.textContent?.length ?? 0;
      return;
    }

    if (node.nodeName === "BR") {
      total += 1;
      return;
    }

    node.childNodes.forEach((child) => visit(child));
  };

  visit(root);

  return resolvedOffset ?? total;
};

const getChildIndex = (node: Node) => {
  if (!node.parentNode) {
    return 0;
  }

  return Array.prototype.indexOf.call(node.parentNode.childNodes, node) as number;
};

const getPointForOffset = (root: HTMLElement, targetOffset: number) => {
  if (root.childNodes.length === 0) {
    return { node: root, offset: 0 };
  }

  let remaining = targetOffset;
  let resolvedPoint: { node: Node; offset: number } | null = null;

  const visit = (node: Node) => {
    if (resolvedPoint) {
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const length = node.textContent?.length ?? 0;
      if (remaining <= length) {
        resolvedPoint = { node, offset: remaining };
        return;
      }

      remaining -= length;
      return;
    }

    if (node.nodeName === "BR") {
      const parent = node.parentNode;
      if (!parent) {
        return;
      }

      if (remaining <= 1) {
        resolvedPoint = {
          node: parent,
          offset: getChildIndex(node) + Number(remaining === 1),
        };
        return;
      }

      remaining -= 1;
      return;
    }

    if (node.childNodes.length === 0) {
      if (remaining === 0) {
        resolvedPoint = { node, offset: 0 };
      }
      return;
    }

    node.childNodes.forEach((child) => visit(child));
  };

  visit(root);

  return resolvedPoint ?? { node: root, offset: root.childNodes.length };
};

export const tokenizeEditorLine = (line: string) => {
  const tokens: EditorToken[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(TAG_TOKEN_PATTERN)) {
    const [value] = match;
    const startIndex = match.index ?? 0;

    if (startIndex > lastIndex) {
      tokens.push({
        type: "text",
        value: line.slice(lastIndex, startIndex),
      });
    }

    tokens.push({
      type: "tag",
      value,
    });

    lastIndex = startIndex + value.length;
  }

  if (lastIndex < line.length) {
    tokens.push({
      type: "text",
      value: line.slice(lastIndex),
    });
  }

  return tokens;
};

export const readPlainTextFromEditable = (root: HTMLElement) => {
  let text = "";

  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? "";
      return;
    }

    if (node.nodeName === "BR") {
      text += "\n";
      return;
    }

    const isBlockElement =
      node instanceof HTMLElement && BLOCK_ELEMENT_NAMES.has(node.nodeName) && node !== root;

    node.childNodes.forEach((child) => visit(child));

    if (isBlockElement && text.at(-1) !== "\n") {
      text += "\n";
    }
  };

  root.childNodes.forEach((child) => visit(child));

  return text.replace(/\r/g, "").replace(/\u00a0/g, " ");
};

export const getSelectionOffsets = (root: HTMLElement): EditorSelection | null => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);

  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
    return null;
  }

  return {
    start: getOffsetForPoint(root, range.startContainer, range.startOffset),
    end: getOffsetForPoint(root, range.endContainer, range.endOffset),
  };
};

export const restoreSelection = (root: HTMLElement, selection: EditorSelection) => {
  const nextSelection = window.getSelection();
  if (!nextSelection) {
    return;
  }

  const startPoint = getPointForOffset(root, selection.start);
  const endPoint = getPointForOffset(root, selection.end);
  const range = document.createRange();

  range.setStart(startPoint.node, startPoint.offset);
  range.setEnd(endPoint.node, endPoint.offset);

  nextSelection.removeAllRanges();
  nextSelection.addRange(range);
};

export const replaceTextInSelection = (
  text: string,
  selection: EditorSelection,
  insertedText: string,
) => {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);
  const nextText = text.slice(0, start) + insertedText + text.slice(end);
  const nextOffset = start + insertedText.length;

  return {
    text: nextText,
    selection: {
      start: nextOffset,
      end: nextOffset,
    },
  };
};

export const deleteBackwardInSelection = (text: string, selection: EditorSelection) => {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);

  if (start !== end) {
    return replaceTextInSelection(text, selection, "");
  }

  if (start === 0) {
    return {
      text,
      selection,
    };
  }

  return {
    text: text.slice(0, start - 1) + text.slice(end),
    selection: {
      start: start - 1,
      end: start - 1,
    },
  };
};

export const deleteForwardInSelection = (text: string, selection: EditorSelection) => {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);

  if (start !== end) {
    return replaceTextInSelection(text, selection, "");
  }

  if (end >= text.length) {
    return {
      text,
      selection,
    };
  }

  return {
    text: text.slice(0, start) + text.slice(end + 1),
    selection: {
      start,
      end: start,
    },
  };
};
