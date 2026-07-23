import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { KaiAdminDashboard } from "@/components/admin/KaiAdminDashboard";
import { KaiAdminLogin } from "@/components/admin/KaiAdminLogin";
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from "@/lib/admin-auth";
import {
  canonicalAdminSectionSlug,
  getAdminDashboardData,
  getAdminSectionData,
} from "@/lib/admin-db";

type AdminSectionPageProps = {
  params: Promise<{
    section: string[];
  }>;
  searchParams: Promise<{
    month?: string | string[];
    page?: string | string[];
    perPage?: string | string[];
    q?: string | string[];
    status?: string | string[];
    year?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Admin - kaireview",
};

export const dynamic = "force-dynamic";

export default async function AdminSectionPage({ params, searchParams }: AdminSectionPageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isAdminSessionValid(session)) {
    return <KaiAdminLogin />;
  }

  const routeParams = await params;
  const queryParams = await searchParams;
  const now = new Date();
  const month = numberParam(queryParams.month) ?? now.getMonth() + 1;
  const page = numberParam(queryParams.page) ?? 1;
  const perPage = numberParam(queryParams.perPage) ?? 10;
  const year = numberParam(queryParams.year) ?? now.getFullYear();
  const query = stringParam(queryParams.q);
  const status = stringParam(queryParams.status);
  const sectionSlug = routeParams.section.join("/");

  if (sectionSlug === "trang/footer" || sectionSlug === "trang-tinh/footer") {
    notFound();
  }

  const canonicalSectionSlug = canonicalAdminSectionSlug(sectionSlug);

  if (canonicalSectionSlug !== sectionSlug) {
    const queryString = buildQueryString(queryParams);

    redirect(`/admin/${canonicalSectionSlug}${queryString ? `?${queryString}` : ""}`);
  }

  const dashboardData = getAdminDashboardData({ month, query, status, year });
  const sectionData = getAdminSectionData(canonicalSectionSlug, { page, perPage });

  return <KaiAdminDashboard dashboardData={dashboardData} sectionData={sectionData} />;
}

function numberParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = rawValue ? Number(rawValue) : Number.NaN;

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function stringParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return rawValue?.trim() ?? "";
}

function buildQueryString(params: AdminSectionPageProps["searchParams"] extends Promise<infer T> ? T : never) {
  const nextParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => nextParams.append(key, item));
    } else if (value) {
      nextParams.set(key, value);
    }
  }

  return nextParams.toString();
}
