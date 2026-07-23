import type { LucideIcon } from "lucide-react";

export type AdminTone = "green" | "pink" | "red" | "teal";

export type AdminDashboardCard = {
  detail: string;
  href: string;
  id:
    | "account"
    | "contact"
    | "password"
    | "post"
    | "site";
  title: string;
  tone: Exclude<AdminTone, "teal">;
};

export type AdminDashboardCardWithIcon = AdminDashboardCard & {
  icon: LucideIcon;
};

export type AdminMetric = {
  label: string;
  tone: AdminTone;
  value: number;
};

export type AdminChartPoint = {
  label: string;
  value: number;
};

export type AdminUserSummary = {
  lastLoginAt: string | null;
  role: string;
  username: string;
};

export type AdminMessageSummary = {
  createdAt: string;
  email: string;
  id: number;
  message: string;
  name: string;
  readAt: string | null;
};

export type AdminArticleSummary = {
  category: string;
  href: string;
  publishedAt: string;
  title: string;
};

export type AdminSearchResult = {
  excerpt: string;
  href: string;
  kind: "Bài viết" | "Cấu hình" | "Tin nhắn";
  title: string;
};

export type AdminSectionItem = {
  description: string;
  href: string;
  id: string;
  meta: string;
  title: string;
};

export type AdminCategoryGroup = {
  children: {
    label: string;
    value: string;
  }[];
  label: string;
  value: string;
};

export type AdminCrudField = {
  allowCustom?: boolean;
  categoryGroups?: AdminCategoryGroup[];
  label: string;
  name: string;
  required?: boolean;
  suggestions?: string[];
  type: "checkbox" | "email" | "number" | "richtext" | "select" | "text" | "textarea";
  value: string;
};

export type AdminCrudPagination = {
  currentPage: number;
  endItem: number;
  perPage: number;
  startItem: number;
  totalItems: number;
  totalPages: number;
};

export type AdminCrudData = {
  allowCreate: boolean;
  allowDelete: boolean;
  allowUpdate: boolean;
  createFields: AdminCrudField[];
  entity: string;
  entityLabel: string;
  pagination: AdminCrudPagination;
  rows: (AdminSectionItem & { fields: AdminCrudField[] })[];
};

export type AdminSectionData = {
  crud: AdminCrudData;
  description: string;
  emptyMessage: string;
  items: AdminSectionItem[];
  metrics: AdminMetric[];
  slug: string;
  title: string;
};

export type AdminSettings = {
  siteEmail: string;
  siteName: string;
};

export type AdminDashboardData = {
  articleCount: number;
  categoryCount: number;
  chart: AdminChartPoint[];
  contentStats: AdminMetric[];
  messages: AdminMessageSummary[];
  monthOptions: number[];
  searchQuery: string;
  searchResults: AdminSearchResult[];
  selectedMonth: number;
  selectedYear: number;
  recentArticles: AdminArticleSummary[];
  settings: AdminSettings;
  shortcutCards: AdminDashboardCard[];
  statusMessage: string;
  trafficStats: AdminMetric[];
  unreadMessageCount: number;
  users: AdminUserSummary[];
  yearOptions: number[];
};
