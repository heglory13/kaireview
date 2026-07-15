import type { Metadata } from "next";
import { FptEventsPage } from "@/components/fptjobs/fptjobs-home";

type SuKienSearchParams = Promise<{ page?: string | string[] }>;

export const metadata: Metadata = {
  title: "Sự Kiện Tuyển Dụng FPT Telecom | Ngày Hội Việc Làm & Workshop",
  description: "Tổng hợp các sự kiện tuyển dụng, ngày hội việc làm và chương trình tìm kiếm nhân tài từ FPT Telecom.",
};

function getPageParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number(rawValue);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function SuKienPage({ searchParams }: { searchParams: SuKienSearchParams }) {
  const params = await searchParams;

  return <FptEventsPage currentPage={getPageParam(params.page)} />;
}
