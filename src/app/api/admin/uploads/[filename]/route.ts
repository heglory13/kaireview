import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import {
  getUploadDirectory,
  isValidUploadedFilename,
} from "@/lib/admin-upload";

export const runtime = "nodejs";

const mimeTypes: Record<string, string> = {
  gif: "image/gif",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;

  if (!isValidUploadedFilename(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(getUploadDirectory(), filename);

  try {
    const file = await readFile(filePath);
    const extension = path.extname(filename).slice(1).toLowerCase();

    return new NextResponse(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
