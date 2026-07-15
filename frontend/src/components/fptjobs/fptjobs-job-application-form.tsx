"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  adminApplicationsStorageKey,
  readStoredApplications,
  writeStoredApplications,
  type FptApplicationProfileSnapshot,
  type FptStoredApplication,
} from "@/lib/fptjobs-applications";

type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

type StoredAuth = {
  user: AuthUser;
  token: string;
};

type CandidateProfile = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  birthday?: string | null;
  address?: string | null;
  currentCity?: string | null;
  currentWard?: string | null;
  desiredCity?: string | null;
  desiredWard?: string | null;
  educationLevel?: string | null;
  school?: string | null;
  major?: string | null;
  graduationYear?: string | null;
  gpa?: string | null;
  resumeUrl?: string | null;
  updatedAt?: string | null;
};

type ProfileResponse = {
  data?: {
    user: AuthUser;
    profile: CandidateProfile;
  };
  error?: {
    message?: string;
  };
};

type ApplicationApiRecord = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  profileSnapshot?: FptApplicationProfileSnapshot;
  createdAt: string;
  job: {
    title: string;
    location: string;
    slug: string;
  };
};

type ApplicationApiResponse = {
  data?: ApplicationApiRecord;
  notification?: {
    adminEmailSent?: boolean;
  };
  error?: {
    message?: string;
    details?: Record<string, string>;
  };
};

type JobQuickApplyButtonProps = {
  jobTitle: string;
  jobSlug: string;
  location: string;
  variant?: "default" | "summary";
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const authStorageKey = "fptjobs.auth";
const candidateApplicationsChangeEventName = "fptjobs-candidate-applications-change";

function formatDateLabel(value?: string) {
  const dateValue = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(dateValue.getTime()) ? new Date() : dateValue;
  const date = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(safeDate);
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  }).format(safeDate);

  return `${date} ${time}`;
}

async function parseJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

function readStoredAuth() {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.localStorage.getItem(authStorageKey);

    return rawValue ? (JSON.parse(rawValue) as StoredAuth) : null;
  } catch {
    return null;
  }
}

function normalizeProfileValue(value?: string | null) {
  return value?.trim() ?? "";
}

const requiredProfileFields: Array<[keyof CandidateProfile, string]> = [
  ["fullName", "Họ và tên"],
  ["email", "Email"],
  ["phone", "Số điện thoại"],
  ["birthday", "Ngày sinh"],
  ["address", "Địa chỉ hiện tại"],
  ["currentCity", "Tỉnh/thành hiện tại"],
  ["currentWard", "Xã/phường hiện tại"],
  ["desiredCity", "Tỉnh/thành mong muốn"],
  ["desiredWard", "Xã/phường mong muốn"],
  ["educationLevel", "Trình độ học vấn"],
  ["school", "Trường"],
  ["major", "Chuyên ngành"],
  ["resumeUrl", "CV"],
];

function getMissingProfileFields(profile: CandidateProfile) {
  return requiredProfileFields
    .filter(([field]) => !normalizeProfileValue(profile[field]))
    .map(([, label]) => label);
}

function createProfileMissingMessage(missingFields: string[]) {
  return `Vui lòng cập nhật đầy đủ thông tin hồ sơ trước khi nộp. Bạn còn thiếu: ${missingFields.join(", ")}.`;
}

function getApplicationErrorMessage(data: ApplicationApiResponse) {
  const detailMessage = data.error?.details ? Object.values(data.error.details)[0] : "";

  return detailMessage || data.error?.message || "Không thể nộp hồ sơ. Vui lòng thử lại.";
}

export function FptJobQuickApplyButton({ jobTitle, jobSlug, location, variant = "default" }: JobQuickApplyButtonProps) {
  const [message, setMessage] = useState("");
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [hasSubmitted, setSubmitted] = useState(false);

  const openConfirmDialog = () => {
    const auth = readStoredAuth();

    if (!auth?.token) {
      setMessage("Vui lòng đăng nhập và cập nhật thông tin cá nhân trước khi nộp hồ sơ.");
      return;
    }

    setMessage("");
    setConfirmOpen(true);
  };

  const submitApplication = async () => {
    const auth = readStoredAuth();

    if (!auth?.token) {
      setConfirmOpen(false);
      setMessage("Vui lòng đăng nhập và cập nhật thông tin cá nhân trước khi nộp hồ sơ.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const profileResponse = await fetch(`${apiBaseUrl}/api/candidate/profile`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const profileData = await parseJson<ProfileResponse>(profileResponse);

      if (!profileResponse.ok || !profileData.data) {
        throw new Error(profileData.error?.message ?? "Không thể lấy thông tin cá nhân.");
      }

      const profile = profileData.data.profile;
      const missingProfileFields = getMissingProfileFields(profile);

      if (missingProfileFields.length > 0) {
        setConfirmOpen(false);
        setMessage(createProfileMissingMessage(missingProfileFields));
        return;
      }

      const fullName = normalizeProfileValue(profile.fullName) || auth.user.fullName;
      const email = normalizeProfileValue(profile.email) || auth.user.email;
      const phone = normalizeProfileValue(profile.phone);
      const resumeUrl = normalizeProfileValue(profile.resumeUrl);

      const response = await fetch(`${apiBaseUrl}/api/applications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverLetter: "Nộp nhanh bằng thông tin cá nhân ứng viên.",
          email,
          fullName,
          jobLocation: location,
          jobSlug,
          jobTitle,
          phone,
          resumeUrl,
        }),
      });
      const data = await parseJson<ApplicationApiResponse>(response);

      if (!response.ok || !data.data) {
        throw new Error(getApplicationErrorMessage(data));
      }

      const application: FptStoredApplication = {
        appliedAt: formatDateLabel(data.data.createdAt),
        cvName: data.data.resumeUrl ?? undefined,
        email: data.data.email,
        fullName: data.data.fullName,
        id: data.data.id,
        jobSlug: data.data.job.slug,
        jobTitle: data.data.job.title,
        location: data.data.job.location,
        note: data.data.coverLetter ?? undefined,
        phone: data.data.phone,
        profileSnapshot: data.data.profileSnapshot,
        source: "FPT Jobs",
        status: "new",
      };

      writeStoredApplications([application, ...readStoredApplications()]);
      window.dispatchEvent(new StorageEvent("storage", { key: adminApplicationsStorageKey }));
      window.dispatchEvent(new Event(candidateApplicationsChangeEventName));
      setSubmitted(true);
      setConfirmOpen(false);
      setMessage("Đã nộp hồ sơ thành công.");
    } catch (error) {
      setConfirmOpen(false);
      setMessage(error instanceof Error ? error.message : "Không thể nộp hồ sơ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`fpt-job-quick-apply ${variant === "summary" ? "is-summary" : ""}`}>
      <button className="fpt-apply-button" disabled={isSubmitting || hasSubmitted} onClick={openConfirmDialog} type="button">
        {isSubmitting ? "Đang nộp..." : hasSubmitted ? "Đã nộp hồ sơ" : "Nộp hồ sơ"}
      </button>
      {message ? (
        <p className={`fpt-job-quick-apply-message ${hasSubmitted ? "is-success" : ""}`}>
          {message}
          {!hasSubmitted && message.toLowerCase().includes("thông tin cá nhân") ? (
            <>
              {" "}
              <Link href="/ung-vien">Cập nhật tại đây</Link>
            </>
          ) : null}
        </p>
      ) : null}
      {isConfirmOpen
        ? createPortal(
            <div className="fpt-quick-apply-modal" role="dialog" aria-modal="true" aria-labelledby="quick-apply-title">
              <button
                className="fpt-quick-apply-backdrop"
                onClick={() => setConfirmOpen(false)}
                type="button"
                aria-label="Đóng xác nhận nộp hồ sơ"
              />
              <div className="fpt-quick-apply-dialog">
                <span>Xác nhận ứng tuyển</span>
                <h2 id="quick-apply-title">Nộp hồ sơ vào vị trí này?</h2>
                <p>
                  Hệ thống sẽ dùng thông tin cá nhân và CV đã lưu trong tài khoản của bạn để nộp vào vị trí{" "}
                  <strong>{jobTitle}</strong>.
                </p>
                <div className="fpt-quick-apply-actions">
                  <button onClick={() => setConfirmOpen(false)} type="button">
                    Hủy
                  </button>
                  <button disabled={isSubmitting} onClick={submitApplication} type="button">
                    {isSubmitting ? "Đang nộp..." : "Xác nhận nộp"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
