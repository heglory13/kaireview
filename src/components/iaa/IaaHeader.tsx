"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";

import { navItems } from "@/lib/iaa-data";
import { localizeIaaHref } from "@/lib/iaa-links";
import { cn } from "@/lib/utils";
import type { IaaSearchSuggestion, NavItem } from "@/types/iaa";

interface IaaHeaderProps {
  activeHref?: string;
  items?: NavItem[];
  variant?: "default" | "article";
}

export function IaaHeader({
  activeHref,
  items = navItems,
  variant = "default",
}: IaaHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isArticleVariant = variant === "article";
  const localizedActiveHref = activeHref ? localizeIaaHref(activeHref) : undefined;
  const isActive = (item: NavItem) =>
    localizedActiveHref === localizeIaaHref(item.href) ||
    item.children?.some((child) => localizeIaaHref(child.href) === localizedActiveHref);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-[1001] h-[70px] bg-white text-black md:h-[90px]">
      <div className="relative mx-auto flex h-full max-w-[1080px] items-center px-[15px]">
        <button
          aria-expanded={isMenuOpen}
          aria-label="Open menu"
          className="flex h-[49px] w-6 flex-col items-start justify-center gap-[4px] text-[#777] transition-colors hover:text-black md:hidden"
          onClick={() => setIsMenuOpen(true)}
          type="button"
        >
          <span className="block h-[2px] w-[20px] bg-current" />
          <span className="block h-[2px] w-[20px] bg-current" />
          <span className="block h-[2px] w-[20px] bg-current" />
        </button>

        <Link
          aria-label="kaireview"
          className="absolute left-1/2 top-0 flex h-[70px] w-[167px] -translate-x-1/2 flex-col items-center justify-center md:static md:h-[90px] md:translate-x-0 md:items-start"
          href="/"
        >
          <span className="font-serif text-[44px] font-black leading-[40px] text-black md:text-[54px] md:leading-[49px]">
            KAI
          </span>
          <span className="text-[8px] font-bold uppercase leading-none text-[#666] md:text-[9px]">
            INSIGHT AND ADVICE
          </span>
        </Link>

        <nav className="ml-[22px] hidden h-9 flex-1 items-center md:flex">
          <ul className={cn("flex items-center", isArticleVariant ? "gap-x-[16px]" : "gap-x-[10px]")}>
            {items.map((item) => (
              <li className="group relative" key={item.href}>
                <a
                  className={cn(
                    "block px-[2px] py-2 font-bold uppercase leading-5 transition-colors hover:text-black",
                    isArticleVariant ? "text-[12.8px]" : "text-[11px]",
                    isActive(item)
                      ? "text-black"
                      : "text-[rgba(102,102,102,0.85)]",
                  )}
                  href={localizeIaaHref(item.href)}
                >
                  {item.label}
                </a>
                {item.children?.length ? (
                  <ul className="pointer-events-none absolute left-0 top-full min-w-[190px] translate-y-2 border border-[#ececec] bg-white py-[8px] text-left opacity-0 shadow-[0_3px_18px_rgba(0,0,0,0.15)] transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <a
                          className="block px-[14px] py-[8px] text-[12.5px] font-bold uppercase leading-5 text-[#777] transition-colors hover:bg-[#f7f7f7] hover:text-black"
                          href={localizeIaaHref(child.href)}
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <HeaderSearchForm
          buttonClassName="absolute right-0 top-0 flex h-[34px] w-[34px] items-center justify-center text-black transition-colors hover:text-[#446084]"
          fieldClassName="relative h-[34px]"
          formClassName={cn(
            "absolute right-0 top-1/2 hidden h-[34px] -translate-y-1/2 md:block md:translate-x-[72px]",
            isArticleVariant ? "w-[167px]" : "w-[169px]",
          )}
          iconClassName="size-[14px]"
          id="iaa-search"
          inputClassName={cn(
            "h-[33px] w-[167px] border border-[rgba(0,0,0,0.09)] px-[11px] pr-[38px] text-[13px] leading-[33px] text-black outline-none transition-colors placeholder:text-[#777]",
            isArticleVariant
              ? "rounded-full bg-white shadow-none"
              : "bg-[rgba(0,0,0,0.03)]",
          )}
          suggestionsClassName="right-0 top-[calc(100%+8px)] w-[322px]"
        />

        <button
          aria-label="Search"
          className="ml-auto flex h-[38px] w-[15px] items-center justify-center text-[rgba(102,102,102,0.85)] transition-colors hover:text-black md:hidden"
          onClick={() => setIsMenuOpen(true)}
          type="button"
        >
          <Search className="size-[15px]" strokeWidth={2} />
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[1100] bg-black/60 transition-opacity duration-300 md:hidden",
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsMenuOpen(false)}
      />
      <button
        aria-label="Close menu"
        className={cn(
          "fixed right-[18px] top-[24px] z-[1102] flex size-10 items-center justify-center rounded-full bg-black/15 text-white shadow-sm transition hover:bg-black/25 md:hidden",
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsMenuOpen(false)}
        type="button"
      >
        <X className="size-[30px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]" strokeWidth={2.4} />
      </button>
      <aside
        className={cn(
          "fixed left-0 top-0 z-[1101] flex h-dvh w-[260px] flex-col bg-white/95 text-black shadow-2xl transition-transform duration-300 md:hidden",
          isMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!isMenuOpen}
      >
        <HeaderSearchForm
          buttonClassName="ml-[10px] flex size-[30px] items-center justify-center text-black"
          fieldClassName="flex h-[44px] items-center rounded-full border border-[#d9d9d9] bg-white px-[18px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
          formClassName="border-b border-[#ececec] px-[20px] pb-[18px] pt-[76px]"
          iconClassName="size-[26px]"
          id="iaa-mobile-search"
          inputClassName="min-w-0 flex-1 bg-transparent text-[18px] leading-none text-[#777] outline-none placeholder:text-[#777]"
          onSuggestionClick={() => setIsMenuOpen(false)}
          suggestionsClassName="left-0 right-0 top-[calc(100%+8px)]"
        />
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[24px] [-webkit-overflow-scrolling:touch]">
          <ul>
            {items.map((item) => (
              <li className="border-b border-[#ececec]" key={item.href}>
                <a
                  className={cn(
                    "block px-[20px] py-[14px] text-[12.8px] font-bold uppercase leading-5 transition-colors hover:bg-[#f7f7f7]",
                    isActive(item) ? "text-black" : "text-[#777]",
                  )}
                  href={localizeIaaHref(item.href)}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
                {item.children?.length ? (
                  <ul className="bg-[#fbfbfb] pb-[8px]">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <a
                          className={cn(
                            "block px-[32px] py-[7px] text-[12.5px] font-semibold leading-5 transition-colors hover:bg-[#f1f1f1]",
                            localizedActiveHref === localizeIaaHref(child.href)
                              ? "text-black"
                              : "text-[#777]",
                          )}
                          href={localizeIaaHref(child.href)}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </header>
  );
}

interface HeaderSearchFormProps {
  buttonClassName: string;
  fieldClassName: string;
  formClassName: string;
  iconClassName: string;
  id: string;
  inputClassName: string;
  onSuggestionClick?: () => void;
  suggestionsClassName: string;
}

function HeaderSearchForm({
  buttonClassName,
  fieldClassName,
  formClassName,
  iconClassName,
  id,
  inputClassName,
  onSuggestionClick,
  suggestionsClassName,
}: HeaderSearchFormProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<IaaSearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);

      fetch(`/api/search-suggestions?s=${encodeURIComponent(trimmedQuery)}`, {
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Search suggestions failed");
          }

          return response.json() as Promise<{ suggestions: IaaSearchSuggestion[] }>;
        })
        .then((payload) => {
          if (!controller.signal.aborted) {
            setSuggestions(payload.suggestions);
            setIsSuggestionsOpen(true);
          }
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }

          setSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trimmedQuery]);

  return (
    <form
      action="/search"
      className={formClassName}
      method="get"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;

        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setIsSuggestionsOpen(false);
        }
      }}
      onFocus={() => {
        if (trimmedQuery) {
          setIsSuggestionsOpen(true);
        }
      }}
      onSubmit={(event) => {
        if (!trimmedQuery) {
          event.preventDefault();
          return;
        }

        setIsSuggestionsOpen(false);
      }}
    >
      <label className="sr-only" htmlFor={id}>
        Search
      </label>
      <div className="relative">
        <div className={fieldClassName}>
          <input
            autoComplete="off"
            className={inputClassName}
            id={id}
            name="s"
            onChange={(event) => {
              const nextQuery = event.target.value;

              setQuery(nextQuery);
              if (!nextQuery.trim()) {
                setSuggestions([]);
                setIsLoading(false);
                setIsSuggestionsOpen(false);
                return;
              }

              setIsSuggestionsOpen(true);
            }}
            placeholder="Search..."
            type="search"
            value={query}
          />
          <button aria-label="Search" className={buttonClassName} type="submit">
            <Search className={iconClassName} strokeWidth={id === "iaa-mobile-search" ? 2.5 : 2} />
          </button>
        </div>
        <SearchSuggestionPanel
          className={suggestionsClassName}
          isLoading={isLoading}
          isOpen={isSuggestionsOpen}
          onSuggestionClick={onSuggestionClick}
          query={trimmedQuery}
          suggestions={suggestions}
        />
      </div>
    </form>
  );
}

function SearchSuggestionPanel({
  className,
  isLoading,
  isOpen,
  onSuggestionClick,
  query,
  suggestions,
}: {
  className: string;
  isLoading: boolean;
  isOpen: boolean;
  onSuggestionClick?: () => void;
  query: string;
  suggestions: IaaSearchSuggestion[];
}) {
  if (!isOpen || !query) {
    return null;
  }

  const searchHref = `/search?s=${encodeURIComponent(query)}`;

  return (
    <div
      aria-label="Search suggestions"
      className={cn(
        "absolute z-[1202] overflow-hidden border border-[#e6e6e6] bg-white text-left shadow-[0_8px_24px_rgba(0,0,0,0.16)]",
        className,
      )}
    >
      {isLoading ? (
        <div className="px-[14px] py-[12px] text-[12px] font-semibold leading-[18px] text-[#777]">
          Đang tìm...
        </div>
      ) : suggestions.length ? (
        <>
          <ul className="max-h-[370px] overflow-y-auto py-[6px]">
            {suggestions.map((suggestion) => (
              <li key={suggestion.href}>
                <a
                  className="grid grid-cols-[58px_1fr] gap-[10px] px-[10px] py-[8px] transition-colors hover:bg-[#f7f7f7]"
                  href={localizeIaaHref(suggestion.href)}
                  onClick={onSuggestionClick}
                >
                  <span className="relative block h-[42px] w-[58px] overflow-hidden bg-[#f5f5f5]">
                    <Image
                      alt={suggestion.alt}
                      className="object-cover"
                      fill
                      sizes="58px"
                      src={suggestion.image}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-[12.5px] font-bold leading-[16px] text-black">
                      {suggestion.title}
                    </span>
                    {suggestion.excerpt ? (
                      <span className="mt-[3px] line-clamp-1 block text-[11px] leading-[15px] text-[#777]">
                        {suggestion.excerpt}
                      </span>
                    ) : null}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            className="block border-t border-[#ececec] px-[12px] py-[9px] text-center text-[11.5px] font-bold uppercase leading-[16px] text-[#446084] transition-colors hover:bg-[#f7f7f7]"
            href={searchHref}
            onClick={onSuggestionClick}
          >
            Xem tất cả kết quả
          </a>
        </>
      ) : (
        <div className="px-[14px] py-[12px] text-[12px] font-semibold leading-[18px] text-[#777]">
          Không có gợi ý phù hợp.
        </div>
      )}
    </div>
  );
}
