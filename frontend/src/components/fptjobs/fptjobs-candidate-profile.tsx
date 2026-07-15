"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  Info,
  Pencil,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { FptHeader } from "@/components/fptjobs/fptjobs-header";
import vietnamAdminUnits from "@/data/vietnam-admin-units.json";
import vietnamMajors from "@/data/vietnam-majors.json";
import vietnamSchools from "@/data/vietnam-schools.json";

type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

type CandidateProfile = {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  birthday: string;
  address: string;
  currentCity: string;
  currentWard: string;
  desiredCity: string;
  desiredWard: string;
  educationLevel: string;
  school: string;
  major: string;
  graduationYear: string;
  gpa: string;
  resumeUrl: string;
};

type StoredAuth = {
  user: AuthUser;
  token: string;
};

type ProfileResponse = {
  data?: {
    user: AuthUser;
    profile: Partial<Record<keyof CandidateProfile, string | null>>;
  };
  error?: {
    message?: string;
  };
};

type CandidateApplicationRecord = {
  id: number;
  resumeUrl: string | null;
  coverLetter: string | null;
  status: string;
  createdAt: string;
  job: {
    title: string;
    location: string;
    slug: string;
  };
};

type CandidateApplicationsResponse = {
  data?: CandidateApplicationRecord[];
  error?: {
    message?: string;
  };
};

type ContactItem = {
  title: string;
  subtitle: string;
  icon: string;
  href: string;
};

type CandidatePanel = "profile" | "applications" | "faq";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const authStorageKey = "fptjobs.auth";
const authChangeEventName = "fptjobs-auth-change";
const candidateApplicationsChangeEventName = "fptjobs-candidate-applications-change";

const assets = {
  avatar: "/images/fptjobs/fptjobs-com-public-imgs-version2-fox-avt.png",
  contactFb: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-fb.svg",
  contactLinkedin: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-in.svg",
  contactMail: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-mail.svg",
  contactOffice: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-vpgd.svg",
  contactPhone: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-phone.svg",
  contactTiktok: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-tik.svg",
  footerLogo: "/seo/fptjobs-com-public-imgs-version2-general-fpt-telecom-logo-footer.svg",
  foxFooter: "/images/fptjobs/fptjobs-com-public-imgs-version2-fox-3.png",
};

const defaultProfile: CandidateProfile = {
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  birthday: "",
  address: "",
  currentCity: "",
  currentWard: "",
  desiredCity: "",
  desiredWard: "",
  educationLevel: "",
  school: "",
  major: "",
  graduationYear: "",
  gpa: "",
  resumeUrl: "",
};

const contacts: ContactItem[] = [
  {
    title: "Văn phòng giao dịch",
    subtitle: "FPT Telecom",
    icon: assets.contactOffice,
    href: "/gioi-thieu#tham-quan-van-phong",
  },
  {
    title: "FPT Telecom",
    subtitle: "LinkedIn",
    icon: assets.contactLinkedin,
    href: "https://www.linkedin.com/company/fpt-telecom/",
  },
  {
    title: "Tuyển dụng FPT Telecom",
    subtitle: "Facebook",
    icon: assets.contactFb,
    href: "https://www.facebook.com/share/1DBQeUXYXQ/?mibextid=wwXIfr",
  },
  {
    title: "0904 678 040\n0986 656 620",
    subtitle: "Phone",
    icon: assets.contactPhone,
    href: "tel:0904678040",
  },
  {
    title: "Nhà Cáo",
    subtitle: "TikTok",
    icon: assets.contactTiktok,
    href: "https://www.tiktok.com/@tuyendungfpttelecom",
  },
  {
    title: "phuongtm3@fpt.com / nhanctt3@fpt.com",
    subtitle: "Email",
    icon: assets.contactMail,
    href: "mailto:phuongtm3@fpt.com,nhanctt3@fpt.com",
  },
];

const footerColumns = [
  {
    title: "Về chúng tôi",
    items: [
      { label: "Giới thiệu công ty", href: "/gioi-thieu" },
      { label: "Tham quan văn phòng", href: "/gioi-thieu#tham-quan-van-phong" },
      { label: "Thông tin liên hệ", href: "/gioi-thieu#lien-he" },
      { label: "Câu hỏi thường gặp", href: "/gioi-thieu#cau-hoi-thuong-gap" },
    ],
  },
  {
    title: "Life at FTEL",
    items: [
      { label: "Hoạt động", href: "/life-at-ftel" },
      { label: "Văn hoá đặc sắc", href: "/life-at-ftel#van-hoa" },
      { label: "Phát triển sự nghiệp", href: "/life-at-ftel#phat-trien-su-nghiep" },
      { label: "Phúc lợi", href: "/life-at-ftel#phuc-loi" },
    ],
  },
  {
    title: "Tin tức & Sự kiện",
    items: [
      { label: "Tin tức", href: "/tin-tuc" },
      { label: "Sự kiện", href: "/su-kien" },
    ],
  },
];

const educationLevels = ["Sau đại học (Thạc Sĩ/Tiến Sĩ)", "Đại học", "Cao đẳng", "Khác (THPT/Trung cấp/Sơ cấp)"];
const majorOptions = vietnamMajors as string[];
const schoolOptions = vietnamSchools as string[];
const maxSelectedMajors = 3;
const provinceWardOptions = Object.fromEntries(vietnamAdminUnits.map((unit) => [unit.province, unit.wards])) as Record<string, string[]>;
const cityOptions = Object.keys(provinceWardOptions);
const applicationsPanelId = "vi-tri-da-ung-tuyen";
const faqPanelId = "cau-hoi-thuong-gap";
const panelHashes: Partial<Record<CandidatePanel, string>> = {
  applications: applicationsPanelId,
  faq: faqPanelId,
};
const candidateFaqs = [
  {
    question: "Thời gian phản hồi sau khi nộp hồ sơ (CV) là bao lâu?",
    answer:
      "Khi bạn ứng tuyển vào FPT Telecom, hồ sơ của bạn sẽ được xem xét trong thời hạn tối đa 15 ngày làm việc tính từ ngày nộp đơn. FPT Telecom sẽ liên lạc trực tiếp với những bạn vượt qua vòng CV / Vòng thi tuyển online.",
  },
  {
    question: "Khi nào tôi được thông báo về kết quả phỏng vấn của mình?",
    answer:
      "Bất kỳ vị trí nào của FPT Telecom, ứng viên đều được thông báo về kết quả phỏng vấn. Chỉ cần bạn có tham gia buổi phỏng vấn, bạn chắc chắn sẽ nhận được kết quả qua email đã đăng ký ban đầu. Thời gian trả kết quả phỏng vấn tối đa trong 07 ngày làm việc. Trường hợp nhanh nhất, bạn có thể nhận kết quả ngay sau buổi phỏng vấn. Một số trường hợp đặc biệt, ví dụ cần chấm bài kiểm tra năng lực ... khiến cho thời gian trả kết quả trễ hơn 07 ngày làm việc, bộ phận Tuyển dụng sẽ có thông báo cụ thể tới bạn.",
  },
];

function readStoredAuth() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(authStorageKey);

    return value ? (JSON.parse(value) as StoredAuth) : null;
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

function displayValue(value?: string | null) {
  return value?.trim() || "-";
}

function parseMajorSelection(value: string) {
  if (!value.trim()) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value) as unknown;
    if (Array.isArray(parsedValue)) {
      return parsedValue.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // Older profiles stored a single text value.
  }

  return [value];
}

function stringifyMajorSelection(values: string[]) {
  return JSON.stringify([...new Set(values)].slice(0, maxSelectedMajors));
}

function formatMajorSelection(value: string) {
  const majors = parseMajorSelection(value);

  return majors.length > 0 ? majors.join(", ") : "-";
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function formatCandidateDate(value?: string | null) {
  if (!value?.trim()) return "-";

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

  return value;
}

function formatCandidateDateTime(value?: string | null) {
  if (!value?.trim()) return "-";

  const dateValue = new Date(value);

  if (Number.isNaN(dateValue.getTime())) {
    return value;
  }

  const date = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateValue);
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  }).format(dateValue);

  return `${date} ${time}`;
}

function getApplicationStatusLabel(status: string) {
  const labels: Record<string, string> = {
    hired: "Đã nhận",
    interview: "Phỏng vấn",
    new: "Mới nộp",
    offer: "Offer",
    rejected: "Từ chối",
    reviewing: "Đang sàng lọc",
  };

  return labels[status] ?? status;
}

function getWardOptions(city: string, currentWard: string) {
  const options = provinceWardOptions[city] ?? [];

  return currentWard && !options.includes(currentWard) ? [currentWard, ...options] : options;
}

function formatLocation(parts: Array<string | null | undefined>) {
  const location = parts.map((part) => part?.trim() ?? "").filter(Boolean).join(", ");

  return location || "-";
}

function getResumeFileLabel(value: string) {
  if (!value.trim()) return "";

  const filename = value.split("/").filter(Boolean).at(-1) ?? value;

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

function normalizeCandidateProfile(profile: Partial<Record<keyof CandidateProfile, string | null>>) {
  const nextProfile = { ...defaultProfile };

  (Object.keys(defaultProfile) as Array<keyof CandidateProfile>).forEach((field) => {
    const value = profile[field];
    nextProfile[field] = typeof value === "string" ? value : defaultProfile[field];
  });

  return nextProfile;
}

function getPanelFromHash(hash: string): CandidatePanel {
  const normalizedHash = hash.replace(/^#/, "");

  if (normalizedHash === panelHashes.applications) {
    return "applications";
  }

  if (normalizedHash === panelHashes.faq) {
    return "faq";
  }

  return "profile";
}

function replacePanelHash(panel: CandidatePanel) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  url.hash = panelHashes[panel] ?? "";
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function SidebarItem({
  children,
  icon,
  isActive,
  onClick,
}: {
  children: ReactNode;
  icon: ReactNode;
  isActive?: boolean;
  onClick: () => void;
}) {
  const className = isActive ? "is-active" : undefined;

  return (
    <button aria-current={isActive ? "page" : undefined} className={className} onClick={onClick} type="button">
      {icon}
      {children}
    </button>
  );
}

function ReadonlyField({
  label,
  multiline,
  value,
}: {
  label: string;
  multiline?: boolean;
  value: string;
}) {
  return (
    <label className={multiline ? "fpt-candidate-field is-textarea" : "fpt-candidate-field"}>
      <span>{label}</span>
      {multiline ? <textarea readOnly rows={4} value={value} /> : <input readOnly value={value} />}
    </label>
  );
}

function EditableField({
  label,
  name,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: {
  label: string;
  name: keyof CandidateProfile;
  onChange: (field: keyof CandidateProfile, value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="fpt-candidate-edit-field">
      <span>
        {label}
        {required ? " *" : null}
      </span>
      <input
        name={name}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function EditableSelect({
  disabled,
  label,
  onChange,
  options,
  placeholder = "-",
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange?: (value: string) => void;
  options: string[];
  placeholder?: string;
  value?: string;
}) {
  const selectOptions = value && !options.includes(value) ? [value, ...options] : options;

  return (
    <label className="fpt-candidate-edit-field">
      <span>{label}</span>
      <span className="fpt-candidate-select-wrap">
        <select disabled={disabled} onChange={(event) => onChange?.(event.target.value)} value={value}>
          <option value="">{placeholder}</option>
          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" size={18} />
      </span>
    </label>
  );
}

function SearchableProfileSelect({
  emptyMessage,
  id,
  isOpen,
  label,
  onOpenChange,
  onQueryChange,
  onSelect,
  options,
  placeholder,
  query,
  value,
}: {
  emptyMessage: string;
  id: string;
  isOpen: boolean;
  label: string;
  onOpenChange: (value: boolean) => void;
  onQueryChange: (value: string) => void;
  onSelect: (value: string) => void;
  options: string[];
  placeholder: string;
  query: string;
  value: string;
}) {
  const labelId = `${id}-label`;

  return (
    <div className="fpt-candidate-edit-field fpt-candidate-school-field">
      <span id={labelId}>{label}</span>
      <div
        className={isOpen ? "fpt-candidate-search-select is-open" : "fpt-candidate-search-select"}
        onBlur={(event) => {
          const nextFocus = event.relatedTarget as Node | null;
          if (!nextFocus || !event.currentTarget.contains(nextFocus)) {
            onOpenChange(false);
          }
        }}
      >
        <button
          aria-expanded={isOpen}
          aria-labelledby={labelId}
          className="fpt-candidate-search-select-trigger"
          onClick={() => {
            onOpenChange(!isOpen);
            if (!isOpen) {
              onQueryChange("");
            }
          }}
          type="button"
        >
          <span>{displayValue(value)}</span>
          <ChevronDown aria-hidden="true" size={18} />
        </button>

        {isOpen ? (
          <div className="fpt-candidate-search-select-menu">
            <input
              autoFocus
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={placeholder}
              type="search"
              value={query}
            />
            <div className="fpt-candidate-search-select-options">
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    className={option === value ? "is-selected" : undefined}
                    key={option}
                    onClick={() => {
                      onSelect(option);
                      onQueryChange("");
                      onOpenChange(false);
                    }}
                    type="button"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <span className="fpt-candidate-search-select-empty">{emptyMessage}</span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SearchableProfileMultiSelect({
  id,
  isOpen,
  label,
  maxSelected,
  onOpenChange,
  onQueryChange,
  onRemove,
  onSelect,
  options,
  placeholder,
  query,
  selectedValues,
}: {
  id: string;
  isOpen: boolean;
  label: string;
  maxSelected: number;
  onOpenChange: (value: boolean) => void;
  onQueryChange: (value: string) => void;
  onRemove: (value: string) => void;
  onSelect: (value: string) => void;
  options: string[];
  placeholder: string;
  query: string;
  selectedValues: string[];
}) {
  const labelId = `${id}-label`;
  const canSelectMore = selectedValues.length < maxSelected;

  return (
    <div className="fpt-candidate-edit-field fpt-candidate-school-field fpt-candidate-major-multi-field">
      <span id={labelId}>{label}</span>
      <div
        className={isOpen ? "fpt-candidate-search-select is-open" : "fpt-candidate-search-select"}
        onBlur={(event) => {
          const nextFocus = event.relatedTarget as Node | null;
          if (!nextFocus || !event.currentTarget.contains(nextFocus)) {
            onOpenChange(false);
          }
        }}
      >
        <button
          aria-expanded={isOpen}
          aria-labelledby={labelId}
          className="fpt-candidate-search-select-trigger is-placeholder"
          onClick={() => {
            onOpenChange(!isOpen);
            if (!isOpen) {
              onQueryChange("");
            }
          }}
          type="button"
        >
          <span>{placeholder}</span>
          <ChevronDown aria-hidden="true" size={18} />
        </button>

        {isOpen ? (
          <div className="fpt-candidate-search-select-menu">
            <input
              autoFocus
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={placeholder}
              type="search"
              value={query}
            />
            <div className="fpt-candidate-search-select-options">
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    disabled={!canSelectMore}
                    key={option}
                    onClick={() => {
                      if (!canSelectMore) {
                        return;
                      }

                      onSelect(option);
                      onQueryChange("");
                    }}
                    type="button"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <span className="fpt-candidate-search-select-empty">
                  {canSelectMore ? "Không tìm thấy chuyên ngành phù hợp." : "Đã chọn tối đa 3 chuyên ngành."}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {selectedValues.length > 0 ? (
        <div className="fpt-candidate-major-chip-list">
          {selectedValues.map((value) => (
            <span className="fpt-candidate-major-chip" key={value}>
              {value}
              <button aria-label={`Bỏ ${value}`} onClick={() => onRemove(value)} type="button">
                <X aria-hidden="true" size={18} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SectionTitle({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return (
    <div className="fpt-section-heading">
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h2>{children}</h2>
    </div>
  );
}

function CandidateAuthRequiredPanel({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <section className="fpt-candidate-shell fpt-candidate-profile-section">
      <div className="fpt-candidate-empty-card fpt-candidate-auth-required">
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </section>
  );
}

export function FptCandidateProfilePage() {
  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile>(defaultProfile);
  const [draftProfile, setDraftProfile] = useState<CandidateProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setUploadingResume] = useState(false);
  const [message, setMessage] = useState("");
  const [cvName, setCvName] = useState("");
  const [activePanel, setActivePanel] = useState<CandidatePanel>("profile");
  const [isEducationSelectOpen, setEducationSelectOpen] = useState(false);
  const [educationQuery, setEducationQuery] = useState("");
  const [isSchoolSelectOpen, setSchoolSelectOpen] = useState(false);
  const [schoolQuery, setSchoolQuery] = useState("");
  const [isMajorSelectOpen, setMajorSelectOpen] = useState(false);
  const [majorQuery, setMajorQuery] = useState("");

  useEffect(() => {
    const syncAuth = () => {
      const nextAuth = readStoredAuth();
      setAuth(nextAuth);
      setHasCheckedAuth(true);

      if (!nextAuth) {
        setProfile(defaultProfile);
        setDraftProfile(defaultProfile);
        setCvName("");
        setIsEditing(false);
        setMessage("");
      }
    };

    window.addEventListener("storage", syncAuth);
    window.addEventListener(authChangeEventName, syncAuth);
    syncAuth();

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener(authChangeEventName, syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!auth) {
      return;
    }

    fetch(`${apiBaseUrl}/api/candidate/profile`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Không thể tải thông tin ứng viên.");
        }

        const data = await parseJson<ProfileResponse>(response);

        if (data.data?.profile) {
          const nextProfile = normalizeCandidateProfile(data.data.profile);
          setProfile(nextProfile);
          setDraftProfile(nextProfile);
          setCvName(getResumeFileLabel(nextProfile.resumeUrl));
        }
      })
      .catch(() => {
        window.localStorage.removeItem(authStorageKey);
        window.dispatchEvent(new Event(authChangeEventName));
        setAuth(null);
      });
  }, [auth]);

  useEffect(() => {
    const syncPanelFromHash = () => {
      const nextPanel = getPanelFromHash(window.location.hash);
      setActivePanel(nextPanel);

      if (nextPanel !== "profile") {
        setIsEditing(false);
        setMessage("");
      }
    };

    window.addEventListener("hashchange", syncPanelFromHash);
    syncPanelFromHash();

    return () => {
      window.removeEventListener("hashchange", syncPanelFromHash);
    };
  }, []);

  const isAuthenticated = Boolean(auth?.token);
  const profileName = profile.fullName || auth?.user.fullName || "Ứng viên";
  const profileEmail = profile.email || auth?.user.email || "";
  const filteredEducationOptions = useMemo(() => {
    const queryText = normalizeSearchText(educationQuery.trim());
    const matchedOptions = queryText
      ? educationLevels.filter((option) => normalizeSearchText(option).includes(queryText))
      : educationLevels;
    const selectedEducationLevel = draftProfile.educationLevel.trim();

    if (selectedEducationLevel && !educationLevels.includes(selectedEducationLevel)) {
      return [selectedEducationLevel, ...matchedOptions];
    }

    return matchedOptions;
  }, [draftProfile.educationLevel, educationQuery]);
  const filteredSchoolOptions = useMemo(() => {
    const queryText = normalizeSearchText(schoolQuery.trim());
    const matchedOptions = queryText
      ? schoolOptions.filter((option) => normalizeSearchText(option).includes(queryText))
      : schoolOptions;
    const selectedSchool = draftProfile.school.trim();

    if (selectedSchool && !schoolOptions.includes(selectedSchool)) {
      return [selectedSchool, ...matchedOptions];
    }

    return matchedOptions;
  }, [draftProfile.school, schoolQuery]);
  const selectedMajorValues = useMemo(() => parseMajorSelection(draftProfile.major), [draftProfile.major]);
  const filteredMajorOptions = useMemo(() => {
    const queryText = normalizeSearchText(majorQuery.trim());
    const availableOptions = majorOptions.filter((option) => !selectedMajorValues.includes(option));
    const matchedOptions = queryText
      ? availableOptions.filter((option) => normalizeSearchText(option).includes(queryText))
      : availableOptions;

    return matchedOptions;
  }, [majorQuery, selectedMajorValues]);
  const updateDraftField = (field: keyof CandidateProfile, value: string) => {
    setDraftProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  };
  const selectDraftMajor = (value: string) => {
    setDraftProfile((currentProfile) => {
      const currentMajors = parseMajorSelection(currentProfile.major);
      if (currentMajors.includes(value) || currentMajors.length >= maxSelectedMajors) {
        return currentProfile;
      }

      return {
        ...currentProfile,
        major: stringifyMajorSelection([...currentMajors, value]),
      };
    });
  };
  const removeDraftMajor = (value: string) => {
    setDraftProfile((currentProfile) => ({
      ...currentProfile,
      major: stringifyMajorSelection(parseMajorSelection(currentProfile.major).filter((major) => major !== value)),
    }));
  };
  const updateDraftLocation = (
    cityField: "currentCity" | "desiredCity",
    wardField: "currentWard" | "desiredWard",
    value: string,
  ) => {
    setDraftProfile((currentProfile) => ({
      ...currentProfile,
      [cityField]: value,
      [wardField]: provinceWardOptions[value]?.includes(currentProfile[wardField]) ? currentProfile[wardField] : "",
    }));
  };
  const selectPanel = (panel: CandidatePanel) => {
    setActivePanel(panel);
    replacePanelHash(panel);

    if (panel !== "profile") {
      setIsEditing(false);
      setMessage("");
    }
  };
  const startEditing = () => {
    setDraftProfile(profile);
    setCvName(getResumeFileLabel(profile.resumeUrl));
    setMessage("");
    setIsEditing(true);
  };
  const uploadCandidateResume = async (file: File | null) => {
    if (!file) {
      setCvName("");
      return;
    }

    if (!auth) {
      setMessage("Vui lòng đăng nhập để tải CV.");
      return;
    }

    const formData = new FormData();
    formData.append("cv", file);
    setUploadingResume(true);
    setMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/candidate/profile/cv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });
      const data = await parseJson<ProfileResponse>(response);

      if (!response.ok || !data.data?.profile) {
        throw new Error(data.error?.message ?? "Không thể tải CV.");
      }

      const resumeUrl = normalizeCandidateProfile(data.data.profile).resumeUrl;
      setProfile((currentProfile) => ({ ...currentProfile, resumeUrl }));
      setDraftProfile((currentProfile) => ({ ...currentProfile, resumeUrl }));
      setCvName(getResumeFileLabel(resumeUrl) || file.name);
      setMessage("CV đã được lưu vào thông tin cá nhân.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể tải CV.");
    } finally {
      setUploadingResume(false);
    }
  };
  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!auth) {
      setMessage("Vui lòng đăng nhập để lưu thông tin.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/candidate/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftProfile),
      });
      const data = await parseJson<ProfileResponse>(response);

      if (!response.ok) {
        throw new Error(data.error?.message ?? "Không thể lưu thông tin.");
      }

      if (data.data?.profile) {
        const nextProfile = normalizeCandidateProfile(data.data.profile);
        setProfile(nextProfile);
        setDraftProfile(nextProfile);
        setCvName(getResumeFileLabel(nextProfile.resumeUrl));
      }

      if (data.data?.user) {
        const nextAuth = {
          ...auth,
          user: data.data.user,
        };
        window.localStorage.setItem(authStorageKey, JSON.stringify(nextAuth));
        window.dispatchEvent(new Event(authChangeEventName));
        setAuth(nextAuth);
      }

      setIsEditing(false);
      setMessage("Thông tin của bạn đã được cập nhật.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fpt-page fpt-has-fixed-header fpt-candidate-page" id="top">
      <FptHeader />

      <main className="fpt-candidate-main">
        <section className="fpt-candidate-shell fpt-candidate-hero-card" aria-labelledby="candidate-name">
          <div className="fpt-candidate-cover" aria-hidden="true" />
          <div className="fpt-candidate-identity">
            <Image className="fpt-candidate-avatar" src={assets.avatar} alt="" width={92} height={92} priority />
            <h1 id="candidate-name">{profileName}</h1>
          </div>
        </section>

        {!hasCheckedAuth ? (
          <CandidateAuthRequiredPanel
            title="Đang kiểm tra đăng nhập"
            message="Hệ thống đang kiểm tra phiên đăng nhập của bạn."
          />
        ) : !isAuthenticated ? (
          <CandidateAuthRequiredPanel
            title="Vui lòng đăng nhập"
            message="Đăng nhập tài khoản ứng viên để xem và cập nhật hồ sơ cá nhân."
          />
        ) : (
          <section className="fpt-candidate-shell fpt-candidate-profile-section">
            <div className="fpt-candidate-workspace">
              <aside className="fpt-candidate-sidebar">
                <nav aria-label="Quản lý ứng viên">
                  <SidebarItem
                    icon={<UserRound aria-hidden="true" size={16} />}
                    isActive={activePanel === "profile"}
                    onClick={() => selectPanel("profile")}
                  >
                    Thông tin cá nhân
                  </SidebarItem>
                  <SidebarItem
                    icon={<BriefcaseBusiness aria-hidden="true" size={16} />}
                    isActive={activePanel === "applications"}
                    onClick={() => selectPanel("applications")}
                  >
                    Các vị trí đã ứng tuyển
                  </SidebarItem>
                  <SidebarItem
                    icon={<Building2 aria-hidden="true" size={16} />}
                    isActive={activePanel === "faq"}
                    onClick={() => selectPanel("faq")}
                  >
                    Câu hỏi thường gặp
                  </SidebarItem>
                </nav>
              </aside>

              <div className="fpt-candidate-content">
              {activePanel === "faq" ? <CandidateFaqPanel /> : null}
              {activePanel === "applications" ? <CandidateApplicationsPanel /> : null}
              {activePanel === "profile" ? (
                <>
                  <h2>Thông tin của tôi</h2>

                  {message ? <p className="fpt-candidate-message">{message}</p> : null}

                  {isEditing ? (
                    <form className="fpt-candidate-edit-form" onSubmit={saveProfile}>
                      <div className="fpt-candidate-info-layout">
                        <section className="fpt-candidate-card fpt-candidate-edit-card">
                          <h3>Thông tin cá nhân</h3>
                          <EditableField
                            label="Họ và tên"
                            name="fullName"
                            onChange={updateDraftField}
                            placeholder="Nguyen Minh Hieu"
                            required
                            value={draftProfile.fullName}
                          />
                          <EditableField
                            label="Số điện thoại"
                            name="phone"
                            onChange={updateDraftField}
                            placeholder="Nhập số điện thoại của bạn"
                            value={draftProfile.phone}
                          />
                          <EditableField
                            label="Email"
                            name="email"
                            onChange={updateDraftField}
                            placeholder="nguyenminhhieu06878@gmail.com"
                            required
                            type="email"
                            value={draftProfile.email}
                          />
                          <label className="fpt-candidate-edit-field">
                            <span>Ngày sinh *</span>
                            <span className="fpt-candidate-date-wrap">
                              <input
                                onChange={(event) => updateDraftField("birthday", event.target.value)}
                                max="2099-12-31"
                                min="1900-01-01"
                                placeholder="DD/MM/YYYY"
                                type="date"
                                value={draftProfile.birthday}
                              />
                              <CalendarDays aria-hidden="true" size={20} />
                            </span>
                          </label>

                          <h3 className="fpt-candidate-form-subtitle">Nơi ở hiện tại</h3>
                          <EditableField
                            label="Địa chỉ"
                            name="address"
                            onChange={updateDraftField}
                            placeholder="Địa chỉ"
                            required
                            value={draftProfile.address}
                          />
                          <div className="fpt-candidate-edit-row">
                            <EditableSelect
                              label="Tỉnh thành *"
                              onChange={(value) => updateDraftLocation("currentCity", "currentWard", value)}
                              options={cityOptions}
                              placeholder="Chọn tỉnh/thành"
                              value={draftProfile.currentCity}
                            />
                            <EditableSelect
                              disabled={!draftProfile.currentCity}
                              label="Xã/Phường*"
                              onChange={(value) => updateDraftField("currentWard", value)}
                              options={getWardOptions(draftProfile.currentCity, draftProfile.currentWard)}
                              placeholder={draftProfile.currentCity ? "Chọn xã/phường" : "Chọn tỉnh trước"}
                              value={draftProfile.currentWard}
                            />
                          </div>

                          <h3 className="fpt-candidate-form-subtitle">Mong muốn làm việc tại</h3>
                          <div className="fpt-candidate-edit-row">
                            <EditableSelect
                              label="Tỉnh thành *"
                              onChange={(value) => updateDraftLocation("desiredCity", "desiredWard", value)}
                              options={cityOptions}
                              placeholder="Chọn tỉnh/thành"
                              value={draftProfile.desiredCity}
                            />
                            <EditableSelect
                              disabled={!draftProfile.desiredCity}
                              label="Xã/Phường*"
                              onChange={(value) => updateDraftField("desiredWard", value)}
                              options={getWardOptions(draftProfile.desiredCity, draftProfile.desiredWard)}
                              placeholder={draftProfile.desiredCity ? "Chọn xã/phường" : "Chọn tỉnh trước"}
                              value={draftProfile.desiredWard}
                            />
                          </div>
                        </section>

                        <div className="fpt-candidate-side-cards">
                          <section className="fpt-candidate-card fpt-candidate-edit-card">
                            <h3>Quá trình học tập</h3>
                            <SearchableProfileSelect
                              emptyMessage="Không tìm thấy hệ phù hợp."
                              id="candidate-education-level"
                              isOpen={isEducationSelectOpen}
                              label="Hệ *"
                              onOpenChange={setEducationSelectOpen}
                              onQueryChange={setEducationQuery}
                              onSelect={(value) => updateDraftField("educationLevel", value)}
                              options={filteredEducationOptions}
                              placeholder=""
                              query={educationQuery}
                              value={draftProfile.educationLevel}
                            />
                            <SearchableProfileSelect
                              emptyMessage="Không tìm thấy trường phù hợp."
                              id="candidate-school"
                              isOpen={isSchoolSelectOpen}
                              label="Trường *"
                              onOpenChange={setSchoolSelectOpen}
                              onQueryChange={setSchoolQuery}
                              onSelect={(value) => updateDraftField("school", value)}
                              options={filteredSchoolOptions}
                              placeholder="Tìm kiếm trường"
                              query={schoolQuery}
                              value={draftProfile.school}
                            />
                            <SearchableProfileMultiSelect
                              id="candidate-major"
                              isOpen={isMajorSelectOpen}
                              label="Chuyên ngành"
                              maxSelected={maxSelectedMajors}
                              onOpenChange={setMajorSelectOpen}
                              onQueryChange={setMajorQuery}
                              onRemove={removeDraftMajor}
                              onSelect={selectDraftMajor}
                              options={filteredMajorOptions}
                              placeholder="Tìm kiếm chuyên ngành"
                              query={majorQuery}
                              selectedValues={selectedMajorValues}
                            />
                            <p className="fpt-candidate-form-hint">
                              <Info aria-hidden="true" size={17} />
                              Chỉ chọn được tối đa 3 chuyên ngành
                            </p>
                          </section>

                          <section className="fpt-candidate-card fpt-candidate-upload-card">
                            <h3>Kinh nghiệm làm việc</h3>
                            <label className="fpt-candidate-upload-box">
                              <input
                                accept=".pdf,.doc,.docx"
                                disabled={isUploadingResume}
                                onChange={(event) => {
                                  void uploadCandidateResume(event.target.files?.[0] ?? null);
                                }}
                                type="file"
                              />
                              <Upload aria-hidden="true" size={24} />
                              <span>{isUploadingResume ? "Đang tải CV..." : cvName || "Tải lên CV"}</span>
                            </label>
                          </section>
                        </div>
                      </div>

                      <label className="fpt-candidate-mail-check">
                        <input type="checkbox" />
                        <span>Nhận mail thông báo khi có job phù hợp</span>
                      </label>

                      <div className="fpt-candidate-actions">
                        <button className="fpt-candidate-save-button" disabled={isSaving} type="submit">
                          <BadgeCheck aria-hidden="true" size={22} />
                          {isSaving ? "Đang lưu" : "Lưu thông tin"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="fpt-candidate-info-layout">
                        <section className="fpt-candidate-card fpt-candidate-personal-card">
                          <h3>Thông tin cá nhân</h3>
                          <ReadonlyField label="Họ và tên" value={profileName} />
                          <ReadonlyField label="Số điện thoại" value={displayValue(profile.phone)} />
                          <ReadonlyField label="Email" value={profileEmail} />
                          <ReadonlyField label="Ngày sinh" value={formatCandidateDate(profile.birthday)} />
                          <ReadonlyField
                            label="Nơi ở hiện tại"
                            multiline
                            value={formatLocation([profile.address, profile.currentWard, profile.currentCity])}
                          />
                          <ReadonlyField
                            label="Mong muốn làm việc tại"
                            multiline
                            value={formatLocation([profile.desiredWard, profile.desiredCity])}
                          />
                          <ReadonlyField label="Nhận thông báo việc làm phù hợp" value="Chưa đăng ký" />
                        </section>

                        <div className="fpt-candidate-side-cards">
                          <section className="fpt-candidate-card">
                            <h3>Quá trình học tập</h3>
                            <ReadonlyField label="Hệ" value={displayValue(profile.educationLevel)} />
                            <ReadonlyField label="Trường" value={displayValue(profile.school)} />
                            <ReadonlyField label="Chuyên ngành" value={formatMajorSelection(profile.major)} />
                          </section>

                          <section className="fpt-candidate-card fpt-candidate-experience-card">
                            <h3>Kinh nghiệm làm việc</h3>
                            {profile.resumeUrl ? (
                              <p>
                                Hồ sơ của bạn{" "}
                                <strong>
                                  <a href={getResumeHref(profile.resumeUrl)} rel="noreferrer" target="_blank">
                                    {getResumeFileLabel(profile.resumeUrl)}
                                  </a>
                                </strong>
                              </p>
                            ) : (
                              <p>
                                Hồ sơ của bạn <strong>Chưa có hồ sơ</strong>
                              </p>
                            )}
                          </section>
                        </div>
                      </div>

                      <div className="fpt-candidate-actions">
                        <button className="fpt-candidate-edit-button" onClick={startEditing} type="button">
                          <Pencil aria-hidden="true" size={15} />
                          Chỉnh sửa thông tin
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : null}
              </div>
            </div>
          </section>
        )}

        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}

function CandidateFaqPanel() {
  return (
    <section className="fpt-candidate-faq-panel" id={faqPanelId} aria-labelledby="candidate-faq-title">
      <h2 id="candidate-faq-title">Câu hỏi thường gặp</h2>
      <p className="fpt-candidate-faq-contact">
        Mọi thắc mắc, vui lòng liên hệ:
        <br />
        <strong>Email:</strong> phuongtm3@fpt.com / nhanctt3@fpt.com - <strong>Facebook:</strong> Tuyển dụng FPT Telecom -{" "}
        <strong>LinkedIn:</strong> FPT Telecom - <strong>TikTok:</strong> Nhà Cáo.
      </p>

      <div className="fpt-candidate-faq-grid">
        {candidateFaqs.map((faq) => (
          <article className="fpt-candidate-faq-card" key={faq.question}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CandidateApplicationsPanel() {
  const [applications, setApplications] = useState<CandidateApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadApplications = async () => {
      const storedAuth = readStoredAuth();

      if (!storedAuth?.token) {
        setApplications([]);
        setMessage("Vui lòng đăng nhập để xem các vị trí đã ứng tuyển.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setMessage("");

      try {
        const response = await fetch(`${apiBaseUrl}/api/candidate/applications`, {
          headers: {
            Authorization: `Bearer ${storedAuth.token}`,
          },
        });
        const data = await parseJson<CandidateApplicationsResponse>(response);

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(data.error?.message ?? "Không thể tải danh sách ứng tuyển.");
        }

        setApplications(data.data ?? []);
      } catch (error) {
        if (!cancelled) {
          setApplications([]);
          setMessage(error instanceof Error ? error.message : "Không thể tải danh sách ứng tuyển.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    const refreshApplications = () => {
      void loadApplications();
    };

    window.addEventListener("storage", refreshApplications);
    window.addEventListener(authChangeEventName, refreshApplications);
    window.addEventListener(candidateApplicationsChangeEventName, refreshApplications);
    void loadApplications();

    return () => {
      cancelled = true;
      window.removeEventListener("storage", refreshApplications);
      window.removeEventListener(authChangeEventName, refreshApplications);
      window.removeEventListener(candidateApplicationsChangeEventName, refreshApplications);
    };
  }, []);

  return (
    <section
      className="fpt-candidate-applications-panel"
      id={applicationsPanelId}
      aria-labelledby="candidate-applications-title"
    >
      <h2 id="candidate-applications-title">Các vị trí đã ứng tuyển</h2>
      {isLoading ? (
        <div className="fpt-candidate-empty-card">
          <h3>Đang tải danh sách</h3>
          <p>Hệ thống đang kiểm tra các hồ sơ bạn đã nộp.</p>
        </div>
      ) : null}
      {!isLoading && applications.length === 0 ? (
        <div className="fpt-candidate-empty-card">
          <h3>Chưa có vị trí ứng tuyển</h3>
          <p>{message || "Các công việc bạn đã nộp hồ sơ sẽ được hiển thị tại đây."}</p>
        </div>
      ) : null}
      {!isLoading && applications.length > 0 ? (
        <div className="fpt-candidate-application-list">
          {applications.map((application) => (
            <article className="fpt-candidate-application-card" key={application.id}>
              <div className="fpt-candidate-application-main">
                <span>{getApplicationStatusLabel(application.status)}</span>
                <h3>
                  <Link href={`/${application.job.slug}`}>{application.job.title}</Link>
                </h3>
                <p>{application.job.location}</p>
              </div>
              <dl>
                <div>
                  <dt>Ngày nộp</dt>
                  <dd>{formatCandidateDateTime(application.createdAt)}</dd>
                </div>
                <div>
                  <dt>CV đã gửi</dt>
                  <dd>
                    {application.resumeUrl ? (
                      <a href={getResumeHref(application.resumeUrl)} rel="noreferrer" target="_blank">
                        {getResumeFileLabel(application.resumeUrl)}
                      </a>
                    ) : (
                      "Chưa đính kèm"
                    )}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ContactSection() {
  return (
    <section className="fpt-section fpt-contact-section fpt-candidate-contact-section" id="ket-noi-voi-chung-toi">
      <SectionTitle eyebrow="🥳">Kết nối với chúng tôi</SectionTitle>
      <div className="fpt-contact-card">
        <div className="fpt-contact-grid">
          {contacts.map((item) => (
            <Link className="fpt-contact-item" href={item.href} key={`${item.title}-${item.subtitle}`}>
              <Image src={item.icon} alt="" width={52} height={52} />
              <span>
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </span>
            </Link>
          ))}
        </div>
        <div className="fpt-contact-fox">
          <Image src={assets.foxFooter} alt="" width={247} height={261} />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="fpt-footer">
      <div className="fpt-container">
        <div className="fpt-footer-top">
          <Image src={assets.footerLogo} alt="FPT Telecom" width={144} height={42} />
          <h2>Công ty Cổ phần Viễn Thông FPT</h2>
          <p>Ban Nhân sự</p>
        </div>

        <div className="fpt-footer-grid">
          <div>
            <h3>Trung tâm Thu hút Nguồn nhân lực</h3>
            <p>FPT Tower, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội</p>
            <p>FPT Tân thuận, KCX Tân Thuận, Quận 7, TP. Hồ Chí Minh</p>
            <p>phuongtm3@fpt.com / nhanctt3@fpt.com</p>
            <p>
              0904 678 040
              <br />
              0986 656 620
            </p>
          </div>

          {footerColumns.map((column) => (
            <FooterColumn items={column.items} key={column.title} title={column.title} />
          ))}
        </div>

        <div className="fpt-footer-support">
          <div>
            <strong>Theo dõi các kênh chính thức</strong>
            <span>của FPT Telecom</span>
          </div>
          <div>
            <strong>Hỗ trợ Khách hàng</strong>
            <span>hotrokhachhang@fpt.com</span>
          </div>
          <div>
            <strong>Hotline</strong>
            <span>1900 6600</span>
          </div>
          <div className="fpt-socials" aria-label="Social links">
            <span className="social-facebook" />
            <span className="social-youtube" />
            <span className="social-instagram" />
            <span className="social-zalo" />
          </div>
        </div>

        <p className="fpt-copyright">
          Copyright © 2015. Official Website Tuyển dụng của Công ty Cổ phần Viễn thông FPT (FPT Telecom).
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  items,
  title,
}: {
  items: Array<{
    href: string;
    label: string;
  }>;
  title: string;
}) {
  return (
    <div>
      <h3>{title}</h3>
      {items.map((item) => (
        <Link href={item.href} key={item.label}>
          {item.label}
        </Link>
      ))}
    </div>
  );
}
