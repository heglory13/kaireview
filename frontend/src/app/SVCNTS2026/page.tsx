import type { Metadata } from "next";
import { FptSvcntsPage } from "@/components/fptjobs/fptjobs-home";

export const metadata: Metadata = {
  title: "FPT Telecom SVCNTS 2026 - Sinh viên Công nghệ Tập sự",
  description: "Chương trình Sinh viên Công nghệ Tập sự 2026 của FPT Telecom với mentorship 1:1 và lộ trình fast-track.",
};

export default function Svcnts2026Page() {
  return <FptSvcntsPage />;
}
