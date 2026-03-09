import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/server-api";
import { readAccessToken } from "@/lib/session-cookie";

export async function GET(request: Request) {
  const accessToken = await readAccessToken();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : "";

  try {
    const notes = await apiRequest(`/notes${query}`, { accessToken });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const accessToken = await readAccessToken();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();

  try {
    const note = await apiRequest("/notes", {
      method: "POST",
      body: payload,
      accessToken,
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
