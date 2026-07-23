import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    maxAge: 0,
    name: ADMIN_SESSION_COOKIE,
    path: "/",
    value: "",
  });

  return response;
}
