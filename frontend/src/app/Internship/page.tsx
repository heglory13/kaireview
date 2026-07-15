import type { Metadata } from "next";
import { FptInternshipPage } from "@/components/fptjobs/fptjobs-home";

export const metadata: Metadata = {
  title: "FPT Telecom Internship 2026 - Chương trình thực tập thực chiến",
  description: "Chương trình thực tập FPT Telecom Internship 2026 với mentor 1-1, dự án thật và cơ hội trải nghiệm thực chiến.",
};

export default function InternshipPage() {
  return <FptInternshipPage />;
}
