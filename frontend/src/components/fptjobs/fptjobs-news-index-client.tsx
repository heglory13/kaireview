"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type FptPublicNewsArticle = {
  title: string;
  type: string;
  date: string;
  image: string;
  href: string;
  excerpt: string;
};

export type FptPublicSidebarItem = {
  title: string;
  date: string;
  image: string;
  href: string;
};

type AdminStoredContent = FptPublicNewsArticle & {
  id: number;
  contentHtml?: string;
  featured?: boolean;
  status?: "draft" | "hidden" | "published";
};

type PaginationItem = {
  label: string;
  href?: string;
  active?: boolean;
  next?: boolean;
};

type StoredArticleState = {
  articles: FptPublicNewsArticle[] | null;
  storageKey: string;
};

const pageSize = 6;

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
}

function getPageHref(baseHref: string, page: number) {
  return page === 1 ? `${baseHref}#tin-moi` : `${baseHref}?page=${page}#tin-moi`;
}

function getPaginationItems(currentPage: number, totalPages: number, baseHref: string): PaginationItem[] {
  const pages: Array<number | "ellipsis-left" | "ellipsis-right"> = [];

  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
      pages.push(page);
    } else if (page < currentPage && !pages.includes("ellipsis-left")) {
      pages.push("ellipsis-left");
    } else if (page > currentPage && !pages.includes("ellipsis-right")) {
      pages.push("ellipsis-right");
    }
  }

  const pagination: PaginationItem[] = pages.map((page) =>
    typeof page === "number"
      ? {
          active: page === currentPage,
          href: getPageHref(baseHref, page),
          label: String(page),
        }
      : { label: "..." },
  );

  if (currentPage < totalPages) {
    pagination.push({
      href: getPageHref(baseHref, currentPage + 1),
      label: "",
      next: true,
    });
  }

  return pagination;
}

function readStoredArticles(storageKey: string, featuredHrefs: string[]) {
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return null;

    const featuredHrefSet = new Set(featuredHrefs);

    return (parsed as AdminStoredContent[])
      .filter((item) => item.status === "published" && item.title?.trim() && item.href?.trim())
      .filter((item) => !featuredHrefSet.has(item.href))
      .map((item) => ({
        date: item.date,
        excerpt: item.excerpt,
        href: item.href,
        image: item.image,
        title: item.title,
        type: item.type,
      }));
  } catch {
    return null;
  }
}

export function FptNewsIndexLatestClient({
  baseHref,
  currentPage,
  featuredHrefs,
  initialArticles,
  latestSubtitle,
  latestTitle,
  sidebar,
  sidebarTitle,
  storageKey,
}: {
  baseHref: string;
  currentPage: number;
  featuredHrefs: string[];
  initialArticles: FptPublicNewsArticle[];
  latestSubtitle: string;
  latestTitle: string;
  sidebar: FptPublicSidebarItem[];
  sidebarTitle: string;
  storageKey: string;
}) {
  const [storedState, setStoredState] = useState<StoredArticleState>({ articles: null, storageKey });
  const articles = storedState.storageKey === storageKey && storedState.articles ? storedState.articles : initialArticles;
  const totalPages = Math.max(1, Math.ceil(articles.length / pageSize));
  const safePage = clampPage(currentPage, totalPages);
  const pageArticles = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;

    return articles.slice(startIndex, startIndex + pageSize);
  }, [articles, safePage]);
  const pagination = useMemo(() => getPaginationItems(safePage, totalPages, baseHref), [baseHref, safePage, totalPages]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStoredState({
        articles: readStoredArticles(storageKey, featuredHrefs),
        storageKey,
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [featuredHrefs, storageKey]);

  return (
    <section className="fpt-news-index-latest" id="tin-moi">
      <div className="fpt-section">
        <div className="fpt-news-index-head">
          <h2>{latestTitle}</h2>
          <p>{latestSubtitle}</p>
        </div>

        <div className="fpt-news-index-layout">
          <div>
            <div className="fpt-news-index-grid">
              {pageArticles.map((item) => (
                <Link className="fpt-news-index-card" href={item.href} key={item.href} title={item.title}>
                  <figure>
                    <Image src={item.image} alt={item.title} fill sizes="(max-width: 760px) 92vw, 18vw" />
                  </figure>
                  <div>
                    <span>{item.type}</span>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                    <small>{item.date}</small>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.length > 1 ? (
              <nav className="fpt-news-index-pagination" aria-label="Phân trang tin tức">
                {pagination.map((item, index) =>
                  item.href ? (
                    <Link
                      aria-current={item.active ? "page" : undefined}
                      aria-label={item.next ? "Trang tiếp theo" : `Trang ${item.label}`}
                      className={cn(item.active && "is-active", item.next && "is-next")}
                      href={item.href}
                      key={`${item.label}-${index}`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span key={`${item.label}-${index}`}>{item.label}</span>
                  ),
                )}
              </nav>
            ) : null}
          </div>

          <aside className="fpt-news-index-sidebar">
            <h3>{sidebarTitle}</h3>
            <div>
              {sidebar.map((item) => (
                <Link className="fpt-news-index-side-item" href={item.href} key={item.href} title={item.title}>
                  <Image src={item.image} alt={item.title} width={85} height={85} />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.date}</small>
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
