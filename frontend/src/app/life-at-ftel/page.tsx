import type { Metadata } from "next";
import { FptLifeAtFtelPage } from "@/components/fptjobs/fptjobs-home";

export const metadata: Metadata = {
  title: "Life at FTEL: Khám phá Văn hóa & Sự nghiệp tại FPT Telecom",
  description: "Khám phá môi trường làm việc, văn hóa doanh nghiệp, phúc lợi và cơ hội phát triển tại FPT Telecom.",
};

export default function LifeAtFtelPage() {
  return <FptLifeAtFtelPage />;
}
