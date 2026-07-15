"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AdminStoredContent = {
  id: number;
  title: string;
  type: string;
  date: string;
  image: string;
  href: string;
  excerpt: string;
  contentHtml?: string;
  status?: "draft" | "hidden" | "published";
};

type StoredDetailState = {
  hasLoaded: boolean;
  item: AdminStoredContent | null;
};

type AdminStoredEventFormField = {
  type: "select" | "text" | "textarea" | "upload";
  label: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
};

const detailBanner = "/images/fptjobs/fptjobs-com-public-imgs-version2-page-eventnews-bg-breadcumb2.png";
const fallbackImage = "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-6302026120000AM181549406thumbnail.png";
const adminStoredEventProvinceOptions = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "Toàn quốc",
];

function getSlugFromHref(href: string) {
  const segments = href.split("?")[0]?.split("#")[0]?.split("/").filter(Boolean) ?? [];

  return segments[segments.length - 1] ?? "";
}

function readStoredDetail(storageKey: string, slug: string) {
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return null;

    return (
      (parsed as AdminStoredContent[]).find(
        (item) => item.status === "published" && item.href?.trim() && getSlugFromHref(item.href) === slug,
      ) ?? null
    );
  } catch {
    return null;
  }
}

function AdminStoredEventFormField({ field, id }: { field: AdminStoredEventFormField; id: string }) {
  const placeholder = field.placeholder ?? "Câu trả lời của bạn";

  if (field.type === "select") {
    return (
      <label className="fpt-survey-field" htmlFor={id}>
        <span>
          {field.label}
          {field.required ? <em>*</em> : null}
        </span>
        <select defaultValue="" id={id}>
          <option disabled value="">
            Choose your option
          </option>
          {field.options?.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="fpt-survey-field" htmlFor={id}>
        <span>
          {field.label}
          {field.required ? <em>*</em> : null}
        </span>
        <textarea id={id} placeholder={placeholder} rows={4} />
      </label>
    );
  }

  if (field.type === "upload") {
    return (
      <div className="fpt-survey-upload">
        <span>{field.label}</span>
        <label>
          <input type="file" />
          <strong>Choose file</strong>
          <small>No file chosen</small>
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
      <input id={id} placeholder={placeholder} type="text" />
    </label>
  );
}

function AdminStoredEventRegistrationForm({ item }: { item: AdminStoredContent }) {
  const fields: AdminStoredEventFormField[] = [
    { type: "text", label: "Họ và tên", required: true },
    { type: "text", label: "Số điện thoại", required: true },
    { type: "text", label: "Email", required: true },
    { type: "select", label: "Tỉnh thành", options: adminStoredEventProvinceOptions, required: true },
    { type: "select", label: "Vị trí ứng tuyển", options: [item.title], required: true },
    { type: "textarea", label: "Bạn có điều gì cần được giải đáp/hỗ trợ thêm không?" },
    { type: "upload", label: "Đính kèm CV" },
  ];

  return (
    <form className="fpt-survey-form">
      {fields.map((field, index) => (
        <AdminStoredEventFormField field={field} id={`admin-event-field-${item.id}-${index}`} key={`${field.label}-${index}`} />
      ))}
      <button type="button">Gửi thông tin</button>
    </form>
  );
}

export function FptAdminStoredDetailClient({
  backHref,
  backLabel,
  resource,
  slug,
  storageKey,
}: {
  backHref: string;
  backLabel: string;
  resource: "news" | "event";
  slug: string;
  storageKey: string;
}) {
  const [state, setState] = useState<StoredDetailState>({ hasLoaded: false, item: null });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState({
        hasLoaded: true,
        item: readStoredDetail(storageKey, slug),
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [slug, storageKey]);

  const item = state.item;
  const isEvent = resource === "event";
  const sourceHref = `https://fptjobs.com${isEvent ? "/su-kien-khao-sat" : "/tin-tuc"}/${slug}`;
  const heroImage = isEvent && item?.image ? item.image : detailBanner;

  return (
    <>
      <h1 className="sr-only">{item?.title || (state.hasLoaded ? "Không tìm thấy bài viết" : "Đang tải bài viết")}</h1>

      <section className={cn("fpt-news-detail-hero-art", isEvent && "fpt-survey-detail-banner")} aria-hidden="true">
        <Image src={heroImage} alt="" fill priority sizes="100vw" />
      </section>

      <section className={cn("fpt-news-detail-header", isEvent && "fpt-survey-detail-header")}>
        <div className="fpt-section">
          <div className={cn("fpt-news-detail-title-card", isEvent && "fpt-survey-detail-title-card")}>
            <Link className="fpt-news-detail-tag" href={backHref}>
              {isEvent ? "Events" : item?.type || backLabel}
            </Link>
            <h2>{item?.title || (state.hasLoaded ? "Không tìm thấy bài viết" : "Đang tải bài viết")}</h2>
            <div className="fpt-news-detail-meta">
              <span>
                <Image src="/images/fptjobs/fptjobs-com-public-imgs-version2-fox-avt.png" alt="" width={28} height={28} />
                Cáo tuyển dụng
              </span>
              <span>
                <Clock3 aria-hidden="true" size={14} />
                {item?.date || "FPT Jobs"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <article className={cn("fpt-news-detail-body", isEvent && "fpt-survey-detail-body")}>
        {item ? (
          <>
            {isEvent ? null : <strong className="fpt-news-detail-lead">{item.excerpt}</strong>}
            <div className={cn("fpt-news-detail-content", isEvent && "fpt-survey-detail-content")}>
              {item.contentHtml?.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
              ) : (
                <div>
                  <figure className="fpt-news-detail-figure">
                    <Image src={item.image || fallbackImage} alt={item.title} width={1200} height={631} sizes="(max-width: 760px) 92vw, 1100px" />
                  </figure>
                  <p>{item.excerpt}</p>
                </div>
              )}
            </div>
            {isEvent ? <AdminStoredEventRegistrationForm item={item} /> : null}
            <div className={cn("fpt-news-detail-actions", isEvent && "fpt-survey-detail-actions")}>
              {isEvent ? (
                <div className="fpt-survey-tags">
                  <Link className="fpt-news-detail-chip" href={backHref}>
                    {item.type || backLabel}
                  </Link>
                </div>
              ) : (
                <Link className="fpt-news-detail-chip" href={backHref}>
                  {item.type || backLabel}
                </Link>
              )}
              <div>
                <h3>Chia sẻ</h3>
                <a href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(sourceHref)}`} target="_blank" rel="noreferrer">
                  <Image src="/seo/fptjobs-com-public-imgs-version2-general-icons-share-fb.svg" alt="Facebook" width={24} height={24} />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(sourceHref)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image src="/seo/fptjobs-com-public-imgs-version2-general-icons-share-linkedin.svg" alt="LinkedIn" width={24} height={24} />
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className="fpt-news-detail-content">
            <p>{state.hasLoaded ? "Bài viết này chưa có trong dữ liệu public hoặc đang ở trạng thái nháp/ẩn." : "Đang kiểm tra bài viết từ admin..."}</p>
            <p>
              <Link href={backHref}>Quay lại {backLabel.toLowerCase()}</Link>
            </p>
          </div>
        )}
      </article>
    </>
  );
}
