import type { AuthUser, Note } from "@repo/shared";
import Link from "next/link";
import styles from "../page.module.css";
import { LogoutButton } from "./logout-button";

type NotesShellProps = {
  user: AuthUser | null;
  notes: Note[];
  currentTag?: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function NotesShell({
  user,
  notes,
  currentTag,
  title,
  description,
  children,
}: NotesShellProps) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroRow}>
            <div>
              <p className={styles.eyebrow}>Memo Workspace</p>
              <h1>{title}</h1>
              <p className={styles.description}>{description}</p>
            </div>
            <div className={styles.heroActions}>
              <Link href="/notes" className={styles.secondaryLink}>
                一覧へ
              </Link>
              <Link href="/notes/new" className={styles.primaryLink}>
                新しいメモ
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.workspace}>
          <aside className={styles.authColumn}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.cardLabel}>Session</p>
                  <h2>ログイン中</h2>
                </div>
                <span className={styles.statusOk}>Ready</span>
              </div>
              {user ? (
                <div className={styles.sessionBox}>
                  <p className={styles.sessionEmail}>{user.email}</p>
                  <p className={styles.sessionMeta}>
                    作成日 {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                  <LogoutButton />
                </div>
              ) : null}
            </div>

            <div className={styles.panel}>
              <div className={styles.notesToolbar}>
                <div>
                  <p className={styles.cardLabel}>Filter</p>
                  <h2>メモ一覧</h2>
                </div>
              </div>

              <form className={styles.form} action="/notes" method="get">
                <label className={styles.field}>
                  <span>タグで絞り込み</span>
                  <input
                    name="tag"
                    defaultValue={currentTag ?? ""}
                    placeholder="react"
                  />
                </label>
                <div className={styles.toolbarActions}>
                  <button type="submit" className={styles.primaryButton}>
                    検索
                  </button>
                  <Link href="/notes" className={styles.secondaryLink}>
                    解除
                  </Link>
                </div>
              </form>

              {notes.length === 0 ? (
                <p className={styles.placeholder}>
                  条件に一致するメモがありません。新しいメモを作成してください。
                </p>
              ) : (
                <div className={styles.noteList}>
                  {notes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/notes/${note.id}`}
                      className={styles.noteListItem}
                    >
                      <strong>{note.title}</strong>
                      <p>{note.content.slice(0, 80)}</p>
                      <div className={styles.tagRow}>
                        {note.tags.map((tag) => (
                          <span key={tag.id} className={styles.tagChip}>
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <div className={styles.notesColumn}>{children}</div>
        </section>
      </main>
    </div>
  );
}
