import type { Metadata } from "next";
import { cookies } from "next/headers";

import { KaiAdminLogin } from "@/components/admin/KaiAdminLogin";
import { KaiAdminDashboard } from "@/components/admin/KaiAdminDashboard";
import { getAdminDashboardData } from "@/lib/admin-db";
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from "@/lib/admin-auth";

type AdminPageProps = {
  searchParams: Promise<{
    month?: string | string[];
    q?: string | string[];
    status?: string | string[];
    year?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Admin - kaireview",
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isAdminSessionValid(session)) {
    return <KaiAdminLogin />;
  }

  const params = await searchParams;
  const now = new Date();
  const month = numberParam(params.month) ?? now.getMonth() + 1;
  const year = numberParam(params.year) ?? now.getFullYear();
  const query = stringParam(params.q);
  const status = stringParam(params.status);
  const dashboardData = getAdminDashboardData({ month, query, status, year });

  return <KaiAdminDashboard dashboardData={dashboardData} />;
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
