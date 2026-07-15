import type { Metadata } from "next";
import { FptNewsPage } from "@/components/fptjobs/fptjobs-home";

type TinTucSearchParams = Promise<{ page?: string | string[] }>;

export const metadata: Metadata = {
  title: "Tin Tức FPT Telecom | Cập Nhật Văn Hóa & Hoạt Động Tuyển Dụng",
  description: "Theo dõi tin tức mới nhất về văn hóa doanh nghiệp, thương hiệu tuyển dụng và hoạt động tại FPT Telecom.",
};

function getPageParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number(rawValue);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function TinTucPage({ searchParams }: { searchParams: TinTucSearchParams }) {
  const params = await searchParams;

  return <FptNewsPage currentPage={getPageParam(params.page)} />;
}
