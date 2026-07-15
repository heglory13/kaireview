"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FptJobsJobDetailPage, FptPageFrame } from "@/components/fptjobs/fptjobs-home";
import type { Job } from "@/types/fptjobs";

type AdminStoredJob = Job & {
  id: number;
  applications?: number;
  owner?: string;
  status?: "active" | "draft" | "paused";
};

type StoredJobState = {
  hasLoaded: boolean;
  job: AdminStoredJob | null;
};

const adminJobsStorageKey = "fptjobs.admin.jobs";

function toLocalHref(href: string) {
  if (href.startsWith("https://fptjobs.com")) {
    return new URL(href).pathname;
  }

  return href;
}

function getSlugFromHref(href: string) {
  return toLocalHref(href).replace(/^\/+/, "");
}

function readStoredJob(slug: string) {
  try {
    const rawValue = window.localStorage.getItem(adminJobsStorageKey);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return null;

    return (
      (parsed as AdminStoredJob[]).find((job) => job.title?.trim() && job.href?.trim() && getSlugFromHref(job.href) === slug) ?? null
    );
  } catch {
    return null;
  }
}

export function FptAdminStoredJobDetailClient({ initialJob, slug }: { initialJob: Job | null; slug: string }) {
  const [state, setState] = useState<StoredJobState>({ hasLoaded: false, job: null });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState({
        hasLoaded: true,
        job: readStoredJob(slug),
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [slug]);

  const job = useMemo(() => {
    if (state.job) {
      if (state.job.status && state.job.status !== "active") return null;

      return {
        ...state.job,
        href: toLocalHref(state.job.href),
      };
    }

    return initialJob;
  }, [initialJob, state.job]);

  if (job) {
    return <FptJobsJobDetailPage job={job} />;
  }

  return (
    <FptPageFrame className="fpt-job-detail-page">
      <section className="fpt-job-detail-section">
        <div className="fpt-job-detail-layout">
          <article className="fpt-job-detail-card">
            <h2>{state.hasLoaded ? "Không tìm thấy việc làm" : "Đang tải việc làm"}</h2>
            <p>
              {state.hasLoaded
                ? "Việc làm này chưa có trong dữ liệu public hoặc đang ở trạng thái nháp/tạm dừng."
                : "Đang kiểm tra dữ liệu việc làm từ admin."}
            </p>
            <div className="fpt-reference-links">
              <Link href="/tuyen-dung">Quay lại danh sách việc làm</Link>
            </div>
          </article>
        </div>
      </section>
    </FptPageFrame>
  );
}
