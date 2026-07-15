"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Filter,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MapPin,
  Newspaper,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import {
  adminApplicationsStorageKey,
  mergeApplications,
  readStoredApplications,
  writeStoredApplications,
  type FptApplicationProfileSnapshot,
  type FptApplicationStatus,
  type FptStoredApplication,
} from "@/lib/fptjobs-applications";
import {
  careerCategoryOptions,
  getEffectiveJobDetailCopy,
  getFptNewsArticleAdminContentHtml,
  getFptSurveyEventBySlug,
  regionOptions,
} from "@/components/fptjobs/fptjobs-home";
import {
  adminJobFiltersStorageKey,
  defaultJobEmploymentOptions,
  defaultJobPositionOptions,
  defaultJobSalaryOptions,
  mergeJobFilterOptions,
  type FptJobFilterKey,
  type FptJobFilterOptions,
} from "@/lib/fptjobs-job-filters";

type AdminView = "overview" | "jobs" | "filters" | "news" | "events" | "candidates" | "settings";
type ResourceKind = "job" | "news" | "event";
type ApplicationStatus = FptApplicationStatus;
type JobStatus = "active" | "draft" | "paused";
type ContentStatus = "published" | "draft" | "hidden";

type AdminJob = {
  id: number;
  title: string;
  department: string;
  position?: string;
  location: string;
  employmentType: string;
  deadline: string;
  salary: string;
  href: string;
  applications: number;
  owner: string;
  status: JobStatus;
  hot: boolean;
  unit?: string;
  quantity?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  workplace?: string;
  branchName?: string;
  branchIntro?: string[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  landline?: string;
};

type AdminContent = {
  id: number;
  title: string;
  type: string;
  date: string;
  image: string;
  href: string;
  excerpt: string;
  contentHtml?: string;
  status: ContentStatus;
  featured: boolean;
};

type AdminApplication = FptStoredApplication;
type BackendApplicationStatus = "new" | "reviewing" | "interview" | "offer" | "hired" | "rejected";

type BackendApplication = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  profileSnapshot?: FptApplicationProfileSnapshot;
  status: BackendApplicationStatus;
  createdAt: string;
  job: {
    id: number;
    slug: string;
    title: string;
    location: string;
  };
};

type BackendApplicationsResponse = {
  data?: BackendApplication[];
  error?: {
    message?: string;
  };
};

type BackendApplicationResponse = {
  data?: BackendApplication;
  error?: {
    message?: string;
  };
};

type AdminSettings = {
  adminEmail: string;
  notificationEmails: string;
};

type AdminSettingsPayload = AdminSettings & {
  confirmPassword?: string;
  currentPassword?: string;
  newPassword?: string;
};

type AdminPasswordDraft = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

type AdminSettingsResponse = {
  data?: AdminSettings;
  error?: {
    message?: string;
    details?: {
      adminEmail?: string;
      confirmPassword?: string;
      currentPassword?: string;
      newPassword?: string;
      notificationEmails?: string;
    };
  };
};

type AdminLoginResponse = {
  data?: {
    admin: {
      email: string;
    };
  };
  error?: {
    message?: string;
    details?: {
      email?: string;
      password?: string;
    };
  };
};

type ModalState =
  | { mode: "create"; resource: ResourceKind }
  | { mode: "edit"; resource: "job"; item: AdminJob }
  | { mode: "edit"; resource: "news" | "event"; item: AdminContent };

const defaultAdminEmail = "admin@fptjobs.com";
const adminSessionStorageKey = "fptjobs.admin.session";
const adminJobsStorageKey = "fptjobs.admin.jobs";
const adminNewsStorageKey = "fptjobs.admin.news";
const adminEventsStorageKey = "fptjobs.admin.events";
const adminNewsSeedVersionKey = "fptjobs.admin.news.seedVersion";
const adminNewsSeedVersion = "news-12-full-detail-2026-07-12";
const adminEventsSeedVersionKey = "fptjobs.admin.events.seedVersion";
const adminEventsSeedVersion = "events-12-full-detail-2026-07-12";
const adminJobsPageSize = 6;
const adminContentPageSize = 6;
const adminCandidatesPageSize = 6;
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const initialJobFilterOptions: FptJobFilterOptions = {
  categories: careerCategoryOptions,
  employments: defaultJobEmploymentOptions,
  positions: defaultJobPositionOptions,
  regions: regionOptions,
  salaries: defaultJobSalaryOptions,
};

const assets = {
  logo: "/seo/fptjobs-com-public-imgs-version2-general-fpt-telecom-ngang-logo.svg",
  avatar: "/images/fptjobs/fptjobs-com-public-imgs-version2-fox-avt.png",
};

const statusLabels: Record<ApplicationStatus, string> = {
  new: "Mới",
  screening: "Sàng lọc",
  interview: "Phỏng vấn",
  offer: "Offer",
  hired: "Đã nhận",
  rejected: "Từ chối",
};

const applicationProfileFieldLabels: Array<[keyof FptApplicationProfileSnapshot, string]> = [
  ["fullName", "Họ và tên"],
  ["email", "Email"],
  ["phone", "Số điện thoại"],
  ["birthday", "Ngày sinh"],
  ["address", "Địa chỉ"],
  ["currentCity", "Tỉnh/thành hiện tại"],
  ["currentWard", "Xã/phường hiện tại"],
  ["desiredCity", "Tỉnh/thành mong muốn"],
  ["desiredWard", "Xã/phường mong muốn"],
  ["educationLevel", "Trình độ học vấn"],
  ["school", "Trường"],
  ["major", "Chuyên ngành"],
  ["updatedAt", "Cập nhật profile lúc"],
];

const jobStatusLabels: Record<JobStatus, string> = {
  active: "Đang mở",
  draft: "Nháp",
  paused: "Tạm dừng",
};

const contentStatusLabels: Record<ContentStatus, string> = {
  published: "Đã đăng",
  draft: "Nháp",
  hidden: "Ẩn",
};

const navItems: Array<{ id: AdminView; label: string; icon: React.ReactNode }> = [
  { id: "overview", label: "Tổng quan", icon: <LayoutDashboard size={18} aria-hidden="true" /> },
  { id: "jobs", label: "Việc làm", icon: <BriefcaseBusiness size={18} aria-hidden="true" /> },
  { id: "filters", label: "Bộ lọc", icon: <Filter size={18} aria-hidden="true" /> },
  { id: "news", label: "Tin tức", icon: <Newspaper size={18} aria-hidden="true" /> },
  { id: "events", label: "Sự kiện", icon: <CalendarDays size={18} aria-hidden="true" /> },
  { id: "candidates", label: "Ứng viên", icon: <UsersRound size={18} aria-hidden="true" /> },
  { id: "settings", label: "Cài đặt", icon: <Settings size={18} aria-hidden="true" /> },
];

const initialJobs: AdminJob[] = [
  {
    id: 25890,
    title: "Thực tập sinh Tài năng Công nghệ thông tin",
    department: "Công nghệ thông tin",
    location: "Hồ Chí Minh",
    employmentType: "Thực tập",
    deadline: "31/08/2026",
    salary: "Lương thỏa thuận",
    href: "/thuc-tap-sinh-tai-nang-cong-nghe-thong-tin-25890",
    applications: 18,
    owner: "Nguyễn Hân",
    status: "active",
    hot: true,
  },
  {
    id: 25891,
    title: "Thực tập sinh Marketing",
    department: "Marketing/Truyền thông/Sự kiện",
    location: "Hà Nội",
    employmentType: "Thực tập",
    deadline: "31/08/2026",
    salary: "Lương thỏa thuận",
    href: "/thuc-tap-sinh-marketing-25891",
    applications: 11,
    owner: "Thanh Trúc",
    status: "active",
    hot: false,
  },
  {
    id: 25801,
    title: "Kỹ Thuật Viên Bảo Trì Hạ Tầng Viễn thông",
    department: "Điện tử viễn thông",
    location: "Tiền Giang",
    employmentType: "Toàn thời gian",
    deadline: "31/07/2026",
    salary: "8 - 15 triệu ₫",
    href: "/ky-thuat-vien-bao-tri-ha-tang-vien-thong-25801",
    applications: 23,
    owner: "Hoàng Nam",
    status: "active",
    hot: false,
  },
  {
    id: 25874,
    title: "Nhân viên Kinh doanh (Cầu Giấy)",
    department: "Kinh doanh",
    location: "Hà Nội",
    employmentType: "Toàn thời gian",
    deadline: "31/07/2026",
    salary: "8 - 20 triệu ₫",
    href: "/nhan-vien-kinh-doanh-cau-giay-25874",
    applications: 42,
    owner: "Minh Anh",
    status: "active",
    hot: true,
  },
  {
    id: 25865,
    title: "Nhân viên kỹ thuật triển khai và bảo trì mạng viễn thông (Hà Nội)",
    department: "Điện tử viễn thông",
    location: "Hà Nội",
    employmentType: "Toàn thời gian",
    deadline: "31/07/2026",
    salary: "10 - 15 triệu ₫",
    href: "/nhan-vien-ky-thuat-trien-khai-va-bao-tri-mang-vien-thong-ha-noi-25865",
    applications: 31,
    owner: "Hoàng Nam",
    status: "active",
    hot: true,
  },
  {
    id: 25870,
    title: "Nhân viên Kinh doanh dịch vụ Viễn thông (Quận 7 , Nhà Bè)",
    department: "Kinh doanh",
    location: "Hồ Chí Minh",
    employmentType: "Toàn thời gian",
    deadline: "31/07/2026",
    salary: "Lương thỏa thuận",
    href: "/nhan-vien-kinh-doanh-dich-vu-vien-thong-quan-7--nha-be-25870",
    applications: 20,
    owner: "Bảo Ngọc",
    status: "active",
    hot: false,
  },
  {
    id: 25871,
    title: "Nhân viên Dịch vụ khách hàng (Quận 7)",
    department: "Chăm sóc khách hàng",
    location: "Hồ Chí Minh",
    employmentType: "Toàn thời gian",
    deadline: "31/07/2026",
    salary: "8 - 13 triệu ₫",
    href: "/nhan-vien-dich-vu-khach-hang-quan-7-25871",
    applications: 22,
    owner: "Bảo Ngọc",
    status: "active",
    hot: false,
  },
  {
    id: 25872,
    title: "Kỹ Sư Vận Hành Hệ Thống CNTT (IT Operation System Engineer)",
    department: "Công nghệ thông tin",
    location: "Hồ Chí Minh",
    employmentType: "Toàn thời gian",
    deadline: "08/08/2026",
    salary: "13 - 15 triệu ₫",
    href: "/ky-su-van-hanh-he-thong-cntt-it-operation-system-engineer-25872",
    applications: 27,
    owner: "Bảo Ngọc",
    status: "active",
    hot: false,
  },
  {
    id: 25851,
    title: "Nhân viên Quản lý Vận hành sàn Thương mại điện tử (Ecommerce Planner)",
    department: "Thương mại điện tử",
    location: "Hà Nội",
    employmentType: "Toàn thời gian",
    deadline: "07/08/2026",
    salary: "Lương thỏa thuận",
    href: "/nhan-vien-quan-ly-van-hanh-san-thuong-mai-ien-tu-ecommerce-planner-25851",
    applications: 24,
    owner: "Thanh Trúc",
    status: "paused",
    hot: true,
  },
  {
    id: 25852,
    title: "Chuyên gia Phân tích Tài chính (Financial Analyst)",
    department: "Tài chính/Ngân hàng",
    location: "Hà Nội",
    employmentType: "Toàn thời gian",
    deadline: "31/07/2026",
    salary: "Lương thỏa thuận",
    href: "/chuyen-gia-phan-tich-tai-chinh-financial-analyst-25852",
    applications: 19,
    owner: "Minh Anh",
    status: "draft",
    hot: true,
  },
  {
    id: 25853,
    title: "Account Manager (Chinese & English Speaking)",
    department: "Kinh doanh",
    location: "Hà Nội",
    employmentType: "Toàn thời gian",
    deadline: "07/08/2026",
    salary: "Lương thỏa thuận",
    href: "/account-manager-chinese--english-speaking-25853",
    applications: 16,
    owner: "Minh Anh",
    status: "active",
    hot: true,
  },
  {
    id: 25859,
    title: "Chuyên viên Quản Lý Dự Án (Viễn thông)",
    department: "Kế hoạch/Dự án",
    location: "Hà Nội",
    employmentType: "Toàn thời gian",
    deadline: "31/07/2026",
    salary: "18 - 25 triệu ₫",
    href: "/chuyen-vien-quan-ly-du-an-vien-thong-25859",
    applications: 14,
    owner: "Hoàng Nam",
    status: "active",
    hot: true,
  },
  {
    id: 25846,
    title: "Nhân viên Nhân sự (Long An)",
    department: "Nhân sự",
    location: "Long An",
    employmentType: "Toàn thời gian",
    deadline: "30/07/2026",
    salary: "10 - 15 triệu ₫",
    href: "/nhan-vien-nhan-su-long-an-25846",
    applications: 12,
    owner: "Thanh Trúc",
    status: "active",
    hot: true,
  },
  {
    id: 25850,
    title: "Chuyên viên Kiểm thử phần mềm (QC - Engineer)",
    department: "Công nghệ thông tin",
    location: "Hồ Chí Minh",
    employmentType: "Toàn thời gian",
    deadline: "07/08/2026",
    salary: "Lương thỏa thuận",
    href: "/chuyen-vien-kiem-thu-phan-mem-qc-engineer-25850",
    applications: 27,
    owner: "Bảo Ngọc",
    status: "draft",
    hot: false,
  },
];

const baseInitialNews: AdminContent[] = [
  {
    id: 331,
    title: "FPT Telecom nhận bằng khen của Bộ Khoa học và Công nghệ cho đóng góp phát triển IPv6 tại Việt Nam",
    type: "Tin tức nổi bật",
    date: "Thứ Ba, 30/06/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-6302026120000AM181549406thumbnail.png",
    href: "/tin-tuc/fpt-telecom-nhan-bang-khen-cua-bo-khoa-hoc-va-cong-nghe-cho-dong-gop-phat-trien-ipv6-tai-viet-nam-331",
    excerpt: "FPT Telecom được ghi nhận cho các đóng góp trong phát triển IPv6 và hạ tầng số tại Việt Nam.",
    status: "published",
    featured: true,
  },
  {
    id: 316,
    title: "FPT được vinh danh Giải Vàng Stevie Award cho Nhà tuyển dụng xuất sắc 2025",
    type: "Tin tức nổi bật",
    date: "Thứ Ba, 19/08/2025",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-8192025120000AM9402187thumbnail.png",
    href: "/tin-tuc/fpt-duoc-vinh-danh-giai-vang-stevie-award-cho-nha-tuyen-dung-xuat-sac-2025-316",
    excerpt: "FPT được ghi nhận ở hạng mục nhà tuyển dụng xuất sắc với môi trường làm việc và chính sách nhân sự nổi bật.",
    status: "published",
    featured: true,
  },
  {
    id: 315,
    title: "Bí mật nào khiến FPT Telecom trở thành “nhà tuyển dụng quốc dân” mà ai cũng muốn đầu quân?",
    type: "Tin tức nổi bật",
    date: "Chủ Nhật, 06/07/2025",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-762025120000AM17510816thumbnail.png",
    href: "/tin-tuc/bi-mat-nao-khien-fpt-telecom-tro-thanh-nha-tuyen-dung-quoc-dan-ma-ai-cung-muon-dau-quan-315",
    excerpt: "Những yếu tố giúp FPT Telecom trở thành điểm đến nghề nghiệp được nhiều ứng viên quan tâm.",
    status: "published",
    featured: true,
  },
  {
    id: 330,
    title: "IT là gì? Toàn cảnh ngành IT và cơ hội nghề nghiệp 2026",
    type: "News",
    date: "Thứ Hai, 29/06/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-6292026120000AM141137995thumbnail.png",
    href: "/tin-tuc/it-la-gi-toan-canh-nganh-it-va-co-hoi-nghe-nghiep-2026-330",
    excerpt: "Giải nghĩa ngành IT, các mảng nghề phổ biến, mức lương và cơ hội việc làm tại FPT Telecom.",
    status: "published",
    featured: false,
  },
  {
    id: 329,
    title: "Sinh viên Công nghệ Tập sự FPT Telecom 2026 — thực chiến có lương, lộ trình rõ ngay từ năm 3",
    type: "News",
    date: "Thứ Năm, 14/05/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-5142026120000AM18058299thumbnail.png",
    href: "/tin-tuc/sinh-vien-cong-nghe-tap-su-fpt-telecom-2026---thuc-chien-co-luong-lo-trinh-ro-ngay-tu-nam-3-329",
    excerpt: "Chương trình dành cho sinh viên công nghệ muốn va chạm dự án thật và có lộ trình rõ ràng.",
    status: "published",
    featured: false,
  },
  {
    id: 328,
    title: "Thực tập FPT Telecom 2026 — chương trình internship quy mô lớn nhất năm chính thức mở đơn",
    type: "News",
    date: "Thứ Năm, 14/05/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-5142026120000AM171425323thumbnail.png",
    href: "/tin-tuc/thuc-tap-fpt-telecom-2026---chuong-trinh-internship-quy-mo-lon-nhat-nam-chinh-thuc-mo-don-328",
    excerpt: "Chương trình internship hướng tới học thật, làm thật và hoàn thiện kỹ năng thực chiến.",
    status: "draft",
    featured: false,
  },
  {
    id: 327,
    title: "Marketing FPT Telecom — Làm Gì, Thu Nhập Bao Nhiêu Và Cơ Hội Phát Triển Ra Sao?",
    type: "News",
    date: "Thứ Ba, 28/04/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-4282026120000AM172242263thumbnail.png",
    href: "/tin-tuc/marketing-fpt-telecom---lam-gi-thu-nhap-bao-nhieu-va-co-hoi-phat-trien-ra-sao-327",
    excerpt: "Tổng quan công việc marketing tại môi trường Telecom và lộ trình phát triển nghề nghiệp.",
    status: "published",
    featured: false,
  },
  {
    id: 326,
    title: "Kỹ Thuật Viên Viễn Thông Là Làm Gì? Công Việc Thực Tế Và Cơ Hội Tại FPT Telecom",
    type: "News",
    date: "Thứ Năm, 16/04/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-4162026120000AM103116402thumbnail.png",
    href: "/tin-tuc/ky-thuat-vien-vien-thong-la-lam-gi-cong-viec-thuc-te-va-co-hoi-tai-fpt-telecom-326",
    excerpt: "Mô tả công việc thực tế của kỹ thuật viên viễn thông và các cơ hội tại FPT Telecom.",
    status: "hidden",
    featured: false,
  },
  {
    id: 325,
    title: "Nhân Viên Kinh Doanh Là Làm Gì? Công Việc Thực Tế Và Cơ Hội Tại FPT Telecom",
    type: "News",
    date: "Thứ Hai, 13/04/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-4132026120000AM141912396thumbnail.png",
    href: "/tin-tuc/nhan-vien-kinh-doanh-la-lam-gi-cong-viec-thuc-te-va-co-hoi-tai-fpt-telecom-325",
    excerpt: "Công việc kinh doanh tại FPT Telecom, các kỹ năng cần có và cơ hội phát triển dài hạn.",
    status: "published",
    featured: false,
  },
  {
    id: 324,
    title: "FPT Telecom và Trường ĐH Khoa học Tự nhiên (ĐHQG-HCM) ký kết hợp tác: Chú trọng nhân lực Chip bán dẫn và Trí tuệ nhân tạo (AI)",
    type: "News",
    date: "Thứ Năm, 09/04/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-492026120000AM182053319thumbnail.png",
    href: "/tin-tuc/fpt-telecom-va-truong-dh-khoa-hoc-tu-nhien-dhqg-hcm-ky-ket-hop-tac-chu-trong-nhan-luc-chip-ban-dan-va-tri-tue-nhan-tao-ai-324",
    excerpt: "FPT Telecom hợp tác với Trường ĐH Khoa học Tự nhiên để phát triển nguồn nhân lực bán dẫn và AI.",
    status: "published",
    featured: false,
  },
  {
    id: 323,
    title: "FPT Telecom tổ chức chương trình tuyển dụng dành riêng cho quân nhân xuất ngũ",
    type: "News",
    date: "Thứ Sáu, 30/01/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-1302026120000AM135432627thumbnail.png",
    href: "/tin-tuc/fpt-telecom-to-chuc-chuong-trinh-tuyen-dung-danh-rieng-cho-quan-nhan-xuat-ngu-323",
    excerpt: "Chương trình tuyển dụng cho quân nhân xuất ngũ tại Hải Phòng, Hồ Chí Minh và Hà Nội.",
    status: "published",
    featured: false,
  },
  {
    id: 321,
    title: "FPT TELECOM KÝ KẾT HỢP TÁC CHIẾN LƯỢC VỚI TRƯỜNG ĐH GIAO THÔNG VẬN TẢI TP.HCM",
    type: "News",
    date: "Thứ Năm, 15/01/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-1152026120000AM17223848thumbnail.png",
    href: "/tin-tuc/fpt-telecom-ky-ket-hop-tac-chien-luoc-voi-truong-dh-giao-thong-van-tai-tphcm-321",
    excerpt: "Cột mốc hợp tác mới giữa FPT Telecom và Trường Đại học Giao thông vận tải TP.HCM.",
    status: "published",
    featured: false,
  },
];

const initialNews: AdminContent[] = hydrateAdminContentDetails(baseInitialNews, "news");

const baseInitialEvents: AdminContent[] = [
  {
    id: 69,
    title: "TUYỂN DỤNG 500 VỊ TRÍ KHU VỰC TOÀN QUỐC",
    type: "Sự kiện nổi bật",
    date: "Thứ Hai, 23/03/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-8857.png",
    href: "/su-kien-khao-sat/tuyen-dung-500-vi-tri-khu-vuc-toan-quoc-69",
    excerpt: "Chiến dịch tuyển dụng quy mô toàn quốc với hàng trăm cơ hội việc làm tại FPT Telecom.",
    status: "published",
    featured: true,
  },
  {
    id: 100,
    title: "TUYỂN DỤNG NHÂN SỰ CÔNG NGHỆ CHO CÁC DỰ ÁN TRỌNG ĐIỂM",
    type: "Sự kiện tuyển dụng",
    date: "Thứ Tư, 01/07/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3265.png",
    href: "/su-kien-khao-sat/tuyen-dung-nhan-su-cong-nghe-cho-cac-du-an-trong-diem-100",
    excerpt: "Tuyển dụng các vị trí công nghệ lõi tham gia dự án trọng điểm chuyển đổi số quốc gia.",
    status: "published",
    featured: true,
  },
  {
    id: 92,
    title: "TUYỂN DỤNG KỸ THUẬT VIÊN TOÀN QUỐC 2026",
    type: "Sự kiện tuyển dụng",
    date: "Thứ Ba, 10/02/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3175.png",
    href: "/su-kien-khao-sat/tuyen-dung-ky-thuat-vien-toan-quoc-2026-92",
    excerpt: "Cơ hội kỹ thuật viên trên toàn quốc với thu nhập 12 - 18 triệu và lộ trình đào tạo đầy đủ.",
    status: "published",
    featured: true,
  },
  {
    id: 90,
    title: "FPT TELECOM EMBEDDED BOOTCAMP 2026: TỪ ZERO ĐẾN TỰ TAY VIẾT HỆ ĐIỀU HÀNH RTOS",
    type: "Bootcamp",
    date: "Thứ Tư, 21/01/2026",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3243.png",
    href: "/su-kien-khao-sat/fpt-telecom-embedded-bootcamp-2026-tu-zero-den-tu-tay-viet-he-dieu-hanh-rtos-90",
    excerpt: "Bootcamp Embedded dành cho kỹ sư nguồn với lộ trình thuật toán, Linux và RTOS.",
    status: "draft",
    featured: true,
  },
  {
    id: 74,
    title: "[MIỀN NAM] PHƯƠNG NAM TELECOM TUYỂN DỤNG NHÂN VIÊN KỸ THUẬT - 2025",
    type: "Sự kiện nổi bật",
    date: "Thứ Tư, 12/03/2025",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-1361.png",
    href: "/su-kien-khao-sat/mien-nam-phuong-nam-telecom-tuyen-dung-nhan-vien-ky-thuat-2025-74",
    excerpt: "Phương Nam Telecom tuyển dụng nhân viên kỹ thuật khu vực miền Nam với nhiều vị trí thực chiến.",
    status: "published",
    featured: true,
  },
  {
    id: 86,
    title: "TUYỂN DỤNG 150 KỸ THUẬT VIÊN TOÀN QUỐC",
    type: "Sự kiện tuyển dụng",
    date: "Thứ Tư, 17/12/2025",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-7743.png",
    href: "/su-kien-khao-sat/tuyen-dung-150-ky-thuat-vien-toan-quoc-86",
    excerpt: "150 suất làm việc chính thức tại FPT Telecom với phỏng vấn nhanh và đi làm sớm.",
    status: "published",
    featured: false,
  },
  {
    id: 83,
    title: "FPT TELECOM TUYỂN DỤNG NHÂN VIÊN TELESALES",
    type: "Sự kiện tuyển dụng",
    date: "Thứ Sáu, 12/09/2025",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-7524.png",
    href: "/su-kien-khao-sat/fpt-telecom-tuyen-dung-nhan-vien-telesales-83",
    excerpt: "Tuyển dụng nhân viên telesales tại Hà Nội với thu nhập từ 18 - 30 triệu mỗi tháng.",
    status: "hidden",
    featured: false,
  },
  {
    id: 82,
    title: "ĐĂNG KÝ THÔNG TIN CAREER BOOMING",
    type: "Sự kiện tuyển dụng",
    date: "Thứ Tư, 20/08/2025",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-25.png",
    href: "/su-kien-khao-sat/dang-ky-thong-tin-career-booming-82",
    excerpt: "Sự kiện dành cho sinh viên và ứng viên trẻ muốn khám phá lộ trình nghề nghiệp tại FPT Telecom.",
    status: "published",
    featured: false,
  },
  {
    id: 73,
    title: "[FPT TELECOM MIỀN NAM] ĐĂNG KÝ THÔNG TIN SINH VIÊN",
    type: "Sự kiện tuyển dụng",
    date: "Thứ Hai, 10/03/2025",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3730.png",
    href: "/su-kien-khao-sat/fpt-telecom-mien-nam-dang-ky-thong-tin-sinh-vien-73",
    excerpt: "Đăng ký thông tin ứng tuyển và nhận quà tại gian hàng FPT Telecom khu vực miền Nam.",
    status: "published",
    featured: false,
  },
  {
    id: 72,
    title: "[FPT TELECOM MIỀN BẮC] ĐĂNG KÝ THÔNG TIN SINH VIÊN",
    type: "Sự kiện tuyển dụng",
    date: "Thứ Hai, 10/03/2025",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3730.png",
    href: "/su-kien-khao-sat/fpt-telecom-mien-bac-dang-ky-thong-tin-sinh-vien-72",
    excerpt: "Đăng ký thông tin vào form và nhận quà tại gian hàng FPT Telecom khu vực miền Bắc.",
    status: "published",
    featured: false,
  },
  {
    id: 71,
    title: "[MIỀN BẮC] FPT TELECOM TUYỂN DỤNG NHÂN VIÊN KỸ THUẬT - 2025",
    type: "Sự kiện tuyển dụng",
    date: "Thứ Ba, 04/03/2025",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-8778.png",
    href: "/su-kien-khao-sat/mien-bac-fpt-telecom-tuyen-dung-nhan-vien-ky-thuat-2025-71",
    excerpt: "Tuyển dụng kỹ thuật viên viễn thông miền Bắc với mức thu nhập cạnh tranh và không yêu cầu kinh nghiệm.",
    status: "published",
    featured: false,
  },
  {
    id: 70,
    title: "[MIỀN BẮC] FPT TELECOM TUYỂN DỤNG NHÂN VIÊN KINH DOANH - 2026",
    type: "Sự kiện tuyển dụng",
    date: "Thứ Ba, 04/03/2025",
    image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-203.png",
    href: "/su-kien-khao-sat/mien-bac-fpt-telecom-tuyen-dung-nhan-vien-kinh-doanh-2026-70",
    excerpt: "Tuyển dụng nhân viên kinh doanh miền Bắc với lộ trình đào tạo bán hàng và phúc lợi FPT Telecom.",
    status: "published",
    featured: false,
  },
];

const initialEvents: AdminContent[] = hydrateAdminContentDetails(baseInitialEvents, "event");

const initialApplications: AdminApplication[] = [];

const backendToAdminApplicationStatus: Record<BackendApplicationStatus, ApplicationStatus> = {
  hired: "hired",
  interview: "interview",
  new: "new",
  offer: "offer",
  rejected: "rejected",
  reviewing: "screening",
};

const adminToBackendApplicationStatus: Record<ApplicationStatus, BackendApplicationStatus> = {
  hired: "hired",
  interview: "interview",
  new: "new",
  offer: "offer",
  rejected: "rejected",
  screening: "reviewing",
};

function formatApplicationDate(value?: string) {
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

async function parseJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

function getBackendApplicationSource(application: BackendApplication) {
  const landingPageSource = application.coverLetter?.match(/^Đăng ký landing page: (.+)$/m)?.[1]?.trim();

  if (landingPageSource) {
    return landingPageSource;
  }

  return application.coverLetter?.startsWith("Đăng ký sự kiện:") ? "Sự kiện" : "FPT Jobs";
}

function mapBackendApplication(application: BackendApplication): AdminApplication {
  return {
    appliedAt: formatApplicationDate(application.createdAt),
    cvName: application.resumeUrl ?? undefined,
    email: application.email,
    fullName: application.fullName,
    id: application.id,
    jobSlug: application.job.slug,
    jobTitle: application.job.title,
    location: application.job.location,
    note: application.coverLetter ?? undefined,
    phone: application.phone,
    profileSnapshot: application.profileSnapshot,
    source: getBackendApplicationSource(application),
    status: backendToAdminApplicationStatus[application.status],
  };
}

async function fetchBackendApplications() {
  const response = await fetch(`${apiBaseUrl}/api/applications?limit=100`, {
    cache: "no-store",
  });
  const data = await parseJson<BackendApplicationsResponse>(response);

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Không thể tải danh sách hồ sơ.");
  }

  return (data.data ?? []).map(mapBackendApplication);
}

async function fetchAdminSettings() {
  const response = await fetch(`${apiBaseUrl}/api/admin/settings`, {
    cache: "no-store",
  });
  const data = await parseJson<AdminSettingsResponse>(response);

  if (!response.ok || !data.data) {
    throw new Error(data.error?.message ?? "Không thể tải cài đặt admin.");
  }

  return data.data;
}

async function saveAdminSettingsRequest(settings: AdminSettingsPayload) {
  const response = await fetch(`${apiBaseUrl}/api/admin/settings`, {
    body: JSON.stringify(settings),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
  const data = await parseJson<AdminSettingsResponse>(response);

  if (!response.ok || !data.data) {
    throw new Error(
      data.error?.details?.adminEmail ??
        data.error?.details?.currentPassword ??
        data.error?.details?.newPassword ??
        data.error?.details?.confirmPassword ??
        data.error?.details?.notificationEmails ??
        data.error?.message ??
        "Không thể lưu cài đặt admin.",
    );
  }

  return data.data;
}

async function loginAdminRequest(email: string, password: string) {
  const response = await fetch(`${apiBaseUrl}/api/admin/login`, {
    body: JSON.stringify({
      email,
      password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = await parseJson<AdminLoginResponse>(response);

  if (!response.ok || !data.data) {
    throw new Error(data.error?.details?.email ?? data.error?.details?.password ?? data.error?.message ?? "Email hoặc mật khẩu admin chưa đúng.");
  }

  return data.data.admin;
}

function getApplicationCvHref(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${apiBaseUrl}${value}`;
  }

  return "";
}

function getApplicationCvLabel(value: string) {
  const filename = value.split("/").filter(Boolean).at(-1) ?? value;

  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
}

function getApplicationProfileSnapshot(application: AdminApplication): FptApplicationProfileSnapshot {
  return {
    ...(application.profileSnapshot ?? {}),
    email: application.profileSnapshot?.email || application.email,
    fullName: application.profileSnapshot?.fullName || application.fullName,
    phone: application.profileSnapshot?.phone || application.phone,
    resumeUrl: application.profileSnapshot?.resumeUrl || application.cvName || "",
  };
}

function displayAdminApplicationValue(value?: string | null) {
  return value?.trim() || "Chưa có";
}

function formatAdminApplicationDate(value?: string | null) {
  if (!value?.trim()) return "Chưa có";

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

  const dateValue = new Date(value);

  if (Number.isNaN(dateValue.getTime())) {
    return value;
  }

  return formatApplicationDate(value);
}

function formatAdminMajorValue(value?: string | null) {
  if (!value?.trim()) return "Chưa có";

  try {
    const parsedValue = JSON.parse(value) as unknown;

    if (Array.isArray(parsedValue)) {
      const majors = parsedValue.filter((item): item is string => typeof item === "string" && item.trim().length > 0);

      return majors.length > 0 ? majors.join(", ") : "Chưa có";
    }
  } catch {
    // Older profiles stored a single text value.
  }

  return value;
}

function formatAdminProfileValue(field: keyof FptApplicationProfileSnapshot, value?: string | null) {
  if (field === "birthday" || field === "updatedAt") {
    return formatAdminApplicationDate(value);
  }

  if (field === "major") {
    return formatAdminMajorValue(value);
  }

  return displayAdminApplicationValue(value);
}

const emptyJobDraft: AdminJob = {
  id: 0,
  title: "",
  department: "Công nghệ thông tin",
  position: "Nhân viên",
  location: "Hồ Chí Minh",
  employmentType: "Toàn thời gian",
  deadline: "31/08/2026",
  salary: "Lương thỏa thuận",
  href: "",
  applications: 0,
  owner: "Admin",
  status: "active",
  hot: false,
  unit: "FPT Telecom",
  quantity: "1",
  responsibilities: [
    "Mô tả các đầu việc chính của vị trí.",
    "Phối hợp với các bộ phận liên quan để hoàn thành mục tiêu công việc.",
    "Thực hiện báo cáo và các nhiệm vụ khác theo phân công của quản lý trực tiếp.",
  ],
  requirements: [
    "Tốt nghiệp chuyên ngành phù hợp với vị trí ứng tuyển.",
    "Có tinh thần trách nhiệm, chủ động học hỏi và phối hợp tốt.",
    "Ưu tiên ứng viên có kinh nghiệm ở vị trí tương đương.",
  ],
  benefits: [
    "Thu nhập cạnh tranh theo năng lực.",
    "Được hưởng đầy đủ chế độ BHXH, BHYT, BHTN theo quy định.",
    "Cơ hội đào tạo, phát triển và thăng tiến rõ ràng.",
    "Môi trường làm việc thân thiện, chuyên nghiệp, năng động và trẻ trung.",
  ],
  tags: ["FPT Telecom", "tuyển dụng"],
  workplace: "FPT Telecom",
  branchName: "FPT Telecom",
  branchIntro: [
    "FPT Telecom là một trong những nhà cung cấp dịch vụ viễn thông và Internet hàng đầu Việt Nam.",
    "Ứng viên được làm việc trong môi trường chuyên nghiệp, trẻ trung và nhiều cơ hội phát triển.",
  ],
  contactName: "Trung tâm Thu hút Nguồn nhân lực",
  contactEmail: "phuongtm3@fpt.com / nhanctt3@fpt.com",
  contactPhone: "0904 678 040 / 0986 656 620",
  landline: "0904 678 040 / 0986 656 620",
};

const emptyContentDraft: AdminContent = {
  id: 0,
  title: "",
  type: "News",
  date: "Thứ Ba, 11/07/2026",
  image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-6302026120000AM181549406thumbnail.png",
  href: "",
  excerpt: "",
  contentHtml: "",
  status: "published",
  featured: false,
};

type StoredSeedOptions = {
  version: string;
  versionKey: string;
};

function mergeSeededItems<T extends { id: number }>(stored: T[], fallback: T[]) {
  const storedById = new Map(stored.map((item) => [item.id, item]));
  const fallbackIds = new Set(fallback.map((item) => item.id));

  return [
    ...fallback.map((item) => {
      const storedItem = storedById.get(item.id);
      if (!storedItem) return item;

      const merged = { ...item, ...storedItem };
      const fallbackContent = "contentHtml" in item ? String((item as { contentHtml?: string }).contentHtml ?? "") : "";
      const storedContent = "contentHtml" in storedItem ? String((storedItem as { contentHtml?: string }).contentHtml ?? "") : "";

      if (fallbackContent && (!storedContent || isGeneratedAdminContentHtml(storedContent))) {
        return { ...merged, contentHtml: fallbackContent };
      }

      return merged;
    }),
    ...stored.filter((item) => !fallbackIds.has(item.id)),
  ];
}

function readStoredArray<T extends { id: number }>(key: string, fallback: T[], seed?: StoredSeedOptions): T[] {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key);
    const seedVersion = seed ? window.localStorage.getItem(seed.versionKey) : null;

    if (!value) {
      if (seed) window.localStorage.setItem(seed.versionKey, seed.version);
      return fallback;
    }

    const parsed = JSON.parse(value);
    const stored = Array.isArray(parsed) ? (parsed as T[]) : fallback;

    if (seed && seedVersion !== seed.version) {
      const merged = mergeSeededItems(stored, fallback);
      window.localStorage.setItem(key, JSON.stringify(merged));
      window.localStorage.setItem(seed.versionKey, seed.version);
      return merged;
    }

    return stored;
  } catch {
    return fallback;
  }
}

function writeStoredArray<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readStoredJobFilterOptions() {
  if (typeof window === "undefined") return initialJobFilterOptions;

  try {
    const value = window.localStorage.getItem(adminJobFiltersStorageKey);
    if (!value) return initialJobFilterOptions;

    return mergeJobFilterOptions(initialJobFilterOptions, JSON.parse(value) as Partial<FptJobFilterOptions>);
  } catch {
    return initialJobFilterOptions;
  }
}

function writeStoredJobFilterOptions(value: FptJobFilterOptions) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(adminJobFiltersStorageKey, JSON.stringify(value));
}

function isStoredAdminSession() {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(adminSessionStorageKey) === "true";
  } catch {
    return false;
  }
}

function nextId(items: Array<{ id: number }>) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function splitMultilineText(value: string) {
  return value
    .split("\n")
    .map((line) => line.replace(/^(?:[-*•])\s+/, "").trim())
    .filter(Boolean);
}

function joinMultilineText(value?: string[]) {
  return value?.join("\n") ?? "";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function textToAdminContentHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;

  const blocks: string[] = [];
  const paragraphLines: string[] = [];
  const listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;

    blocks.push(`<p>${paragraphLines.map(escapeHtml).join("<br />")}</p>`);
    paragraphLines.length = 0;
  };

  const flushList = () => {
    if (!listItems.length) return;

    blocks.push(["<ul>", ...listItems.map((item) => `<li>${escapeHtml(item)}</li>`), "</ul>"].join("\n"));
    listItems.length = 0;
  };

  for (const rawLine of trimmed.split("\n")) {
    const line = rawLine.trim();
    const listItem = line.match(/^(?:[-*•])\s+(.+)$/);

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (listItem) {
      flushParagraph();
      listItems.push(listItem[1].trim());
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks.join("\n");
}

function isGeneratedAdminContentHtml(value: string) {
  return (
    value.includes("Nội dung chi tiết cho bài viết") ||
    value.includes("Kiểm tra lại nội dung trước khi chuyển trạng thái sang Đã đăng")
  );
}

function createDefaultAdminContentHtml(item: Pick<AdminContent, "excerpt" | "title" | "type">) {
  const intro = item.excerpt || `Nội dung chi tiết cho bài viết "${item.title}" sẽ được cập nhật bởi bộ phận tuyển dụng.`;

  return [
    `<p>${escapeHtml(intro)}</p>`,
    "<h2>Thông tin nổi bật</h2>",
    `<p>${escapeHtml(item.type)} này được dùng để truyền tải thông tin tuyển dụng, hoạt động nội bộ và các cập nhật quan trọng tới ứng viên.</p>`,
    "<ul>",
    "<li>Cập nhật bối cảnh, mục tiêu và thông tin cần chú ý.</li>",
    "<li>Bổ sung hình ảnh, đường dẫn hoặc lời kêu gọi hành động khi cần.</li>",
    "<li>Kiểm tra lại nội dung trước khi chuyển trạng thái sang Đã đăng.</li>",
    "</ul>",
  ].join("\n");
}

function getAdminContentSlug(item: Pick<AdminContent, "href">, resource: "news" | "event") {
  const prefix = resource === "news" ? "/tin-tuc/" : "/su-kien-khao-sat/";

  return item.href.startsWith(prefix) ? item.href.slice(prefix.length) : item.href.replace(/^\//, "");
}

function getPublicAdminContentHtml(item: AdminContent, resource: "news" | "event") {
  const slug = getAdminContentSlug(item, resource);

  if (resource === "news") {
    return getFptNewsArticleAdminContentHtml(slug);
  }

  return getFptSurveyEventBySlug(slug)?.contentHtml?.trim() ?? "";
}

function getAdminContentExample(resource: "news" | "event", title: string) {
  const heading = title.trim() || (resource === "news" ? "Tiêu đề bài viết" : "Tên sự kiện tuyển dụng");

  if (resource === "event") {
    return [
      `<h2>${escapeHtml(heading)}</h2>`,
      "<p>Giới thiệu ngắn về sự kiện, đối tượng tham gia và lý do ứng viên nên đăng ký.</p>",
      "<h2>Thông tin chương trình</h2>",
      "<ul>",
      "<li>Thời gian: cập nhật ngày giờ tổ chức.</li>",
      "<li>Địa điểm hoặc hình thức tham gia: online/offline.</li>",
      "<li>Đối tượng phù hợp: sinh viên, fresher hoặc ứng viên có kinh nghiệm.</li>",
      "</ul>",
      "<h2>Quyền lợi khi tham gia</h2>",
      "<p>Ứng viên được tư vấn lộ trình nghề nghiệp, gặp gỡ đội ngũ tuyển dụng và nhận thông tin vị trí phù hợp.</p>",
      "<h2>Cách đăng ký</h2>",
      "<p>Điền form bên dưới để bộ phận tuyển dụng liên hệ và xác nhận thông tin.</p>",
    ].join("\n");
  }

  return [
    `<h2>${escapeHtml(heading)}</h2>`,
    "<p>Viết đoạn mở đầu tóm tắt bối cảnh, vấn đề chính và giá trị bài viết mang lại cho ứng viên.</p>",
    "<h2>Mục lục</h2>",
    "<ul>",
    "<li>Ý chính thứ nhất của bài viết.</li>",
    "<li>Ý chính thứ hai của bài viết.</li>",
    "<li>Cơ hội hoặc lời khuyên dành cho ứng viên.</li>",
    "</ul>",
    "<h2>Thông tin nổi bật</h2>",
    "<p>Triển khai nội dung chi tiết, có thể thêm ví dụ, số liệu hoặc câu chuyện thực tế.</p>",
    "<h2>Cơ hội dành cho ứng viên</h2>",
    "<p>Kết bài bằng lời khuyên, lời kêu gọi hành động hoặc đường dẫn tới vị trí tuyển dụng liên quan.</p>",
  ].join("\n");
}

function hydrateAdminContentDetails(items: AdminContent[], resource: "news" | "event") {
  return items.map((item) => {
    const contentHtml = getPublicAdminContentHtml(item, resource) || item.contentHtml?.trim() || createDefaultAdminContentHtml(item);

    return {
      ...item,
      contentHtml,
    };
  });
}

function ensureContentDetails(items: AdminContent[]) {
  return items.map((item) => ({
    ...item,
    contentHtml: item.contentHtml?.trim() || createDefaultAdminContentHtml(item),
  }));
}

function formatPercent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function useAdminPagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const from = items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, items.length);
  const pageItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    currentPage,
    from,
    pageItems,
    setPage: (nextPage: number) => setPage(Math.min(Math.max(nextPage, 1), totalPages)),
    to,
    totalPages,
  };
}

function getPaginationPages(currentPage: number, totalPages: number) {
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

  return pages;
}

function resourceLabel(resource: ResourceKind) {
  if (resource === "job") return "việc làm";
  if (resource === "news") return "tin tức";

  return "sự kiện";
}

export function FptAdminPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState(defaultAdminEmail);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setLoggingIn] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [jobs, setJobs] = useState(initialJobs);
  const [jobFilterOptions, setJobFilterOptions] = useState<FptJobFilterOptions>(initialJobFilterOptions);
  const [newsItems, setNewsItems] = useState<AdminContent[]>(initialNews);
  const [eventItems, setEventItems] = useState<AdminContent[]>(initialEvents);
  const [applications, setApplications] = useState(initialApplications);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [previewContent, setPreviewContent] = useState<{ resource: "news" | "event"; item: AdminContent } | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<AdminApplication | null>(null);
  const [jobDraft, setJobDraft] = useState<AdminJob>(emptyJobDraft);
  const [contentDraft, setContentDraft] = useState<AdminContent>(emptyContentDraft);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({ adminEmail: defaultAdminEmail, notificationEmails: "" });
  const [adminEmailDraft, setAdminEmailDraft] = useState(defaultAdminEmail);
  const [settingsDraft, setSettingsDraft] = useState("");
  const [settingsPasswordDraft, setSettingsPasswordDraft] = useState<AdminPasswordDraft>({
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
  });
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsMessageTone, setSettingsMessageTone] = useState<"error" | "success">("success");
  const [isSavingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    let isActive = true;

    const syncApplications = () => {
      const storedApplications = readStoredApplications();
      setApplications(mergeApplications(initialApplications, storedApplications));

      fetchBackendApplications()
        .then((backendApplications) => {
          if (!isActive) return;
          writeStoredApplications(backendApplications);
          setApplications(backendApplications);
        })
        .catch((error) => {
          console.error("Failed to load backend applications", error);
        });
    };

    const timer = window.setTimeout(() => {
      setAuthenticated(isStoredAdminSession());
      setJobs(readStoredArray(adminJobsStorageKey, initialJobs));
      setJobFilterOptions(readStoredJobFilterOptions());
      setNewsItems(ensureContentDetails(readStoredArray(adminNewsStorageKey, initialNews, { version: adminNewsSeedVersion, versionKey: adminNewsSeedVersionKey })));
      setEventItems(
        ensureContentDetails(readStoredArray(adminEventsStorageKey, initialEvents, { version: adminEventsSeedVersion, versionKey: adminEventsSeedVersionKey })),
      );
      syncApplications();
      fetchAdminSettings()
        .then((settings) => {
          if (!isActive) return;
          setAdminSettings(settings);
          setAdminEmailDraft(settings.adminEmail);
          setLoginEmail(settings.adminEmail);
          setSettingsDraft(settings.notificationEmails);
        })
        .catch((error) => {
          console.error("Failed to load admin settings", error);
        });
      setHasMounted(true);
    }, 0);

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== adminApplicationsStorageKey) return;
      syncApplications();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredApplications = useMemo(
    () =>
      applications.filter((application) => {
        const text = `${application.fullName} ${application.email} ${application.jobTitle} ${application.location}`.toLowerCase();
        const matchesQuery = normalizedQuery ? text.includes(normalizedQuery) : true;
        const matchesStatus = statusFilter === "all" ? true : application.status === statusFilter;

        return matchesQuery && matchesStatus;
      }),
    [applications, normalizedQuery, statusFilter],
  );
  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const text = `${job.title} ${job.department} ${job.location} ${job.owner}`.toLowerCase();

        return normalizedQuery ? text.includes(normalizedQuery) : true;
      }),
    [jobs, normalizedQuery],
  );
  const filteredNews = useMemo(() => filterContent(newsItems, normalizedQuery), [newsItems, normalizedQuery]);
  const filteredEvents = useMemo(() => filterContent(eventItems, normalizedQuery), [eventItems, normalizedQuery]);
  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const newApplications = applications.filter((application) => application.status === "new").length;
  const hiredCount = applications.filter((application) => application.status === "hired").length;
  const totalApplications = applications.length;
  const publishedContent = [...newsItems, ...eventItems].filter((item) => item.status === "published").length;
  const pipelineItems = (Object.keys(statusLabels) as ApplicationStatus[]).map((status) => ({
    status,
    count: applications.filter((application) => application.status === status).length,
  }));

  function persistJobs(nextJobs: AdminJob[]) {
    setJobs(nextJobs);
    writeStoredArray(adminJobsStorageKey, nextJobs);
  }

  function persistNews(nextNews: AdminContent[]) {
    setNewsItems(nextNews);
    writeStoredArray(adminNewsStorageKey, nextNews);
  }

  function persistEvents(nextEvents: AdminContent[]) {
    setEventItems(nextEvents);
    writeStoredArray(adminEventsStorageKey, nextEvents);
  }

  function persistJobFilterOptions(nextOptions: FptJobFilterOptions) {
    setJobFilterOptions(nextOptions);
    writeStoredJobFilterOptions(nextOptions);
  }

  function persistApplications(nextApplications: AdminApplication[]) {
    setApplications(nextApplications);
    writeStoredApplications(nextApplications);
  }

  async function saveAdminSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSettings(true);
    setSettingsMessage("");

    try {
      const nextSettings = await saveAdminSettingsRequest({
        adminEmail: adminEmailDraft,
        confirmPassword: settingsPasswordDraft.confirmPassword,
        currentPassword: settingsPasswordDraft.currentPassword,
        newPassword: settingsPasswordDraft.newPassword,
        notificationEmails: settingsDraft,
      });

      setAdminSettings(nextSettings);
      setAdminEmailDraft(nextSettings.adminEmail);
      setLoginEmail(nextSettings.adminEmail);
      setSettingsDraft(nextSettings.notificationEmails);
      setSettingsPasswordDraft({
        confirmPassword: "",
        currentPassword: "",
        newPassword: "",
      });
      setSettingsMessageTone("success");
      setSettingsMessage("Đã lưu cài đặt admin.");
    } catch (error) {
      setSettingsMessageTone("error");
      setSettingsMessage(error instanceof Error ? error.message : "Không thể lưu cài đặt admin.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError("");

    try {
      const admin = await loginAdminRequest(loginEmail, loginPassword);
      window.localStorage.setItem(adminSessionStorageKey, "true");
      setLoginEmail(admin.email);
      setLoginError("");
      setAuthenticated(true);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Email hoặc mật khẩu admin chưa đúng.");
    } finally {
      setLoggingIn(false);
    }
  }

  function logout() {
    window.localStorage.removeItem(adminSessionStorageKey);
    setAuthenticated(false);
    setLoginPassword("");
    setActiveView("overview");
  }

  function openCreate(resource: ResourceKind) {
    setModal({ mode: "create", resource });
    setJobDraft(emptyJobDraft);
    setContentDraft({
      ...emptyContentDraft,
      type: resource === "event" ? "Sự kiện tuyển dụng" : "News",
      image:
        resource === "event"
          ? "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3265.png"
          : emptyContentDraft.image,
      contentHtml: "",
    });
  }

function openEditJob(job: AdminJob) {
    const detailCopy = getEffectiveJobDetailCopy(job);

    setJobDraft({
      ...job,
      benefits: job.benefits?.length ? job.benefits : detailCopy.benefits,
      branchIntro: job.branchIntro?.length ? job.branchIntro : detailCopy.branchIntro,
      branchName: job.branchName?.trim() || detailCopy.branchName,
      contactEmail: job.contactEmail?.trim() || detailCopy.contactEmail,
      contactName: job.contactName?.trim() || detailCopy.contactName,
      contactPhone: job.contactPhone?.trim() || detailCopy.contactPhone,
      landline: job.landline?.trim() || detailCopy.landline,
      position: job.position ?? jobFilterOptions.positions[0] ?? "Nhân viên",
      quantity: job.quantity?.trim() || detailCopy.quantity,
      requirements: job.requirements?.length ? job.requirements : detailCopy.requirements,
      responsibilities: job.responsibilities?.length ? job.responsibilities : detailCopy.responsibilities,
      tags: job.tags?.length ? job.tags : detailCopy.tags,
      unit: job.unit?.trim() || detailCopy.unit,
      workplace: job.workplace?.trim() || detailCopy.workplace,
    });
    setModal({ mode: "edit", resource: "job", item: job });
  }

  function openEditContent(resource: "news" | "event", item: AdminContent) {
    setContentDraft({
      ...item,
      contentHtml: item.contentHtml?.trim() || createDefaultAdminContentHtml(item),
    });
    setModal({ mode: "edit", resource, item });
  }

  function updateApplicationStatus(applicationId: number, status: ApplicationStatus) {
    persistApplications(applications.map((application) => (application.id === applicationId ? { ...application, status } : application)));

    if (applicationId > 1_000_000_000_000) {
      return;
    }

    void (async () => {
      const response = await fetch(`${apiBaseUrl}/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: adminToBackendApplicationStatus[status],
        }),
      });
      const data = await parseJson<BackendApplicationResponse>(response);

      if (!response.ok) {
        throw new Error(data.error?.message ?? "Không thể cập nhật trạng thái hồ sơ.");
      }

      if (data.data) {
        const updatedApplication = mapBackendApplication(data.data);
        setApplications((currentApplications) =>
          currentApplications.map((application) =>
            application.id === applicationId ? updatedApplication : application,
          ),
        );
      }
    })().catch((error) => {
      console.error("Failed to update backend application status", error);
    });
  }

  function updateJobStatus(jobId: number, status: JobStatus) {
    persistJobs(jobs.map((job) => (job.id === jobId ? { ...job, status } : job)));
  }

  function deleteJob(jobId: number) {
    if (!window.confirm("Xóa việc làm này khỏi admin?")) return;
    persistJobs(jobs.filter((job) => job.id !== jobId));
  }

  function deleteContent(resource: "news" | "event", itemId: number) {
    if (!window.confirm(`Xóa ${resourceLabel(resource)} này khỏi admin?`)) return;

    if (resource === "news") {
      persistNews(newsItems.filter((item) => item.id !== itemId));
      return;
    }

    persistEvents(eventItems.filter((item) => item.id !== itemId));
  }

  function saveJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = slugify(jobDraft.title);
    const normalizedJob = {
      ...jobDraft,
      benefits: jobDraft.benefits?.map((item) => item.trim()).filter(Boolean),
      branchIntro: jobDraft.branchIntro?.map((item) => item.trim()).filter(Boolean),
      contactEmail: jobDraft.contactEmail?.trim(),
      contactName: jobDraft.contactName?.trim(),
      contactPhone: jobDraft.contactPhone?.trim(),
      department: jobDraft.department.trim(),
      employmentType: jobDraft.employmentType.trim(),
      title: jobDraft.title.trim(),
      location: jobDraft.location.trim(),
      position: jobDraft.position?.trim(),
      requirements: jobDraft.requirements?.map((item) => item.trim()).filter(Boolean),
      responsibilities: jobDraft.responsibilities?.map((item) => item.trim()).filter(Boolean),
      href: jobDraft.href.trim() || `/${slug}-${jobDraft.id || nextId(jobs)}`,
      landline: jobDraft.landline?.trim(),
      quantity: jobDraft.quantity?.trim(),
      tags: jobDraft.tags?.map((item) => item.trim()).filter(Boolean),
      unit: jobDraft.unit?.trim(),
      workplace: jobDraft.workplace?.trim(),
    };

    if (!normalizedJob.title) return;

    if (modal?.mode === "edit" && modal.resource === "job") {
      persistJobs(jobs.map((job) => (job.id === modal.item.id ? { ...normalizedJob, id: modal.item.id } : job)));
    } else {
      const id = nextId(jobs);
      persistJobs([{ ...normalizedJob, id, href: normalizedJob.href || `/${slug}-${id}` }, ...jobs]);
      setActiveView("jobs");
    }

    setModal(null);
  }

  function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal || modal.resource === "job") return;
    const resource = modal.resource;
    const items = resource === "news" ? newsItems : eventItems;
    const id = modal.mode === "edit" ? modal.item.id : nextId(items);
    const pathPrefix = resource === "news" ? "/tin-tuc" : "/su-kien-khao-sat";
    const normalizedContent = {
      ...contentDraft,
      id,
      excerpt: contentDraft.excerpt.trim(),
      title: contentDraft.title.trim(),
      href: contentDraft.href.trim() || `${pathPrefix}/${slugify(contentDraft.title)}-${id}`,
    };

    if (!normalizedContent.title) return;
    normalizedContent.contentHtml =
      textToAdminContentHtml(contentDraft.contentHtml ?? "") || createDefaultAdminContentHtml(normalizedContent);

    if (resource === "news") {
      persistNews(modal.mode === "edit" ? newsItems.map((item) => (item.id === id ? normalizedContent : item)) : [normalizedContent, ...newsItems]);
      setActiveView("news");
    } else {
      persistEvents(modal.mode === "edit" ? eventItems.map((item) => (item.id === id ? normalizedContent : item)) : [normalizedContent, ...eventItems]);
      setActiveView("events");
    }

    setModal(null);
  }

  if (!hasMounted) {
    return (
      <div className="fpt-admin-login-page">
        <section className="fpt-admin-login-card" aria-busy="true">
          <Link className="fpt-admin-login-logo" href="/">
            <Image src={assets.logo} alt="FPT Telecom" width={139} height={46} priority />
          </Link>
          <div>
            <span>Admin Access</span>
            <h1>Đang tải trang quản trị</h1>
            <p>Đang kiểm tra phiên đăng nhập admin.</p>
          </div>
        </section>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fpt-admin-login-page">
        <section className="fpt-admin-login-card" aria-labelledby="admin-login-title">
          <Link className="fpt-admin-login-logo" href="/">
            <Image src={assets.logo} alt="FPT Telecom" width={139} height={46} priority />
          </Link>
          <div>
            <span>Admin Access</span>
            <h1 id="admin-login-title">Đăng nhập quản trị</h1>
            <p>Chỉ tài khoản admin mới được truy cập trang quản lý việc làm, tin tức và sự kiện.</p>
          </div>
          <form className="fpt-admin-login-form" onSubmit={login}>
            <label>
              Email admin
              <input value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} type="email" autoComplete="username" />
            </label>
            <label>
              Mật khẩu
              <input
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="Nhập mật khẩu admin"
              />
            </label>
            {loginError ? <p className="fpt-admin-login-error">{loginError}</p> : null}
            <button className="fpt-admin-primary" disabled={isLoggingIn} type="submit">
              <LockKeyhole size={17} aria-hidden="true" />
              {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập admin"}
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="fpt-admin-page">
      <aside className="fpt-admin-sidebar">
        <Link className="fpt-admin-brand" href="/">
          <Image src={assets.logo} alt="FPT Telecom" width={139} height={46} priority />
        </Link>
        <nav className="fpt-admin-nav" aria-label="Admin">
          {navItems.map((item) => (
            <button
              className={cn(activeView === item.id && "is-active")}
              type="button"
              onClick={() => setActiveView(item.id)}
              key={item.id}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="fpt-admin-sidebar-note">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>
            <strong>Admin Workspace</strong>
            <small>Quản trị tuyển dụng FTEL</small>
          </span>
        </div>
      </aside>

      <main className="fpt-admin-main">
        <header className="fpt-admin-topbar">
          <div>
            <span className="fpt-admin-eyebrow">FPT Jobs Admin</span>
            <h1>Quản trị tuyển dụng</h1>
          </div>
          <div className="fpt-admin-actions">
            <label className="fpt-admin-search">
              <Search size={16} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm ứng viên, job, tin tức..." />
            </label>
            <button className="fpt-admin-icon-button" type="button" aria-label="Thông báo">
              <Bell size={18} aria-hidden="true" />
            </button>
            {activeView === "jobs" || activeView === "news" || activeView === "events" ? (
              <button className="fpt-admin-primary" type="button" onClick={() => openCreate(activeView === "news" ? "news" : activeView === "events" ? "event" : "job")}>
                <Plus size={17} aria-hidden="true" />
                Tạo mới
              </button>
            ) : null}
            <button className="fpt-admin-secondary" type="button" onClick={logout}>
              <LogOut size={16} aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        </header>

        <section className="fpt-admin-stats" aria-label="Recruitment stats">
          <StatCard icon={<BriefcaseBusiness size={18} aria-hidden="true" />} tone="blue" label="Việc đang mở" value={activeJobs} />
          <StatCard icon={<FileText size={18} aria-hidden="true" />} tone="pink" label="Hồ sơ mới" value={newApplications} />
          <StatCard icon={<Newspaper size={18} aria-hidden="true" />} tone="orange" label="Tin/sự kiện đã đăng" value={publishedContent} />
          <StatCard icon={<CheckCircle2 size={18} aria-hidden="true" />} tone="green" label="Đã nhận việc" value={`${formatPercent(hiredCount, totalApplications)}%`} />
        </section>

        {activeView === "overview" ? (
          <section className="fpt-admin-panel fpt-admin-pipeline">
            <PanelHead eyebrow="Pipeline" title="Trạng thái hồ sơ" icon={<Sparkles size={19} aria-hidden="true" />} />
            <div className="fpt-admin-pipeline-list">
              {pipelineItems.map((item) => (
                <div className="fpt-admin-pipeline-row" key={item.status}>
                  <span>{statusLabels[item.status]}</span>
                  <meter value={item.count} max={Math.max(totalApplications, 1)} />
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {(activeView === "overview" || activeView === "candidates") ? (
          <CandidatesPanel
            applications={filteredApplications}
            openApplicationDetail={setSelectedApplication}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            updateApplicationStatus={updateApplicationStatus}
          />
        ) : null}

        {(activeView === "overview" || activeView === "jobs") ? (
          <JobsPanel jobs={filteredJobs} openCreate={() => openCreate("job")} openEdit={openEditJob} deleteJob={deleteJob} updateJobStatus={updateJobStatus} />
        ) : null}

        {activeView === "filters" ? (
          <FilterOptionsPanel options={jobFilterOptions} persistOptions={persistJobFilterOptions} />
        ) : null}

        {activeView === "news" ? (
          <ContentPanel
            resource="news"
            items={filteredNews}
            title="Quản lý tin tức"
            openCreate={() => openCreate("news")}
            openEdit={(item) => openEditContent("news", item)}
            openPreview={(item) => setPreviewContent({ resource: "news", item })}
            deleteContent={(id) => deleteContent("news", id)}
          />
        ) : null}

        {activeView === "events" ? (
          <ContentPanel
            resource="event"
            items={filteredEvents}
            title="Quản lý sự kiện"
            openCreate={() => openCreate("event")}
            openEdit={(item) => openEditContent("event", item)}
            openPreview={(item) => setPreviewContent({ resource: "event", item })}
            deleteContent={(id) => deleteContent("event", id)}
          />
        ) : null}

        {activeView === "settings" ? (
          <AdminSettingsPanel
            adminEmailDraft={adminEmailDraft}
            currentSettings={adminSettings}
            draft={settingsDraft}
            isSaving={isSavingSettings}
            message={settingsMessage}
            messageTone={settingsMessageTone}
            onAdminEmailDraftChange={setAdminEmailDraft}
            onDraftChange={setSettingsDraft}
            onPasswordDraftChange={setSettingsPasswordDraft}
            onSubmit={saveAdminSettings}
            passwordDraft={settingsPasswordDraft}
          />
        ) : null}

      </main>

      {modal ? (
        <div className="fpt-admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
          <div className="fpt-admin-modal-card">
            <header>
              <div>
                <span>{modal.mode === "edit" ? "Cập nhật" : "Tạo mới"}</span>
                <h2 id="admin-modal-title">
                  {modal.mode === "edit" ? "Sửa" : "Tạo"} {resourceLabel(modal.resource)}
                </h2>
              </div>
              <button type="button" onClick={() => setModal(null)} aria-label="Đóng">
                <X size={20} aria-hidden="true" />
              </button>
            </header>
            {modal.resource === "job" ? (
              <JobForm draft={jobDraft} filterOptions={jobFilterOptions} setDraft={setJobDraft} onSubmit={saveJob} onCancel={() => setModal(null)} />
            ) : (
              <ContentForm
                resource={modal.resource}
                draft={contentDraft}
                setDraft={setContentDraft}
                onSubmit={saveContent}
                onCancel={() => setModal(null)}
              />
            )}
          </div>
        </div>
      ) : null}
      {previewContent ? (
        <ContentPreviewModal item={previewContent.item} resource={previewContent.resource} onClose={() => setPreviewContent(null)} />
      ) : null}
      {selectedApplication ? (
        <ApplicationDetailModal application={selectedApplication} onClose={() => setSelectedApplication(null)} />
      ) : null}
    </div>
  );
}

function filterContent(items: AdminContent[], normalizedQuery: string) {
  return items.filter((item) => {
    const text = `${item.title} ${item.type} ${item.date} ${item.excerpt} ${item.contentHtml ?? ""}`.toLowerCase();

    return normalizedQuery ? text.includes(normalizedQuery) : true;
  });
}

function StatCard({ icon, label, tone, value }: { icon: React.ReactNode; label: string; tone: string; value: number | string }) {
  return (
    <article>
      <span className={`tone-${tone}`}>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function PanelHead({ eyebrow, icon, title }: { eyebrow: string; icon: React.ReactNode; title: string }) {
  return (
    <div className="fpt-admin-panel-head">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {icon}
    </div>
  );
}

function AdminSettingsPanel({
  adminEmailDraft,
  currentSettings,
  draft,
  isSaving,
  message,
  messageTone,
  onAdminEmailDraftChange,
  onDraftChange,
  onPasswordDraftChange,
  onSubmit,
  passwordDraft,
}: {
  adminEmailDraft: string;
  currentSettings: AdminSettings;
  draft: string;
  isSaving: boolean;
  message: string;
  messageTone: "error" | "success";
  onAdminEmailDraftChange: (value: string) => void;
  onDraftChange: (value: string) => void;
  onPasswordDraftChange: (value: AdminPasswordDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  passwordDraft: AdminPasswordDraft;
}) {
  const activeEmails = currentSettings.notificationEmails
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean);

  return (
    <section className="fpt-admin-panel">
      <PanelHead eyebrow="Tài khoản & thông báo" title="Cài đặt admin" icon={<Settings size={19} aria-hidden="true" />} />
      <form className="fpt-admin-create-form fpt-admin-settings-form" onSubmit={onSubmit}>
        <label>
          Email đăng nhập admin
          <input
            value={adminEmailDraft}
            onChange={(event) => onAdminEmailDraftChange(event.target.value)}
            type="email"
            autoComplete="username"
            placeholder="admin@fptjobs.com"
          />
        </label>
        <label>
          Mật khẩu hiện tại
          <input
            value={passwordDraft.currentPassword}
            onChange={(event) =>
              onPasswordDraftChange({
                ...passwordDraft,
                currentPassword: event.target.value,
              })
            }
            type="password"
            autoComplete="current-password"
            placeholder="Nhập khi muốn đổi email/mật khẩu admin"
          />
        </label>
        <label>
          Mật khẩu mới
          <input
            value={passwordDraft.newPassword}
            onChange={(event) =>
              onPasswordDraftChange({
                ...passwordDraft,
                newPassword: event.target.value,
              })
            }
            type="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
          />
        </label>
        <label>
          Nhập lại mật khẩu mới
          <input
            value={passwordDraft.confirmPassword}
            onChange={(event) =>
              onPasswordDraftChange({
                ...passwordDraft,
                confirmPassword: event.target.value,
              })
            }
            type="password"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu mới"
          />
          <small className="fpt-admin-field-help">
            Nếu chỉ đổi email nhận hồ sơ bên dưới thì không cần nhập mật khẩu hiện tại.
          </small>
        </label>
        <label>
          Email nhận thông báo khi có hồ sơ mới
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="mail1@gmail.com, mail2@gmail.com"
            rows={4}
          />
          <small className="fpt-admin-field-help">
            Nhập một hoặc nhiều email, phân tách bằng dấu phẩy hoặc dấu chấm phẩy. Nếu bỏ trống, backend sẽ dùng email trong file .env.
          </small>
        </label>
        <div className="fpt-admin-settings-current">
          <span>Admin đang dùng</span>
          <strong>{currentSettings.adminEmail}</strong>
          <span>Email nhận hồ sơ</span>
          <strong>{activeEmails.length > 0 ? activeEmails.join(", ") : "Email trong backend/.env"}</strong>
        </div>
        {message ? <p className={`fpt-admin-settings-message ${messageTone === "error" ? "is-error" : "is-success"}`}>{message}</p> : null}
        <footer>
          <button className="fpt-admin-primary" disabled={isSaving} type="submit">
            <Settings size={16} aria-hidden="true" />
            {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
          </button>
        </footer>
      </form>
    </section>
  );
}

function CandidatesPanel({
  applications,
  openApplicationDetail,
  setStatusFilter,
  statusFilter,
  updateApplicationStatus,
}: {
  applications: AdminApplication[];
  openApplicationDetail: (application: AdminApplication) => void;
  setStatusFilter: (status: ApplicationStatus | "all") => void;
  statusFilter: ApplicationStatus | "all";
  updateApplicationStatus: (applicationId: number, status: ApplicationStatus) => void;
}) {
  const pagination = useAdminPagination(applications, adminCandidatesPageSize);

  return (
    <section className="fpt-admin-panel fpt-admin-table-panel">
      <div className="fpt-admin-panel-head">
        <div>
          <span>{applications.length} hồ sơ</span>
          <h2>Danh sách ứng viên</h2>
        </div>
        <label className="fpt-admin-filter">
          <Filter size={15} aria-hidden="true" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ApplicationStatus | "all")}>
            <option value="all">Tất cả trạng thái</option>
            {(Object.keys(statusLabels) as ApplicationStatus[]).map((status) => (
              <option value={status} key={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
          <ChevronDown size={15} aria-hidden="true" />
        </label>
      </div>
      <div className="fpt-admin-table-wrap">
        <table className="fpt-admin-table">
          <thead>
            <tr>
              <th>Ứng viên</th>
              <th>Vị trí</th>
              <th>Nguồn</th>
              <th>Trạng thái</th>
              <th>Ngày nộp</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {pagination.pageItems.map((application) => (
              <tr key={application.id}>
                <td>
                  <div className="fpt-admin-candidate">
                    <Image src={assets.avatar} alt="" width={34} height={34} />
                    <span>
                      <strong>{application.fullName}</strong>
                      <small>{application.email}</small>
                      <small>{application.phone}</small>
                      {application.cvName ? (
                        <small>
                          CV:{" "}
                          {getApplicationCvHref(application.cvName) ? (
                            <a href={getApplicationCvHref(application.cvName)} rel="noreferrer" target="_blank">
                              {getApplicationCvLabel(application.cvName)}
                            </a>
                          ) : (
                            getApplicationCvLabel(application.cvName)
                          )}
                        </small>
                      ) : null}
                    </span>
                  </div>
                </td>
                <td>
                  <strong>{application.jobTitle}</strong>
                  <small className="fpt-admin-muted">
                    <MapPin size={13} aria-hidden="true" />
                    {application.location}
                  </small>
                </td>
                <td>{application.source}</td>
                <td>
                  <select
                    className={cn("fpt-admin-status-select", `status-${application.status}`)}
                    value={application.status}
                    onChange={(event) => updateApplicationStatus(application.id, event.target.value as ApplicationStatus)}
                  >
                    {(Object.keys(statusLabels) as ApplicationStatus[]).map((status) => (
                      <option value={status} key={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{application.appliedAt}</td>
                <td>
                  <div className="fpt-admin-row-actions">
                    <button type="button" onClick={() => openApplicationDetail(application)} aria-label={`Xem chi tiết hồ sơ ${application.fullName}`}>
                      <Eye size={16} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pagination.pageItems.length === 0 ? (
              <tr>
                <td colSpan={6}>Không có hồ sơ phù hợp.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <AdminPagination
        currentPage={pagination.currentPage}
        from={pagination.from}
        label="hồ sơ"
        onPageChange={pagination.setPage}
        to={pagination.to}
        total={applications.length}
        totalPages={pagination.totalPages}
      />
    </section>
  );
}

function JobsPanel({
  deleteJob,
  jobs,
  openCreate,
  openEdit,
  updateJobStatus,
}: {
  deleteJob: (jobId: number) => void;
  jobs: AdminJob[];
  openCreate: () => void;
  openEdit: (job: AdminJob) => void;
  updateJobStatus: (jobId: number, status: JobStatus) => void;
}) {
  const pagination = useAdminPagination(jobs, adminJobsPageSize);

  return (
    <section className="fpt-admin-panel fpt-admin-table-panel">
      <div className="fpt-admin-panel-head">
        <div>
          <span>{jobs.length} tin</span>
          <h2>Quản lý việc làm</h2>
        </div>
        <button className="fpt-admin-secondary" type="button" onClick={openCreate}>
          <Plus size={16} aria-hidden="true" />
          Thêm việc làm
        </button>
      </div>
      <div className="fpt-admin-job-grid">
        {pagination.pageItems.map((job) => (
          <article className="fpt-admin-job-card" key={job.id}>
            <div>
              <span className={cn("fpt-admin-job-state", `state-${job.status}`)}>{jobStatusLabels[job.status]}</span>
              {job.hot ? <span className="fpt-admin-hot">HOT</span> : null}
            </div>
            <h3>{job.title}</h3>
            <dl>
              <div>
                <dt>Ngành</dt>
                <dd>{job.department}</dd>
              </div>
              <div>
                <dt>Khu vực</dt>
                <dd>{job.location}</dd>
              </div>
              <div>
                <dt>Hồ sơ</dt>
                <dd>{job.applications}</dd>
              </div>
              <div>
                <dt>Hạn nộp</dt>
                <dd>{job.deadline}</dd>
              </div>
            </dl>
            <footer>
              <select value={job.status} onChange={(event) => updateJobStatus(job.id, event.target.value as JobStatus)}>
                {(Object.keys(jobStatusLabels) as JobStatus[]).map((status) => (
                  <option value={status} key={status}>
                    {jobStatusLabels[status]}
                  </option>
                ))}
              </select>
              <div className="fpt-admin-row-actions">
                <Link href={job.href} aria-label="Xem việc làm">
                  <Eye size={16} aria-hidden="true" />
                </Link>
                <button type="button" onClick={() => openEdit(job)} aria-label="Sửa việc làm">
                  <Edit3 size={16} aria-hidden="true" />
                </button>
                <button className="is-danger" type="button" onClick={() => deleteJob(job.id)} aria-label="Xóa việc làm">
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </footer>
          </article>
        ))}
      </div>
      {pagination.pageItems.length === 0 ? <p className="fpt-admin-empty">Không có việc làm phù hợp.</p> : null}
      <AdminPagination
        currentPage={pagination.currentPage}
        from={pagination.from}
        label="việc làm"
        onPageChange={pagination.setPage}
        to={pagination.to}
        total={jobs.length}
        totalPages={pagination.totalPages}
      />
    </section>
  );
}

function ContentPanel({
  deleteContent,
  items,
  openCreate,
  openEdit,
  openPreview,
  resource,
  title,
}: {
  deleteContent: (itemId: number) => void;
  items: AdminContent[];
  openCreate: () => void;
  openEdit: (item: AdminContent) => void;
  openPreview: (item: AdminContent) => void;
  resource: "news" | "event";
  title: string;
}) {
  const pagination = useAdminPagination(items, adminContentPageSize);

  return (
    <section className="fpt-admin-panel fpt-admin-table-panel">
      <div className="fpt-admin-panel-head">
        <div>
          <span>{items.length} mục</span>
          <h2>{title}</h2>
        </div>
        <button className="fpt-admin-secondary" type="button" onClick={openCreate}>
          <Plus size={16} aria-hidden="true" />
          Thêm {resourceLabel(resource)}
        </button>
      </div>
      <div className="fpt-admin-content-grid">
        {pagination.pageItems.map((item) => (
          <article className="fpt-admin-content-card" key={item.id}>
            <Image src={item.image} alt="" width={176} height={112} />
            <div>
              <div className="fpt-admin-content-meta">
                <span className={cn("fpt-admin-content-status", `status-${item.status}`)}>{contentStatusLabels[item.status]}</span>
                {item.featured ? <span className="fpt-admin-hot">Nổi bật</span> : null}
              </div>
              <h3>{item.title}</h3>
              <p>{item.excerpt}</p>
              <small>{item.date}</small>
              <footer>
                <Link href={item.href} aria-label={`Xem ${resourceLabel(resource)}`}>
                  <Eye size={16} aria-hidden="true" />
                </Link>
                <button type="button" onClick={() => openEdit(item)} aria-label={`Sửa ${resourceLabel(resource)}`}>
                  <Edit3 size={16} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => openPreview(item)} aria-label={`Xem nội dung chi tiết ${resourceLabel(resource)}`}>
                  <FileText size={16} aria-hidden="true" />
                </button>
                <button className="is-danger" type="button" onClick={() => deleteContent(item.id)} aria-label={`Xóa ${resourceLabel(resource)}`}>
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </footer>
            </div>
          </article>
        ))}
      </div>
      {pagination.pageItems.length === 0 ? <p className="fpt-admin-empty">Không có {resourceLabel(resource)} phù hợp.</p> : null}
      <AdminPagination
        currentPage={pagination.currentPage}
        from={pagination.from}
        label={resourceLabel(resource)}
        onPageChange={pagination.setPage}
        to={pagination.to}
        total={items.length}
        totalPages={pagination.totalPages}
      />
    </section>
  );
}

function ApplicationDetailModal({
  application,
  onClose,
}: {
  application: AdminApplication;
  onClose: () => void;
}) {
  const profileSnapshot = getApplicationProfileSnapshot(application);
  const resumeValue = profileSnapshot.resumeUrl || application.cvName || "";
  const resumeHref = resumeValue ? getApplicationCvHref(resumeValue) : "";

  return (
    <div className="fpt-admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-application-detail-title">
      <div className="fpt-admin-application-detail-card">
        <header>
          <div>
            <span>Chi tiết hồ sơ ứng tuyển</span>
            <h2 id="admin-application-detail-title">{application.fullName}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng chi tiết hồ sơ">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <article className="fpt-admin-application-detail-body">
          <section className="fpt-admin-application-summary">
            <div>
              <span>Vị trí ứng tuyển</span>
              <strong>{application.jobTitle}</strong>
              <small>
                <MapPin size={14} aria-hidden="true" />
                {application.location}
              </small>
            </div>
            <div>
              <span>Trạng thái</span>
              <strong>{statusLabels[application.status]}</strong>
              <small>Nộp lúc {application.appliedAt}</small>
            </div>
          </section>

          <section className="fpt-admin-application-detail-section">
            <h3>Thông tin ứng tuyển</h3>
            <dl className="fpt-admin-application-detail-list">
              <div>
                <dt>Nguồn</dt>
                <dd>{application.source}</dd>
              </div>
              <div>
                <dt>Ghi chú</dt>
                <dd className="fpt-admin-application-note">{displayAdminApplicationValue(application.note)}</dd>
              </div>
              <div>
                <dt>Bài tuyển dụng</dt>
                <dd>
                  {application.jobSlug ? (
                    <Link href={`/${application.jobSlug}`}>{application.jobSlug}</Link>
                  ) : (
                    "Chưa có"
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="fpt-admin-application-detail-section">
            <h3>Thông tin user đã nộp</h3>
            <dl className="fpt-admin-application-detail-list">
              {applicationProfileFieldLabels.map(([field, label]) => (
                <div key={field}>
                  <dt>{label}</dt>
                  <dd>{formatAdminProfileValue(field, profileSnapshot[field])}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="fpt-admin-application-detail-section">
            <h3>CV / hồ sơ đính kèm</h3>
            {resumeValue ? (
              resumeHref ? (
                <a className="fpt-admin-application-file-link" href={resumeHref} rel="noreferrer" target="_blank">
                  <FileText size={16} aria-hidden="true" />
                  {getApplicationCvLabel(resumeValue)}
                </a>
              ) : (
                <p>{getApplicationCvLabel(resumeValue)}</p>
              )
            ) : (
              <p>Chưa có CV đính kèm.</p>
            )}
          </section>
        </article>
      </div>
    </div>
  );
}

function ContentPreviewModal({
  item,
  onClose,
  resource,
}: {
  item: AdminContent;
  onClose: () => void;
  resource: "news" | "event";
}) {
  const contentHtml = item.contentHtml?.trim() || createDefaultAdminContentHtml(item);

  return (
    <div className="fpt-admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-content-preview-title">
      <div className="fpt-admin-preview-card">
        <header>
          <div>
            <span>Preview nội dung</span>
            <h2 id="admin-content-preview-title">{resourceLabel(resource)}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng preview">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <article className="fpt-admin-preview-body">
          <span className="fpt-admin-preview-tag">{item.type}</span>
          <h3>{item.title}</h3>
          <div className="fpt-admin-preview-meta">
            <span>
              <Image src={assets.avatar} alt="" width={28} height={28} />
              Cáo tuyển dụng
            </span>
            <span>
              <Clock3 size={14} aria-hidden="true" />
              {item.date}
            </span>
          </div>
          {item.image ? <Image className="fpt-admin-preview-cover" src={item.image} alt="" width={1100} height={580} /> : null}
          {item.excerpt ? <strong>{item.excerpt}</strong> : null}
          <div className="fpt-admin-preview-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </article>
      </div>
    </div>
  );
}

function AdminPagination({
  currentPage,
  from,
  label,
  onPageChange,
  to,
  total,
  totalPages,
}: {
  currentPage: number;
  from: number;
  label: string;
  onPageChange: (page: number) => void;
  to: number;
  total: number;
  totalPages: number;
}) {
  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <nav className="fpt-admin-pagination" aria-label={`Phân trang ${label}`}>
      <span>
        {total > 0 ? `Hiển thị ${from}-${to} / ${total} ${label}` : `Không có ${label}`}
      </span>
      {totalPages > 1 ? (
        <div>
          <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Trang trước">
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          {pages.map((page) =>
            typeof page === "number" ? (
              <button className={cn(currentPage === page && "is-active")} type="button" onClick={() => onPageChange(page)} key={page}>
                {page}
              </button>
            ) : (
              <span key={page}>...</span>
            ),
          )}
          <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Trang sau">
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </nav>
  );
}

function getSelectOptions(options: string[], currentValue?: string) {
  const current = currentValue?.trim();

  if (!current || options.some((option) => option.toLowerCase() === current.toLowerCase())) return options;

  return [current, ...options];
}

const filterOptionConfigs: Array<{ key: FptJobFilterKey; title: string; description: string; placeholder: string }> = [
  {
    key: "categories",
    title: "Ngành nghề",
    description: "Dùng cho dropdown Ngành nghề trong admin và bộ lọc Ngành nghề bên user.",
    placeholder: "Ví dụ: Công nghệ thông tin",
  },
  {
    key: "regions",
    title: "Khu vực/Tỉnh thành",
    description: "Dùng cho dropdown Khu vực trong admin và bộ lọc Khu vực/Tỉnh thành bên user.",
    placeholder: "Ví dụ: Hà Nội",
  },
  {
    key: "salaries",
    title: "Mức lương",
    description: "Dùng cho dropdown Mức lương trong admin và bộ lọc Mức lương bên user.",
    placeholder: "Ví dụ: 10 - 20 Triệu ₫",
  },
  {
    key: "positions",
    title: "Vị trí",
    description: "Dùng để phân loại cấp bậc như Nhân viên, Quản lý.",
    placeholder: "Ví dụ: Trưởng nhóm",
  },
  {
    key: "employments",
    title: "Loại hình công việc",
    description: "Dùng cho dropdown Loại hình trong admin và bộ lọc Loại hình công việc bên user.",
    placeholder: "Ví dụ: Remote",
  },
];

const emptyFilterDraftValues: Record<FptJobFilterKey, string> = {
  categories: "",
  employments: "",
  positions: "",
  regions: "",
  salaries: "",
};

function addFilterOption(options: FptJobFilterOptions, key: FptJobFilterKey, value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return options;

  const hasValue = options[key].some((item) => item.toLowerCase() === trimmedValue.toLowerCase());
  if (hasValue) return options;

  return {
    ...options,
    [key]: [...options[key], trimmedValue],
  };
}

function removeFilterOption(options: FptJobFilterOptions, key: FptJobFilterKey, value: string) {
  return {
    ...options,
    [key]: options[key].filter((item) => item !== value),
  };
}

function FilterOptionsPanel({
  options,
  persistOptions,
}: {
  options: FptJobFilterOptions;
  persistOptions: (options: FptJobFilterOptions) => void;
}) {
  const [draftValues, setDraftValues] = useState<Record<FptJobFilterKey, string>>(emptyFilterDraftValues);
  const totalOptions = Object.values(options).reduce((total, items) => total + items.length, 0);

  function submitOption(event: FormEvent<HTMLFormElement>, key: FptJobFilterKey) {
    event.preventDefault();
    const nextOptions = addFilterOption(options, key, draftValues[key]);

    persistOptions(nextOptions);
    setDraftValues({ ...draftValues, [key]: "" });
  }

  return (
    <section className="fpt-admin-panel fpt-admin-filter-manager">
      <div className="fpt-admin-panel-head">
        <div>
          <span>{totalOptions} lựa chọn</span>
          <h2>Quản lý bộ lọc việc làm</h2>
        </div>
      </div>
      <div className="fpt-admin-filter-manager-grid">
        {filterOptionConfigs.map((config) => (
          <article className="fpt-admin-filter-group-card" key={config.key}>
            <div>
              <h3>{config.title}</h3>
              <p>{config.description}</p>
            </div>
            <form onSubmit={(event) => submitOption(event, config.key)}>
              <input
                value={draftValues[config.key]}
                onChange={(event) => setDraftValues({ ...draftValues, [config.key]: event.target.value })}
                placeholder={config.placeholder}
              />
              <button className="fpt-admin-secondary" type="submit">
                <Plus size={15} aria-hidden="true" />
                Thêm
              </button>
            </form>
            <div className="fpt-admin-filter-chip-list">
              {options[config.key].map((item) => (
                <span key={item}>
                  {item}
                  <button
                    type="button"
                    onClick={() => persistOptions(removeFilterOption(options, config.key, item))}
                    aria-label={`Xóa ${item}`}
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function JobForm({
  draft,
  filterOptions,
  onCancel,
  onSubmit,
  setDraft,
}: {
  draft: AdminJob;
  filterOptions: FptJobFilterOptions;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setDraft: (draft: AdminJob) => void;
}) {
  return (
    <form className="fpt-admin-create-form" onSubmit={onSubmit}>
      <label>
        Tên vị trí
        <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required />
      </label>
      <div className="fpt-admin-form-row">
        <label>
          Ngành nghề
          <select value={draft.department} onChange={(event) => setDraft({ ...draft, department: event.target.value })}>
            {getSelectOptions(filterOptions.categories, draft.department).map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Khu vực
          <select value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })}>
            {getSelectOptions(filterOptions.regions, draft.location).map((region) => (
              <option value={region} key={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="fpt-admin-form-row">
        <label>
          Vị trí
          <select value={draft.position ?? ""} onChange={(event) => setDraft({ ...draft, position: event.target.value })}>
            {getSelectOptions(filterOptions.positions, draft.position).map((position) => (
              <option value={position} key={position}>
                {position}
              </option>
            ))}
          </select>
        </label>
        <label>
          Loại hình
          <select value={draft.employmentType} onChange={(event) => setDraft({ ...draft, employmentType: event.target.value })}>
            {getSelectOptions(filterOptions.employments, draft.employmentType).map((employment) => (
              <option value={employment} key={employment}>
                {employment}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="fpt-admin-form-row">
        <label>
          Hạn nộp
          <input value={draft.deadline} onChange={(event) => setDraft({ ...draft, deadline: event.target.value })} />
        </label>
      </div>
      <div className="fpt-admin-form-row">
        <label>
          Mức lương
          <select value={draft.salary} onChange={(event) => setDraft({ ...draft, salary: event.target.value })}>
            {getSelectOptions(filterOptions.salaries, draft.salary).map((salary) => (
              <option value={salary} key={salary}>
                {salary}
              </option>
            ))}
          </select>
        </label>
        <label>
          Link public
          <input value={draft.href} onChange={(event) => setDraft({ ...draft, href: event.target.value })} placeholder="Tự tạo nếu bỏ trống" />
        </label>
      </div>
      <div className="fpt-admin-form-row">
        <label>
          Trạng thái
          <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as JobStatus })}>
            {(Object.keys(jobStatusLabels) as JobStatus[]).map((status) => (
              <option value={status} key={status}>
                {jobStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Phụ trách
          <input value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value })} />
        </label>
      </div>
      <label className="fpt-admin-checkline">
        <input checked={draft.hot} onChange={(event) => setDraft({ ...draft, hot: event.target.checked })} type="checkbox" />
        Đánh dấu HOT
      </label>
      <h3 className="fpt-admin-form-section-title">Thông tin trang chi tiết</h3>
      <div className="fpt-admin-form-row">
        <label>
          Đơn vị
          <input value={draft.unit ?? ""} onChange={(event) => setDraft({ ...draft, unit: event.target.value })} />
        </label>
        <label>
          Số lượng tuyển
          <input value={draft.quantity ?? ""} onChange={(event) => setDraft({ ...draft, quantity: event.target.value })} />
        </label>
      </div>
      <label>
        Nơi làm việc
        <input value={draft.workplace ?? ""} onChange={(event) => setDraft({ ...draft, workplace: event.target.value })} />
      </label>
      <label>
        Chi tiết công việc
        <textarea
          value={joinMultilineText(draft.responsibilities)}
          onChange={(event) => setDraft({ ...draft, responsibilities: splitMultilineText(event.target.value) })}
          rows={5}
          placeholder={"Mỗi dòng là một ý công việc\n- Vận hành và khai thác hệ thống\n- Phối hợp xử lý sự cố"}
        />
      </label>
      <label>
        Yêu cầu công việc
        <textarea
          value={joinMultilineText(draft.requirements)}
          onChange={(event) => setDraft({ ...draft, requirements: splitMultilineText(event.target.value) })}
          rows={5}
          placeholder={"Mỗi dòng là một yêu cầu\n- Tốt nghiệp chuyên ngành phù hợp\n- Chủ động, trách nhiệm"}
        />
      </label>
      <label>
        Quyền lợi
        <textarea
          value={joinMultilineText(draft.benefits)}
          onChange={(event) => setDraft({ ...draft, benefits: splitMultilineText(event.target.value) })}
          rows={5}
          placeholder={"Mỗi dòng là một quyền lợi\n- Thu nhập cạnh tranh\n- Đầy đủ BHXH, BHYT, BHTN"}
        />
      </label>
      <div className="fpt-admin-form-row">
        <label>
          Job tags
          <textarea
            value={joinMultilineText(draft.tags)}
            onChange={(event) => setDraft({ ...draft, tags: splitMultilineText(event.target.value) })}
            rows={4}
            placeholder={"Mỗi dòng là một tag\nkinh doanh\nviễn thông"}
          />
        </label>
        <label>
          Giới thiệu đơn vị
          <textarea
            value={joinMultilineText(draft.branchIntro)}
            onChange={(event) => setDraft({ ...draft, branchIntro: splitMultilineText(event.target.value) })}
            rows={4}
            placeholder="Mỗi dòng là một đoạn giới thiệu"
          />
        </label>
      </div>
      <label>
        Tên đơn vị/chi nhánh sidebar
        <input value={draft.branchName ?? ""} onChange={(event) => setDraft({ ...draft, branchName: event.target.value })} />
      </label>
      <h3 className="fpt-admin-form-section-title">Thông tin liên hệ</h3>
      <div className="fpt-admin-form-row">
        <label>
          Người phụ trách
          <input value={draft.contactName ?? ""} onChange={(event) => setDraft({ ...draft, contactName: event.target.value })} />
        </label>
        <label>
          Email
          <input value={draft.contactEmail ?? ""} onChange={(event) => setDraft({ ...draft, contactEmail: event.target.value })} />
        </label>
      </div>
      <div className="fpt-admin-form-row">
        <label>
          SĐT di động
          <input value={draft.contactPhone ?? ""} onChange={(event) => setDraft({ ...draft, contactPhone: event.target.value })} />
        </label>
        <label>
          SĐT cố định
          <input value={draft.landline ?? ""} onChange={(event) => setDraft({ ...draft, landline: event.target.value })} />
        </label>
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}

function ContentForm({
  draft,
  onCancel,
  onSubmit,
  resource,
  setDraft,
}: {
  draft: AdminContent;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  resource: "news" | "event";
  setDraft: (draft: AdminContent) => void;
}) {
  const appendContentSnippet = (snippet: string) => {
    const current = draft.contentHtml?.trim();

    setDraft({
      ...draft,
      contentHtml: current ? `${current}\n\n${snippet}` : snippet,
    });
  };

  const useExampleContent = () => {
    const hasContent = Boolean(draft.contentHtml?.trim());

    if (hasContent && !window.confirm("Thay nội dung chi tiết hiện tại bằng mẫu ví dụ?")) return;
    setDraft({ ...draft, contentHtml: getAdminContentExample(resource, draft.title) });
  };

  return (
    <form className="fpt-admin-create-form" onSubmit={onSubmit}>
      <label>
        Tiêu đề
        <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required />
      </label>
      <div className="fpt-admin-form-row">
        <label>
          Loại
          <input value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })} />
        </label>
        <label>
          Ngày đăng
          <input value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
        </label>
      </div>
      <label>
        Ảnh thumbnail
        <input value={draft.image} onChange={(event) => setDraft({ ...draft, image: event.target.value })} />
      </label>
      <label>
        Link public
        <input value={draft.href} onChange={(event) => setDraft({ ...draft, href: event.target.value })} placeholder="Tự tạo nếu bỏ trống" />
      </label>
      <label>
        Mô tả ngắn
        <textarea value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} rows={4} />
      </label>
      <label>
        Nội dung chi tiết
        <div className="fpt-admin-editor-tools" aria-label="Công cụ soạn nội dung chi tiết">
          <button type="button" onClick={useExampleContent}>
            Dùng mẫu ví dụ
          </button>
          <button type="button" onClick={() => appendContentSnippet("<h2>Tiêu đề mục</h2>")}>
            Tiêu đề
          </button>
          <button type="button" onClick={() => appendContentSnippet("<p>Nhập nội dung đoạn văn tại đây.</p>")}>
            Đoạn văn
          </button>
          <button type="button" onClick={() => appendContentSnippet("<p><strong>Nhập nội dung nhấn mạnh tại đây.</strong></p>")}>
            Đậm
          </button>
          <button type="button" onClick={() => appendContentSnippet('<p><a href="https://example.com">Nhập nội dung link tại đây.</a></p>')}>
            Link
          </button>
          <button type="button" onClick={() => appendContentSnippet("<ul>\n<li>Ý chính thứ nhất.</li>\n<li>Ý chính thứ hai.</li>\n</ul>")}>
            Danh sách
          </button>
          <button type="button" onClick={() => appendContentSnippet('<figure><img src="/images/fptjobs/ten-anh.png" alt="Mô tả ảnh" /></figure>')}>
            Ảnh
          </button>
        </div>
        <textarea
          className="fpt-admin-content-editor"
          value={draft.contentHtml ?? ""}
          onChange={(event) => setDraft({ ...draft, contentHtml: event.target.value })}
          placeholder={"<h2>Tiêu đề mục</h2>\n<p>Nội dung bài viết hoặc sự kiện...</p>\n\n- Ý chính thứ nhất\n- Ý chính thứ hai"}
          rows={9}
        />
        <small className="fpt-admin-field-help">
          Có thể nhập HTML như h2, p, strong, a, ul, li, img; hoặc gõ mỗi dòng bắt đầu bằng -, * hay • để tự tạo danh sách dấu chấm.
        </small>
      </label>
      <div className="fpt-admin-form-row">
        <label>
          Trạng thái
          <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ContentStatus })}>
            {(Object.keys(contentStatusLabels) as ContentStatus[]).map((status) => (
              <option value={status} key={status}>
                {contentStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nhóm quản lý
          <input readOnly value={resource === "news" ? "Tin tức" : "Sự kiện"} />
        </label>
      </div>
      <label className="fpt-admin-checkline">
        <input checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} type="checkbox" />
        Đánh dấu nổi bật
      </label>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}

function FormFooter({ onCancel }: { onCancel: () => void }) {
  return (
    <footer>
      <button className="fpt-admin-secondary" type="button" onClick={onCancel}>
        Hủy
      </button>
      <button className="fpt-admin-primary" type="submit">
        <Plus size={16} aria-hidden="true" />
        Lưu
      </button>
    </footer>
  );
}
