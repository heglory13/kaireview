import { NextResponse } from "next/server";

import { recordVisit } from "@/lib/admin-db";

type VisitPayload = {
  path?: unknown;
  sessionId?: unknown;
};

export async function POST(request: Request) {
  const payload = await readPayload(request);
  const path = typeof payload.path === "string" ? payload.path : "";
  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : "";
  const userAgent = request.headers.get("user-agent") ?? "";

  if (path && sessionId) {
    recordVisit({ path, sessionId, userAgent });
  }

  return NextResponse.json({ ok: true });
}

async function readPayload(request: Request): Promise<VisitPayload> {
  try {
    return (await request.json()) as VisitPayload;
  } catch {
    return {};
  }
}
