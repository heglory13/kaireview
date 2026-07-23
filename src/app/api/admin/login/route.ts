import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionValue,
} from "@/lib/admin-auth";
import { touchAdminLogin, verifyAdminCredentials } from "@/lib/admin-db";

type LoginPayload = {
  password?: unknown;
  username?: unknown;
};

export async function POST(request: Request) {
  const payload = await readLoginPayload(request);
  const username = typeof payload.username === "string" ? payload.username.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json(
      { message: "Tài khoản hoặc mật khẩu không đúng." },
      { status: 401 },
    );
  }

  touchAdminLogin(username);

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    name: ADMIN_SESSION_COOKIE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: createAdminSessionValue(),
  });

  return response;
}

async function readLoginPayload(request: Request): Promise<LoginPayload> {
  try {
    const payload = (await request.json()) as LoginPayload;

    return payload;
  } catch {
    return {};
  }
}
