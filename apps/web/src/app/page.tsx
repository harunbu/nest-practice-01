import type { HealthStatus } from "@repo/shared";
import { MemoClient } from "./memo-client";
import styles from "./page.module.css";

const apiBaseUrl =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:3001";

async function getApiHealth() {
  try {
    const response = await fetch(`${apiBaseUrl}/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false as const,
        message: `API responded with ${response.status}`,
      };
    }

    const health = (await response.json()) as HealthStatus;

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
  const api = await getApiHealth();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Memo App</p>
          <h1>Next.js と NestJS で動く認証付きメモアプリ</h1>
          <p className={styles.description}>
            フロントエンドは <code>apps/web</code>、バックエンドは{" "}
            <code>apps/api</code> です。下のステータスが緑なら、認証 API と
            メモ API を使う準備ができています。
          </p>
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

        <MemoClient apiReachable={api.ok} />
      </main>
    </div>
  );
}
