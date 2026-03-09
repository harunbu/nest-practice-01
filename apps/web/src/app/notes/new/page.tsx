import { redirect } from "next/navigation";
import styles from "../../page.module.css";
import { NoteEditorForm } from "../../components/note-editor-form";
import { NotesShell } from "../../components/notes-shell";
import { getNotes } from "@/lib/server-api";
import { readAccessToken, readSessionUser } from "@/lib/session-cookie";

export default async function NewNotePage() {
  const accessToken = await readAccessToken();
  const user = await readSessionUser();

  if (!accessToken) {
    redirect("/auth");
  }

  const notes = await getNotes(accessToken);

  return (
    <NotesShell
      user={user}
      notes={notes}
      title="新しいメモ"
      description="タイトル、タグ、本文を入力して新しいメモを作成します。"
    >
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.cardLabel}>Create</p>
            <h2>メモを作成</h2>
          </div>
        </div>
        <NoteEditorForm mode="create" />
      </section>
    </NotesShell>
  );
}
