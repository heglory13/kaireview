import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from "@/lib/admin-auth";

export const runtime = "nodejs";

const maxUploadSize = 8 * 1024 * 1024;
const uploadDirectory = path.join(process.cwd(), "public", "images", "admin", "uploads");
const uploadUrlPrefix = "/images/admin/uploads";
const imageExtensions = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ message: "Bạn cần đăng nhập để tải ảnh." }, { status: 401 });
  }

  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ message: "Không tìm thấy file ảnh." }, { status: 400 });
  }

  const extension = imageExtensions[image.type as keyof typeof imageExtensions];

  if (!extension) {
    return NextResponse.json(
      { message: "Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF." },
      { status: 400 },
    );
  }

  if (image.size > maxUploadSize) {
    return NextResponse.json({ message: "Ảnh tối đa 8MB." }, { status: 400 });
  }

  const filename = `${safeFilenameBase(image.name)}-${randomUUID()}.${extension}`;
  const destination = path.join(uploadDirectory, filename);
  const imageBuffer = Buffer.from(await image.arrayBuffer());

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(destination, imageBuffer);

  return NextResponse.json({
    filename,
    url: `${uploadUrlPrefix}/${filename}`,
  });
}

async function isAuthorizedAdmin() {
  const cookieStore = await cookies();

  return isAdminSessionValid(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

function safeFilenameBase(filename: string) {
  const baseName = filename
    .replace(/\.[a-z0-9]+$/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return baseName || "image";
}
