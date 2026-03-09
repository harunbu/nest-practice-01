import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/server-api";
import { readAccessToken } from "@/lib/session-cookie";

type Context = {
  params: Promise<{ id: string }>;
};

async function withToken() {
  const accessToken = await readAccessToken();

  if (!accessToken) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  return { accessToken };
}

export async function GET(_: Request, context: Context) {
  const tokenResult = await withToken();

  if ("error" in tokenResult) {
    return tokenResult.error;
  }

  const { id } = await context.params;

  try {
    const note = await apiRequest(`/notes/${id}`, {
      accessToken: tokenResult.accessToken,
    });
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request, context: Context) {
  const tokenResult = await withToken();

  if ("error" in tokenResult) {
    return tokenResult.error;
  }

  const { id } = await context.params;
  const payload = await request.json();

  try {
    const note = await apiRequest(`/notes/${id}`, {
      method: "PATCH",
      body: payload,
      accessToken: tokenResult.accessToken,
    });
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_: Request, context: Context) {
  const tokenResult = await withToken();

  if ("error" in tokenResult) {
    return tokenResult.error;
  }

  const { id } = await context.params;

  try {
    await apiRequest(`/notes/${id}`, {
      method: "DELETE",
      accessToken: tokenResult.accessToken,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 400 },
    );
  }
}
