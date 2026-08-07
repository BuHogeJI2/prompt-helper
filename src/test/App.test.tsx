import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";
import { STORAGE_KEYS } from "@/constants/storage";
import { createDefaultTags } from "@/constants/tags";

const getEditor = () => screen.getByRole("textbox", { name: "Prompt editor" });

describe("Prompt Helper", () => {
  beforeEach(() => {
    window.localStorage.clear();
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
    await user.click(screen.getByRole("button", { name: /Task/ }));

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
    expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard.");
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
      ) as Array<{ source: string }>;
      expect(storedTags).toHaveLength(createDefaultTags().length);
      expect(storedTags.some((tag) => tag.source === "user")).toBe(false);
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
});
