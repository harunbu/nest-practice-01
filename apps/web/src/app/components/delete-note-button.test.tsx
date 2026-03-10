import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteNoteButton } from "./delete-note-button";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe("DeleteNoteButton", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("confirm", vi.fn());
  });

  it("deletes a note after confirmation and routes to the list", async () => {
    vi.mocked(confirm).mockReturnValue(true);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(<DeleteNoteButton noteId="note-1" />);

    fireEvent.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => {
      expect(confirm).toHaveBeenCalledWith("このメモを削除しますか？");
      expect(fetch).toHaveBeenCalledWith("/api/notes/note-1", {
        method: "DELETE",
      });
      expect(pushMock).toHaveBeenCalledWith("/notes");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("shows an error message when deletion fails", async () => {
    vi.mocked(confirm).mockReturnValue(true);
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "削除に失敗しました。" }),
    } as Response);

    render(<DeleteNoteButton noteId="note-1" />);

    fireEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(await screen.findByText("削除に失敗しました。")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
