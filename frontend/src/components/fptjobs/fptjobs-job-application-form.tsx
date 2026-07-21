"use client";

import { useEffect, useId, useState, type CSSProperties, type ChangeEvent, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, Info, Send, Upload, X } from "lucide-react";
import {
  adminApplicationsStorageKey,
  readStoredApplications,
  writeStoredApplications,
  type FptApplicationProfileSnapshot,
  type FptStoredApplication,
} from "@/lib/fptjobs-applications";
import { formatVietnamDateTime } from "@/lib/fptjobs-datetime";
import vietnamAdminUnits from "@/data/vietnam-admin-units.json";
import vietnamMajors from "@/data/vietnam-majors.json";
import vietnamSchools from "@/data/vietnam-schools.json";

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

type ApplicationFormValues = {
  address: string;
  birthday: string;
  coverLetter: string;
  currentCity: string;
  currentWard: string;
  desiredCity: string;
  desiredWard: string;
  email: string;
  educationLevel: string;
  fullName: string;
  major: string;
  phone: string;
  resumeUrl: string;
  school: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const authStorageKey = "fptjobs.auth";
const candidateApplicationsChangeEventName = "fptjobs-candidate-applications-change";
const educationLevels = ["Sau đại học (Thạc Sĩ/Tiến Sĩ)", "Đại học", "Cao đẳng", "Khác (THPT/Trung cấp/Sơ cấp)"];
const maxSelectedMajors = 3;
const majorOptions = vietnamMajors as string[];
const schoolOptions = vietnamSchools as string[];
const provinceWardOptions = Object.fromEntries(vietnamAdminUnits.map((unit) => [unit.province, unit.wards])) as Record<
  string,
  string[]
>;
const cityOptions = Object.keys(provinceWardOptions);
const defaultApplicationFormValues: ApplicationFormValues = {
  address: "",
  birthday: "",
  coverLetter: "",
  currentCity: "",
  currentWard: "",
  desiredCity: "",
  desiredWard: "",
  email: "",
  educationLevel: "",
  fullName: "",
  major: "",
  phone: "",
  resumeUrl: "",
  school: "",
};
const modalStyle: CSSProperties = {
  display: "grid",
  inset: 0,
  isolation: "isolate",
  overflowY: "auto",
  padding: 24,
  placeItems: "center",
  position: "fixed",
  zIndex: 20000,
};
const dialogStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #dfe7f6",
  borderRadius: 14,
  boxShadow: "0 32px 80px rgb(7 23 51 / 24%)",
  color: "#05264e",
  maxHeight: "calc(100vh - 48px)",
  overflowY: "auto",
  padding: 34,
  position: "relative",
  width: "min(1180px, calc(100vw - 48px))",
  zIndex: 1,
};
const closeButtonStyle: CSSProperties = {
  alignItems: "center",
  background: "#fff",
  border: "1px solid #dfe7f6",
  borderRadius: 999,
  color: "#52627d",
  cursor: "pointer",
  display: "inline-flex",
  height: 36,
  justifyContent: "center",
  position: "absolute",
  right: 18,
  top: 18,
  width: 36,
};
const fieldLabelStyle: CSSProperties = {
  color: "#99a8bd",
  display: "block",
  fontSize: 17,
  fontWeight: 1000,
  letterSpacing: 0,
  lineHeight: 1.35,
  textTransform: "none",
};
const controlStyle: CSSProperties = {
  background: "#e9edf5",
  border: "1.5px solid #dce4f0",
  borderRadius: 6,
  color: "#05264e",
  fontSize: 18,
  fontWeight: 900,
  minHeight: 62,
  outline: "none",
  padding: "0 22px",
  width: "100%",
};
const textareaStyle: CSSProperties = {
  ...controlStyle,
  lineHeight: 1.45,
  minHeight: 136,
  padding: "18px 22px",
  resize: "vertical",
};
const filePickerStyle: CSSProperties = {
  alignItems: "center",
  background: "#e9edf5",
  border: "1.5px solid #dce4f0",
  borderRadius: 6,
  color: "#05264e",
  cursor: "pointer",
  display: "flex",
  gap: 10,
  minHeight: 62,
  padding: "0 22px",
  width: "100%",
};
const searchTriggerStyle: CSSProperties = {
  alignItems: "center",
  background: "#e9edf5",
  border: "1.5px solid #dce4f0",
  borderRadius: 6,
  color: "#05264e",
  cursor: "pointer",
  display: "flex",
  fontSize: 18,
  fontWeight: 900,
  gap: 14,
  justifyContent: "space-between",
  minHeight: 62,
  outline: "none",
  padding: "0 18px 0 22px",
  textAlign: "left",
  width: "100%",
};
const searchTriggerPlaceholderStyle: CSSProperties = {
  ...searchTriggerStyle,
  color: "#99a8bd",
};
const searchTriggerLabelStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const searchSelectStyle: CSSProperties = {
  minWidth: 0,
  position: "relative",
  width: "100%",
};
const searchMenuStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #dbe5f5",
  borderRadius: 8,
  boxShadow: "0 18px 44px rgb(5 38 78 / 14%)",
  display: "grid",
  gap: 12,
  left: 0,
  maxWidth: "100%",
  padding: 12,
  position: "absolute",
  right: 0,
  top: "calc(100% + 8px)",
  zIndex: 20,
};
const searchInputStyle: CSSProperties = {
  background: "#fff",
  border: "1.5px solid #e0e7f4",
  borderRadius: 6,
  color: "#05264e",
  fontSize: 16,
  fontWeight: 800,
  minHeight: 48,
  outline: "none",
  padding: "0 14px",
  width: "100%",
};
const searchOptionsStyle: CSSProperties = {
  display: "grid",
  maxHeight: 260,
  overflowY: "auto",
};
const searchOptionButtonStyle: CSSProperties = {
  background: "transparent",
  border: 0,
  color: "#05264e",
  cursor: "pointer",
  fontSize: 17,
  fontWeight: 900,
  lineHeight: 1.3,
  padding: "12px 14px",
  textAlign: "left",
};
const searchOptionSelectedStyle: CSSProperties = {
  ...searchOptionButtonStyle,
  background: "#f3f6fc",
};
const searchEmptyStyle: CSSProperties = {
  color: "#7e8da5",
  fontSize: 15,
  fontWeight: 900,
  padding: "12px 14px",
};

function formatDateLabel(value?: string) {
  return formatVietnamDateTime(value);
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

function getDefaultJobCity(location: string) {
  const normalizedLocation = normalizeProfileValue(location);

  return cityOptions.includes(normalizedLocation) ? normalizedLocation : "";
}

function normalizeDateInputValue(value?: string | null) {
  const safeValue = normalizeProfileValue(value);

  if (!safeValue) return "";

  const isoMatch = safeValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const vietnameseDateMatch = safeValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (vietnameseDateMatch) return `${vietnameseDateMatch[3]}-${vietnameseDateMatch[2]}-${vietnameseDateMatch[1]}`;

  return "";
}

function parseMajorSelection(value?: string | null) {
  const safeValue = normalizeProfileValue(value);

  if (!safeValue) return [];

  try {
    const parsedValue = JSON.parse(safeValue) as unknown;

    if (Array.isArray(parsedValue)) {
      return parsedValue.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // Older profiles may store major as plain text.
  }

  return [safeValue];
}

function stringifyMajorSelection(values: string[]) {
  return JSON.stringify([...new Set(values)].slice(0, maxSelectedMajors));
}

function getWardOptions(city: string, currentWard: string) {
  const options = provinceWardOptions[city] ?? [];

  return currentWard && !options.includes(currentWard) ? [currentWard, ...options] : options;
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function getResumeFileLabel(value?: string | null) {
  const safeValue = value?.trim() ?? "";

  if (!safeValue) return "";

  const filename = safeValue.split("/").filter(Boolean).at(-1) ?? safeValue;

  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
}

function getResumeHref(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${apiBaseUrl}${value}`;

  return "";
}

function getApplicationErrorMessage(data: ApplicationApiResponse) {
  const detailMessage = data.error?.details ? Object.values(data.error.details)[0] : "";

  return detailMessage || data.error?.message || "Không thể nộp hồ sơ. Vui lòng thử lại.";
}

function createDefaultFormValues(auth: StoredAuth | null, location: string): ApplicationFormValues {
  return {
    ...defaultApplicationFormValues,
    desiredCity: getDefaultJobCity(location),
    email: auth?.user.email ?? "",
    fullName: auth?.user.fullName ?? "",
  };
}

function ApplySelect({
  disabled,
  emptyMessage = "Không tìm thấy lựa chọn phù hợp.",
  label,
  onChange,
  options,
  placeholder,
  required,
  value,
}: {
  disabled?: boolean;
  emptyMessage?: string;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
  value: string;
}) {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const labelId = useId();
  const selectOptions = value && !options.includes(value) ? [value, ...options] : options;
  const normalizedQuery = normalizeSearchText(query.trim());
  const filteredOptions = normalizedQuery
    ? selectOptions.filter((option) => normalizeSearchText(option).includes(normalizedQuery))
    : selectOptions;

  return (
    <div className="fpt-quick-apply-profile-field">
      <span id={labelId} style={fieldLabelStyle}>
        {label}
        {required ? " *" : null}
      </span>
      <div
        className={isOpen ? "fpt-quick-apply-search-select is-open" : "fpt-quick-apply-search-select"}
        onBlur={(event) => {
          const nextFocus = event.relatedTarget as Node | null;

          if (!nextFocus || !event.currentTarget.contains(nextFocus)) {
            setOpen(false);
            setQuery("");
          }
        }}
        style={searchSelectStyle}
      >
        <button
          aria-expanded={isOpen}
          aria-labelledby={labelId}
          className={value ? "fpt-quick-apply-search-trigger" : "fpt-quick-apply-search-trigger is-placeholder"}
          disabled={disabled}
          onClick={() => {
            setOpen((currentValue) => !currentValue);
            setQuery("");
          }}
          style={value ? searchTriggerStyle : searchTriggerPlaceholderStyle}
          type="button"
        >
          <span className="fpt-quick-apply-search-trigger-label" style={searchTriggerLabelStyle}>
            {value || placeholder}
          </span>
          <ChevronDown aria-hidden="true" size={18} />
        </button>

        {isOpen && !disabled ? (
          <div className="fpt-quick-apply-search-menu" style={searchMenuStyle}>
            <input
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm"
              style={searchInputStyle}
              type="search"
              value={query}
            />
            <div className="fpt-quick-apply-search-options" style={searchOptionsStyle}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    className={option === value ? "is-selected" : undefined}
                    key={option}
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                      setQuery("");
                    }}
                    style={option === value ? searchOptionSelectedStyle : searchOptionButtonStyle}
                    type="button"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <span className="fpt-quick-apply-search-empty" style={searchEmptyStyle}>
                  {emptyMessage}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ApplyMultiSelect({
  disabled,
  emptyMessage,
  label,
  maxSelected,
  onRemove,
  onSelect,
  options,
  placeholder,
  selectedValues,
}: {
  disabled?: boolean;
  emptyMessage: string;
  label: string;
  maxSelected: number;
  onRemove: (value: string) => void;
  onSelect: (value: string) => void;
  options: string[];
  placeholder: string;
  selectedValues: string[];
}) {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const labelId = useId();
  const canSelectMore = selectedValues.length < maxSelected;
  const availableOptions = options.filter((option) => !selectedValues.includes(option));
  const normalizedQuery = normalizeSearchText(query.trim());
  const filteredOptions = normalizedQuery
    ? availableOptions.filter((option) => normalizeSearchText(option).includes(normalizedQuery))
    : availableOptions;

  return (
    <div className="fpt-quick-apply-profile-field">
      <span id={labelId} style={fieldLabelStyle}>
        {label}
      </span>
      <div
        className={isOpen ? "fpt-quick-apply-search-select is-open" : "fpt-quick-apply-search-select"}
        onBlur={(event) => {
          const nextFocus = event.relatedTarget as Node | null;

          if (!nextFocus || !event.currentTarget.contains(nextFocus)) {
            setOpen(false);
            setQuery("");
          }
        }}
        style={searchSelectStyle}
      >
        <button
          aria-expanded={isOpen}
          aria-labelledby={labelId}
          className="fpt-quick-apply-search-trigger is-placeholder"
          disabled={disabled || !canSelectMore}
          onClick={() => {
            setOpen((currentValue) => !currentValue);
            setQuery("");
          }}
          style={searchTriggerPlaceholderStyle}
          type="button"
        >
          <span className="fpt-quick-apply-search-trigger-label" style={searchTriggerLabelStyle}>
            {canSelectMore ? placeholder : "Đã chọn tối đa 3 chuyên ngành"}
          </span>
          <ChevronDown aria-hidden="true" size={18} />
        </button>

        {isOpen && !disabled ? (
          <div className="fpt-quick-apply-search-menu" style={searchMenuStyle}>
            <input
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm"
              style={searchInputStyle}
              type="search"
              value={query}
            />
            <div className="fpt-quick-apply-search-options" style={searchOptionsStyle}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    disabled={!canSelectMore}
                    key={option}
                    onClick={() => {
                      if (!canSelectMore) return;

                      onSelect(option);
                      setQuery("");
                    }}
                    style={searchOptionButtonStyle}
                    type="button"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <span className="fpt-quick-apply-search-empty" style={searchEmptyStyle}>
                  {canSelectMore ? emptyMessage : "Đã chọn tối đa 3 chuyên ngành."}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {selectedValues.length > 0 ? (
        <div className="fpt-quick-apply-major-chip-list">
          {selectedValues.map((value) => (
            <span className="fpt-quick-apply-major-chip" key={value}>
              {value}
              <button aria-label={`Bỏ ${value}`} onClick={() => onRemove(value)} type="button">
                <X aria-hidden="true" size={16} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function FptJobQuickApplyButton({ jobTitle, jobSlug, location, variant = "default" }: JobQuickApplyButtonProps) {
  const cvInputId = useId();
  const [dialogMessage, setDialogMessage] = useState("");
  const [formValues, setFormValues] = useState<ApplicationFormValues>(defaultApplicationFormValues);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [message, setMessage] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isLoadingProfile, setLoadingProfile] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [hasSubmitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isDialogOpen) return;

    const originalOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        setDialogOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isDialogOpen, isSubmitting]);

  const closeDialog = () => {
    if (isSubmitting) return;

    setDialogOpen(false);
  };

  const openApplicationDialog = async () => {
    const auth = readStoredAuth();

    setDialogMessage("");
    setFormValues(createDefaultFormValues(auth, location));
    setMessage("");
    setResumeFile(null);
    setResumeFileName("");
    setDialogOpen(true);

    if (!auth?.token) return;

    setLoadingProfile(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/candidate/profile`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const profileData = await parseJson<ProfileResponse>(response);

      if (!response.ok || !profileData.data) {
        throw new Error(profileData.error?.message ?? "Không thể tải hồ sơ đã lưu.");
      }

      const profile = profileData.data.profile;
      const resumeUrl = normalizeProfileValue(profile.resumeUrl);

      setFormValues((currentValues) => ({
        ...currentValues,
        address: normalizeProfileValue(profile.address),
        birthday: normalizeDateInputValue(profile.birthday),
        currentCity: normalizeProfileValue(profile.currentCity),
        currentWard: normalizeProfileValue(profile.currentWard),
        desiredCity: normalizeProfileValue(profile.desiredCity) || getDefaultJobCity(location),
        desiredWard: normalizeProfileValue(profile.desiredWard),
        educationLevel: normalizeProfileValue(profile.educationLevel),
        email: normalizeProfileValue(profile.email) || auth.user.email,
        fullName: normalizeProfileValue(profile.fullName) || auth.user.fullName,
        major: stringifyMajorSelection(parseMajorSelection(profile.major)),
        phone: normalizeProfileValue(profile.phone),
        resumeUrl,
        school: normalizeProfileValue(profile.school),
      }));
      setResumeFileName(getResumeFileLabel(resumeUrl));
    } catch (error) {
      setDialogMessage(error instanceof Error ? error.message : "Không thể tải hồ sơ đã lưu.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const updateFormValue = (field: keyof ApplicationFormValues, value: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const updateLocation = (
    cityField: "currentCity" | "desiredCity",
    wardField: "currentWard" | "desiredWard",
    value: string,
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [cityField]: value,
      [wardField]: provinceWardOptions[value]?.includes(currentValues[wardField]) ? currentValues[wardField] : "",
    }));
  };

  const selectMajor = (value: string) => {
    if (!value) return;

    setFormValues((currentValues) => {
      const selectedMajors = parseMajorSelection(currentValues.major);

      if (selectedMajors.includes(value) || selectedMajors.length >= maxSelectedMajors) {
        return currentValues;
      }

      return {
        ...currentValues,
        major: stringifyMajorSelection([...selectedMajors, value]),
      };
    });
  };

  const removeMajor = (value: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      major: stringifyMajorSelection(parseMajorSelection(currentValues.major).filter((major) => major !== value)),
    }));
  };

  const updateResumeFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setResumeFile(file);
    setResumeFileName(file?.name ?? getResumeFileLabel(formValues.resumeUrl));
  };

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const auth = readStoredAuth();
    const fullName = normalizeProfileValue(formValues.fullName);
    const email = normalizeProfileValue(formValues.email);
    const phone = normalizeProfileValue(formValues.phone);
    const resumeUrl = normalizeProfileValue(formValues.resumeUrl);
    const missingDropdownFields = [
      formValues.address,
      formValues.birthday,
      formValues.currentCity,
      formValues.currentWard,
      formValues.desiredCity,
      formValues.desiredWard,
      formValues.educationLevel,
      formValues.school,
    ].some((value) => !normalizeProfileValue(value));

    if (!fullName || !email || !phone) {
      setDialogMessage("Vui lòng nhập họ tên, email và số điện thoại.");
      return;
    }

    if (missingDropdownFields) {
      setDialogMessage("Vui lòng điền đầy đủ ngày sinh, địa chỉ, nơi muốn làm việc, hệ học và trường.");
      return;
    }

    if (!resumeFile && !resumeUrl) {
      setDialogMessage("Vui lòng tải CV trước khi nộp hồ sơ.");
      return;
    }

    const requestBody = new FormData();
    requestBody.append("coverLetter", normalizeProfileValue(formValues.coverLetter) || "Nộp hồ sơ từ form ứng tuyển.");
    requestBody.append("address", normalizeProfileValue(formValues.address));
    requestBody.append("birthday", normalizeProfileValue(formValues.birthday));
    requestBody.append("currentCity", normalizeProfileValue(formValues.currentCity));
    requestBody.append("currentWard", normalizeProfileValue(formValues.currentWard));
    requestBody.append("desiredCity", normalizeProfileValue(formValues.desiredCity));
    requestBody.append("desiredWard", normalizeProfileValue(formValues.desiredWard));
    requestBody.append("email", email);
    requestBody.append("educationLevel", normalizeProfileValue(formValues.educationLevel));
    requestBody.append("fullName", fullName);
    requestBody.append("jobLocation", location);
    requestBody.append("jobSlug", jobSlug);
    requestBody.append("jobTitle", jobTitle);
    requestBody.append("major", normalizeProfileValue(formValues.major));
    requestBody.append("phone", phone);
    requestBody.append("school", normalizeProfileValue(formValues.school));

    if (resumeFile) {
      requestBody.append("cv", resumeFile);
    } else {
      requestBody.append("resumeUrl", resumeUrl);
    }

    setSubmitting(true);
    setDialogMessage("");
    setMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/applications`, {
        body: requestBody,
        headers: auth?.token
          ? {
              Authorization: `Bearer ${auth.token}`,
            }
          : undefined,
        method: "POST",
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
      setDialogOpen(false);
      setMessage("Đã nộp hồ sơ thành công.");
    } catch (error) {
      setDialogMessage(error instanceof Error ? error.message : "Không thể nộp hồ sơ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const resumeHref = getResumeHref(formValues.resumeUrl);
  const selectedMajorValues = parseMajorSelection(formValues.major);

  return (
    <div className={`fpt-job-quick-apply ${variant === "summary" ? "is-summary" : ""}`}>
      <button className="fpt-apply-button" disabled={isSubmitting || hasSubmitted} onClick={openApplicationDialog} type="button">
        {isSubmitting ? "Đang nộp..." : hasSubmitted ? "Đã nộp hồ sơ" : "Nộp hồ sơ"}
      </button>
      {message ? (
        <p className={`fpt-job-quick-apply-message ${hasSubmitted ? "is-success" : ""}`}>{message}</p>
      ) : null}
      {isDialogOpen
        ? createPortal(
            <div
              className="fpt-quick-apply-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="quick-apply-title"
              style={modalStyle}
            >
              <button
                className="fpt-quick-apply-backdrop"
                onClick={closeDialog}
                type="button"
                aria-label="Đóng form nộp hồ sơ"
              />
              <div className="fpt-quick-apply-dialog" style={dialogStyle}>
                <button
                  className="fpt-quick-apply-close"
                  disabled={isSubmitting}
                  onClick={closeDialog}
                  style={closeButtonStyle}
                  type="button"
                  aria-label="Đóng form nộp hồ sơ"
                >
                  <X aria-hidden="true" size={19} />
                </button>
                <header className="fpt-quick-apply-head">
                  <span className="fpt-quick-apply-kicker">Ứng tuyển</span>
                  <h2 id="quick-apply-title">Nộp hồ sơ</h2>
                  <p className="fpt-quick-apply-intro">
                    Vị trí <strong>{jobTitle}</strong> · {location}
                  </p>
                </header>

                <form className="fpt-quick-apply-profile-form" onSubmit={submitApplication}>
                  <div className="fpt-quick-apply-profile-grid">
                    <section className="fpt-quick-apply-profile-card">
                      <h3>Thông tin cá nhân</h3>
                      <label className="fpt-quick-apply-profile-field">
                        <span style={fieldLabelStyle}>Họ và tên *</span>
                        <input
                          autoComplete="name"
                          disabled={isSubmitting}
                          onChange={(event) => updateFormValue("fullName", event.target.value)}
                          placeholder="Nhập họ và tên"
                          required
                          style={controlStyle}
                          type="text"
                          value={formValues.fullName}
                        />
                      </label>
                      <label className="fpt-quick-apply-profile-field">
                        <span style={fieldLabelStyle}>Số điện thoại *</span>
                        <input
                          autoComplete="tel"
                          disabled={isSubmitting}
                          onChange={(event) => updateFormValue("phone", event.target.value)}
                          placeholder="Nhập số điện thoại"
                          required
                          style={controlStyle}
                          type="tel"
                          value={formValues.phone}
                        />
                      </label>
                      <label className="fpt-quick-apply-profile-field">
                        <span style={fieldLabelStyle}>Email *</span>
                        <input
                          autoComplete="email"
                          disabled={isSubmitting}
                          onChange={(event) => updateFormValue("email", event.target.value)}
                          placeholder="Nhập email"
                          required
                          style={controlStyle}
                          type="email"
                          value={formValues.email}
                        />
                      </label>
                      <label className="fpt-quick-apply-profile-field">
                        <span style={fieldLabelStyle}>Ngày sinh *</span>
                        <span className="fpt-quick-apply-date-wrap">
                          <input
                            disabled={isSubmitting}
                            max="2099-12-31"
                            min="1900-01-01"
                            onChange={(event) => updateFormValue("birthday", event.target.value)}
                            required
                            style={controlStyle}
                            type="date"
                            value={formValues.birthday}
                          />
                          <CalendarDays aria-hidden="true" size={20} />
                        </span>
                      </label>
                      <label className="fpt-quick-apply-profile-field">
                        <span style={fieldLabelStyle}>Địa chỉ *</span>
                        <textarea
                          disabled={isSubmitting}
                          onChange={(event) => updateFormValue("address", event.target.value)}
                          placeholder="Nhập nơi ở hiện tại"
                          required
                          rows={3}
                          style={textareaStyle}
                          value={formValues.address}
                        />
                      </label>

                      <h4>Nơi ở hiện tại</h4>
                      <div className="fpt-quick-apply-location-row">
                        <ApplySelect
                          disabled={isSubmitting}
                          label="Tỉnh thành"
                          onChange={(value) => updateLocation("currentCity", "currentWard", value)}
                          options={cityOptions}
                          placeholder="Chọn tỉnh/thành"
                          required
                          value={formValues.currentCity}
                        />
                        <ApplySelect
                          disabled={isSubmitting || !formValues.currentCity}
                          label="Xã/Phường"
                          onChange={(value) => updateFormValue("currentWard", value)}
                          options={getWardOptions(formValues.currentCity, formValues.currentWard)}
                          placeholder={formValues.currentCity ? "Chọn xã/phường" : "Chọn tỉnh trước"}
                          required
                          value={formValues.currentWard}
                        />
                      </div>

                      <h4>Mong muốn làm việc tại</h4>
                      <div className="fpt-quick-apply-location-row">
                        <ApplySelect
                          disabled={isSubmitting}
                          label="Tỉnh thành"
                          onChange={(value) => updateLocation("desiredCity", "desiredWard", value)}
                          options={cityOptions}
                          placeholder="Chọn tỉnh/thành"
                          required
                          value={formValues.desiredCity}
                        />
                        <ApplySelect
                          disabled={isSubmitting || !formValues.desiredCity}
                          label="Xã/Phường"
                          onChange={(value) => updateFormValue("desiredWard", value)}
                          options={getWardOptions(formValues.desiredCity, formValues.desiredWard)}
                          placeholder={formValues.desiredCity ? "Chọn xã/phường" : "Chọn tỉnh trước"}
                          required
                          value={formValues.desiredWard}
                        />
                      </div>
                    </section>

                    <div className="fpt-quick-apply-profile-stack">
                      <section className="fpt-quick-apply-profile-card">
                        <h3>Quá trình học tập</h3>
                        <ApplySelect
                          disabled={isSubmitting}
                          label="Hệ"
                          onChange={(value) => updateFormValue("educationLevel", value)}
                          options={educationLevels}
                          placeholder="Chọn hệ"
                          required
                          value={formValues.educationLevel}
                        />
                        <ApplySelect
                          disabled={isSubmitting}
                          label="Trường"
                          onChange={(value) => updateFormValue("school", value)}
                          options={schoolOptions}
                          placeholder="Chọn trường"
                          required
                          value={formValues.school}
                        />
                        <ApplyMultiSelect
                          disabled={isSubmitting}
                          emptyMessage="Không tìm thấy chuyên ngành phù hợp."
                          label="Chuyên ngành"
                          maxSelected={maxSelectedMajors}
                          onRemove={removeMajor}
                          onSelect={selectMajor}
                          options={majorOptions}
                          placeholder="Tìm kiếm chuyên ngành"
                          selectedValues={selectedMajorValues}
                        />
                        <p className="fpt-quick-apply-hint">
                          <Info aria-hidden="true" size={16} />
                          Chỉ chọn được tối đa 3 chuyên ngành
                        </p>
                      </section>

                      <section className="fpt-quick-apply-profile-card fpt-quick-apply-resume-card">
                        <h3>Kinh nghiệm làm việc</h3>
                        <input
                          accept=".pdf,.doc,.docx"
                          disabled={isSubmitting}
                          hidden
                          id={cvInputId}
                          onChange={updateResumeFile}
                          type="file"
                        />
                        <div className="fpt-quick-apply-resume-row">
                          <span>Hồ sơ của bạn *</span>
                          {resumeHref && !resumeFile ? (
                            <a href={resumeHref} rel="noreferrer" target="_blank">
                              {resumeFileName || "Xem CV đã lưu"}
                            </a>
                          ) : (
                            <strong>{resumeFileName || "Chưa có CV"}</strong>
                          )}
                          <label className="fpt-quick-apply-file" htmlFor={cvInputId} style={filePickerStyle}>
                            <Upload aria-hidden="true" size={20} />
                            <strong>{resumeFileName ? "Chọn CV khác" : "Tải lên CV"}</strong>
                          </label>
                          <p className="fpt-quick-apply-resume-hint">Hỗ trợ PDF, DOC, DOCX</p>
                        </div>
                      </section>
                    </div>
                  </div>

                  {isLoadingProfile ? <p className="fpt-quick-apply-inline-message">Đang tải thông tin đã lưu...</p> : null}
                  {dialogMessage ? <p className="fpt-quick-apply-inline-message is-error">{dialogMessage}</p> : null}

                  <div className="fpt-quick-apply-actions">
                    <button disabled={isSubmitting} onClick={closeDialog} type="button">
                      Hủy
                    </button>
                    <button disabled={isSubmitting || isLoadingProfile} type="submit">
                      <Send aria-hidden="true" size={17} />
                      {isSubmitting ? "Đang nộp..." : "Nộp hồ sơ"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
