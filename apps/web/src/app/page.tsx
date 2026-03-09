import Link from "next/link";
import styles from "./page.module.css";
import { getHealthStatus } from "@/lib/server-api";
import { readAccessToken } from "@/lib/session-cookie";

const apiBaseUrl =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:3001";

async function getApiHealth() {
  try {
    const health = await getHealthStatus();
    return {
      ok: true as const,
      health,
    };
  } catch {
    return {
      ok: false as const,
      message: "API is not reachable. Start apps/api and reload the page.",
    };
  }
}

export default async function Home() {
  const accessToken = await readAccessToken();
  const api = await getApiHealth();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Memo App</p>
          <h1>Next.js と NestJS で動く認証付きメモアプリ</h1>
          <p className={styles.description}>
            フロントエンドは <code>apps/web</code>、バックエンドは <code>apps/api</code>
            です。認証は Web 側の Cookie セッションで保持し、メモ操作は専用ルートへ分離しました。
          </p>
          <div className={styles.heroActions}>
            <Link
              href={accessToken ? "/notes" : "/auth"}
              className={styles.primaryLink}
            >
              {accessToken ? "メモ画面へ" : "認証を始める"}
            </Link>
            <Link href="/notes" className={styles.secondaryLink}>
              一覧を見る
            </Link>
          </div>
        </section>

        <section className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <div>
              <p className={styles.cardLabel}>API Status</p>
              <h2>Backend Health Check</h2>
            </div>
            <span
              className={api.ok ? styles.statusOk : styles.statusError}
              aria-live="polite"
            >
              {api.ok ? "Connected" : "Unavailable"}
            </span>
          </div>

          {api.ok ? (
            <dl className={styles.statusList}>
              <div>
                <dt>Service</dt>
                <dd>{api.health.service}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{api.health.status}</dd>
              </div>
              <div>
                <dt>Timestamp</dt>
                <dd>{new Date(api.health.timestamp).toLocaleString("ja-JP")}</dd>
              </div>
              <div>
                <dt>Endpoint</dt>
                <dd>{apiBaseUrl}/health</dd>
              </div>
            </dl>
          ) : (
            <p className={styles.errorMessage}>{api.message}</p>
          )}
        </section>

        <section className={styles.authLayout}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.cardLabel}>Routes</p>
                <h2>分離した画面構成</h2>
              </div>
            </div>
            <ul className={styles.featureList}>
              <li>`/auth` で登録とログイン</li>
              <li>`/notes` で一覧とタグ検索</li>
              <li>`/notes/new` で新規作成</li>
              <li>`/notes/[id]` と `/notes/[id]/edit` で詳細と編集</li>
            </ul>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.cardLabel}>Next Step</p>
                <h2>今の改善ポイント</h2>
              </div>
            </div>
            <ul className={styles.featureList}>
              <li>Markdown 表示の導入</li>
              <li>テスト範囲の拡張</li>
              <li>Cookie 運用の本番設定見直し</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
