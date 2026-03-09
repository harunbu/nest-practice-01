import { notFound, redirect } from "next/navigation";
import styles from "../../../page.module.css";
import { NoteEditorForm } from "../../../components/note-editor-form";
import { NotesShell } from "../../../components/notes-shell";
import { getNote, getNotes } from "@/lib/server-api";
import { readAccessToken, readSessionUser } from "@/lib/session-cookie";

type EditNotePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditNotePage({ params }: EditNotePageProps) {
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
      title="メモを編集"
      description="内容を更新すると、詳細画面へ戻ります。"
    >
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.cardLabel}>Edit</p>
            <h2>{note.title}</h2>
          </div>
        </div>
        <NoteEditorForm mode="edit" initialNote={note} />
      </section>
    </NotesShell>
  );
}
