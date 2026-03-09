import type { AuthUser } from "@repo/shared";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const accessTokenCookieName = "memo_access_token";
const userCookieName = "memo_user";

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function readAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(accessTokenCookieName)?.value ?? null;
}

export async function readSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(userCookieName)?.value;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function writeSessionCookies(
  response: NextResponse,
  accessToken: string,
  user: AuthUser,
): void {
  const options = getCookieOptions();
  response.cookies.set(accessTokenCookieName, accessToken, options);
  response.cookies.set(userCookieName, JSON.stringify(user), options);
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(accessTokenCookieName, "", {
    ...getCookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(userCookieName, "", {
    ...getCookieOptions(),
    maxAge: 0,
  });
}
