import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { saveAdminSettings } from "@/lib/admin-db";
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin())) {
    return redirectToAdmin(request, "auth-required", "website-settings");
  }

  const formData = await request.formData();

  saveAdminSettings({
    siteEmail: formValue(formData, "siteEmail"),
    siteName: formValue(formData, "siteName"),
  });

  return redirectToAdmin(request, "settings-saved", "website-settings");
}

async function isAuthorizedAdmin() {
  const cookieStore = await cookies();

  return isAdminSessionValid(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function redirectToAdmin(request: Request, status: string, hash: string) {
  const url = new URL("/admin", request.url);

  url.searchParams.set("status", status);
  url.hash = hash;

  return NextResponse.redirect(url, { status: 303 });
}
