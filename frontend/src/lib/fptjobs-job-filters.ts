export type FptJobFilterOptions = {
  categories: string[];
  regions: string[];
  salaries: string[];
  positions: string[];
  employments: string[];
};

export type FptJobFilterKey = keyof FptJobFilterOptions;

export const adminJobFiltersStorageKey = "fptjobs.admin.jobFilters";

export const defaultJobSalaryOptions = [
  "Lương thỏa thuận",
  "0 - 10 Triệu ₫",
  "10 - 20 Triệu ₫",
  "20 - 30 Triệu ₫",
  "30 Triệu ₫ trở lên",
];

export const defaultJobPositionOptions = ["Nhân viên", "Quản lý"];

export const defaultJobEmploymentOptions = ["Toàn thời gian", "Bán thời gian", "Thực tập", "Cộng tác viên"];

function dedupeOptions(items: string[]) {
  const seen = new Set<string>();

  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);

      return true;
    });
}

export function mergeJobFilterOptions(base: FptJobFilterOptions, stored?: Partial<FptJobFilterOptions> | null): FptJobFilterOptions {
  return {
    categories: dedupeOptions(stored?.categories?.length ? stored.categories : base.categories),
    regions: dedupeOptions(stored?.regions?.length ? stored.regions : base.regions),
    salaries: dedupeOptions(stored?.salaries?.length ? stored.salaries : base.salaries),
    positions: dedupeOptions(stored?.positions?.length ? stored.positions : base.positions),
    employments: dedupeOptions(stored?.employments?.length ? stored.employments : base.employments),
  };
}
