import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { changeAdminPassword } from "@/lib/admin-db";
import {
  ADMIN_DEFAULT_USERNAME,
  ADMIN_SESSION_COOKIE,
  isAdminSessionValid,
} from "@/lib/admin-auth";
import { buildExternalUrl } from "@/lib/request-url";

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin())) {
    return redirectToAdmin(request, "auth-required", "change-password");
  }

  const formData = await request.formData();
  const currentPassword = formValue(formData, "currentPassword");
  const nextPassword = formValue(formData, "nextPassword");

  if (nextPassword.length < 6) {
    return redirectToAdmin(request, "password-short", "change-password");
  }

  const didChange = changeAdminPassword(ADMIN_DEFAULT_USERNAME, currentPassword, nextPassword);

  return redirectToAdmin(
    request,
    didChange ? "password-updated" : "wrong-password",
    "change-password",
  );
}

async function isAuthorizedAdmin() {
  const cookieStore = await cookies();

  return isAdminSessionValid(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function redirectToAdmin(request: Request, status: string, hash: string) {
  const url = buildExternalUrl(request, "/admin");

  url.searchParams.set("status", status);
  url.hash = hash;

  return NextResponse.redirect(url, { status: 303 });
}
