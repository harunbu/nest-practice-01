"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import styles from "../page.module.css";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    startTransition(() => {
      router.push("/auth");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      className={styles.secondaryButton}
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? "処理中..." : "ログアウト"}
    </button>
  );
}
