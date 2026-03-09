import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import styles from "../../page.module.css";
import { DeleteNoteButton } from "../../components/delete-note-button";
import { NotesShell } from "../../components/notes-shell";
import { getNote, getNotes } from "@/lib/server-api";
import { readAccessToken, readSessionUser } from "@/lib/session-cookie";

type NoteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const accessToken = await readAccessToken();
  const user = await readSessionUser();

  if (!accessToken) {
    redirect("/auth");
  }

  const { id } = await params;

  const [notes, note] = await Promise.all([
    getNotes(accessToken),
    getNote(accessToken, id).catch(() => null),
  ]);

  if (!note) {
    notFound();
  }

  return (
    <NotesShell
      user={user}
      notes={notes}
      title={note.title}
      description="個別メモの本文とタグを確認できます。編集は専用画面で行います。"
    >
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.cardLabel}>Detail</p>
            <h2>{note.title}</h2>
          </div>
          <div className={styles.toolbarActions}>
            <Link href={`/notes/${note.id}/edit`} className={styles.secondaryLink}>
              編集
            </Link>
            <DeleteNoteButton noteId={note.id} />
          </div>
        </div>

        <div className={styles.noteDetail}>
          <div className={styles.tagRow}>
            {note.tags.map((tag) => (
              <span key={tag.id} className={styles.tagChip}>
                #{tag.name}
              </span>
            ))}
          </div>
          <div className={styles.noteMeta}>
            <span>作成 {new Date(note.createdAt).toLocaleString("ja-JP")}</span>
            <span>更新 {new Date(note.updatedAt).toLocaleString("ja-JP")}</span>
          </div>
          <article className={styles.noteContent}>{note.content}</article>
        </div>
      </section>
    </NotesShell>
  );
}
