import type { Metadata } from "next";
import { FptJobsCareersPage } from "@/components/fptjobs/fptjobs-home";

export const metadata: Metadata = {
  title: "Tuyển Dụng FPT Telecom | Tìm Việc Làm FPT Mới Nhất Toàn Quốc",
  description: "Tổng hợp danh sách vị trí tuyển dụng tại FPT Telecom",
};

export default function TuyenDungPage() {
  return <FptJobsCareersPage />;
}
