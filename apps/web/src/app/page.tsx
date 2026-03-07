import type { HealthStatus } from "@repo/shared";
import styles from "./page.module.css";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:3001";

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
          <p className={styles.eyebrow}>Monorepo Practice</p>
          <h1>Next.js と NestJS を一緒に動かす最小構成</h1>
          <p className={styles.description}>
            フロントエンドは <code>apps/web</code>、バックエンドは{" "}
            <code>apps/api</code> です。下のステータスが緑なら、Next.js
            から NestJS への疎通が確認できています。
          </p>
        </section>

        <section className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <div>
              <p className={styles.cardLabel}>API Status</p>
              <h2>NestJS Health Check</h2>
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

        <section className={styles.steps}>
          <div className={styles.step}>
            <span>1</span>
            <p>
              <code>yarn dev</code> で Next.js と NestJS を同時起動する
            </p>
          </div>
          <div className={styles.step}>
            <span>2</span>
            <p>
              Web は <code>localhost:3000</code>、API は{" "}
              <code>localhost:3001</code>
            </p>
          </div>
          <div className={styles.step}>
            <span>3</span>
            <p>次は共通型、DB、認証、API 呼び出し層を足していく</p>
          </div>
        </section>
      </main>
    </div>
  );
}
