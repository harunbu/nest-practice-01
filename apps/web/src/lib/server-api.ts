import type { Note } from "@repo/shared";
import { getApiBaseUrl } from "./api-base-url";

type RequestOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string | null;
};

async function parseJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await parseJsonSafely(response)) as
      | { message?: string | string[] }
      | null;
    const message = Array.isArray(payload?.message)
      ? payload.message.join(", ")
      : payload?.message ?? `Request failed with ${response.status}`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getHealthStatus() {
  return apiRequest<{ service: string; status: "ok"; timestamp: string }>(
    "/health",
  );
}

export async function getNotes(accessToken: string, tag?: string) {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : "";
  return apiRequest<Note[]>(`/notes${query}`, { accessToken });
}

export async function getNote(accessToken: string, noteId: string) {
  return apiRequest<Note>(`/notes/${noteId}`, { accessToken });
}
