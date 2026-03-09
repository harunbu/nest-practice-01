"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styles from "../page.module.css";

type DeleteNoteButtonProps = {
  noteId: string;
};

export function DeleteNoteButton({ noteId }: DeleteNoteButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    setMessage(null);

    const confirmed = window.confirm("このメモを削除しますか？");

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/notes/${noteId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setMessage(payload.message ?? "削除に失敗しました。");
      return;
    }

    startTransition(() => {
      router.push("/notes");
      router.refresh();
    });
  }

  return (
    <div className={styles.inlineAction}>
      <button
        type="button"
        className={styles.dangerButton}
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? "削除中..." : "削除"}
      </button>
      {message ? <p className={styles.inlineMessage}>{message}</p> : null}
    </div>
  );
}
