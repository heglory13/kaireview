import type { Metadata } from "next";
import { FptCareerBoomingPage } from "@/components/fptjobs/fptjobs-home";

export const metadata: Metadata = {
  title: "FTEL Career Booming: Cơ hội bứt phá thu nhập tại FPT",
  description: "Tham gia Career Booming của FPT Telecom với cơ hội việc làm, mentor đồng hành và lộ trình phát triển rõ ràng.",
};

export default function CareerBoomingPage() {
  return <FptCareerBoomingPage />;
}
