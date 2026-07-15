import type { Metadata } from "next";
import { FptAdminStoredJobDetailClient } from "@/components/fptjobs/fptjobs-admin-stored-job-detail-client";
import {
  getFptJobBySlug,
  getFptJobSlugs,
} from "@/components/fptjobs/fptjobs-home";

type JobDetailPageProps = {
  params: Promise<{
    jobSlug: string;
  }>;
};

export function generateStaticParams() {
  return getFptJobSlugs().map((jobSlug) => ({ jobSlug }));
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { jobSlug } = await params;
  const job = getFptJobBySlug(jobSlug);

  return {
    title: job ? `${job.title} | FPT Jobs` : "FPT Jobs",
    description: job ? `${job.title} - ${job.location} - hạn nộp CV ${job.deadline}` : "Cơ hội nghề nghiệp tại FPT Telecom",
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { jobSlug } = await params;
  const job = getFptJobBySlug(jobSlug);

  return <FptAdminStoredJobDetailClient initialJob={job ?? null} slug={jobSlug} />;
}
