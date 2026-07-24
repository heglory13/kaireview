import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from "@/lib/admin-auth";
import { mutateAdminRecord } from "@/lib/admin-db";
import { buildExternalUrl } from "@/lib/request-url";

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin())) {
    return redirectToSection(request, "auth-required");
  }

  const formData = await request.formData();
  const sectionSlug = formValue(formData, "sectionSlug");
  const entity = formValue(formData, "entity");
  const intent = formValue(formData, "intent");
  const id = formValue(formData, "id");
  const page = formValue(formData, "page") || "1";
  const perPage = formValue(formData, "perPage") || "10";
  const status = mutateAdminRecord({
    entity,
    id,
    intent,
    values: Object.fromEntries(
      [...formData.entries()]
        .filter(([key]) => !["entity", "id", "intent", "page", "perPage", "sectionSlug"].includes(key))
        .map(([key, value]) => [key, typeof value === "string" ? value : ""]),
    ),
  });

  return redirectToSection(request, status, sectionSlug, page, perPage);
}

async function isAuthorizedAdmin() {
  const cookieStore = await cookies();

  return isAdminSessionValid(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function redirectToSection(
  request: Request,
  status: string,
  sectionSlug = "",
  page = "1",
  perPage = "10",
) {
  const safeSection = sectionSlug
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
  const url = buildExternalUrl(request, safeSection ? `/admin/${safeSection}` : "/admin");

  url.searchParams.set("status", status);
  url.searchParams.set("page", page);
  url.searchParams.set("perPage", perPage);

  return NextResponse.redirect(url, { status: 303 });
}
