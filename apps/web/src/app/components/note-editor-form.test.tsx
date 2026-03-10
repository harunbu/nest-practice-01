import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Note } from "@repo/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NoteEditorForm } from "./note-editor-form";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const backMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
    back: backMock,
  }),
}));

const initialNote: Note = {
  id: "note-1",
  title: "Existing title",
  content: "Existing content",
  tags: [
    { id: "tag-1", name: "react" },
    { id: "tag-2", name: "nextjs" },
  ],
  createdAt: "2026-03-10T00:00:00.000Z",
  updatedAt: "2026-03-10T00:00:00.000Z",
};

describe("NoteEditorForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    backMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("creates a note and normalizes duplicate tags", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "note-10",
      }),
    } as Response);

    render(<NoteEditorForm mode="create" />);

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "Test note" },
    });
    fireEvent.change(screen.getByLabelText("タグ"), {
      target: { value: "react, nextjs, react" },
    });
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "Body text" },
    });
    fireEvent.click(screen.getByRole("button", { name: "メモを作成" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test note",
          content: "Body text",
          tags: ["react", "nextjs"],
        }),
      });
      expect(pushMock).toHaveBeenCalledWith("/notes/note-10");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("updates an existing note and can navigate back", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "note-1",
      }),
    } as Response);

    render(<NoteEditorForm mode="edit" initialNote={initialNote} />);

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "Updated title" },
    });
    fireEvent.click(screen.getByRole("button", { name: "戻る" }));
    expect(backMock).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "変更を保存" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/notes/note-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Updated title",
          content: "Existing content",
          tags: ["react", "nextjs"],
        }),
      });
      expect(pushMock).toHaveBeenCalledWith("/notes/note-1");
    });
  });
});
