import type { Metadata } from "next";
import { FptAdminPage } from "@/components/fptjobs/fptjobs-admin";

export const metadata: Metadata = {
  title: "Admin | FPT Jobs",
  description: "Trang quản trị tuyển dụng FPT Jobs",
};

export default function AdminPage() {
  return <FptAdminPage />;
}
