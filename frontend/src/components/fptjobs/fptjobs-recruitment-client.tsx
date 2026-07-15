"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BriefcaseBusiness, Clock3, MapPin, Search, Zap } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import {
  adminJobFiltersStorageKey,
  defaultJobEmploymentOptions,
  defaultJobPositionOptions,
  defaultJobSalaryOptions,
  mergeJobFilterOptions,
  type FptJobFilterOptions,
} from "@/lib/fptjobs-job-filters";
import type { Job } from "@/types/fptjobs";

type RecruitmentAssets = {
  hiringFox: string;
  listIcon: string;
  gridIcon: string;
};

type RecruitmentFiltersState = {
  category: string;
  location: string;
  keyword: string;
  salary: string;
  position: string;
  employment: string;
};

type FilterKey = keyof Omit<RecruitmentFiltersState, "keyword">;

type FilterItem = {
  label: string;
  value: string;
  count?: string;
};

type FilterGroup = {
  key: FilterKey;
  title: string;
  items: FilterItem[];
};

type FptRecruitmentClientProps = {
  jobs: Job[];
  careerCategories: string[];
  regions: string[];
  popularTags: string[];
  assets: RecruitmentAssets;
};

type AdminStoredJob = Job & {
  id: number;
  applications?: number;
  owner?: string;
  status?: "active" | "draft" | "paused";
};

const emptyFilters: RecruitmentFiltersState = {
  category: "",
  location: "",
  keyword: "",
  salary: "",
  position: "",
  employment: "",
};

const pageSize = 12;
const adminJobsStorageKey = "fptjobs.admin.jobs";

const groupToFilter: Record<string, Partial<RecruitmentFiltersState>> = {
  it: { category: "Công nghệ thông tin" },
  marketing: { category: "Marketing/Truyền thông/Sự kiện" },
  data: { keyword: "Data" },
  ai: { keyword: "AI" },
  "semiconductor-embedded": { keyword: "Embedded" },
  "nhan-vien-kinh-doanh": { category: "Kinh doanh" },
  "dich-vu-khach-hang": { category: "Chăm sóc khách hàng" },
  "ky-thuat-vien": { category: "Điện tử viễn thông" },
  "ky-thuat-ho-tro-qua-tong-dai": { keyword: "kỹ thuật hỗ trợ" },
  "thuc-tap-sinh": { category: "Thực tập sinh/ Cộng tác viên" },
};

const categoryMatchRules: Array<[string, string[]]> = [
  ["cong nghe thong tin phan cung mang", ["cong nghe thong tin", "cntt", "it", "he thong", "mang", "ha tang"]],
  ["cong nghe thong tin phan mem", ["cong nghe thong tin", "phan mem", "kiem thu", "qc", "developer", "software"]],
  ["cong nghe thong tin", ["cong nghe thong tin", "cntt", "it", "software", "developer", "data", "kiem thu", "qc", "he thong"]],
  ["dien tu vien thong", ["vien thong", "ky thuat", "bao tri", "ha tang", "mang"]],
  ["thuong mai dien tu", ["thuong mai dien tu", "ecommerce"]],
  ["thuc tap sinh cong tac vien", ["thuc tap", "intern", "cong tac vien"]],
  ["marketing truyen thong su kien", ["marketing", "truyen thong", "su kien"]],
  ["cham soc khach hang", ["dich vu khach hang", "cham soc khach hang", "giao dich vien"]],
  ["quan ly va thu cuoc", ["thu cuoc", "quan ly van hanh", "ecommerce planner"]],
  ["thu ngan thu cuoc", ["thu cuoc", "thu ngan"]],
  ["quan ly chat luong qa qc", ["qa", "qc", "kiem thu", "chat luong"]],
  ["quan ly dieu hanh", ["quan ly", "manager"]],
  ["ke hoach du an", ["du an", "planner", "ke hoach"]],
  ["ke toan kiem toan", ["ke toan", "kiem toan", "tai chinh"]],
  ["tai chinh ngan hang", ["tai chinh", "financial"]],
  ["ban hang", ["ban hang", "kinh doanh", "sales"]],
  ["kinh doanh", ["kinh doanh", "account manager", "sales"]],
  ["nhan su", ["nhan su"]],
  ["dien", ["ky thuat", "bao tri", "ha tang", "dien", "vien thong"]],
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toLocalHref(href: string) {
  if (href.startsWith("https://fptjobs.com")) {
    return new URL(href).pathname;
  }

  return href;
}

function countMatchingJobs(jobs: Job[], predicate: (job: Job) => boolean) {
  return String(jobs.filter(predicate).length);
}

function toFilterItems(items: string[], countItem: (item: string) => string): FilterItem[] {
  return [{ label: "Tất cả", value: "" }, ...items.map((item) => ({ count: countItem(item), label: item, value: item }))];
}

function buildFilterGroups(filterOptions: FptJobFilterOptions, jobs: Job[]): FilterGroup[] {
  return [
    {
      key: "category",
      title: "Ngành nghề",
      items: toFilterItems(filterOptions.categories, (category) => countMatchingJobs(jobs, (job) => matchesCategory(getJobText(job), category))),
    },
    {
      key: "location",
      title: "Khu vực/Tỉnh thành",
      items: toFilterItems(filterOptions.regions, (region) => countMatchingJobs(jobs, (job) => matchesLocation(job, region))),
    },
    {
      key: "salary",
      title: "Mức lương",
      items: toFilterItems(filterOptions.salaries, (salary) => countMatchingJobs(jobs, (job) => matchesSalary(job, salary))),
    },
    {
      key: "position",
      title: "Vị trí",
      items: toFilterItems(filterOptions.positions, (position) => countMatchingJobs(jobs, (job) => matchesPosition(job, position))),
    },
    {
      key: "employment",
      title: "Loại hình công việc",
      items: toFilterItems(filterOptions.employments, (employment) => countMatchingJobs(jobs, (job) => matchesEmployment(job, employment))),
    },
  ];
}

function getFiltersFromSearch(search: string): RecruitmentFiltersState {
  const params = new URLSearchParams(search);
  const group = params.get("nhom") ?? "";
  const groupFilters = groupToFilter[group] ?? {};

  return {
    ...emptyFilters,
    ...groupFilters,
    category: params.get("nganh") ?? params.get("department") ?? groupFilters.category ?? "",
    location: params.get("khuvuc") ?? params.get("location") ?? groupFilters.location ?? "",
    keyword: params.get("tukhoa") ?? params.get("q") ?? groupFilters.keyword ?? "",
    salary: params.get("muc-luong") ?? "",
    position: params.get("vi-tri") ?? "",
    employment: params.get("loai-hinh") ?? "",
  };
}

function getPageFromSearch(search: string) {
  const page = Number(new URLSearchParams(search).get("page"));

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function writeFiltersToUrl(filters: RecruitmentFiltersState, page = 1, mode: "push" | "replace" = "push") {
  const params = new URLSearchParams();

  if (filters.category) params.set("nganh", filters.category);
  if (filters.location) params.set("khuvuc", filters.location);
  if (filters.keyword) params.set("tukhoa", filters.keyword);
  if (filters.salary) params.set("muc-luong", filters.salary);
  if (filters.position) params.set("vi-tri", filters.position);
  if (filters.employment) params.set("loai-hinh", filters.employment);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history[mode === "push" ? "pushState" : "replaceState"](null, "", nextUrl);
}

function getJobText(job: Job) {
  return normalizeText(`${job.title} ${job.department ?? ""} ${job.position ?? ""} ${job.location} ${job.salary} ${getJobEmployment(job)}`);
}

function includesKeyword(jobText: string, keyword: string) {
  const terms = normalizeText(keyword).split(" ").filter(Boolean);
  return terms.every((term) => jobText.includes(term));
}

function matchesCategory(jobText: string, category: string) {
  if (!category) return true;

  const normalizedCategory = normalizeText(category);
  if (!normalizedCategory || normalizedCategory === "nganh nghe khac") return true;
  if (jobText.includes(normalizedCategory)) return true;

  const rule = categoryMatchRules.find(([key]) => normalizedCategory.includes(key) || key.includes(normalizedCategory));
  if (!rule) return false;

  return rule[1].some((term) => jobText.includes(term));
}

function matchesLocation(job: Job, location: string) {
  if (!location) return true;

  const normalizedLocation = normalizeText(location);
  const jobLocation = normalizeText(job.location);

  if (normalizedLocation === "ha noi va ho chi minh") {
    return jobLocation === "ha noi" || jobLocation === "ho chi minh";
  }

  return jobLocation.includes(normalizedLocation) || normalizedLocation.includes(jobLocation);
}

function salaryRangeFromText(salary: string) {
  const numbers = salary.match(/\d+/g)?.map(Number) ?? [];

  if (!numbers.length) return null;
  if (numbers.length === 1) return { min: numbers[0], max: numbers[0] };

  return { min: numbers[0], max: numbers[1] };
}

function salaryFilterRange(filter: string) {
  const numbers = filter.match(/\d+/g)?.map(Number) ?? [];

  if (numbers.length >= 2) return { min: numbers[0], max: numbers[1] };
  if (numbers.length === 1 && normalizeText(filter).includes("tro len")) return { min: numbers[0], max: Number.POSITIVE_INFINITY };

  switch (filter) {
    case "0-10":
      return { min: 0, max: 10 };
    case "10-20":
      return { min: 10, max: 20 };
    case "20-30":
      return { min: 20, max: 30 };
    case "30+":
      return { min: 30, max: Number.POSITIVE_INFINITY };
    default:
      return null;
  }
}

function matchesSalary(job: Job, salary: string) {
  if (!salary) return true;

  const normalizedSalary = normalizeText(salary);
  const normalizedJobSalary = normalizeText(job.salary);

  if (normalizedSalary.includes("luong thoa thuan")) {
    return normalizedJobSalary.includes("luong thoa thuan");
  }

  const jobRange = salaryRangeFromText(job.salary);
  const filterRange = salaryFilterRange(salary);
  if (!jobRange || !filterRange) return false;

  return jobRange.max >= filterRange.min && jobRange.min <= filterRange.max;
}

function matchesPosition(job: Job, position: string) {
  const normalizedPosition = normalizeText(position);
  if (!normalizedPosition) return true;

  const jobPosition = normalizeText(job.position ?? "");
  if (jobPosition) return jobPosition === normalizedPosition || jobPosition.includes(normalizedPosition);

  const jobText = getJobText(job);

  if (normalizedPosition === "nhan vien") return jobText.includes("nhan vien");
  if (normalizedPosition === "quan ly") return jobText.includes("quan ly") || jobText.includes("manager");

  return jobText.includes(normalizedPosition);
}

function getJobEmployment(job: Job) {
  if (job.employmentType?.trim()) return job.employmentType.trim();

  const title = normalizeText(job.title);
  return title.includes("thuc tap") ? "Thực tập" : "Toàn thời gian";
}

function matchesEmployment(job: Job, employment: string) {
  const normalizedEmployment = normalizeText(employment);
  if (!normalizedEmployment) return true;

  const jobEmployment = normalizeText(getJobEmployment(job));
  return jobEmployment === normalizedEmployment;
}

function filterJobs(jobs: Job[], filters: RecruitmentFiltersState) {
  return jobs.filter((job) => {
    const jobText = getJobText(job);

    return (
      includesKeyword(jobText, filters.keyword) &&
      matchesCategory(jobText, filters.category) &&
      matchesLocation(job, filters.location) &&
      matchesSalary(job, filters.salary) &&
      matchesPosition(job, filters.position) &&
      matchesEmployment(job, filters.employment)
    );
  });
}

function getPaginationItems(totalPages: number, currentPage: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
    .reduce<Array<number | "ellipsis">>((items, page, index, pagesList) => {
      if (index > 0 && page - pagesList[index - 1] > 1) {
        items.push("ellipsis");
      }

      items.push(page);

      return items;
    }, []);
}

function readStoredAdminJobs() {
  try {
    const rawValue = window.localStorage.getItem(adminJobsStorageKey);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return null;

    return (parsed as AdminStoredJob[]).filter((job) => job.title?.trim() && job.href?.trim());
  } catch {
    return null;
  }
}

function readStoredFilterOptions(baseOptions: FptJobFilterOptions) {
  try {
    const rawValue = window.localStorage.getItem(adminJobFiltersStorageKey);
    if (!rawValue) return baseOptions;

    const parsed = JSON.parse(rawValue) as Partial<FptJobFilterOptions>;

    return mergeJobFilterOptions(baseOptions, parsed);
  } catch {
    return baseOptions;
  }
}

function mergeStoredJobs(staticJobs: Job[], storedJobs: AdminStoredJob[] | null) {
  if (!storedJobs) return staticJobs;

  const jobsByHref = new Map(staticJobs.map((job) => [toLocalHref(job.href), job]));

  for (const job of storedJobs) {
    const href = toLocalHref(job.href);

    if (job.status && job.status !== "active") {
      jobsByHref.delete(href);
      continue;
    }

    jobsByHref.set(href, {
      ...job,
      href,
    });
  }

  return Array.from(jobsByHref.values());
}

export function FptRecruitmentClient({
  jobs,
  careerCategories,
  regions,
  popularTags,
  assets,
}: FptRecruitmentClientProps) {
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const [filters, setFilters] = useState<RecruitmentFiltersState>(emptyFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [storedJobs, setStoredJobs] = useState<AdminStoredJob[] | null>(null);
  const baseFilterOptions = useMemo(
    () => ({
      categories: careerCategories,
      employments: defaultJobEmploymentOptions,
      positions: defaultJobPositionOptions,
      regions,
      salaries: defaultJobSalaryOptions,
    }),
    [careerCategories, regions],
  );
  const [filterOptions, setFilterOptions] = useState<FptJobFilterOptions>(baseFilterOptions);
  const visibleSourceJobs = useMemo(() => mergeStoredJobs(jobs, storedJobs), [jobs, storedJobs]);
  const filterGroups = useMemo(
    () => buildFilterGroups(filterOptions, visibleSourceJobs),
    [filterOptions, visibleSourceJobs],
  );
  const filteredJobs = useMemo(() => filterJobs(visibleSourceJobs, filters), [visibleSourceJobs, filters]);
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * pageSize;
  const visibleJobs = filteredJobs.slice(startIndex, startIndex + pageSize);
  const visibleStart = filteredJobs.length ? startIndex + 1 : 0;
  const visibleEnd = filteredJobs.length ? Math.min(startIndex + visibleJobs.length, filteredJobs.length) : 0;
  const paginationItems = getPaginationItems(totalPages, activePage);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const search = searchString ? `?${searchString}` : "";
      setFilters(getFiltersFromSearch(search));
      setCurrentPage(getPageFromSearch(search));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [searchString]);

  useEffect(() => {
    const syncFromUrl = () => {
      setFilters(getFiltersFromSearch(window.location.search));
      setCurrentPage(getPageFromSearch(window.location.search));
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);

    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    const syncStoredAdminData = () => {
      setStoredJobs(readStoredAdminJobs());
      setFilterOptions(readStoredFilterOptions(baseFilterOptions));
    };

    const timer = window.setTimeout(() => {
      syncStoredAdminData();
    }, 0);

    const handleStorage = (event: StorageEvent) => {
      if (event.key && ![adminJobsStorageKey, adminJobFiltersStorageKey].includes(event.key)) return;
      syncStoredAdminData();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", handleStorage);
    };
  }, [baseFilterOptions]);

  function setAndSyncFilters(nextFilters: RecruitmentFiltersState, mode: "push" | "replace" = "push") {
    setFilters(nextFilters);
    setCurrentPage(1);
    writeFiltersToUrl(nextFilters, 1, mode);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAndSyncFilters(filters);
  }

  function handlePopularClick(event: MouseEvent<HTMLAnchorElement>, tag: string) {
    event.preventDefault();
    setAndSyncFilters({ ...filters, keyword: tag });
  }

  function handleFilterChange(key: FilterKey, value: string) {
    setAndSyncFilters({ ...filters, [key]: value });
  }

  function handleReset() {
    setAndSyncFilters(emptyFilters);
  }

  function handleFormFieldChange(key: keyof RecruitmentFiltersState, value: string) {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages || page === activePage) return;

    setCurrentPage(page);
    writeFiltersToUrl(filters, page);
  }

  return (
    <>
      <section className="fpt-recruitment-hero">
        <div className="fpt-recruitment-panel">
          <Image className="fpt-recruitment-mascot" src={assets.hiringFox} alt="" width={161} height={170} priority />
          <div className="fpt-recruitment-search">
            <h1 className="sr-only">Tổng hợp danh sách vị trí tuyển dụng tại FPT Telecom</h1>
            <form className="fpt-search-card fpt-recruitment-search-card" onSubmit={handleSubmit}>
              <label>
                <BriefcaseBusiness aria-hidden="true" size={14} />
                <select
                  aria-label="Ngành nghề"
                  value={filters.category}
                  onChange={(event) => handleFormFieldChange("category", event.target.value)}
                >
                  <option value="">Ngành nghề</option>
                  {filterOptions.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <MapPin aria-hidden="true" size={14} />
                <select
                  aria-label="Khu vực"
                  value={filters.location}
                  onChange={(event) => handleFormFieldChange("location", event.target.value)}
                >
                  <option value="">Khu vực</option>
                  {filterOptions.regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <Search aria-hidden="true" size={14} />
                <input
                  aria-label="Vị trí chức danh"
                  placeholder="Vị trí, chức danh..."
                  value={filters.keyword}
                  onChange={(event) => handleFormFieldChange("keyword", event.target.value)}
                />
              </label>
              <button type="submit">
                <Search aria-hidden="true" size={14} />
                Tìm kiếm
              </button>
            </form>
            <p className="fpt-popular-tags">
              <strong>Phổ biến:</strong>{" "}
              {popularTags.map((tag, index) => (
                <Link
                  href={`/tuyen-dung?tukhoa=${encodeURIComponent(tag)}`}
                  key={`${tag}-${index}`}
                  onClick={(event) => handlePopularClick(event, tag)}
                >
                  {tag}
                  {index < popularTags.length - 1 ? "," : ""}
                </Link>
              ))}
            </p>
          </div>
        </div>
      </section>

      <section className="fpt-recruitment-section">
        <div className="fpt-recruitment-layout">
          <aside className="fpt-filter-sidebar">
            <div className="fpt-filter-head">
              <h2>Bộ lọc nâng cao</h2>
              <button type="button" onClick={handleReset}>
                Đặt lại
              </button>
            </div>
            {filterGroups.map((group) => (
              <section className={cn("fpt-filter-group", group.items.length > 12 && "is-scrollable")} key={group.title}>
                <h3>{group.title}</h3>
                <div>
                  {group.items.map((item) => (
                    <label className="fpt-filter-item" key={item.label}>
                      <input
                        className="fpt-filter-control"
                        type="radio"
                        name={group.key}
                        checked={filters[group.key] === item.value}
                        onChange={() => handleFilterChange(group.key, item.value)}
                      />
                      <span>{item.label}</span>
                      {item.count ? <small>{item.count}</small> : null}
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </aside>

          <div className="fpt-recruitment-results">
            <div className="fpt-recruitment-toolbar">
              <p>
                Vị trí <strong>{filteredJobs.length ? `${visibleStart}-${visibleEnd}` : "0"}</strong> của{" "}
                <strong>{filteredJobs.length}</strong> việc làm
              </p>
              <div className="fpt-toolbar-controls">
                <span>
                  Hiển thị:
                  <button type="button">12</button>
                </span>
                <span>
                  Sắp xếp:
                  <button type="button">Mới nhất</button>
                </span>
                <Image src={assets.listIcon} alt="" width={20} height={20} />
                <Image src={assets.gridIcon} alt="" width={20} height={20} />
              </div>
            </div>

            {visibleJobs.length ? (
              <>
                <div className="fpt-job-grid fpt-recruitment-grid">
                  {visibleJobs.map((job, index) => (
                    <Link className="fpt-job-card" href={toLocalHref(job.href)} key={`${job.title}-${index}`}>
                      <span className={cn("fpt-hot", index % 4 === 0 ? "is-green" : "")} aria-label="hot job">
                        <Zap aria-hidden="true" size={15} />
                      </span>
                      <h3>{job.title}</h3>
                      <div className="fpt-job-meta">
                        <span>
                          <BriefcaseBusiness aria-hidden="true" size={12} />
                          {getJobEmployment(job)}
                        </span>
                        <span>
                          <MapPin aria-hidden="true" size={12} />
                          {job.location}
                        </span>
                        <span>
                          <Clock3 aria-hidden="true" size={12} />
                          Thời hạn: {job.deadline}
                        </span>
                      </div>
                      <div className="fpt-job-footer">
                        <strong>{job.salary}</strong>
                        <span>Ứng Tuyển</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {filteredJobs.length > pageSize ? (
                  <div className="fpt-pagination" aria-label="Pagination">
                    {paginationItems.map((item, index) => (
                      item === "ellipsis" ? (
                        <span className="fpt-page-ellipsis" key={`ellipsis-${index}`}>
                          ...
                        </span>
                      ) : (
                        <button
                          className={item === activePage ? "is-active" : ""}
                          type="button"
                          onClick={() => handlePageChange(item)}
                          key={item}
                        >
                          {item}
                        </button>
                      )
                    ))}
                    <button
                      className="fpt-page-next"
                      type="button"
                      disabled={activePage >= totalPages}
                      onClick={() => handlePageChange(activePage + 1)}
                    >
                      ›
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="fpt-recruitment-empty">
                <h3>Chưa tìm thấy vị trí phù hợp</h3>
                <p>Thử đổi từ khóa, khu vực hoặc đặt lại bộ lọc để xem thêm việc làm.</p>
                <button type="button" onClick={handleReset}>
                  Đặt lại bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
