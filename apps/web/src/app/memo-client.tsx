"use client";

import { startTransition, useEffect, useState } from "react";
import type { AuthResponse, Note } from "@repo/shared";
import styles from "./page.module.css";

const clientApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3001";

type AuthMode = "login" | "register";

type AuthFormState = {
  email: string;
  password: string;
};

type NoteFormState = {
  title: string;
  content: string;
  tags: string;
};

type SessionState = {
  accessToken: string;
  user: AuthResponse["user"];
};

type MemoClientProps = {
  apiReachable: boolean;
};

const emptyNoteForm: NoteFormState = {
  title: "",
  content: "",
  tags: "",
};

function normalizeTags(value: string): string[] {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))];
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const response = await fetch(`${clientApiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message)
      ? payload.message.join(", ")
      : payload?.message ?? `Request failed with ${response.status}`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function MemoClient({ apiReachable }: MemoClientProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("register");
  const [authForm, setAuthForm] = useState<AuthFormState>({
    email: "",
    password: "",
  });
  const [session, setSession] = useState<SessionState | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState<NoteFormState>(emptyNoteForm);
  const [tagFilter, setTagFilter] = useState("");
  const [notesPending, setNotesPending] = useState(false);
  const [notesMessage, setNotesMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("memo-session");

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as SessionState;
      setSession(parsed);
    } catch {
      window.localStorage.removeItem("memo-session");
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setNotes([]);
      setSelectedNoteId(null);
      setNoteForm(emptyNoteForm);
      setIsEditing(false);
      return;
    }

    void loadNotes(session.accessToken, tagFilter);
  }, [session, tagFilter]);

  const selectedNote =
    selectedNoteId === null
      ? null
      : notes.find((note) => note.id === selectedNoteId) ?? null;

  async function loadNotes(accessToken: string, tag?: string) {
    setNotesPending(true);
    setNotesMessage(null);

    try {
      const query = tag ? `?tag=${encodeURIComponent(tag)}` : "";
      const nextNotes = await requestJson<Note[]>(
        `/notes${query}`,
        {},
        accessToken,
      );

      setNotes(nextNotes);
      setSelectedNoteId((currentId) => {
        if (!currentId) {
          return nextNotes[0]?.id ?? null;
        }

        return nextNotes.some((note) => note.id === currentId)
          ? currentId
          : nextNotes[0]?.id ?? null;
      });
    } catch (error) {
      setNotesMessage(getErrorMessage(error));
    } finally {
      setNotesPending(false);
    }
  }

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthPending(true);
    setAuthMessage(null);

    try {
      const response = await requestJson<AuthResponse>(`/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(authForm),
      });

      const nextSession = {
        accessToken: response.accessToken,
        user: response.user,
      };

      window.localStorage.setItem("memo-session", JSON.stringify(nextSession));

      startTransition(() => {
        setSession(nextSession);
        setAuthForm({ email: "", password: "" });
        setAuthMessage(
          authMode === "register"
            ? "アカウントを作成しました。"
            : "ログインしました。",
        );
      });
    } catch (error) {
      setAuthMessage(getErrorMessage(error));
    } finally {
      setAuthPending(false);
    }
  }

  function beginCreate() {
    setSelectedNoteId(null);
    setNoteForm(emptyNoteForm);
    setIsEditing(true);
    setNotesMessage(null);
  }

  function beginEdit(note: Note) {
    setSelectedNoteId(note.id);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags.map((tag) => tag.name).join(", "),
    });
    setIsEditing(true);
    setNotesMessage(null);
  }

  async function handleNoteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      return;
    }

    setNotesPending(true);
    setNotesMessage(null);

    try {
      const payload = {
        title: noteForm.title,
        content: noteForm.content,
        tags: normalizeTags(noteForm.tags),
      };

      const savedNote = selectedNoteId
        ? await requestJson<Note>(
            `/notes/${selectedNoteId}`,
            {
              method: "PATCH",
              body: JSON.stringify(payload),
            },
            session.accessToken,
          )
        : await requestJson<Note>(
            "/notes",
            {
              method: "POST",
              body: JSON.stringify(payload),
            },
            session.accessToken,
          );

      await loadNotes(session.accessToken, tagFilter);
      setSelectedNoteId(savedNote.id);
      setIsEditing(false);
      setNotesMessage(selectedNoteId ? "メモを更新しました。" : "メモを作成しました。");
    } catch (error) {
      setNotesMessage(getErrorMessage(error));
    } finally {
      setNotesPending(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (!session) {
      return;
    }

    setNotesPending(true);
    setNotesMessage(null);

    try {
      await requestJson<{ success: true }>(
        `/notes/${noteId}`,
        { method: "DELETE" },
        session.accessToken,
      );
      await loadNotes(session.accessToken, tagFilter);
      setIsEditing(false);
      setNoteForm(emptyNoteForm);
      setNotesMessage("メモを削除しました。");
    } catch (error) {
      setNotesMessage(getErrorMessage(error));
    } finally {
      setNotesPending(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem("memo-session");
    setSession(null);
    setAuthMessage("ログアウトしました。");
  }

  return (
    <section className={styles.workspace}>
      <div className={styles.authColumn}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.cardLabel}>Auth</p>
              <h2>{session ? "ログイン中" : "登録とログイン"}</h2>
            </div>
            <span
              className={session ? styles.statusOk : styles.statusNeutral}
              aria-live="polite"
            >
              {session ? "Ready" : "Guest"}
            </span>
          </div>

          {session ? (
            <div className={styles.sessionBox}>
              <p className={styles.sessionEmail}>{session.user.email}</p>
              <p className={styles.sessionMeta}>
                作成日 {new Date(session.user.createdAt).toLocaleDateString("ja-JP")}
              </p>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleLogout}
              >
                ログアウト
              </button>
            </div>
          ) : (
            <>
              <div className={styles.segmentedControl}>
                <button
                  type="button"
                  className={
                    authMode === "register"
                      ? styles.segmentActive
                      : styles.segmentButton
                  }
                  onClick={() => setAuthMode("register")}
                >
                  新規登録
                </button>
                <button
                  type="button"
                  className={
                    authMode === "login"
                      ? styles.segmentActive
                      : styles.segmentButton
                  }
                  onClick={() => setAuthMode("login")}
                >
                  ログイン
                </button>
              </div>

              <form className={styles.form} onSubmit={handleAuthSubmit}>
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(event) =>
                      setAuthForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Password</span>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(event) =>
                      setAuthForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="8文字以上"
                    minLength={8}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={authPending || !apiReachable}
                >
                  {authPending
                    ? "送信中..."
                    : authMode === "register"
                      ? "アカウント作成"
                      : "ログイン"}
                </button>
              </form>
            </>
          )}

          {authMessage ? (
            <p className={styles.inlineMessage}>{authMessage}</p>
          ) : null}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.cardLabel}>Guide</p>
              <h2>この画面で試せること</h2>
            </div>
          </div>
          <ul className={styles.featureList}>
            <li>ユーザー登録とログイン</li>
            <li>JWT 付きでのメモ一覧取得</li>
            <li>メモの作成、更新、削除</li>
            <li>タグ検索の動作確認</li>
          </ul>
        </div>
      </div>

      <div className={styles.notesColumn}>
        <div className={styles.panel}>
          <div className={styles.notesToolbar}>
            <div>
              <p className={styles.cardLabel}>Notes</p>
              <h2>メモ一覧</h2>
            </div>
            <div className={styles.toolbarActions}>
              <input
                className={styles.filterInput}
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                placeholder="tag で絞り込み"
                disabled={!session}
              />
              <button
                type="button"
                className={styles.primaryButton}
                onClick={beginCreate}
                disabled={!session}
              >
                新しいメモ
              </button>
            </div>
          </div>

          {!session ? (
            <p className={styles.placeholder}>
              まずは登録またはログインすると、メモ一覧が表示されます。
            </p>
          ) : notesPending && notes.length === 0 ? (
            <p className={styles.placeholder}>読み込み中...</p>
          ) : notes.length === 0 ? (
            <p className={styles.placeholder}>
              まだメモがありません。右上のボタンから作成できます。
            </p>
          ) : (
            <div className={styles.noteGrid}>
              {notes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  className={
                    note.id === selectedNoteId
                      ? styles.noteCardActive
                      : styles.noteCard
                  }
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setIsEditing(false);
                  }}
                >
                  <strong>{note.title}</strong>
                  <p>{note.content.slice(0, 120)}</p>
                  <div className={styles.tagRow}>
                    {note.tags.map((tag) => (
                      <span key={tag.id} className={styles.tagChip}>
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}

          {notesMessage ? (
            <p className={styles.inlineMessage}>{notesMessage}</p>
          ) : null}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.cardLabel}>Editor</p>
              <h2>
                {isEditing ? (selectedNoteId ? "メモを編集" : "メモを作成") : "詳細"}
              </h2>
            </div>

            {session && selectedNote ? (
              <div className={styles.toolbarActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => beginEdit(selectedNote)}
                >
                  編集
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={() => void handleDelete(selectedNote.id)}
                >
                  削除
                </button>
              </div>
            ) : null}
          </div>

          {!session ? (
            <p className={styles.placeholder}>認証後にメモを操作できます。</p>
          ) : isEditing ? (
            <form className={styles.editorForm} onSubmit={handleNoteSubmit}>
              <label className={styles.field}>
                <span>Title</span>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(event) =>
                    setNoteForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="メモのタイトル"
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Tags</span>
                <input
                  type="text"
                  value={noteForm.tags}
                  onChange={(event) =>
                    setNoteForm((current) => ({
                      ...current,
                      tags: event.target.value,
                    }))
                  }
                  placeholder="react, nestjs"
                />
              </label>

              <label className={styles.field}>
                <span>Content</span>
                <textarea
                  value={noteForm.content}
                  onChange={(event) =>
                    setNoteForm((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  placeholder="Markdown で書けます"
                  rows={12}
                  required
                />
              </label>

              <div className={styles.toolbarActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setIsEditing(false);
                    if (selectedNote) {
                      beginEdit(selectedNote);
                      setIsEditing(false);
                    } else {
                      setNoteForm(emptyNoteForm);
                    }
                  }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={notesPending}
                >
                  {notesPending ? "保存中..." : "保存"}
                </button>
              </div>
            </form>
          ) : selectedNote ? (
            <article className={styles.noteDetail}>
              <h3>{selectedNote.title}</h3>
              <div className={styles.tagRow}>
                {selectedNote.tags.map((tag) => (
                  <span key={tag.id} className={styles.tagChip}>
                    #{tag.name}
                  </span>
                ))}
              </div>
              <pre className={styles.noteContent}>{selectedNote.content}</pre>
            </article>
          ) : (
            <p className={styles.placeholder}>
              メモを選択するか、新しいメモを作成してください。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
