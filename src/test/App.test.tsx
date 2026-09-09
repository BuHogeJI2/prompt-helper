import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";
import { STORAGE_KEYS } from "@/constants/storage";
import { createDefaultTags } from "@/constants/tags";

const getEditor = () => screen.getByRole("textbox", { name: "Prompt editor" });

const createMediaQueryList = (query: string, matches: boolean): MediaQueryList => ({
  matches,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
});

const mockDesktopMedia = (matches: boolean) => {
  vi.mocked(window.matchMedia).mockImplementation((query) =>
    createMediaQueryList(query, query === "(min-width: 1024px)" && matches),
  );
};

const installDesktopMediaController = (initialMatches: boolean) => {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = "(min-width: 1024px)";
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  } as MediaQueryList;

  vi.mocked(window.matchMedia).mockImplementation(() => mediaQuery);

  return (nextMatches: boolean) => {
    matches = nextMatches;
    const event = { matches, media: query } as MediaQueryListEvent;
    listeners.forEach((listener) => listener(event));
  };
};

const createRect = (left: number, top: number, width: number, height: number): DOMRect => ({
  x: left,
  y: top,
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
  toJSON: () => ({}),
});

const mockTagCardLayout = () => {
  const viewportRect = createRect(0, 0, 1200, 800);
  const tagRects = new Map([
    ["task", createRect(0, 0, 300, 52)],
    ["output", createRect(0, 60, 300, 52)],
  ]);

  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    return tagRects.get(this.dataset.tagId ?? "") ?? viewportRect;
  });
};

const getTagOrder = (groupTitle: string) =>
  within(screen.getByRole("list", { name: `${groupTitle} prompt blocks` }))
    .getAllByRole("listitem")
    .map((item) => item.getAttribute("data-tag-id"));

describe("Prompt Helper", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(window, "matchMedia");
    mockDesktopMedia(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates exactly one immediately visible newline for each Enter press", async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor() as HTMLTextAreaElement;

    await user.type(editor, "First line{Enter}");

    expect(editor).toHaveValue("First line\n");
    expect(editor.selectionStart).toBe(11);
    expect(editor.selectionEnd).toBe(11);

    await user.keyboard("{Enter}");

    expect(editor).toHaveValue("First line\n\n");
    expect(editor.selectionStart).toBe(12);
    expect(editor.selectionEnd).toBe(12);
  });

  it("uses the browser text editing path for selection replacement and deletion", async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor() as HTMLTextAreaElement;

    await user.type(editor, "Replace this");
    editor.setSelectionRange(0, 7);
    await user.keyboard("Keep");
    await user.keyboard("{Backspace}");

    expect(editor).toHaveValue("Kee this");
  });

  it("inserts a tag block at the current selection and restores the caret inside", async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor() as HTMLTextAreaElement;

    await user.type(editor, "Replace me");
    editor.setSelectionRange(0, 7);
    await user.click(screen.getByRole("button", { name: "Insert Task block" }));

    expect(editor).toHaveValue("<TASK>\n\n</TASK>\n me");
    expect(editor.selectionStart).toBe(7);
    expect(editor.selectionEnd).toBe(7);
    expect(editor).toHaveFocus();
  });

  it("inserts built-in tags through Alt+Shift shortcuts", () => {
    render(<App />);
    const editor = getEditor() as HTMLTextAreaElement;
    editor.focus();

    fireEvent.keyDown(window, {
      key: "T",
      code: "KeyT",
      altKey: true,
      shiftKey: true,
    });

    expect(editor).toHaveValue("<TASK>\n\n</TASK>\n");
  });

  it("inserts a one-time custom tag at the saved selection and focuses between its tags", async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor() as HTMLTextAreaElement;
    const storedTags = window.localStorage.getItem(STORAGE_KEYS.tags);

    await user.type(editor, "Before replace after");
    editor.setSelectionRange(7, 14);
    await user.keyboard("{Alt>}{Shift>}[KeyU]{/Shift}{/Alt}");

    const popup = screen.getByRole("dialog", { name: "Insert custom tag" });
    const input = within(popup).getByRole("textbox", { name: "Tag name" });
    expect(input).toHaveFocus();
    await user.keyboard("my tag");
    expect(popup).toHaveTextContent("<MY_TAG>");
    await user.keyboard("{Enter}");

    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(editor).toHaveValue("Before \n<MY_TAG>\n\n</MY_TAG>\n after");
    expect(editor).toHaveFocus();
    expect(editor.selectionStart).toBe("Before \n<MY_TAG>\n".length);
    expect(editor.selectionEnd).toBe(editor.selectionStart);
    expect(window.localStorage.getItem(STORAGE_KEYS.editor)).toBe(editor.value);
    expect(window.localStorage.getItem(STORAGE_KEYS.tags)).toBe(storedTags);

    await user.keyboard("Content");
    expect(editor).toHaveValue("Before \n<MY_TAG>\nContent\n</MY_TAG>\n after");
  });

  it.each(["escape", "button"])(
    "cancels custom tag insertion via %s and restores the selection",
    async (method) => {
      const user = userEvent.setup();
      render(<App />);
      const editor = getEditor() as HTMLTextAreaElement;

      await user.type(editor, "Keep this text");
      editor.setSelectionRange(5, 9, "backward");
      await user.keyboard("{Alt>}{Shift>}[KeyU]{/Shift}{/Alt}");
      await user.keyboard("discard");
      if (method === "escape") {
        await user.keyboard("{Escape}");
      } else {
        await user.click(screen.getByRole("button", { name: "Cancel" }));
      }

      await waitFor(() =>
        expect(screen.queryByRole("dialog", { name: "Insert custom tag" })).not.toBeInTheDocument(),
      );
      expect(editor).toHaveValue("Keep this text");
      expect(editor).toHaveFocus();
      expect(editor.selectionStart).toBe(5);
      expect(editor.selectionEnd).toBe(9);
      expect(editor.selectionDirection).toBe("backward");

      await user.keyboard("{Alt>}{Shift>}[KeyU]{/Shift}{/Alt}");
      expect(screen.getByRole("textbox", { name: "Tag name" })).toHaveValue("");
    },
  );

  it("rejects empty or unsupported custom tag names and allows correcting them", async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor();
    await user.click(editor);
    await user.keyboard("{Alt>}{Shift>}[KeyU]{/Shift}{/Alt}{Enter}");

    const input = screen.getByRole("textbox", { name: "Tag name" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("at least one English letter or number");
    expect(editor).toHaveValue("");

    await user.keyboard("---{Enter}");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(editor).toHaveValue("");
    await user.clear(input);
    await user.keyboard("  brief 2  ");
    await user.click(screen.getByRole("button", { name: "Insert tag" }));

    await waitFor(() => expect(editor).toHaveFocus());
    expect(editor).toHaveValue("<BRIEF_2>\n\n</BRIEF_2>\n");
    expect((editor as HTMLTextAreaElement).selectionStart).toBe(10);
  });

  it("disables built-in tag shortcuts while entering a custom tag", async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor();
    await user.click(editor);
    await user.keyboard("{Alt>}{Shift>}[KeyU]{/Shift}{/Alt}");
    await user.keyboard("{Alt>}{Shift>}[KeyT]{/Shift}{/Alt}");

    expect(editor).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Tag name" })).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(editor).toHaveFocus());
    await user.keyboard("{Alt>}{Shift>}[KeyT]{/Shift}{/Alt}");
    expect(editor).toHaveValue("<TASK>\n\n</TASK>\n");
  });

  it("only opens the custom tag popup from the editor and ignores composition and repeated hotkeys", async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor();
    const shortcut = { key: "U", code: "KeyU", altKey: true, shiftKey: true };

    fireEvent.keyDown(window, shortcut);
    expect(screen.queryByRole("dialog", { name: "Insert custom tag" })).not.toBeInTheDocument();

    await user.click(editor);
    for (const ignored of [
      { isComposing: true },
      { repeat: true },
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: false },
    ]) {
      fireEvent.keyDown(editor, { ...shortcut, ...ignored });
      expect(screen.queryByRole("dialog", { name: "Insert custom tag" })).not.toBeInTheDocument();
    }

    await user.click(screen.getByRole("button", { name: "Manage tags" }));
    await user.click(screen.getByRole("button", { name: /Create new tag/ }));
    await user.keyboard("{Alt>}{Shift>}[KeyU]{/Shift}{/Alt}");
    expect(screen.queryByRole("dialog", { name: "Insert custom tag" })).not.toBeInTheDocument();
  });

  it("does not submit a custom tag while Enter is confirming text composition", async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor();
    await user.click(editor);
    await user.keyboard("{Alt>}{Shift>}[KeyU]{/Shift}{/Alt}Draft");
    const input = screen.getByRole("textbox", { name: "Tag name" });

    const defaultAllowed = fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
      isComposing: true,
    });

    expect(defaultAllowed).toBe(false);
    expect(input).toHaveFocus();
    expect(editor).toHaveValue("");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(editor).toHaveFocus());
    expect(editor).toHaveValue("<DRAFT>\n\n</DRAFT>\n");
  });

  it("shows compact tag controls and reveals supporting information on demand", async () => {
    const user = userEvent.setup();
    render(<App />);

    const insertTask = screen.getByRole("button", { name: "Insert Task block" });
    expect(insertTask).toHaveTextContent("<TASK>");
    expect(insertTask).toHaveTextContent("Alt+Shift+T");
    expect(screen.queryByText("What should the model do?")).not.toBeInTheDocument();

    const taskInformation = screen.getByRole("button", { name: "About <TASK>" });
    await user.click(taskInformation);

    const popover = screen.getByRole("dialog", { name: "Task" });
    expect(within(popover).getByText("What should the model do?")).toBeInTheDocument();
    expect(popover).toHaveTextContent("<TASK>");
    expect(popover).toHaveTextContent("</TASK>");
    expect(popover).toHaveTextContent("Keyboard shortcut: Alt+Shift+T");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(popover).not.toBeInTheDocument());
    expect(taskInformation).toHaveFocus();
  });

  it("keeps panel and group guidance behind information controls", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.queryByText("Select a block to insert it at the editor cursor."),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Prompt block help" }));
    expect(screen.getByRole("dialog", { name: "Using prompt blocks" })).toHaveTextContent(
      "Built-in blocks support Alt+Shift+letter shortcuts.",
    );
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "About Core blocks" }));
    expect(screen.getByRole("dialog", { name: "Core blocks" })).toHaveTextContent(
      "Set the task and the required output shape first.",
    );
  });

  it("reorders a group with the keyboard and persists the announced result", async () => {
    mockTagCardLayout();
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    const taskHandle = screen.getByRole("button", { name: "Reorder Task block" });

    taskHandle.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(taskHandle).toHaveAttribute("aria-grabbed", "true"));

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(getTagOrder("Core blocks")).toEqual(["output", "task"]);
      const storedTags = JSON.parse(
        window.localStorage.getItem(STORAGE_KEYS.tags) ?? "[]",
      ) as Array<{ groupId: string; id: string }>;
      expect(storedTags.filter((tag) => tag.groupId === "core").map((tag) => tag.id)).toEqual([
        "output",
        "task",
      ]);
    });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Reorder Task block" })).toHaveFocus(),
    );
    expect(document.getElementById("dnd-kit-announcement-tag-order-core")).toHaveTextContent(
      "Task placed at position 2 of 2 in Core blocks.",
    );

    unmount();
    render(<App />);
    expect(getTagOrder("Core blocks")).toEqual(["output", "task"]);
  });

  it("cancels keyboard reordering without changing the stored order", async () => {
    mockTagCardLayout();
    const user = userEvent.setup();
    render(<App />);
    const taskHandle = screen.getByRole("button", { name: "Reorder Task block" });

    taskHandle.focus();
    await user.keyboard("[Space]");
    await waitFor(() => expect(taskHandle).toHaveAttribute("aria-grabbed", "true"));
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(getTagOrder("Core blocks")).toEqual(["task", "output"]);
      expect(document.getElementById("dnd-kit-announcement-tag-order-core")).toHaveTextContent(
        "Reordering Task canceled. It remains at position 1 of 2 in Core blocks.",
      );
    });

    const storedTags = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.tags) ?? "[]") as Array<{
      groupId: string;
      id: string;
    }>;
    expect(storedTags.filter((tag) => tag.groupId === "core").map((tag) => tag.id)).toEqual([
      "task",
      "output",
    ]);
    await waitFor(() => expect(taskHandle).toHaveFocus());
  });

  it("does not expose a reorder handle for a one-item group", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      STORAGE_KEYS.tags,
      JSON.stringify([
        ...createDefaultTags(),
        {
          id: "custom-tag",
          label: "Custom tag",
          openTag: "<CUSTOM_TAG>",
          closeTag: "</CUSTOM_TAG>",
          groupId: "custom",
          source: "user",
        },
      ]),
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Custom tags, 1 block" }));

    expect(screen.getByRole("button", { name: "Insert Custom tag block" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reorder Custom tag block" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "About <CUSTOM_TAG>" }));
    const customTagInformation = screen.getByRole("dialog", { name: "Custom tag" });
    expect(customTagInformation).toHaveTextContent("<CUSTOM_TAG>");
    expect(customTagInformation).toHaveTextContent("</CUSTOM_TAG>");
    expect(customTagInformation).not.toHaveTextContent("Keyboard shortcut:");
  });

  it("persists native editor input with the existing storage key", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(getEditor(), "Saved prompt");

    await waitFor(() => {
      expect(window.localStorage.getItem(STORAGE_KEYS.editor)).toBe("Saved prompt");
    });
  });

  it("uses native paste and copies the complete prompt", async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");

    await user.click(editor);
    await user.paste("First\nSecond");
    await user.click(screen.getByRole("button", { name: "Quick copy" }));

    expect(editor).toHaveValue("First\nSecond");
    expect(writeText).toHaveBeenCalledWith("First\nSecond");
    expect(screen.getByRole("status", { name: "Editor status" })).toHaveTextContent(
      "Copied to clipboard.",
    );
    expect(
      screen.queryByText("Copy status and editor safety actions show here."),
    ).not.toBeInTheDocument();
  });

  it("clears editor content only after confirmation", async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor();

    await user.type(editor, "Do not lose this");
    await user.click(screen.getByRole("button", { name: "Clear editor" }));

    const dialog = screen.getByRole("alertdialog", { name: "Clear the editor?" });
    expect(editor).toHaveValue("Do not lose this");

    await user.click(within(dialog).getByRole("button", { name: "Clear editor" }));

    expect(editor).toHaveValue("");
  });

  it("creates, updates, and deletes a custom tag through explicit tag operations", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Manage tags" }));
    const dialog = screen.getByRole("dialog", { name: "Manage tags" });
    const createButton = within(dialog).getByRole("button", { name: /Create new tag/ });
    expect(createButton).toHaveFocus();

    await user.click(createButton);
    const tagInput = within(dialog).getByRole("textbox", { name: "Tag" });
    expect(tagInput).toHaveFocus();

    await user.type(tagInput, "Writing brief");
    await user.type(within(dialog).getByRole("textbox", { name: "Hint" }), "Draft guidance");
    await user.click(within(dialog).getByRole("button", { name: "Add tag" }));

    expect(within(dialog).getByText("Tag added.")).toBeInTheDocument();

    await user.clear(tagInput);
    await user.type(tagInput, "Updated brief");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      const storedTags = JSON.parse(
        window.localStorage.getItem(STORAGE_KEYS.tags) ?? "[]",
      ) as Array<{ label: string }>;
      expect(storedTags.some((tag) => tag.label === "Updated brief")).toBe(true);
    });

    await user.click(within(dialog).getByRole("button", { name: "Delete tag" }));

    const deleteConfirmation = screen.getByRole("alertdialog", {
      name: "Delete Updated brief?",
    });
    const storedBeforeConfirmation = JSON.parse(
      window.localStorage.getItem(STORAGE_KEYS.tags) ?? "[]",
    ) as Array<{ source: string }>;
    expect(storedBeforeConfirmation.some((tag) => tag.source === "user")).toBe(true);

    await user.click(within(deleteConfirmation).getByRole("button", { name: "Delete tag" }));

    await waitFor(() => {
      const storedTags = JSON.parse(
        window.localStorage.getItem(STORAGE_KEYS.tags) ?? "[]",
      ) as Array<{ source: string }>;
      expect(storedTags.some((tag) => tag.source === "user")).toBe(false);
    });
    expect(createButton).toHaveFocus();
  });

  it("moves focus between the tag list and editor views", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Manage tags" }));
    const dialog = screen.getByRole("dialog", { name: "Manage tags" });
    const createButton = within(dialog).getByRole("button", { name: /Create new tag/ });
    const taskButton = within(dialog).getByRole("button", { name: /^Task/ });

    await user.click(taskButton);
    expect(within(dialog).getByRole("textbox", { name: "Tag" })).toHaveFocus();

    await user.click(within(dialog).getByRole("button", { name: "All tags" }));
    expect(createButton).toHaveFocus();
  });

  it("resets stored tags only after confirmation", async () => {
    const user = userEvent.setup();
    const customTag = {
      id: "custom-tag",
      label: "Custom tag",
      openTag: "<CUSTOM_TAG>",
      closeTag: "</CUSTOM_TAG>",
      groupId: "custom",
      source: "user",
    };
    window.localStorage.setItem(
      STORAGE_KEYS.tags,
      JSON.stringify([...createDefaultTags(), customTag]),
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Manage tags" }));
    const dialog = screen.getByRole("dialog", { name: "Manage tags" });
    await user.click(within(dialog).getByRole("button", { name: "Reset defaults" }));

    const confirmation = screen.getByRole("alertdialog", { name: "Reset all tags?" });
    await user.click(within(confirmation).getByRole("button", { name: "Reset tags" }));

    await waitFor(() => {
      const storedTags = JSON.parse(
        window.localStorage.getItem(STORAGE_KEYS.tags) ?? "[]",
      ) as Array<{ id: string; source: string }>;
      expect(storedTags).toHaveLength(createDefaultTags().length);
      expect(storedTags.some((tag) => tag.source === "user")).toBe(false);
      expect(storedTags.map((tag) => tag.id)).toEqual(createDefaultTags().map((tag) => tag.id));
    });
  });

  it("disables tag hotkeys while a confirmation or management dialog is open", async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor();

    await user.click(screen.getByRole("button", { name: "Manage tags" }));
    fireEvent.keyDown(window, {
      key: "T",
      code: "KeyT",
      altKey: true,
      shiftKey: true,
    });

    expect(editor).toHaveValue("");
  });

  it("keeps the editor visible with persisted Core quick tags on smaller screens", async () => {
    mockDesktopMedia(false);
    const defaultTags = createDefaultTags();
    const reorderedTags = [
      defaultTags.find((tag) => tag.id === "output")!,
      defaultTags.find((tag) => tag.id === "task")!,
      ...defaultTags.filter((tag) => tag.id !== "output" && tag.id !== "task"),
    ];
    window.localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(reorderedTags));
    const user = userEvent.setup();

    render(<App />);

    const launcher = screen.getByRole("region", { name: "Prompt block shortcuts" });
    const quickButtons = within(launcher).getAllByRole("button", { name: /Insert .+ block/ });
    expect(quickButtons.map((button) => button.textContent)).toEqual(["<OUTPUT>", "<TASK>"]);
    expect(getEditor()).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Core blocks prompt blocks" }),
    ).not.toBeInTheDocument();

    await user.click(quickButtons[0]);

    expect(getEditor()).toHaveValue("<OUTPUT>\n\n</OUTPUT>\n");
    expect(getEditor()).toHaveFocus();
  });

  it("opens one full mobile palette and closes into the editor after insertion", async () => {
    mockDesktopMedia(false);
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor() as HTMLTextAreaElement;

    await user.type(editor, "Keep this");
    editor.setSelectionRange(4, 4);
    await user.click(screen.getByRole("button", { name: "All blocks" }));

    const drawer = screen.getByRole("dialog", { name: "All blocks" });
    expect(
      within(drawer).getByRole("list", { name: "Core blocks prompt blocks" }),
    ).toBeInTheDocument();
    const taskHandle = within(drawer).getByRole("button", { name: "Reorder Task block" });
    expect(drawer).toContainElement(
      document.getElementById(taskHandle.getAttribute("aria-describedby") ?? ""),
    );
    expect(screen.getAllByRole("list", { name: "Core blocks prompt blocks" })).toHaveLength(1);
    await waitFor(() =>
      expect(document.querySelectorAll("#dnd-kit-announcement-tag-order-core")).toHaveLength(1),
    );

    await user.click(within(drawer).getByRole("button", { name: "Insert Task block" }));

    await waitFor(() => expect(drawer).not.toBeInTheDocument());
    expect(editor).toHaveValue("Keep\n<TASK>\n\n</TASK>\n this");
    expect(editor.selectionStart).toBe(12);
    expect(editor.selectionEnd).toBe(12);
    await waitFor(() => expect(editor).toHaveFocus());
  });

  it("returns focus to the mobile launcher when the drawer is dismissed", async () => {
    mockDesktopMedia(false);
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByRole("button", { name: "All blocks" });

    await user.click(trigger);
    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "All blocks" })).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("disables global tag hotkeys while the mobile drawer is open", async () => {
    mockDesktopMedia(false);
    const user = userEvent.setup();
    render(<App />);
    const editor = getEditor();

    await user.click(screen.getByRole("button", { name: "All blocks" }));
    fireEvent.keyDown(window, {
      key: "T",
      code: "KeyT",
      altKey: true,
      shiftKey: true,
    });

    expect(editor).toHaveValue("");
  });

  it("cancels keyboard reordering without dismissing the mobile drawer", async () => {
    mockDesktopMedia(false);
    mockTagCardLayout();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "All blocks" }));
    const drawer = screen.getByRole("dialog", { name: "All blocks" });
    const taskHandle = within(drawer).getByRole("button", { name: "Reorder Task block" });

    taskHandle.focus();
    await user.keyboard("[Space]");
    await waitFor(() => expect(taskHandle).toHaveAttribute("aria-grabbed", "true"));
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Escape}");

    expect(drawer).toBeInTheDocument();
    await waitFor(() => expect(getTagOrder("Core blocks")).toEqual(["task", "output"]));
    expect(window.localStorage.getItem(STORAGE_KEYS.tags)).toContain('"id":"task"');
  });

  it("resets the mobile drawer when crossing the desktop breakpoint", async () => {
    const setDesktopMatches = installDesktopMediaController(false);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "All blocks" }));
    expect(screen.getByRole("dialog", { name: "All blocks" })).toBeInTheDocument();

    act(() => setDesktopMatches(true));
    expect(screen.queryByRole("button", { name: "All blocks" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "All blocks" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Prompt blocks" })).toBeInTheDocument();

    act(() => setDesktopMatches(false));
    expect(screen.getByRole("button", { name: "All blocks" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("dialog", { name: "All blocks" })).not.toBeInTheDocument();
  });
});
