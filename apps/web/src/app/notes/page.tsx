import { redirect } from "next/navigation";
import styles from "../page.module.css";
import { NotesShell } from "../components/notes-shell";
import { getNotes } from "@/lib/server-api";
import { readAccessToken, readSessionUser } from "@/lib/session-cookie";

type NotesPageProps = {
  searchParams: Promise<{
    tag?: string;
  }>;
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const accessToken = await readAccessToken();
  const user = await readSessionUser();

  if (!accessToken) {
    redirect("/auth");
  }

  const { tag } = await searchParams;
  const notes = await getNotes(accessToken, tag);

  return (
    <NotesShell
      user={user}
      notes={notes}
      currentTag={tag}
      title="メモ一覧"
      description="一覧、タグ検索、作成導線を分離した構成です。個別メモは詳細画面で確認します。"
    >
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.cardLabel}>Overview</p>
            <h2>ワークスペースの状態</h2>
          </div>
          <span className={styles.statusOk}>{notes.length} Notes</span>
        </div>
        <p className={styles.placeholder}>
          左の一覧から詳細を開くか、右上のボタンから新しいメモを作成してください。
        </p>
      </section>
    </NotesShell>
  );
}
