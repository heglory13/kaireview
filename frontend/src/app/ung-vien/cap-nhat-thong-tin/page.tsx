import type { Metadata } from "next";
import { FptCandidateProfilePage } from "@/components/fptjobs/fptjobs-candidate-profile";

export const metadata: Metadata = {
  title: "Thông tin ứng viên | FPT Jobs",
};

export default function CandidateProfilePage() {
  return <FptCandidateProfilePage />;
}
