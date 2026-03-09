import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "../page.module.css";
import { AuthForm } from "../components/auth-form";
import { readAccessToken } from "@/lib/session-cookie";

export default async function AuthPage() {
  const accessToken = await readAccessToken();

  if (accessToken) {
    redirect("/notes");
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Memo App</p>
          <h1>認証を分離したメモワークスペース</h1>
          <p className={styles.description}>
            認証は Web 側の Cookie セッションで保持し、メモ操作画面とはルートを分けています。
          </p>
        </section>

        <section className={styles.authLayout}>
          <AuthForm />

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.cardLabel}>Guide</p>
                <h2>この画面の役割</h2>
              </div>
            </div>
            <ul className={styles.featureList}>
              <li>新規登録とログインを専用ルートで扱う</li>
              <li>セッションは `httpOnly` Cookie に保存する</li>
              <li>認証後はメモ画面へ遷移する</li>
            </ul>
            <Link href="/" className={styles.secondaryLink}>
              トップへ戻る
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
