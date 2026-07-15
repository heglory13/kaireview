"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  adminApplicationsStorageKey,
  mergeApplications,
  readStoredApplications,
  writeStoredApplications,
  type FptApplicationProfileSnapshot,
  type FptStoredApplication,
} from "@/lib/fptjobs-applications";
import type { FptSurveyEventDetail, FptSurveyFormField } from "@/components/fptjobs/fptjobs-home";

type FieldValue = string | string[];

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

type SurveyAnswer = {
  label: string;
  normalizedLabel: string;
  value: string;
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

function createEventJobSlug(event: FptSurveyEventDetail, jobTitle: string) {
  const jobPart = createSlugPart(jobTitle);

  return ["su-kien", event.slug, jobPart].filter(Boolean).join("-");
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

function getStringValue(value: FieldValue | undefined) {
  return typeof value === "string" ? value : "";
}

function getCheckboxValues(value: FieldValue | undefined) {
  return Array.isArray(value) ? value : [];
}

function formatAnswerValue(field: FptSurveyFormField, value: FieldValue | undefined, file?: File) {
  if (field.type === "upload") {
    return file?.name ?? "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value?.trim() ?? "";
}

function findAnswer(answers: SurveyAnswer[], labelHints: string[]) {
  const normalizedHints = labelHints.map(normalizeText);
  const matchedAnswer = answers.find((answer) => normalizedHints.some((hint) => answer.normalizedLabel.includes(hint)));

  return matchedAnswer?.value.trim() ?? "";
}

function buildCoverLetter(event: FptSurveyEventDetail, answers: SurveyAnswer[]) {
  const answerLines = answers.map((answer) => `- ${answer.label}: ${answer.value || "Chưa trả lời"}`);

  return [
    `Đăng ký sự kiện: ${event.title}`,
    `Slug sự kiện: ${event.slug}`,
    `Ngày sự kiện: ${event.date}`,
    "",
    "Câu trả lời form:",
    ...answerLines,
  ].join("\n");
}

function getFirstUploadedFile(fields: FptSurveyFormField[], files: Record<number, File | undefined>) {
  const uploadIndex = fields.findIndex((field) => field.type === "upload");

  return uploadIndex >= 0 ? files[uploadIndex] : undefined;
}

function getErrorMessage(data: ApplicationApiResponse) {
  const detailMessage = data.error?.details ? Object.values(data.error.details)[0] : "";

  return detailMessage || data.error?.message || "Không thể gửi thông tin. Vui lòng thử lại.";
}

function SurveyEventFormField({
  field,
  file,
  index,
  onCheckboxChange,
  onFileChange,
  onValueChange,
  value,
}: {
  field: FptSurveyFormField;
  file?: File;
  index: number;
  onCheckboxChange: (index: number, option: string, checked: boolean) => void;
  onFileChange: (index: number, file?: File) => void;
  onValueChange: (index: number, value: string) => void;
  value?: FieldValue;
}) {
  const id = `survey-event-field-${index}`;
  const placeholder = field.placeholder ?? (field.type === "date" ? "dd/mm/yyyy" : "Câu trả lời của bạn");

  if (field.type === "select") {
    return (
      <label className="fpt-survey-field" htmlFor={id}>
        <span>
          {field.label}
          {field.required ? <em>*</em> : null}
        </span>
        {field.description ? <small>{field.description}</small> : null}
        <input
          id={id}
          onChange={(event) => onValueChange(index, event.target.value)}
          placeholder={field.placeholder ?? "Câu trả lời của bạn"}
          required={field.required}
          type="text"
          value={getStringValue(value)}
        />
      </label>
    );
  }

  if (field.type === "radio" || field.type === "checkbox") {
    const selectedValues = getCheckboxValues(value);
    const selectedValue = getStringValue(value);

    return (
      <fieldset className="fpt-survey-choice-field">
        <legend>
          {field.label}
          {field.required ? <em>*</em> : null}
        </legend>
        {field.description ? <small>{field.description}</small> : null}
        <div className="fpt-survey-choice-grid">
          {field.options?.map((option) => (
            <label key={option}>
              <input
                checked={field.type === "checkbox" ? selectedValues.includes(option) : selectedValue === option}
                name={id}
                onChange={(event) => {
                  if (field.type === "checkbox") {
                    onCheckboxChange(index, option, event.target.checked);
                    return;
                  }

                  onValueChange(index, option);
                }}
                required={field.required && field.type === "radio"}
                type={field.type}
                value={option}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="fpt-survey-field" htmlFor={id}>
        <span>
          {field.label}
          {field.required ? <em>*</em> : null}
        </span>
        {field.description ? <small>{field.description}</small> : null}
        <textarea
          id={id}
          onChange={(event) => onValueChange(index, event.target.value)}
          placeholder={placeholder}
          required={field.required}
          rows={4}
          value={getStringValue(value)}
        />
      </label>
    );
  }

  if (field.type === "upload") {
    return (
      <div className="fpt-survey-upload">
        <span>
          {field.label}
          {field.required ? <em>*</em> : null}
        </span>
        {field.description ? <small>{field.description}</small> : null}
        <label htmlFor={id}>
          <input
            accept=".pdf,.doc,.docx"
            id={id}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onFileChange(index, event.target.files?.[0])}
            required={field.required}
            type="file"
          />
          <strong>Choose file</strong>
          <small>{file?.name ?? "No file chosen"}</small>
        </label>
      </div>
    );
  }

  return (
    <label className="fpt-survey-field" htmlFor={id}>
      <span>
        {field.label}
        {field.required ? <em>*</em> : null}
      </span>
      {field.description ? <small>{field.description}</small> : null}
      <input
        id={id}
        onChange={(event) => onValueChange(index, event.target.value)}
        placeholder={placeholder}
        required={field.required}
        type={field.type === "date" ? "text" : "text"}
        value={getStringValue(value)}
      />
    </label>
  );
}

export function FptSurveyEventForm({ event }: { event: FptSurveyEventDetail }) {
  const [fieldValues, setFieldValues] = useState<Record<number, FieldValue>>({});
  const [files, setFiles] = useState<Record<number, File | undefined>>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [hasSubmitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");

  const setValue = (index: number, value: string) => {
    setFieldValues((currentValues) => ({ ...currentValues, [index]: value }));
  };

  const setCheckboxValue = (index: number, option: string, checked: boolean) => {
    setFieldValues((currentValues) => {
      const selectedValues = getCheckboxValues(currentValues[index]);
      const nextValues = checked ? [...selectedValues, option] : selectedValues.filter((value) => value !== option);

      return { ...currentValues, [index]: nextValues };
    });
  };

  const setFileValue = (index: number, file?: File) => {
    setFiles((currentFiles) => ({ ...currentFiles, [index]: file }));
  };

  const buildAnswers = () =>
    event.formFields.map((field, index) => ({
      label: field.label,
      normalizedLabel: normalizeText(field.label),
      value: formatAnswerValue(field, fieldValues[index], files[index]),
    }));

  const validateRequiredFields = (answers: SurveyAnswer[]) => {
    const missingField = event.formFields.find((field, index) => {
      if (!field.required) return false;

      return !answers[index]?.value.trim();
    });

    return missingField?.label ?? "";
  };

  const submitForm = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();

    if (event.expired || isSubmitting || hasSubmitted) {
      return;
    }

    const answers = buildAnswers();
    const missingLabel = validateRequiredFields(answers);

    if (missingLabel) {
      setMessageTone("error");
      setMessage(`Vui lòng nhập ${missingLabel}.`);
      return;
    }

    const auth = readStoredAuth();
    const fullName = findAnswer(answers, ["họ và tên", "ho va ten"]) || auth?.user.fullName || "";
    const email = findAnswer(answers, ["email"]) || auth?.user.email || "";
    const phone = findAnswer(answers, ["số điện thoại", "so dien thoai", "phone"]);
    const selectedPosition = findAnswer(answers, [
      "vị trí ứng tuyển",
      "vi tri ung tuyen",
      "vị trí bạn quan tâm",
      "vi tri ban quan tam",
      "vị trí công việc",
      "vi tri cong viec",
      "vị trí bạn mong muốn",
      "vi tri ban mong muon",
      "lĩnh vực ứng tuyển",
      "linh vuc ung tuyen",
    ]);
    const selectedLocation = findAnswer(answers, [
      "tỉnh thành",
      "tinh thanh",
      "khu vực tỉnh",
      "khu vuc tinh",
      "khu vực/tỉnh thành",
      "khu vuc/tinh thanh",
      "khu vực ứng tuyển",
      "khu vuc ung tuyen",
      "khu vực",
      "khu vuc",
    ]);

    if (!fullName || !email || !phone) {
      setMessageTone("error");
      setMessage("Vui lòng nhập đầy đủ họ tên, email và số điện thoại.");
      return;
    }

    const jobTitle = selectedPosition || event.title;
    const resumeFile = getFirstUploadedFile(event.formFields, files);
    const formData = new FormData();

    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("jobTitle", jobTitle);
    formData.append("jobLocation", selectedLocation || "Sự kiện");
    formData.append("jobSlug", createEventJobSlug(event, jobTitle));
    formData.append("coverLetter", buildCoverLetter(event, answers));

    if (resumeFile) {
      formData.append("cv", resumeFile);
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/applications`, {
        body: formData,
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
        source: "Sự kiện",
        status: "new",
      };

      writeStoredApplications(mergeApplications([application], readStoredApplications()));
      window.dispatchEvent(new StorageEvent("storage", { key: adminApplicationsStorageKey }));
      window.dispatchEvent(new Event(candidateApplicationsChangeEventName));
      setSubmitted(true);
      setMessageTone("success");
      setMessage("Đã gửi thông tin thành công.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Không thể gửi thông tin. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="fpt-survey-form" onSubmit={submitForm}>
      {event.formFields.map((field, index) => (
        <SurveyEventFormField
          field={field}
          file={files[index]}
          index={index}
          key={`${field.label}-${index}`}
          onCheckboxChange={setCheckboxValue}
          onFileChange={setFileValue}
          onValueChange={setValue}
          value={fieldValues[index]}
        />
      ))}
      <button disabled={event.expired || isSubmitting || hasSubmitted} type="submit">
        {event.expired ? "Đã hết hạn" : isSubmitting ? "Đang gửi..." : hasSubmitted ? "Đã gửi thông tin" : "Gửi thông tin"}
      </button>
      {message ? <p className={`fpt-survey-form-message ${messageTone === "success" ? "is-success" : ""}`}>{message}</p> : null}
    </form>
  );
}
