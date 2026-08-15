import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, checkAdminPassword, createSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (typeof password !== "string" || !checkAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
