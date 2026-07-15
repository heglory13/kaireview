"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import {
  adminApplicationsStorageKey,
  mergeApplications,
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

type LandingAnswer = {
  label: string;
  value: string;
};

type SubmitLandingApplicationInput = {
  answers: LandingAnswer[];
  email: string;
  fullName: string;
  jobLocation: string;
  jobTitle: string;
  phone: string;
  programSlug: string;
  programTitle: string;
  resumeFile?: File;
};

type SubmitState = {
  hasSubmitted: boolean;
  isSubmitting: boolean;
  message: string;
  tone: "error" | "success";
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const authStorageKey = "fptjobs.auth";
const candidateApplicationsChangeEventName = "fptjobs-candidate-applications-change";

function readStoredAuth() {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.localStorage.getItem(authStorageKey);

    return rawValue ? (JSON.parse(rawValue) as StoredAuth) : null;
  } catch {
    return null;
  }
}

async function parseJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

function getFormString(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function getFormFile(formData: FormData, field: string) {
  const value = formData.get(field);

  return value instanceof File && value.size > 0 ? value : undefined;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function createSlugPart(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function createLandingJobSlug(programSlug: string, jobTitle: string) {
  return ["landing", createSlugPart(programSlug), createSlugPart(jobTitle)].filter(Boolean).join("-");
}

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

function buildCoverLetter(input: SubmitLandingApplicationInput) {
  const answerLines = input.answers.map((answer) => `- ${answer.label}: ${answer.value || "Chưa trả lời"}`);

  return [
    `Đăng ký landing page: ${input.programTitle}`,
    `Slug landing page: ${input.programSlug}`,
    "",
    "Câu trả lời form:",
    ...answerLines,
  ].join("\n");
}

function getErrorMessage(data: ApplicationApiResponse) {
  const detailMessage = data.error?.details ? Object.values(data.error.details)[0] : "";

  return detailMessage || data.error?.message || "Không thể gửi thông tin. Vui lòng thử lại.";
}

async function submitLandingApplication(input: SubmitLandingApplicationInput) {
  const auth = readStoredAuth();
  const requestBody = new FormData();

  requestBody.append("fullName", input.fullName);
  requestBody.append("email", input.email);
  requestBody.append("phone", input.phone);
  requestBody.append("jobTitle", input.jobTitle);
  requestBody.append("jobLocation", input.jobLocation);
  requestBody.append("jobSlug", createLandingJobSlug(input.programSlug, input.jobTitle));
  requestBody.append("coverLetter", buildCoverLetter(input));

  if (input.resumeFile) {
    requestBody.append("cv", input.resumeFile);
  }

  const response = await fetch(`${apiBaseUrl}/api/applications`, {
    body: requestBody,
    headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
    method: "POST",
  });
  const data = await parseJson<ApplicationApiResponse>(response);

  if (!response.ok || !data.data) {
    throw new Error(getErrorMessage(data));
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
    source: input.programTitle,
    status: "new",
  };

  writeStoredApplications(mergeApplications([application], readStoredApplications()));
  window.dispatchEvent(new StorageEvent("storage", { key: adminApplicationsStorageKey }));
  window.dispatchEvent(new Event(candidateApplicationsChangeEventName));

  return data;
}

function createInitialSubmitState(): SubmitState {
  return {
    hasSubmitted: false,
    isSubmitting: false,
    message: "",
    tone: "error",
  };
}

function SubmitMessage({ state }: { state: SubmitState }) {
  if (!state.message) return null;

  return <p className={`fpt-landing-form-message ${state.tone === "success" ? "is-success" : ""}`}>{state.message}</p>;
}

function getSuccessMessage() {
  return "Đã gửi thông tin thành công.";
}

export function FptCareerBoomingApplicationForm({
  fields,
  regions,
}: {
  fields: string[];
  regions: string[];
}) {
  const [submitState, setSubmitState] = useState(createInitialSubmitState);
  const [cvName, setCvName] = useState("");

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitState.isSubmitting || submitState.hasSubmitted) return;

    const formData = new FormData(event.currentTarget);
    const fullName = getFormString(formData, "fullName");
    const email = getFormString(formData, "email");
    const phone = getFormString(formData, "phone");
    const education = getFormString(formData, "education");
    const school = getFormString(formData, "school");
    const major = getFormString(formData, "major");
    const graduationTime = getFormString(formData, "graduationTime");
    const region = getFormString(formData, "region");
    const field = getFormString(formData, "field");
    const resumeFile = getFormFile(formData, "cv");
    const answers: LandingAnswer[] = [
      { label: "Họ và tên", value: fullName },
      { label: "Email", value: email },
      { label: "Số điện thoại", value: phone },
      { label: "Hệ đào tạo", value: education },
      { label: "Trường", value: school },
      { label: "Chuyên ngành đào tạo", value: major },
      { label: "Thời gian tốt nghiệp", value: graduationTime },
      { label: "Khu vực ứng tuyển", value: region },
      { label: "Lĩnh vực ứng tuyển", value: field },
      { label: "CV", value: resumeFile?.name ?? "" },
    ];

    setSubmitState((currentState) => ({ ...currentState, isSubmitting: true, message: "" }));

    try {
      await submitLandingApplication({
        answers,
        email,
        fullName,
        jobLocation: region || "FTEL Career Booming",
        jobTitle: field || "FTEL Career Booming",
        phone,
        programSlug: "LandingPage/CareerBooming",
        programTitle: "FTEL Career Booming",
        resumeFile,
      });

      setSubmitState({
        hasSubmitted: true,
        isSubmitting: false,
        message: getSuccessMessage(),
        tone: "success",
      });
    } catch (error) {
      setSubmitState({
        hasSubmitted: false,
        isSubmitting: false,
        message: error instanceof Error ? error.message : "Không thể gửi thông tin. Vui lòng thử lại.",
        tone: "error",
      });
    }
  };

  return (
    <form className="fpt-container fpt-cb-form" onSubmit={submitForm}>
      <div>
        <label>
          Họ và tên (*)
          <input name="fullName" required type="text" />
        </label>
        <label>
          Email (*)
          <input name="email" required type="email" />
        </label>
        <label>
          Số điện thoại (*)
          <input name="phone" required type="tel" />
        </label>
        <label>
          Hệ đào tạo (*)
          <select defaultValue="" name="education" required>
            <option disabled value="">
              Lựa chọn...
            </option>
            <option>Sau đại học (Thạc Sĩ/Tiến Sĩ)</option>
            <option>Đại học</option>
            <option>Cao đẳng</option>
            <option>THPT/Trung cấp/Khác</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Trường (*)
          <input name="school" required type="text" />
        </label>
        <label>
          Chuyên ngành đào tạo
          <input name="major" type="text" />
        </label>
        <label>
          Thời gian tốt nghiệp
          <input name="graduationTime" placeholder="Tháng/Năm" type="text" />
        </label>
      </div>
      <div>
        <label>
          Khu vực ứng tuyển
          <select defaultValue="" name="region">
            <option disabled value="">
              Lựa chọn...
            </option>
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </label>
        <label>
          Lĩnh vực ứng tuyển
          <select defaultValue="" name="field">
            <option disabled value="">
              Lựa chọn...
            </option>
            {fields.map((field) => (
              <option key={field}>{field}</option>
            ))}
          </select>
        </label>
        <div className="fpt-cb-upload">
          <span>Tải lên CV</span>
          <label>
            <input
              accept=".pdf,.doc,.docx,application/pdf"
              name="cv"
              onChange={(event) => setCvName(event.target.files?.[0]?.name ?? "")}
              type="file"
            />
            <strong>{cvName || "Tải lên"}</strong>
          </label>
        </div>
      </div>
      <button disabled={submitState.isSubmitting || submitState.hasSubmitted} type="submit">
        {submitState.isSubmitting ? "ĐANG GỬI..." : submitState.hasSubmitted ? "ĐÃ GỬI THÔNG TIN" : "GỬI THÔNG TIN"}
      </button>
      <SubmitMessage state={submitState} />
    </form>
  );
}

export function FptSvcntsApplicationForm({ positions }: { positions: string[] }) {
  const [submitState, setSubmitState] = useState(createInitialSubmitState);
  const [cvName, setCvName] = useState("");

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitState.isSubmitting || submitState.hasSubmitted) return;

    const formData = new FormData(event.currentTarget);
    const fullName = getFormString(formData, "fullName");
    const email = getFormString(formData, "email");
    const phone = getFormString(formData, "phone");
    const school = getFormString(formData, "school");
    const region = getFormString(formData, "region");
    const major = getFormString(formData, "major");
    const position = getFormString(formData, "position");
    const graduationTime = getFormString(formData, "graduationTime");
    const workTime = getFormString(formData, "workTime");
    const education = getFormString(formData, "education");
    const gpa = getFormString(formData, "gpa");
    const resumeFile = getFormFile(formData, "cv");
    const answers: LandingAnswer[] = [
      { label: "Họ và tên", value: fullName },
      { label: "Email", value: email },
      { label: "Số điện thoại", value: phone },
      { label: "Tên trường", value: school },
      { label: "Khu vực ứng tuyển", value: region },
      { label: "Chuyên ngành đào tạo", value: major },
      { label: "Vị trí ứng tuyển", value: position },
      { label: "Tháng/Năm tốt nghiệp", value: graduationTime },
      { label: "Thời gian làm việc", value: workTime },
      { label: "Hệ đào tạo", value: education },
      { label: "Điểm GPA Trung bình", value: gpa },
      { label: "CV", value: resumeFile?.name ?? "" },
    ];

    setSubmitState((currentState) => ({ ...currentState, isSubmitting: true, message: "" }));

    try {
      await submitLandingApplication({
        answers,
        email,
        fullName,
        jobLocation: region || "SVCNTS 2026",
        jobTitle: position || "Sinh viên Công nghệ Tập sự 2026",
        phone,
        programSlug: "SVCNTS2026",
        programTitle: "SVCNTS 2026",
        resumeFile,
      });

      setSubmitState({
        hasSubmitted: true,
        isSubmitting: false,
        message: getSuccessMessage(),
        tone: "success",
      });
    } catch (error) {
      setSubmitState({
        hasSubmitted: false,
        isSubmitting: false,
        message: error instanceof Error ? error.message : "Không thể gửi thông tin. Vui lòng thử lại.",
        tone: "error",
      });
    }
  };

  return (
    <form className="fpt-svc-form" onSubmit={submitForm}>
      <Image
        alt="Đăng ký ngay"
        height={118}
        src="/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-btn-dang-ky-ngay.png"
        width={487}
      />
      <div className="fpt-svc-form-grid">
        <label>
          Họ và tên *
          <input name="fullName" placeholder="Họ tên của bạn" required type="text" />
        </label>
        <label>
          Email *
          <input name="email" placeholder="example@gmail.com" required type="email" />
        </label>
        <label>
          Số điện thoại *
          <input name="phone" placeholder="09xxxxxxxx" required type="tel" />
        </label>
        <label>
          Tên trường *
          <input name="school" placeholder="Nhập tên trường" required type="text" />
        </label>
        <label>
          Khu vực ứng tuyển *
          <select defaultValue="" name="region" required>
            <option disabled value="">
              -- Chọn khu vực --
            </option>
            <option>Hà Nội</option>
            <option>TP. Hồ Chí Minh</option>
          </select>
        </label>
        <label>
          Chuyên ngành đào tạo *
          <input name="major" placeholder="Nhập chuyên ngành" required type="text" />
        </label>
        <label>
          Vị trí ứng tuyển *
          <select defaultValue="" name="position" required>
            <option disabled value="">
              -- Chọn vị trí --
            </option>
            {positions.map((position) => (
              <option key={position}>{position}</option>
            ))}
          </select>
        </label>
        <label>
          Tháng/Năm tốt nghiệp *
          <input name="graduationTime" placeholder="MM/YYYY" required type="text" />
        </label>
        <label>
          Thời gian làm việc *
          <select defaultValue="" name="workTime" required>
            <option disabled value="">
              -- Chọn thời gian --
            </option>
            <option>Full-time</option>
            <option>Part-time</option>
          </select>
        </label>
        <label>
          Hệ đào tạo *
          <select defaultValue="" name="education" required>
            <option disabled value="">
              -- Chọn hệ đào tạo --
            </option>
            <option>Đại học</option>
            <option>Cao đẳng</option>
            <option>Khác</option>
          </select>
        </label>
        <label>
          Điểm GPA Trung bình *
          <input name="gpa" placeholder="VD: 7.5" required type="text" />
        </label>
      </div>
      <label className="fpt-svc-upload">
        Upload CV * <small>(.pdf - tối đa 20MB)</small>
        <span>{cvName || "📁 Click để chọn file CV"}</span>
        <input
          accept=".pdf,.doc,.docx,application/pdf"
          name="cv"
          onChange={(event) => setCvName(event.target.files?.[0]?.name ?? "")}
          required
          type="file"
        />
      </label>
      <button disabled={submitState.isSubmitting || submitState.hasSubmitted} type="submit">
        {submitState.isSubmitting ? "Đang gửi thông tin..." : submitState.hasSubmitted ? "Đã gửi thông tin" : "Gửi thông tin"}
      </button>
      <SubmitMessage state={submitState} />
    </form>
  );
}

export function FptInternshipApplicationForm({ roles }: { roles: string[] }) {
  const [submitState, setSubmitState] = useState(createInitialSubmitState);
  const [cvName, setCvName] = useState("");

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitState.isSubmitting || submitState.hasSubmitted) return;

    const formData = new FormData(event.currentTarget);
    const fullName = getFormString(formData, "fullName");
    const birthday = getFormString(formData, "birthday");
    const phone = getFormString(formData, "phone");
    const email = getFormString(formData, "email");
    const school = getFormString(formData, "school");
    const major = getFormString(formData, "major");
    const graduationTime = getFormString(formData, "graduationTime");
    const internshipTime = getFormString(formData, "internshipTime");
    const area = getFormString(formData, "area");
    const role = getFormString(formData, "role");
    const resumeFile = getFormFile(formData, "cv");
    const answers: LandingAnswer[] = [
      { label: "Họ và tên", value: fullName },
      { label: "Ngày tháng năm sinh", value: birthday },
      { label: "Số điện thoại", value: phone },
      { label: "Email", value: email },
      { label: "Tên trường", value: school },
      { label: "Chuyên ngành đào tạo", value: major },
      { label: "Tháng/Năm tốt nghiệp", value: graduationTime },
      { label: "Thời gian có thể thực tập", value: internshipTime },
      { label: "Khu vực làm việc mong muốn", value: area },
      { label: "Vị trí thực tập", value: role },
      { label: "CV", value: resumeFile?.name ?? "" },
    ];

    setSubmitState((currentState) => ({ ...currentState, isSubmitting: true, message: "" }));

    try {
      await submitLandingApplication({
        answers,
        email,
        fullName,
        jobLocation: area || "Internship 2026",
        jobTitle: role || "FPT Telecom Internship 2026",
        phone,
        programSlug: "Internship",
        programTitle: "Internship 2026",
        resumeFile,
      });

      setSubmitState({
        hasSubmitted: true,
        isSubmitting: false,
        message: getSuccessMessage(),
        tone: "success",
      });
    } catch (error) {
      setSubmitState({
        hasSubmitted: false,
        isSubmitting: false,
        message: error instanceof Error ? error.message : "Không thể gửi thông tin. Vui lòng thử lại.",
        tone: "error",
      });
    }
  };

  return (
    <form className="fpt-int-form" onSubmit={submitForm}>
      <h2>Form đăng ký</h2>
      <div className="fpt-int-field-grid">
        <label>
          Họ và tên *
          <input name="fullName" required type="text" />
        </label>
        <label>
          Ngày tháng năm sinh *
          <input name="birthday" placeholder="DD/MM/YYYY" required type="text" />
        </label>
        <label>
          Số điện thoại *
          <input name="phone" required type="tel" />
        </label>
        <label>
          Email *
          <input name="email" required type="email" />
        </label>
        <label>
          Tên trường *
          <input name="school" required type="text" />
        </label>
        <label>
          Chuyên ngành đào tạo *
          <input name="major" required type="text" />
        </label>
        <label>
          Tháng/Năm tốt nghiệp *
          <input name="graduationTime" placeholder="Tháng/Năm" required type="text" />
        </label>
        <label>
          Thời gian có thể thực tập *
          <input name="internshipTime" placeholder="Tháng/Năm - Tháng/Năm" required type="text" />
        </label>
      </div>
      <fieldset>
        <legend>Khu vực làm việc mong muốn *</legend>
        {["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"].map((area) => (
          <label key={area}>
            <input name="area" required type="radio" value={area} />
            {area}
          </label>
        ))}
      </fieldset>
      <label>
        Vị trí thực tập *
        <select defaultValue="" name="role" required>
          <option disabled value="">
            -- Chọn vị trí thực tập --
          </option>
          {roles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
      </label>
      <label className="fpt-int-upload">
        Upload CV *
        <span>{cvName || "Upload CV *"}</span>
        <input
          accept=".pdf,.doc,.docx,application/pdf"
          name="cv"
          onChange={(event) => setCvName(event.target.files?.[0]?.name ?? "")}
          required
          type="file"
        />
      </label>
      <button disabled={submitState.isSubmitting || submitState.hasSubmitted} type="submit">
        {submitState.isSubmitting ? "Đang gửi thông tin..." : submitState.hasSubmitted ? "Đã gửi thông tin" : "Gửi thông tin"}
      </button>
      <SubmitMessage state={submitState} />
    </form>
  );
}
