import type { Metadata } from "next";
import { FptNextgenLeadersPage } from "@/components/fptjobs/fptjobs-home";

export const metadata: Metadata = {
  title: "Nextgen Leaders: Chương trình sinh viên tài năng FPT Telecom",
  description: "Nextgen Leaders tìm kiếm và đào tạo những thủ lĩnh trẻ tương lai tại FPT Telecom.",
};

export default function NextgenLeadersPage() {
  return <FptNextgenLeadersPage />;
}
