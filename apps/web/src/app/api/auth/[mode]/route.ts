import type { AuthResponse } from "@repo/shared";
import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/server-api";
import { writeSessionCookies } from "@/lib/session-cookie";

type AuthMode = "login" | "register";

function isAuthMode(value: string): value is AuthMode {
  return value === "login" || value === "register";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ mode: string }> },
) {
  const { mode } = await context.params;

  if (!isAuthMode(mode)) {
    return NextResponse.json({ message: "Unsupported auth mode." }, { status: 404 });
  }

  const payload = (await request.json()) as {
    email: string;
    password: string;
  };

  try {
    const response = await apiRequest<AuthResponse>(`/auth/${mode}`, {
      method: "POST",
      body: payload,
    });
    const nextResponse = NextResponse.json({ user: response.user });
    writeSessionCookies(nextResponse, response.accessToken, response.user);
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 400 },
    );
  }
}
