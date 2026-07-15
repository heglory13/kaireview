import type { Metadata } from "next";
import { FptAboutPage } from "@/components/fptjobs/fptjobs-home";

export const metadata: Metadata = {
  title: "Giới thiệu về FPT Jobs - Cổng tuyển dụng FPT Telecom",
  description: "Tìm hiểu về FPT Telecom, lịch sử hình thành, văn hóa, giải thưởng tuyển dụng và cơ hội nghề nghiệp.",
};

export default function GioiThieuPage() {
  return <FptAboutPage />;
}
