"use client";

import type { Note } from "@repo/shared";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styles from "../page.module.css";

type NoteEditorFormProps = {
  mode: "create" | "edit";
  initialNote?: Note;
};

function normalizeTags(value: string): string[] {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))];
}

export function NoteEditorForm({
  mode,
  initialNote,
}: NoteEditorFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialNote?.title ?? "");
  const [content, setContent] = useState(initialNote?.content ?? "");
  const [tags, setTags] = useState(
    initialNote?.tags.map((tag) => tag.name).join(", ") ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const path = mode === "create" ? "/api/notes" : `/api/notes/${initialNote?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const response = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        tags: normalizeTags(tags),
      }),
    });

    const payload = (await response.json()) as { id?: string; message?: string };

    if (!response.ok || !payload.id) {
      setMessage(payload.message ?? "保存に失敗しました。");
      return;
    }

    startTransition(() => {
      router.push(`/notes/${payload.id}`);
      router.refresh();
    });
  }

  return (
    <form className={styles.editorForm} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>タイトル</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="今日のメモ"
          required
        />
      </label>

      <label className={styles.field}>
        <span>タグ</span>
        <input
          type="text"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="react, nextjs"
        />
      </label>

      <label className={styles.field}>
        <span>本文</span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Markdown で本文を書けます。"
          required
        />
      </label>

      <div className={styles.toolbarActions}>
        <button type="submit" className={styles.primaryButton} disabled={isPending}>
          {isPending ? "保存中..." : mode === "create" ? "メモを作成" : "変更を保存"}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => router.back()}
          disabled={isPending}
        >
          戻る
        </button>
      </div>

      {message ? <p className={styles.inlineMessage}>{message}</p> : null}
    </form>
  );
}
