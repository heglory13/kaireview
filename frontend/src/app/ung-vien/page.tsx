import type { Metadata } from "next";
import { FptCandidateProfilePage } from "@/components/fptjobs/fptjobs-candidate-profile";

export const metadata: Metadata = {
  title: "Ứng viên | FPT Jobs",
};

export default function CandidatePage() {
  return <FptCandidateProfilePage />;
}
