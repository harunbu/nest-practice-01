"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styles from "../page.module.css";

type AuthMode = "register" | "login";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "認証に失敗しました。");
      }

      startTransition(() => {
        router.push("/notes");
        router.refresh();
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "認証に失敗しました。");
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.cardLabel}>Auth</p>
          <h2>{mode === "register" ? "アカウント作成" : "ログイン"}</h2>
        </div>
        <span className={styles.statusNeutral}>
          {mode === "register" ? "Create" : "Sign In"}
        </span>
      </div>

      <div className={styles.segmentedControl}>
        <button
          type="button"
          className={mode === "register" ? styles.segmentActive : styles.segmentButton}
          onClick={() => setMode("register")}
        >
          新規登録
        </button>
        <button
          type="button"
          className={mode === "login" ? styles.segmentActive : styles.segmentButton}
          onClick={() => setMode("login")}
        >
          ログイン
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            placeholder="8文字以上"
            required
          />
        </label>

        <button type="submit" className={styles.primaryButton} disabled={isPending}>
          {isPending ? "送信中..." : mode === "register" ? "アカウント作成" : "ログイン"}
        </button>
      </form>

      {message ? <p className={styles.inlineMessage}>{message}</p> : null}
    </div>
  );
}
