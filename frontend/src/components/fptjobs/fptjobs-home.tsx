import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Mail,
  MapPin,
  Menu,
  Phone,
  Rocket,
  Search,
  Share2,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FptAboutSlideshow } from "@/components/fptjobs/fptjobs-about-slideshow";
import { FptBranchContactMap, type FptBranchContact } from "@/components/fptjobs/fptjobs-contact-map";
import { FptHeader } from "@/components/fptjobs/fptjobs-header";
import { FptJobQuickApplyButton } from "@/components/fptjobs/fptjobs-job-application-form";
import {
  FptCareerBoomingApplicationForm,
  FptInternshipApplicationForm,
  FptSvcntsApplicationForm,
} from "@/components/fptjobs/fptjobs-landing-application-forms-client";
import { FptNewsIndexLatestClient } from "@/components/fptjobs/fptjobs-news-index-client";
import { fptNewsArticleContentOverrides } from "@/components/fptjobs/fptjobs-news-article-html";
import { FptRecruitmentClient } from "@/components/fptjobs/fptjobs-recruitment-client";
import { FptSurveyEventForm } from "@/components/fptjobs/fptjobs-survey-event-form-client";
import type {
  BenefitCard,
  ContactItem,
  Job,
  Metric,
  ProcessStep,
  Testimonial,
} from "@/types/fptjobs";

const assets = {
  logo: "/seo/fptjobs-com-public-imgs-version2-general-fpt-telecom-ngang-logo.svg",
  footerLogo: "/seo/fptjobs-com-public-imgs-version2-general-fpt-telecom-logo-footer.svg",
  cover: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-homepage-cover.png",
  fox: "/images/fptjobs/fptjobs-com-public-imgs-version2-fox-13.png",
  hiringFox: "/images/fptjobs/fptjobs-com-public-imgs-version2-fox-10.png",
  foxFooter: "/images/fptjobs/fptjobs-com-public-imgs-version2-fox-3.png",
  detailBanner: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-eventnews-bg-breadcumb2.png",
  fab: "/images/fptjobs/fptjobs-com-public-img-popup-fab-17.png",
  listIcon: "/seo/fptjobs-com-public-imgs-version2-general-icons-icon-list.svg",
  gridIcon: "/seo/fptjobs-com-public-imgs-version2-general-icons-icon-grid-hover.svg",
  contactOffice: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-vpgd.svg",
  contactFb: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-fb.svg",
  contactTiktok: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-tik.svg",
  contactLinkedin: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-in.svg",
  contactPhone: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-phone.svg",
  contactMail: "/seo/fptjobs-com-public-imgs-version2-general-contact-ct-mail.svg",
  locationPin: "/images/fptjobs/fptjobs-com-public-img-fpt-location.png",
};

const jobs: Job[] = [
  {
    title: "Nhân viên Kinh doanh (Cầu Giấy)",
    location: "Hà Nội",
    deadline: "31/07/2026",
    salary: "8 - 20 triệu ₫",
    href: "https://fptjobs.com/nhan-vien-kinh-doanh-cau-giay-25874",
    hot: true,
  },
  {
    title: "Nhân viên kỹ thuật triển khai và bảo trì mạng viễn thông (Hà Nội)",
    location: "Hà Nội",
    deadline: "31/07/2026",
    salary: "10 - 15 triệu ₫",
    href: "https://fptjobs.com/nhan-vien-ky-thuat-trien-khai-va-bao-tri-mang-vien-thong-ha-noi-25865",
    hot: true,
  },
  {
    title: "Nhân viên Quản lý Vận hành sàn Thương mại điện tử (Ecommerce Planner)",
    location: "Hà Nội",
    deadline: "07/08/2026",
    salary: "Lương thỏa thuận",
    href: "https://fptjobs.com/nhan-vien-quan-ly-van-hanh-san-thuong-mai-ien-tu-ecommerce-planner-25851",
    hot: true,
  },
  {
    title: "Chuyên gia Phân tích Tài chính (Financial Analyst)",
    location: "Hà Nội",
    deadline: "31/07/2026",
    salary: "Lương thỏa thuận",
    href: "https://fptjobs.com/chuyen-gia-phan-tich-tai-chinh-financial-analyst-25852",
    hot: true,
  },
  {
    title: "Kỹ Thuật Viên Bảo Trì Hạ Tầng Viễn thông",
    location: "Tiền Giang",
    deadline: "31/07/2026",
    salary: "8 - 15 triệu ₫",
    href: "https://fptjobs.com/ky-thuat-vien-bao-tri-ha-tang-vien-thong-25801",
  },
  {
    title: "Nhân viên Kinh doanh dịch vụ Viễn thông (Quận 7 , Nhà Bè)",
    location: "Hồ Chí Minh",
    deadline: "31/07/2026",
    salary: "Lương thỏa thuận",
    href: "https://fptjobs.com/nhan-vien-kinh-doanh-dich-vu-vien-thong-quan-7--nha-be-25870",
  },
  {
    title: "Nhân viên Dịch vụ khách hàng (Quận 7)",
    location: "Hồ Chí Minh",
    deadline: "31/07/2026",
    salary: "8 - 13 triệu ₫",
    href: "https://fptjobs.com/nhan-vien-dich-vu-khach-hang-quan-7-25871",
  },
  {
    title: "Kỹ Sư Vận Hành Hệ Thống CNTT (IT Operation System Engineer)",
    location: "Hồ Chí Minh",
    deadline: "08/08/2026",
    salary: "13 - 15 triệu ₫",
    href: "https://fptjobs.com/ky-su-van-hanh-he-thong-cntt-it-operation-system-engineer-25872",
  },
];

const recruitmentJobs: Job[] = [
  {
    title: "Thực tập sinh Tài năng Công nghệ thông tin",
    location: "Hồ Chí Minh",
    deadline: "31/08/2026",
    salary: "Lương thỏa thuận",
    href: "https://fptjobs.com/thuc-tap-sinh-tai-nang-cong-nghe-thong-tin-25890",
    hot: true,
  },
  {
    title: "Thực tập sinh Marketing",
    location: "Hà Nội",
    deadline: "31/08/2026",
    salary: "Lương thỏa thuận",
    href: "https://fptjobs.com/thuc-tap-sinh-marketing-25891",
  },
  {
    title: "Kỹ Thuật Viên Bảo Trì Hạ Tầng Viễn thông",
    location: "Tiền Giang",
    deadline: "31/07/2026",
    salary: "8 - 15 triệu ₫",
    href: "https://fptjobs.com/ky-thuat-vien-bao-tri-ha-tang-vien-thong-25801",
  },
  jobs[0],
  jobs[1],
  jobs[5],
  jobs[6],
  jobs[7],
  jobs[2],
  jobs[3],
  {
    title: "Account Manager (Chinese & English Speaking)",
    location: "Hà Nội",
    deadline: "07/08/2026",
    salary: "Lương thỏa thuận",
    href: "https://fptjobs.com/account-manager-chinese--english-speaking-25853",
    hot: true,
  },
  {
    title: "Chuyên viên Quản Lý Dự Án (Viễn thông)",
    location: "Hà Nội",
    deadline: "31/07/2026",
    salary: "18 - 25 triệu ₫",
    href: "https://fptjobs.com/chuyen-vien-quan-ly-du-an-vien-thong-25859",
    hot: true,
  },
  {
    title: "Nhân viên Nhân sự (Long An)",
    location: "Long An",
    deadline: "30/07/2026",
    salary: "10 - 15 triệu ₫",
    href: "https://fptjobs.com/nhan-vien-nhan-su-long-an-25846",
    hot: true,
  },
  {
    title: "Chuyên viên Kiểm thử phần mềm (QC - Engineer)",
    location: "Hồ Chí Minh",
    deadline: "07/08/2026",
    salary: "Lương thỏa thuận",
    href: "https://fptjobs.com/chuyen-vien-kiem-thu-phan-mem-qc-engineer-25850",
  },
];

const popularTags = [
  "thực tập sinh",
  "Thực tập sinh",
  "Thực tập sinh",
  "Thực tập sinh tài năng",
  "Thực tập sinh tài năng",
  "nhân viên kinh doanh",
  "Nhân viên",
  "marketing",
  "Business analyst",
  "Business Analyst",
  "Chăm sóc khách hàng",
  "Data",
  "developer",
  "Giao dịch viên",
  "data analyst",
];

export const careerCategoryOptions = [
  "Bán hàng",
  "Báo chí/Truyền hình",
  "Biên tập/ Biên dịch/ Bản quyền",
  "Công nghệ thông tin - Phần cứng/mạng",
  "Công nghệ thông tin - Phần mềm",
  "Chăm sóc khách hàng",
  "Quản lý và thu cước",
  "Điện dân dụng",
  "Điện công nghiệp",
  "Điện tự động hóa",
  "Điện tử viễn thông",
  "Hành chính/ Văn thư/Thư ký/ Lễ tân",
  "Kế hoạch/Dự án",
  "Kế toán/ Kiểm toán",
  "Kho vận/ Vật tư/ Vận chuyển",
  "Kinh doanh",
  "Luật/ Pháp chế",
  "Marketing/Truyền thông/Sự kiện",
  "Nhân sự",
  "Quản lý chất lượng (QA/QC)",
  "Quản lý/ Điều hành",
  "Tài chính/Ngân hàng",
  "Thiết kế/ Mỹ thuật",
  "Thu ngân/ Thu cước",
  "Thực tập sinh/ Cộng tác viên",
  "Việc làm bán thời gian",
  "Việc làm tại nước ngoài",
  "Ngành nghề khác",
  "Phim Ảnh/Hậu kỳ",
  "Công nghệ thông tin",
  "Xây Dựng/ Kiến Trúc",
  "Du lịch - Khách sạn",
  "Điện tử",
  "Y tế - Dược",
  "Xuất nhập khẩu/Ngoại thương",
  "Thương mại điện tử",
];

export const regionOptions = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Hà Giang",
  "Cao Bằng",
  "Bắc Kạn",
  "Tuyên Quang",
  "Lào Cai",
  "Điện Biên",
  "Lai Châu",
  "Sơn La",
  "Yên Bái",
  "Hoà Bình",
  "Thái Nguyên",
  "Lạng Sơn",
  "Quảng Ninh",
  "Bắc Giang",
  "Phú Thọ",
  "Vĩnh Phúc",
  "Bắc Ninh",
  "Hải Dương",
  "Hải Phòng",
  "Hưng Yên",
  "Thái Bình",
  "Hà Nam",
  "Nam Định",
  "Ninh Bình",
  "Thanh Hoá",
  "Nghệ An",
  "Hà Tĩnh",
  "Quảng Bình",
  "Quảng Trị",
  "Thừa Thiên Huế",
  "Đà Nẵng",
  "Quảng Nam",
  "Quảng Ngãi",
  "Bình Định",
  "Phú Yên",
  "Khánh Hoà",
  "Ninh Thuận",
  "Bình Thuận",
  "Kon Tum",
  "Gia Lai",
  "Đắk Lắk",
  "Đắk Nông",
  "Lâm Đồng",
  "Bình Phước",
  "Tây Ninh",
  "Bình Dương",
  "Đồng Nai",
  "Bà Rịa - Vũng Tàu",
  "Long An",
  "Tiền Giang",
  "Bến Tre",
  "Trà Vinh",
  "Vĩnh Long",
  "Đồng Tháp",
  "An Giang",
  "Kiên Giang",
  "Cần Thơ",
  "Hậu Giang",
  "Sóc Trăng",
  "Bạc Liêu",
  "Cà Mau",
  "Hà Nội và Hồ Chí Minh",
];

function toLocalHref(href: string) {
  if (href.startsWith("https://fptjobs.com")) {
    return new URL(href).pathname;
  }

  return href;
}

function getJobSlug(job: Job) {
  return toLocalHref(job.href).replace(/^\/+/, "");
}

export function getFptJobSlugs() {
  return recruitmentJobs.map(getJobSlug);
}

export function getFptJobBySlug(slug: string) {
  return recruitmentJobs.find((job) => getJobSlug(job) === slug);
}

function getJobEmploymentLabel(job: Job) {
  if (job.employmentType?.trim()) return job.employmentType.trim();

  return job.title.toLowerCase().includes("thực tập") ? "Thực tập" : "Toàn thời gian";
}

const benefits: BenefitCard[] = [
  {
    title: "Vượt trội",
    kicker: "Quyền lợi",
    description:
      "Nơi mỗi cá nhân luôn được đầu tư phát triển với các chương trình đào tạo bài bản, lộ trình thăng tiến rõ ràng cùng thu nhập cạnh tranh và chế độ đãi ngộ toàn diện.",
    image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-homepage-img-blue-girl.png",
    tone: "blue",
  },
  {
    title: "Tiên phong",
    kicker: "Công nghệ",
    description:
      "Gia nhập hệ sinh thái công nghệ hiện đại, nơi bạn được làm việc với những giải pháp tiên tiến và cùng kiến tạo nên hành trình kết nối không giới hạn.",
    image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-homepage-img-orange-girl.png",
    tone: "orange",
  },
  {
    title: "Chơi hết mình",
    kicker: "Làm hết sức",
    description:
      "Hòa mình vào môi trường trẻ trung, sáng tạo, nơi bạn phát huy giá trị cá nhân và kết nối đồng đội qua những hoạt động văn hóa đầy màu sắc.",
    image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-homepage-img-green-boyngirl.png",
    tone: "green",
  },
];

const metrics: Metric[] = [
  {
    value: "10K",
    label: "Nhân sự",
    description: "Tận tâm, chuyên nghiệp, sẵn sàng mang đến dịch vụ tốt nhất.",
  },
  {
    value: "15K Tỷ",
    label: "Doanh thu",
    description: "Khẳng định vị thế và là minh chứng cho sự phát triển bền vững.",
  },
  {
    value: "63",
    label: "Tỉnh thành",
    description: "Mạng lưới phủ sóng lớn, mang sản phẩm dịch vụ đến mọi miền đất nước.",
  },
  {
    value: "Top 1",
    label: "Employer of Choice",
    description: "Nhà tuyển dụng được yêu thích nhất ngành Viễn thông",
  },
];

const processSteps: ProcessStep[] = [
  {
    step: "1",
    title: "Sàng lọc hồ sơ",
    description:
      "Hồ sơ ứng tuyển (CV) của bạn sẽ được xem xét để đánh giá mức độ phù hợp với yêu cầu của vị trí ứng tuyển. Ứng viên đáp ứng tiêu chí sẽ nhận được lời mời tham gia vòng tiếp theo.",
  },
  {
    step: "2",
    title: "Phỏng vấn",
    description:
      "Bạn sẽ được trao đổi trực tiếp với Trưởng đơn vị về kỹ năng, kinh nghiệm và mong muốn phát triển. Đối với một số vị trí đặc biệt, sẽ có thêm bài kiểm tra năng lực trước khi phỏng vấn.",
  },
  {
    step: "3",
    title: "Thông báo kết quả",
    description:
      "Nếu phù hợp, bạn sẽ nhận được Thư mời nhận việc. Trong trường hợp chưa phù hợp, chúng tôi khuyến khích bạn tiếp tục ứng tuyển những vị trí khác của FPT Telecom.",
  },
];

const testimonials: Testimonial[] = [
  {
    title: "Tận Tâm",
    quote:
      "Mình làm đúng điều mình tin: luôn sẵn sàng khi khách hàng cần. Mỗi lần vượt chỉ tiêu, mỗi lời cảm ơn là dấu mốc cho thấy mình đang đi đúng hướng.",
    name: "Đỗ Duy Khánh",
    role: "Trưởng nhóm Kinh doanh",
    image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-homepage-do-duy-khanh.png",
    tone: "orange",
  },
  {
    title: "Trưởng Thành",
    quote:
      "Nơi mình luôn được trao thử thách đúng lúc để vượt giới hạn, phát triển kỹ năng và trưởng thành nhanh hơn mỗi ngày.",
    name: "Nguyễn Thu Ngân",
    role: "Chuyên viên Phân tích dữ liệu",
    image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-homepage-nguyen-thu-ngan.png",
    tone: "green",
  },
  {
    title: "Vững Vàng",
    quote:
      "FPT Telecom là nơi giúp tôi rèn luyện bản lĩnh và phát triển chuyên sâu. Tôi luôn được chủ động, học hỏi và hợp tác để giữ vững cổng an toàn.",
    name: "Nguyễn Thành Đạt",
    role: "Kỹ sư Bảo mật An ninh mạng",
    image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-homepage-nguyen-thanh-dat.png",
    tone: "blue",
  },
];

const contacts: ContactItem[] = [
  {
    title: "Văn phòng giao dịch",
    subtitle: "FPT Telecom",
    icon: assets.contactOffice,
    href: "/gioi-thieu#tham-quan-van-phong",
  },
  {
    title: "Tuyển dụng FPT Telecom",
    subtitle: "Facebook",
    icon: assets.contactFb,
    href: "https://www.facebook.com/share/1DBQeUXYXQ/?mibextid=wwXIfr",
  },
  {
    title: "Nhà Cáo",
    subtitle: "TikTok",
    icon: assets.contactTiktok,
    href: "https://www.tiktok.com/@tuyendungfpttelecom",
  },
  {
    title: "FPT Telecom",
    subtitle: "LinkedIn",
    icon: assets.contactLinkedin,
    href: "https://www.linkedin.com/company/fpt-telecom/",
  },
  {
    title: "0904 678 040\n0986 656 620",
    subtitle: "Phone",
    icon: assets.contactPhone,
    href: "tel:0904678040",
  },
  {
    title: "phuongtm3@fpt.com / nhanctt3@fpt.com",
    subtitle: "Email",
    icon: assets.contactMail,
    href: "mailto:phuongtm3@fpt.com,nhanctt3@fpt.com",
  },
];

const contactRegions = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Hà Giang",
  "Cao Bằng",
  "Bắc Kạn",
  "Tuyên Quang",
  "Lào Cai",
  "Điện Biên",
  "Lai Châu",
  "Sơn La",
  "Yên Bái",
  "Hoà Bình",
  "Thái Nguyên",
  "Lạng Sơn",
  "Quảng Ninh",
  "Bắc Giang",
  "Phú Thọ",
  "Vĩnh Phúc",
  "Bắc Ninh",
  "Hải Dương",
  "Hải Phòng",
  "Hưng Yên",
  "Thái Bình",
  "Hà Nam",
  "Nam Định",
  "Ninh Bình",
  "Thanh Hoá",
  "Nghệ An",
  "Hà Tĩnh",
  "Quảng Bình",
  "Quảng Trị",
  "Thừa Thiên Huế",
  "Đà Nẵng",
  "Quảng Nam",
  "Quảng Ngãi",
  "Bình Định",
  "Phú Yên",
  "Khánh Hoà",
  "Ninh Thuận",
  "Bình Thuận",
  "Kon Tum",
  "Gia Lai",
  "Đắk Lắk",
  "Đắk Nông",
  "Lâm Đồng",
  "Bình Phước",
  "Tây Ninh",
  "Bình Dương",
  "Đồng Nai",
  "Bà Rịa - Vũng Tàu",
  "Long An",
  "Tiền Giang",
  "Bến Tre",
  "Trà Vinh",
  "Vĩnh Long",
  "Đồng Tháp",
  "An Giang",
  "Kiên Giang",
  "Cần Thơ",
  "Hậu Giang",
  "Sóc Trăng",
  "Bạc Liêu",
  "Cà Mau",
];

const branchContacts: FptBranchContact[] = [
  { region: "AN GIANG", detail: "Quách Văn Hoàng", email: "hoangqv@fpt.com", phone: "0989324198", extension: "024(028) 7300 2222 máy lẻ 7361" },
  { region: "BẮC GIANG", detail: "Trương Thị Linh", email: "linhtt15@fpt.com", phone: "0903259191", extension: "024(028) 7300 2222 máy lẻ 24032" },
  { region: "BẮC NINH", detail: "Nguyễn Thị Anh Thu", email: "thunta22@fpt.com", phone: "0912270295", extension: "024(028) 7300 2222 máy lẻ 24141" },
  { region: "BẾN TRE", detail: "Võ Hữu Lộc", email: "locvh2@fpt.com", phone: "0932984352", extension: "024(028) 7300 2222 máy lẻ 7520" },
  { region: "BÌNH ĐỊNH", detail: "Huỳnh Lê Bảo Chi", email: "chihlb@fpt.com", phone: "983969287", extension: "024(028) 7300 2222 máy lẻ 5611" },
  { region: "BÌNH DƯƠNG", detail: "Nguyễn Đình Hậu", email: "HauND9@fpt.com", phone: "0987771167", extension: "024(028) 7300 2222 máy lẻ 6532" },
  { region: "BÌNH PHƯỚC", detail: "Hồ Thị Bích Liên", email: "lienhtb3@fpt.com", phone: "0973420950", extension: "024(028) 7300 2222 máy lẻ 65126" },
  { region: "BÌNH THUẬN", detail: "Đào Thị Nguyên Lộc", email: "locdtn@fpt.com", phone: "0908391305", extension: "024(028) 7300 2222 máy lẻ 6225" },
  { region: "CÀ MAU", detail: "Võ Đặng Mỹ Linh", email: "LinhVDM@fpt.com", phone: "0942310917", extension: "024(028) 7300 2222 máy lẻ 78073" },
  { region: "CẦN THƠ", detail: "Bùi Thị Ngọc Tú", email: "TuBTN2@fpt.com", phone: "0947891616", extension: "024(028) 7300 2222 máy lẻ 7147" },
  { region: "CAO BẰNG", detail: "Lê Nguyệt Ánh", email: "AnhLN11@fpt.com.vn", phone: "376652035", extension: "024(028) 7300 2222 máy lẻ 2630" },
  { region: "ĐÀ NẴNG", detail: "Trần Thị Lệ Thanh", email: "thanhttl@fpt.com", phone: "0932509439", extension: "024(028) 7300 2222 máy lẻ 51186" },
  { region: "ĐẮK LẮK", detail: "Nguyễn Thị Huyền Minh", email: "minhnth6@fpt.com", phone: "935115266", extension: "024(028) 7300 2222 máy lẻ 50012" },
  { region: "ĐIỆN BIÊN", detail: "Nguyễn Thị Hoài", email: "hoaint11@fpt.com", phone: "0915485848", extension: "024(028) 7300 2222 máy lẻ 2330" },
  { region: "ĐỒNG NAI", detail: "Vũ Quang Minh", email: "minhvq14@fpt.com", phone: "0942326039", extension: "024(028) 7300 2222 máy lẻ 6119" },
  { region: "ĐỒNG THÁP", detail: "Nguyễn Thị Mai Hương", email: "HuongNTM12@fpt.com.vn", phone: "366767422", extension: "024(028) 7300 2222 máy lẻ 6740" },
  { region: "GIA LAI", detail: "Ngô Thị Thanh Xuân", email: "xuanntt10@fpt.com", phone: "0393875092", extension: "024(028) 7300 2222 máy lẻ 5940" },
  { region: "HÀ NAM", detail: "Nguyễn Thị Thu", email: "thunt67@fpt.com", phone: "0388468388", extension: "024(028) 7300 2222 máy lẻ 35141" },
  { region: "HÀ NỘI", detail: "Tầng 5-Tòa Nhà PVI-Số 1 Phạm Văn Bạch-Yên Hòa-Cầu Giấy-Hà Nội Nguyễn Thị Bích Ngọc", email: "ngocntb29@fpt.com", phone: "973830203", extension: "024(028) 7300 2222 máy lẻ 14033" },
  { region: "HÀ TĨNH", detail: "Nguyễn Thị Dung", email: "dungnt333@fpt.com", phone: "0944928496", extension: "024(028) 7300 2222 máy lẻ 3931" },
  { region: "HẢI DƯƠNG", detail: "Nguyễn Thị Thu Hà", email: "hantt207@fpt.com", phone: "0866762851", extension: "024(028) 7300 2222 máy lẻ 3202" },
  { region: "HẢI PHÒNG", detail: "Cao Thanh Ngọc", email: "ngocct2@fpt.com", phone: "0868382894", extension: "024(028) 7300 2222 máy lẻ 3106" },
  { region: "HỒ CHÍ MINH", detail: "148/1 Đ. Hoàng Diệu 2- Linh Chiểu- TP. Thủ Đức Nguyễn Chí Thành", email: "Thanhnc61@fpt.com", phone: "0794436088", extension: "024(028) 7300 2222 máy lẻ 80511" },
  { region: "HÒA BÌNH", detail: "Nguyễn Thị Dung", email: "dungnt67@fpt.com", phone: "968396136", extension: "024(028) 7300 2222 máy lẻ 21841" },
  { region: "HUẾ", detail: "Võ Thị Hồng Hạnh", email: "hanhvth10@fpt.com", phone: "0946347347", extension: "024(028) 7300 2222 máy lẻ 54012" },
  { region: "HƯNG YÊN", detail: "Dương Thị Hồng Tuyến", email: "tuyendth@fpt.com", phone: "0968230134", extension: "024(028) 7300 2222 máy lẻ 32121" },
  { region: "KIÊN GIANG", detail: "Trần Thị Thanh Huế", email: "HueTTT2@fpt.com", phone: "0962061394", extension: "024(028) 7300 2222 máy lẻ 7740" },
  { region: "KON TUM", detail: "Phạm Thị Ngọc Mai", email: "maiptn@fpt.com", phone: "0393703077", extension: "024(028) 7300 2222 máy lẻ 6040" },
  { region: "LÂM ĐỒNG", detail: "Nguyễn Thị Thùy Liên", email: "lienntt9@fpt.com", phone: "0392521467", extension: "024(028) 7300 2222 máy lẻ 6377" },
  { region: "LẠNG SƠN", detail: "Ma Thị Thu Huyền", email: "huyenmtt3@fpt.com", phone: "915812889", extension: "024(028) 7300 2222 máy lẻ 2530" },
  { region: "LÀO CAI", detail: "228 Hoàng Liên- Phường Cốc Lếu- Thành phố Lào Cai- Lao Cai Lương Thị Mẫu", email: "mault@fpt.com", phone: "0979023905", extension: "024(028) 7300 2222 máy lẻ 2030" },
  { region: "LONG AN", detail: "Trình Thị Thu Hương", email: "huongttt15@fpt.com", phone: "0937865387", extension: "024(028) 7300 2222 máy lẻ 7230" },
  { region: "NAM ĐỊNH", detail: "Trần Thị Ánh Tuyết", email: "tuyettta22@fpt.com", phone: "0942025785", extension: "024(028) 7300 2222 máy lẻ 35041" },
  { region: "NGHỆ AN", detail: "Nguyễn Thị Hồng Thanh", email: "thanhnth6@fpt.com", phone: "0974467095", extension: "024(028) 7300 2222 máy lẻ 3831" },
  { region: "KHÁNH HÒA", detail: "Thái Bá Nghĩa", email: "NghiaTB@fpt.com", phone: "0385111291", extension: "024(028) 7300 2222 máy lẻ 5834" },
  { region: "NINH BÌNH", detail: "Trần Thị Thu Hằng", email: "hangttt70@fpt.com", phone: "0353192085", extension: "024(028) 7300 2222 máy lẻ 3040" },
  { region: "NINH THUẬN", detail: "Mai Thị Lộc", email: "locmt@fpt.com", phone: "0389972994", extension: "024(028) 7300 2222 máy lẻ 6844" },
  { region: "PHÚ THỌ", detail: "Nguyễn Xuân Hương", email: "huongnx@fpt.com", phone: "0915812889", extension: "024(028) 7300 2222 máy lẻ 21042" },
  { region: "PHÚ YÊN", detail: "Trần Thị Thu Thủy", email: "thuyttt8@fpt.com", phone: "0986732734", extension: "024(028) 7300 2222 máy lẻ 5740" },
  { region: "QUẢNG BÌNH", detail: "Trần Thị Nga", email: "ngatt11@fpt.com", phone: "0971992885", extension: "024(028) 7300 2222 máy lẻ 5225" },
  { region: "QUẢNG NAM", detail: "Lê Thị Hạnh", email: "hanhlt36@fpt.com", phone: "0961144668", extension: "024(028) 7300 2222 máy lẻ 51021" },
  { region: "QUẢNG NGÃI", detail: "Trang Thị Bích Cẩm", email: "camttb@fpt.com", phone: "0917230787", extension: "024(028) 7300 2222 máy lẻ 5570" },
  { region: "QUẢNG NINH", detail: "Ngô Thị Hoa Lê", email: "lenth3@fpt.com", phone: "0988385114", extension: "024(028) 7300 2222 máy lẻ 3342" },
  { region: "QUẢNG TRỊ", detail: "Đặng Thị Kim Phụng", email: "PhungDTK4@fpt.com", phone: "0944138136", extension: "024(028) 7300 2222 máy lẻ 5311" },
  { region: "SÓC TRĂNG", detail: "Phạm Thanh Tuyền", email: "TuyenPT3@fpt.com", phone: "0939751076", extension: "024(028) 7300 2222 máy lẻ 7916" },
  { region: "SƠN LA", detail: "Nguyễn Thị Hương Thùy", email: "thuynth10@fpt.com", phone: "0989628018", extension: "024(028) 7300 2222 máy lẻ 2232" },
  { region: "TÂY NINH", detail: "Trần Thị Hồng Hạnh", email: "hanhtth9@fpt.com", phone: "0937265611", extension: "024(028) 7300 2222 máy lẻ 6642" },
  { region: "THÁI BÌNH", detail: "Nguyễn Thị Hồng", email: "hongnt9@fpt.com", phone: "0978810100", extension: "024(028) 7300 2222 máy lẻ 3642" },
  { region: "THÁI NGUYÊN", detail: "Chu Thị Tuyến", email: "tuyenct@fpt.com", phone: "0976115891", extension: "024(028) 7300 2222 máy lẻ 28041" },
  { region: "THANH HÓA", detail: "Nguyễn Công Hậu", email: "haunc4@fpt.com", phone: "0376791708", extension: "024(028) 7300 2222 máy lẻ 3741" },
  { region: "TIỀN GIANG", detail: "Phùng Ngọc Ánh Thy", email: "ThyPNA2@fpt.com", phone: "0383808591", extension: "024(028) 7300 2222 máy lẻ 7330" },
  { region: "TRÀ VINH", detail: "Huỳnh Thị Huỳnh Ngân", email: "nganhth@fpt.com", phone: "0974288276", extension: "024(028) 7300 2222 máy lẻ 7444" },
  { region: "TUYÊN QUANG", detail: "Phan Thị Thanh Huyền", email: "huyenptt7@fpt.com", phone: "0973752266", extension: "024(028) 7300 2222 máy lẻ 24040" },
  { region: "VĨNH LONG", detail: "Ngô Thị Thu Nga", email: "ngantt35@fpt.com", phone: "0706823343", extension: "024(028) 7300 2222 máy lẻ 7040" },
  { region: "VĨNH PHÚC", detail: "Trần Thị Phượng", email: "phuongtt56@fpt.com", phone: "0972420211", extension: "024(028) 7300 2222 máy lẻ 21118" },
  { region: "BÀ RỊA - VŨNG TÀU", detail: "Lê Võ Lệ Trinh", email: "trinhlvl@fpt.com", phone: "0978691767", extension: "024(028) 7300 2222 máy lẻ 6445" },
  { region: "YÊN BÁI", detail: "Trần Thị Thanh Chung", email: "chungttt2@fpt.com", phone: "0978801898", extension: "024(028) 7300 2222 máy lẻ 2940" },
  { region: "BẠC LIÊU", detail: "số 44 - 45 Ninh Bình- Phường 2- TP.Bạc Liêu- tỉnh Bạc Liêu Nguyễn Thu Hồng", email: "Hongnt100@fpt.com", phone: "0936757993", extension: "024(028) 7300 2222 máy lẻ 78121" },
  { region: "HẬU GIANG", detail: "195h Trần Hưng Đạo- Phường 5- Vị Thanh- Hậu Giang- Việt Nam Huỳnh Thiên Lý", email: "LyHT8@fpt.com", phone: "0982510007", extension: "024(028) 7300 2222 máy lẻ 71155" },
];

function SectionTitle({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="fpt-section-heading">
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h2>{children}</h2>
    </div>
  );
}

function Hero() {
  return (
    <section className="fpt-hero">
      <div className="fpt-hero-inner">
        <h1 className="sr-only">Cổng thông tin việc làm và cơ hội nghề nghiệp tại FPT Telecom</h1>
        <p className="fpt-hero-title">
          <span>Khai phóng sự nghiệp</span>
          <strong>cùng chúng tôi</strong>
        </p>
        <form className="fpt-search-card" action="/tuyen-dung" method="get">
          <label>
            <BriefcaseBusiness aria-hidden="true" size={14} />
            <select aria-label="Ngành nghề" name="nganh" defaultValue="">
              <option value="">Ngành nghề</option>
              {careerCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            <MapPin aria-hidden="true" size={14} />
            <select aria-label="Khu vực" name="khuvuc" defaultValue="">
              <option value="">Khu vực</option>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <label>
            <Search aria-hidden="true" size={14} />
            <input aria-label="Vị trí chức danh" name="tukhoa" placeholder="Vị trí, chức danh..." />
          </label>
          <button type="submit">
            <Search aria-hidden="true" size={14} />
            Tìm kiếm
          </button>
        </form>
      </div>
    </section>
  );
}

function JobsSection() {
  return (
    <section className="fpt-section fpt-jobs-section">
      <SectionTitle>Cơ hội nghề nghiệp</SectionTitle>
      <div className="fpt-job-grid">
        {jobs.map((job) => (
          <Link className="fpt-job-card" href={toLocalHref(job.href)} key={job.title}>
            {job.hot ? (
              <span className="fpt-hot" aria-label="hot job">
                <Zap aria-hidden="true" size={15} />
              </span>
            ) : null}
            <h3>{job.title}</h3>
            <div className="fpt-job-meta">
              <span>
                <BriefcaseBusiness aria-hidden="true" size={12} />
                Toàn thời gian
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
      <Link className="fpt-see-more" href="/tuyen-dung">
        Xem thêm <ArrowRight aria-hidden="true" size={14} />
      </Link>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="fpt-section fpt-benefits-section">
      <SectionTitle>Lựa chọn FPT Telecom</SectionTitle>
      <div className="fpt-benefit-grid">
        {benefits.map((benefit) => (
          <article className={cn("fpt-benefit-card", `tone-${benefit.tone}`)} key={benefit.title}>
            <Image src={benefit.image} alt="" fill sizes="(max-width: 768px) 92vw, 31vw" />
            <div>
              <span>{benefit.kicker}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="fpt-section fpt-about-section">
      <div className="fpt-about-art">
        <Image src={assets.cover} alt="" width={662} height={600} sizes="(max-width: 768px) 88vw, 45vw" />
      </div>
      <div className="fpt-about-copy">
        <p className="fpt-kicker">FPT Telecom</p>
        <h2>Hành trình kết nối & Kiến tạo tương lai</h2>
        <p>
          Là nhà cung cấp dịch vụ Internet, Truyền hình, giải pháp Nhà thông minh và các dịch vụ gia tăng trên nền
          tảng Internet hàng đầu trong khu vực. FPT Telecom tự hào mang đến dịch vụ kết nối cho hàng triệu khách hàng
          cá nhân, hộ gia đình và doanh nghiệp.
        </p>
        <div className="fpt-about-actions">
          <Link className="fpt-login" href="/gioi-thieu">
            Về chúng tôi
          </Link>
          <Link className="fpt-text-link" href="/life-at-ftel">
            Life at FTEL
          </Link>
        </div>
      </div>
    </section>
  );
}

function MetricsSection() {
  return (
    <section className="fpt-metrics">
      {metrics.map((metric) => (
        <article key={metric.value}>
          <strong>{metric.value}</strong>
          <h3>{metric.label}</h3>
          <p>{metric.description}</p>
        </article>
      ))}
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="fpt-section fpt-process-section" id="quy-trinh-tuyen-dung">
      <SectionTitle eyebrow="🤗">Quy trình Tuyển dụng</SectionTitle>
      <p className="fpt-section-subtitle">Quy trình với 3 bước đơn giản, minh bạch và hoàn toàn không mất phí cho ứng viên.</p>
      <div className="fpt-process-grid">
        {processSteps.map((item) => (
          <article className="fpt-process-step" key={item.step}>
            <div className="fpt-process-number">{item.step}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="fpt-testimonials">
      <div className="fpt-container">
        <div className="fpt-testimonials-head">
          <SectionTitle eyebrow="🦊">Tự hào là FOXer</SectionTitle>
          <p>Luôn tiên phong và sáng tạo cho sứ mệnh kết nối yêu thương!</p>
          <div className="fpt-carousel-dots" aria-hidden="true">
            <span />
            <span />
          </div>
        </div>
        <div className="fpt-testimonial-grid">
          {testimonials.map((item) => (
            <article className={cn("fpt-testimonial-card", `tone-${item.tone}`)} key={item.name}>
              <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 86vw, 30vw" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.quote}</p>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="fpt-section fpt-contact-section" id="ket-noi-voi-chung-toi">
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

function AboutContactSection() {
  return (
    <section className="fpt-section fpt-branch-contact-section" id="lien-he">
      <div className="fpt-branch-contact-head">
        <h2>Liên hệ</h2>
        <p>
          Hãy kết nối với chi nhánh FPT Telecom gần bạn nơi hành trình nghề nghiệp mới đang chờ bạn bước tới!
        </p>
      </div>

      <FptBranchContactMap
        contacts={branchContacts}
        locationPin={assets.locationPin}
        regions={contactRegions}
      />
    </section>
  );
}

function Footer() {
  const aboutLinks = ["Giới thiệu công ty", "Tham quan văn phòng", "Thông tin liên hệ", "Câu hỏi thường gặp"];
  const lifeLinks = ["Hoạt động", "Văn hoá đặc sắc", "Phát triển sự nghiệp", "Phúc lợi"];
  const newsLinks = ["Tin tức", "Sự kiện"];

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
          <FooterColumn title="Về chúng tôi" items={aboutLinks} />
          <FooterColumn title="Life at FTEL" items={lifeLinks} />
          <FooterColumn title="Tin tức & Sự kiện" items={newsLinks} />
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

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  const hrefs: Record<string, string> = {
    "Giới thiệu công ty": "/gioi-thieu",
    "Tham quan văn phòng": "/gioi-thieu#tham-quan-van-phong",
    "Thông tin liên hệ": "/gioi-thieu#lien-he",
    "Câu hỏi thường gặp": "/gioi-thieu#cau-hoi-thuong-gap",
    "Hoạt động": "/life-at-ftel",
    "Văn hoá đặc sắc": "/life-at-ftel#van-hoa",
    "Phát triển sự nghiệp": "/life-at-ftel#phat-trien-su-nghiep",
    "Phúc lợi": "/life-at-ftel#phuc-loi",
    "Tin tức": "/tin-tuc",
    "Sự kiện": "/su-kien",
  };

  return (
    <div>
      <h3>{title}</h3>
      {items.map((item) => (
        <Link href={hrefs[item] ?? "/"} key={item}>
          {item}
        </Link>
      ))}
    </div>
  );
}

function FloatingActions() {
  return (
    <div className="fpt-floating" aria-label="Promoted job">
      <Link href="/su-kien">
        <Image src={assets.fab} alt="Tuyển dụng dự án trọng điểm" width={221} height={100} />
      </Link>
      <Link className="fpt-go-top" href="#top" aria-label="Go to top">
        ↑
      </Link>
    </div>
  );
}

function RecruitmentNotice() {
  return (
    <section className="fpt-recruitment-notice">
      <Image src={assets.hiringFox} alt="" width={91} height={96} />
      <p>
        Chúng tôi không thu bất kì chi phí nào
        <br />
        của ứng viên, sinh viên trong quá trình tuyển dụng, thực tập
      </p>
      <div aria-hidden="true" />
    </section>
  );
}

type FptFeature = {
  title: string;
  description: string;
  image?: string;
};

type FptOfficeTour = {
  title: string;
  description: string;
  image: string;
  href: string;
};

type FptAboutIntro = {
  kicker: string;
  heading: string;
  description: string;
  images: string[];
  body: string[];
};

type FptAboutProduct = {
  title: string;
  subtitle: string;
  tone: "orange" | "green" | "blue" | "pink" | "orange2" | "black";
};

type FptAboutAward = {
  title: string;
  type: string;
  image: string;
};

type FptAboutFaq = {
  question: string;
  answer: string[];
};

type FptLifeImage = {
  image: string;
  className: string;
};

type FptLifeCulture = {
  value: string;
  description: string;
  tone: "blue" | "orange" | "green" | "pink" | "orange2" | "black";
};

type FptLifeCard = {
  title: string;
  description?: string;
  image: string;
};

type FptLifeBenefit = {
  title: string;
  icon: string;
  subtitle: string;
  bullets: string[];
};

type FptLifePageData = {
  hero: {
    title: string;
    accent: string;
    subtitle: string;
    description: string;
  };
  images: FptLifeImage[];
  culture: {
    title: string;
    accent: string;
    subtitle: string;
    description: string;
    values: FptLifeCulture[];
  };
  spirit: {
    title: string;
    accent: string;
    subtitle: string;
    description: string;
    cards: FptLifeCard[];
  };
  career: {
    title: string;
    accent: string;
    subtitle: string;
    description: string;
    cards: FptLifeCard[];
  };
  benefits: {
    title: string;
    accent: string;
    subtitle: string;
    description: string;
    items: FptLifeBenefit[];
  };
};

type FptNewsFeature = {
  title: string;
  type: string;
  date: string;
  image: string;
  href: string;
};

type FptNewsArticle = FptNewsFeature & {
  excerpt: string;
};

type FptNewsArticleContentBlock =
  | { kind: "heading"; id?: string; title: string }
  | { kind: "image"; alt: string; src: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "paragraph"; text: string }
  | { kind: "richParagraph"; parts: Array<{ href?: string; text: string }> }
  | { kind: "toc"; items: Array<{ href: string; label: string }> };

type FptNewsDetailArticle = FptNewsArticle & {
  author: string;
  contentHtml?: string;
  description: string;
  slug: string;
  tag: string;
  contentBlocks?: FptNewsArticleContentBlock[];
};

type FptNewsSidebarItem = {
  title: string;
  date: string;
  image: string;
  href: string;
};

type FptNewsPaginationItem = {
  label: string;
  href?: string;
  active?: boolean;
  next?: boolean;
};

export type FptSurveyFormField = {
  type: "checkbox" | "date" | "radio" | "select" | "text" | "textarea" | "upload";
  label: string;
  description?: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
};

export type FptSurveyEventDetail = {
  bannerImage: string;
  contentHtml: string;
  date: string;
  description: string;
  expired?: boolean;
  extraImage?: string;
  formFields: FptSurveyFormField[];
  slug: string;
  tags?: string[];
  title: string;
};

type FptNewsIndexPageData = {
  hero: {
    title: string;
    subtitle: string;
  };
  featuredAriaLabel?: string;
  featured: FptNewsFeature[];
  latestSubtitle?: string;
  latestTitle?: string;
  latest: FptNewsArticle[];
  pageClassName?: string;
  pageHeading?: string;
  sidebar: FptNewsSidebarItem[];
  sidebarTitle?: string;
  pagination?: FptNewsPaginationItem[];
};

type FptContentPageData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroImage: string;
  hideHero?: boolean;
  aboutIntro?: FptAboutIntro;
  introTitle: string;
  intro: string[];
  stats: { value: string; label: string }[];
  features: FptFeature[];
  gallery: { title: string; image: string }[];
  products?: FptAboutProduct[];
  awards?: FptAboutAward[];
  officeTour?: FptOfficeTour[];
  faqs?: FptAboutFaq[];
  showBranchContacts?: boolean;
};

const aboutPageData: FptContentPageData = {
  eyebrow: "Về chúng tôi",
  title: "Giới thiệu FPT Jobs: Cơ hội sự nghiệp tại FPT Telecom",
  subtitle:
    "Là thành viên của Tập đoàn công nghệ lớn nhất Việt Nam, FPT Telecom hiện là một trong những nhà cung cấp dịch vụ viễn thông và Internet hàng đầu trong khu vực.",
  heroImage: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-about-1-hoi-nghi-chien-luoc.jpg",
  hideHero: true,
  showBranchContacts: true,
  aboutIntro: {
    kicker: "Về chúng tôi",
    heading: "Giới thiệu chung",
    description:
      "Là thành viên của Tập đoàn công nghệ lớn nhất Việt Nam, FPT Telecom hiện là một trong những nhà cung cấp dịch vụ viễn thông và Internet hàng đầu trong khu vực.",
    images: [
      "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-about-1-hoi-nghi-chien-luoc.jpg",
      "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-about-2-ftel-careerviet.jpg",
      "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-about-3-stco.jpg",
      "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-about-4-nextgen.jpg",
    ],
    body: [
      "FPT Telecom được thành lập ngày 31/01/1997, xuất phát từ Trung tâm Dịch vụ Trực tuyến với sản phẩm mạng Intranet đầu tiên của Việt Nam \"Trí tuệ Việt Nam - TTVN\", mở đường cho sự phát triển Internet tại Việt Nam.",
      "Với sứ mệnh mang Internet và kết nối đến mọi gia đình Việt Nam, FPT Telecom đang thực hiện chiến lược \"Mang đến trải nghiệm tuyệt vời cho khách hàng\", phát huy giá trị văn hóa \"Lấy khách hàng làm trọng tâm\" và sức mạnh công nghệ FPT, từ đó tiên phong trở thành Nhà cung cấp dịch vụ số có trải nghiệm khách hàng vượt trội, tốt nhất tại Việt Nam.",
    ],
  },
  introTitle: "Kết nối hàng triệu gia đình Việt Nam",
  intro: [
    "FPT Telecom được thành lập ngày 31/01/1997, xuất phát từ Trung tâm Dịch vụ Trực tuyến với sản phẩm mạng Intranet đầu tiên của Việt Nam Trí tuệ Việt Nam - TTVN.",
    "Với sứ mệnh mang Internet và kết nối đến mọi gia đình Việt Nam, FPT Telecom đang thực hiện chiến lược mang đến trải nghiệm tuyệt vời cho khách hàng.",
    "Tại FPT Telecom, mỗi cá nhân được trao cơ hội phát triển trong môi trường công nghệ, tốc độ cao và giàu bản sắc văn hóa FPT.",
  ],
  stats: [
    { value: "1997", label: "Năm thành lập" },
    { value: "10K+", label: "Nhân sự toàn quốc" },
    { value: "63", label: "Tỉnh thành hiện diện" },
    { value: "Top 1", label: "Employer of Choice ngành Viễn thông" },
  ],
  features: [
    {
      title: "Internet và kết nối",
      description: "Internet cá nhân, Internet gia đình, Internet doanh nghiệp và các giải pháp kết nối tốc độ cao.",
    },
    {
      title: "Truyền hình và giải trí",
      description: "FPT Play cùng hệ sinh thái nội dung giải trí số đa nền tảng phục vụ hàng triệu khách hàng.",
    },
    {
      title: "Bảo mật và nhà thông minh",
      description: "Các dịch vụ bảo mật, camera, smart home và giải pháp số giúp khách hàng sống an toàn hơn.",
    },
    {
      title: "Thương hiệu tuyển dụng",
      description: "Nhiều giải thưởng tuyển dụng, môi trường làm việc và phát triển con người được ghi nhận rộng rãi.",
    },
  ],
  gallery: [
    { title: "Hội nghị chiến lược", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-about-1-hoi-nghi-chien-luoc.jpg" },
    { title: "CareerViet vinh danh", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-about-2-ftel-careerviet.jpg" },
    { title: "Văn hóa STCo", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-about-3-stco.jpg" },
    { title: "NextGen Leaders", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-about-4-nextgen.jpg" },
    { title: "FPT Play", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-reward-fptplay.jpg" },
    { title: "Great Place To Work", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-reward-great-place-to-work.jpg" },
  ],
  products: [
    { title: "Internet", subtitle: "Cá nhân", tone: "orange" },
    { title: "Internet", subtitle: "Gia đình", tone: "green" },
    { title: "Internet", subtitle: "Doanh nghiệp", tone: "blue" },
    { title: "Internet", subtitle: "Game thủ", tone: "pink" },
    { title: "Truyền hình", subtitle: "Giải trí", tone: "orange2" },
    { title: "Bảo mật", subtitle: "An toàn", tone: "black" },
  ],
  awards: [
    {
      title: "FPT Play - Nền tảng giải trí Việt của năm 2024 tại lễ trao giải Vietnam iContent Awards 2024",
      type: "Corporate Awards",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-reward-fptplay.jpg",
    },
    {
      title: "Top 10 Sao Khuê 2024",
      type: "Corporate Awards",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-reward-saokhue.webp",
    },
    {
      title: "Nơi làm việc xuất sắc nhất Việt Nam 2023-2024 do tổ chức quốc tế Great Place to Work",
      type: "HR Excellence",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-reward-great-place-to-work.jpg",
    },
    {
      title: "Top 1 Nhà tuyển dụng được yêu thích nhất ngành Viễn thông",
      type: "HR Excellence",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-reward-top-1-tuyendung.jpg",
    },
    {
      title: "Doanh nghiệp CSR tiêu biểu & Hoạt động cộng đồng toàn cầu 2024",
      type: "CSR Impacts",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-reward-doanh-nghiep-csr.webp",
    },
    {
      title: "Top 10 Thương hiệu bền vững nhờ đổi mới sáng tạo 2024",
      type: "CSR Impacts",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-reward-top-10-thuonghieu.webp",
    },
  ],
  officeTour: [
    {
      title: "FPT Tower",
      description:
        "FPT Tower là trụ sở chính có quy mô lớn gồm một tòa nhà với 3 khối 17 tầng, 8 tầng và 21 tầng, tọa lạc ngay ngã 5 lớn thuộc quận Cầu Giấy (Hà Nội) trên khu đất “vàng” có diện tích gần 16.000 m². Với hơn 102.000 m² sử dụng cùng nhiều diện tích hiện đại, tòa nhà phục vụ nhu cầu đa dạng của hơn 9.000 nhân viên FPT và các công ty thành viên.",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-tour-ftower.png",
      href: "https://tour.fptjobs.com/view-branch/3?frameId=22",
    },
    {
      title: "FPT Tân Thuận 2",
      description:
        "FPT Tân Thuận 2 hiện đang tọa lạc tại Lô 29B - 31B - 33B, Đường Tân Thuận, KCX Tân Thuận, Phường Tân Thuận Đông, Quận 7, TP.HCM. Tòa nhà gồm 6 tầng với tổng diện tích sử dụng hơn 15.000 m², có sức chứa 2.200 cán bộ nhân viên. FPT Tân Thuận 2 là nơi đặt trụ sở của các phòng ban HO của công ty FPT Telecom ở khu vực phía Nam.",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-tour-tanthuan.png",
      href: "https://tour.fptjobs.com/view-branch/2?frameId=5",
    },
    {
      title: "Chi nhánh FPT Telecom Huế",
      description:
        "FPT Telecom chi nhánh Huế hiện đang tọa lạc tại một vị trí trung tâm của thành phố Huế, phục vụ khách hàng trên toàn khu vực Thừa Thiên Huế. Văn phòng chi nhánh Huế được trang bị cơ sở hạ tầng hiện đại với tổng diện tích sử dụng lớn, đáp ứng nhu cầu làm việc của hàng trăm cán bộ nhân viên.",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-about-tour-cnhue.png",
      href: "https://tour.fptjobs.com/view-branch/8?frameId=168",
    },
  ],
  faqs: [
    {
      question: "Thời gian phản hồi sau khi nộp CV là bao lâu?",
      answer: [
        "Hồ sơ ứng tuyển sẽ được FPT Telecom xem xét trong thời hạn tối đa 15 ngày làm việc kể từ ngày nộp. Trong trường hợp hồ sơ phù hợp, ứng viên sẽ được liên hệ để bước vào vòng tiếp theo.",
      ],
    },
    {
      question: "Khi nào tôi được thông báo về kết quả phỏng vấn của mình?",
      answer: [
        "Bất kỳ vị trí nào của FPT Telecom, ứng viên đều được thông báo về kết quả phỏng vấn. Chỉ cần bạn có tham gia buổi phỏng vấn, bạn chắc chắn sẽ nhận được kết quả qua email đã đăng ký ban đầu. Thời gian trả kết quả phỏng vấn tối đa trong 07 ngày làm việc.",
      ],
    },
    {
      question: "Có thể ứng tuyển nhiều vị trí cùng lúc?",
      answer: [
        "Có. Ứng viên được khuyến khích ứng tuyển nhiều vị trí phù hợp với năng lực và nguyện vọng. Mỗi hồ sơ sẽ được xem xét riêng biệt dựa trên yêu cầu của từng vị trí.",
      ],
    },
    {
      question: "Phỏng vấn trực tiếp hay trực tuyến?",
      answer: [
        "Tùy theo tính chất công việc và khu vực, FPT Telecom có thể tổ chức phỏng vấn trực tiếp hoặc trực tuyến qua nền tảng video call. Hình thức phỏng vấn cụ thể sẽ được thông báo trong thư mời.",
      ],
    },
    {
      question: "Quy trình tuyển dụng tại FPT Telecom gồm những bước nào?",
      answer: [
        "Quy trình tuyển dụng có thể khác nhau tùy theo vị trí, nhưng thông thường sẽ bao gồm:",
        "1. Tiếp nhận và sàng lọc hồ sơ",
        "2. Thi tuyển hoặc đánh giá chuyên môn (nếu có)",
        "3. Phỏng vấn (trực tiếp hoặc trực tuyến)",
        "4. Thông báo kết quả & mời nhận việc",
      ],
    },
  ],
};

const lifePageData: FptLifePageData = {
  hero: {
    title: "Life at",
    accent: "FTEL",
    subtitle: "Cuộc sống tại FPT Telecom",
    description:
      "Khám phá văn hóa “Làm hết sức, chơi hết mình” Nơi tinh thần FPT Telecom bùng cháy trong từng khoảnh khắc, từ công việc đến những hoạt động gắn kết đầy màu sắc.",
  },
  images: [
    {
      className: "is-large",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-486540120-1063295219168393-86955670962358.jpg",
    },
    {
      className: "is-small",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-z6369812868192-0e7659809dae5d1f865c1836f7.jpg",
    },
    {
      className: "is-tall",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-z6369812905627-4c17acc192f99a4edf486549af.jpg",
    },
    {
      className: "is-medium",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-488980929-1073425544822027-68068811065418.jpg",
    },
    {
      className: "is-medium",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-486119155-1060806466083935-16563141811067.jpg",
    },
    {
      className: "is-small",
      image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-z6369812937993-feb951856018108063c9d8fe1b.jpg",
    },
  ],
  culture: {
    title: "Văn hoá",
    accent: "Đặc sắc",
    subtitle: "Giá trị cốt lõi FPT",
    description:
      "Mỗi nhân viên FPT Telecom không chỉ làm việc, mà còn sống với một tinh thần chung, nơi sự khác biệt được trân trọng, sáng tạo được khuyến khích và thành công đến từ sự đồng lòng.",
    values: [
      {
        value: "Tôn",
        description:
          "Tôn trọng - FPT tạo môi trường cởi mở, nơi mọi người được lắng nghe, thể hiện quan điểm và phát triển tối đa, không phân biệt vị trí hay quan hệ.",
        tone: "blue",
      },
      {
        value: "Đổi",
        description:
          "Đổi mới – FPT tạo điều kiện cho mọi thành viên học tập suốt đời, đồng thời tiếp thu cái mới, đầu tư nghiên cứu và thúc đẩy sáng tạo để dẫn đầu.",
        tone: "orange",
      },
      {
        value: "Đồng",
        description:
          "Đồng đội – FPT là một đại gia đình, nơi mỗi thành viên gắn kết, sẻ chia, đồng hành vượt qua mọi thử thách, cùng nhau sát cánh vì mục tiêu chung.",
        tone: "green",
      },
      {
        value: "Chí",
        description:
          "Chí công – FPT đề cao chính trực, công bằng, minh bạch, đặt lợi ích tổ chức lên hàng đầu, mọi quyết định không thiên vị, không phụ thuộc thân sơ.",
        tone: "pink",
      },
      {
        value: "Gương",
        description:
          "Gương mẫu – Lãnh đạo FPT tiên phong, làm gương, truyền cảm hứng, sẵn sàng xông pha cùng nhân viên và thể hiện rõ tinh thần “Tôn trọng - Đổi mới - Đồng đội”.",
        tone: "orange2",
      },
      {
        value: "Sáng",
        description:
          "Sáng suốt – FPT yêu cầu lãnh đạo phải có tầm nhìn xa và tính quyết đoán. Luôn hỗ trợ nhân viên, đưa ra quyết định chính xác, kịp thời, định hướng chiến lược dài hạn.",
        tone: "black",
      },
    ],
  },
  spirit: {
    title: "Tinh thần",
    accent: "Phong phú",
    subtitle: "Cùng chơi - Cùng gắn kết - Cùng sống ý nghĩa",
    description:
      "Chúng tôi tin rằng những điều đẹp nhất luôn bắt đầu từ sự gắn kết chân thành. Ở FPT Telecom, chuỗi dài các hoạt động tinh thần suốt năm không chỉ vui mà còn để kết nối, để yêu thương.",
    cards: [
      { title: "Nghỉ mát hàng năm", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-vh-nghi-mat.jpg" },
      { title: "Hội làng", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-vh-hoilang.jpg" },
      { title: "Year End Party", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-vh-yearend.jpg" },
      { title: "Ngày gia đình", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-vh-giadinh.jpg" },
      { title: "Ngày FPT vì cộng đồng", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-vh-congdong.jpg" },
      { title: "Giải bóng đá", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-vh-bongda.jpg" },
      { title: "Ngày sinh nhật Tập đoàn", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-vh-sinhnhat.jpg" },
      { title: "Các ngày lễ đặc biệt", image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-vh-dacbiet.jpg" },
    ],
  },
  career: {
    title: "Phát triển",
    accent: "Sự nghiệp",
    subtitle: "Level Up Mỗi ngày",
    description: "Trở thành phiên bản tốt hơn của chính mình thông qua học hỏi và phát triển không ngừng.",
    cards: [
      {
        title: "Chủ động học hỏi",
        description:
          "Lộ trình đào tạo chuyên nghiệp với đa dạng hình thức: Đào tạo trực tiếp, mentoring cùng lãnh đạo, học trực tuyến qua Udemy/Coursera....",
        image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-vh-learn.jpg",
      },
      {
        title: "Cơ hội thăng tiến rộng mở",
        description:
          "Chủ động ứng cử hoặc được đề cử vào các cuộc thi tìm kiếm nhân tài, các chương trình đào tạo quản lý, lãnh đạo kế cận: Trạng FPT, Nhà quản lý tài năng, Cán bộ nguồn...",
        image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-vh-ql.jpg",
      },
      {
        title: "Ghi nhận, vinh danh kịp thời",
        description:
          "Hệ thống khen thưởng đa dạng từ Thưởng Gold nóng đến vinh danh Top 100 FPT, Top 50 FPT Telecom, Cán bộ xuất sắc ngành dọc...",
        image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-lifeatftel-vh-vinhdanh.jpg",
      },
    ],
  },
  benefits: {
    title: "Hệ thống",
    accent: "Phúc lợi",
    subtitle: "Những điều bạn sẽ nhận được",
    description: "Đầy đủ về vật chất, phong phú về tinh thần để bạn yên tâm làm việc và phát triển lâu dài.",
    items: [
      {
        title: "Thu nhập",
        icon: "💰",
        subtitle: "Thu nhập hấp dẫn, cạnh tranh",
        bullets: [
          "Gói thu nhập hấp dẫn: Lương tháng, Lương tháng 13, thưởng hiệu quả.",
          "Hệ thống khen thưởng đa dạng: Thưởng nóng, Tuyên dương, cá nhân xuất sắc TOP 50 FPT Telecom, TOP 100 FPT...",
          "Chính sách nghỉ mát hằng năm giúp tái tạo năng lượng và gắn kết đồng đội.",
        ],
      },
      {
        title: "Sức khoẻ",
        icon: "👩‍⚕️",
        subtitle: "Chăm sóc sức khoẻ toàn diện",
        bullets: [
          "Khám sức khỏe định kỳ hàng năm giúp theo dõi và bảo vệ sức khỏe chủ động.",
          "Gói bảo hiểm sức khỏe FPT Care toàn diện với quyền lợi khám chữa bệnh nội trú, ngoại trú, chăm sóc răng, tai nạn...",
          "Chuỗi hội thảo, workshop về nâng cao chăm sóc sức khỏe cho cán bộ nhân viên",
        ],
      },
      {
        title: "Hỗ trợ",
        icon: "🏦",
        subtitle: "Hỗ trợ tài chính, vững bước tương lai",
        bullets: [
          "Chính sách hỗ trợ lãi suất cho cán bộ nhân viên khi mua nhà, mua xe giúp an cư, ổn định cuộc sống",
          "Ưu đãi nội bộ F-Citizen khi mua sắm trong hệ sinh thái sản phẩm, dịch vụ của tập đoàn FPT.",
          "Quỹ Hy vọng, Quỹ Vì Cộng đồng: cùng chung tay hỗ trợ các hoàn cảnh khó khăn",
        ],
      },
      {
        title: "Thiết bị",
        icon: "🎒",
        subtitle: "Trang thiết bị làm việc hiện đại",
        bullets: [
          "Cung cấp đầy đủ thiết bị hỗ trợ công việc.",
          "Hệ thống quản trị được số hóa cùng các ứng dụng hiện đại giúp tăng hiệu suất tối đa",
          "Không gian làm việc tiện nghi, sáng tạo, truyền cảm hứng mỗi ngày.",
        ],
      },
    ],
  },
};

const newsIndexPageData: FptNewsIndexPageData = {
  hero: {
    title: "Tin tức",
    subtitle: "Nhận tin tức mới nhất, cập nhật và chia sẻ hữu ích.",
  },
  featured: [
    {
      title: "FPT Telecom nhận bằng khen của Bộ Khoa học và Công nghệ cho đóng góp phát triển IPv6 tại Việt Nam",
      type: "Tin tức nổi bật",
      date: "Thứ Ba, 30/06/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-6302026120000AM181549406thumbnail.png",
      href: "/tin-tuc/fpt-telecom-nhan-bang-khen-cua-bo-khoa-hoc-va-cong-nghe-cho-dong-gop-phat-trien-ipv6-tai-viet-nam-331",
    },
    {
      title: "FPT được vinh danh Giải Vàng Stevie Award cho Nhà tuyển dụng xuất sắc 2025",
      type: "Tin tức nổi bật",
      date: "Thứ Ba, 19/08/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-8192025120000AM9402187thumbnail.png",
      href: "/tin-tuc/fpt-duoc-vinh-danh-giai-vang-stevie-award-cho-nha-tuyen-dung-xuat-sac-2025-316",
    },
    {
      title: "Bí mật nào khiến FPT Telecom trở thành “nhà tuyển dụng quốc dân” mà ai cũng muốn đầu quân?",
      type: "Tin tức nổi bật",
      date: "Chủ Nhật, 06/07/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-762025120000AM17510816thumbnail.png",
      href: "/tin-tuc/bi-mat-nao-khien-fpt-telecom-tro-thanh-nha-tuyen-dung-quoc-dan-ma-ai-cung-muon-dau-quan-315",
    },
  ],
  latest: [
    {
      title: "IT là gì? Toàn cảnh ngành IT và cơ hội nghề nghiệp 2026",
      type: "News",
      date: "Thứ Hai, 29/06/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-6292026120000AM141137995thumbnail.png",
      href: "/tin-tuc/it-la-gi-toan-canh-nganh-it-va-co-hoi-nghe-nghiep-2026-330",
      excerpt:
        'Bạn nghe nhắc đến "dân IT" gần như mỗi ngày, nhưng nếu hỏi chính xác IT là gì thì không phải ai cũng trả lời gọn được. Nhiều người mặc định IT là "sửa máy tính" hoặc "lập trình", trong khi thực tế ngành này rộng hơn thế rất nhiều.',
    },
    {
      title: "Sinh viên Công nghệ Tập sự FPT Telecom 2026 — thực chiến có lương, lộ trình rõ ngay từ năm 3",
      type: "News",
      date: "Thứ Năm, 14/05/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-5142026120000AM18058299thumbnail.png",
      href: "/tin-tuc/sinh-vien-cong-nghe-tap-su-fpt-telecom-2026---thuc-chien-co-luong-lo-trinh-ro-ngay-tu-nam-3-329",
      excerpt:
        "Nếu bạn đang là sinh viên năm 3 hoặc năm cuối thuộc khối ngành Công nghệ - Kỹ thuật và đang tìm một nơi để thực sự va chạm với công việc — không phải quan sát từ xa, không phải xử lý tác vụ phụ — thì chương trình Sinh viên Công nghệ Tập sự FPT Telecom năm 2026 đáng để bạn đọc kỹ.",
    },
    {
      title: "Thực tập FPT Telecom 2026 — chương trình internship quy mô lớn nhất năm chính thức mở đơn",
      type: "News",
      date: "Thứ Năm, 14/05/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-5142026120000AM171425323thumbnail.png",
      href: "/tin-tuc/thuc-tap-fpt-telecom-2026---chuong-trinh-internship-quy-mo-lon-nhat-nam-chinh-thuc-mo-don-328",
      excerpt:
        "Nhiều sinh viên kết thúc kỳ thực tập chỉ với một tờ giấy xác nhận và vài tháng làm việc không để lại dấu ấn gì. Thực tập FPT Telecom năm 2026 được thiết kế theo hướng ngược lại: học thật, làm thật, và kết thúc kỳ intern với bộ kỹ năng thực chiến có thể ghi ngay vào CV.",
    },
    {
      title: "Marketing FPT Telecom — Làm Gì, Thu Nhập Bao Nhiêu Và Cơ Hội Phát Triển Ra Sao?",
      type: "News",
      date: "Thứ Ba, 28/04/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-4282026120000AM172242263thumbnail.png",
      href: "/tin-tuc/marketing-fpt-telecom---lam-gi-thu-nhap-bao-nhieu-va-co-hoi-phat-trien-ra-sao-327",
      excerpt:
        "Bạn đang tìm kiếm cơ hội trong ngành Marketing nhưng chưa biết môi trường Telecom có phù hợp không? Hay bạn đang cân nhắc giữa agency nhỏ và một tập đoàn công nghệ lớn — nơi ngân sách thực chiến và quy mô triển khai hoàn toàn khác?",
    },
    {
      title: "Kỹ Thuật Viên Viễn Thông Là Làm Gì? Công Việc Thực Tế Và Cơ Hội Tại FPT Telecom",
      type: "News",
      date: "Thứ Năm, 16/04/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-4162026120000AM103116402thumbnail.png",
      href: "/tin-tuc/ky-thuat-vien-vien-thong-la-lam-gi-cong-viec-thuc-te-va-co-hoi-tai-fpt-telecom-326",
      excerpt:
        "Nhiều người nghe đến “kỹ thuật viên viễn thông” hình dung ngay đến cảnh trèo cột, kéo dây giữa trời nắng. Thực tế thì rộng hơn nhiều — và cũng thú vị hơn nhiều. Đây là vị trí đứng ở trung tâm của hạ tầng số, trực tiếp quyết định hàng triệu hộ gia đình và doanh nghiệp có Internet ổn định hay không.",
    },
    {
      title: "Nhân Viên Kinh Doanh Là Làm Gì? Công Việc Thực Tế Và Cơ Hội Tại FPT Telecom",
      type: "News",
      date: "Thứ Hai, 13/04/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-4132026120000AM141912396thumbnail.png",
      href: "/tin-tuc/nhan-vien-kinh-doanh-la-lam-gi-cong-viec-thuc-te-va-co-hoi-tai-fpt-telecom-325",
      excerpt:
        "Nhiều người nghe đến “nhân viên kinh doanh” là nghĩ ngay đến việc đi gõ cửa từng nhà, chào hàng liên tục rồi bị từ chối. Thực tế, công việc này phong phú hơn rất nhiều — và với đúng môi trường, đây có thể là bước đệm vững chắc để xây dựng sự nghiệp dài hạn.",
    },
    {
      title:
        "FPT Telecom và Trường ĐH Khoa học Tự nhiên (ĐHQG-HCM) ký kết hợp tác: Chú trọng nhân lực Chip bán dẫn và Trí tuệ nhân tạo (AI)",
      type: "News",
      date: "Thứ Năm, 09/04/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-492026120000AM182053319thumbnail.png",
      href: "/tin-tuc/fpt-telecom-va-truong-dh-khoa-hoc-tu-nhien-dhqg-hcm-ky-ket-hop-tac-chu-trong-nhan-luc-chip-ban-dan-va-tri-tue-nhan-tao-ai-324",
      excerpt:
        "Ngày 09/04/2026, tại TP. Hồ Chí Minh, Công ty Cổ phần Viễn thông FPT và Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM đã chính thức trao Bản ghi nhớ hợp tác (MoU).",
    },
    {
      title: "FPT Telecom tổ chức chương trình tuyển dụng dành riêng cho quân nhân xuất ngũ",
      type: "News",
      date: "Thứ Sáu, 30/01/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-1302026120000AM135432627thumbnail.png",
      href: "/tin-tuc/fpt-telecom-to-chuc-chuong-trinh-tuyen-dung-danh-rieng-cho-quan-nhan-xuat-ngu-323",
      excerpt:
        "FPT Telecom tổ chức thành công chương trình tuyển dụng cho hơn 3500 quân nhân xuất ngũ của 3 thành phố Hải phòng, Hồ Chí Minh và Hà Nội.",
    },
    {
      title: "FPT TELECOM KÝ KẾT HỢP TÁC CHIẾN LƯỢC VỚI TRƯỜNG ĐH GIAO THÔNG VẬN TẢI TP.HCM",
      type: "News",
      date: "Thứ Năm, 15/01/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-1152026120000AM17223848thumbnail.png",
      href: "/tin-tuc/fpt-telecom-ky-ket-hop-tac-chien-luoc-voi-truong-dh-giao-thong-van-tai-tphcm-321",
      excerpt:
        "FPT Telecom và Trường Đại học Giao thông vận tải TP.HCM đã chính thức ký kết hợp tác chiến lược, đánh dấu bước phát triển mới trong mối quan hệ hợp tác giữa doanh nghiệp và nhà trường.",
    },
  ],
  sidebar: [
    {
      title: "TUYỂN DỤNG 500 VỊ TRÍ KHU VỰC TOÀN QUỐC",
      date: "Thứ Hai, 23/03/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-8857.png",
      href: "/su-kien-khao-sat/tuyen-dung-500-vi-tri-khu-vuc-toan-quoc-69",
    },
    {
      title: 'FPT TELECOM EMBEDDED BOOTCAMP 2026: TỪ "ZERO" ĐẾN TỰ TAY VIẾT HỆ ĐIỀU HÀNH RTOS',
      date: "Thứ Tư, 21/01/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3243.png",
      href: "/su-kien-khao-sat/fpt-telecom-embedded-bootcamp-2026-tu-zero-den-tu-tay-viet-he-dieu-hanh-rtos-90",
    },
    {
      title: "[MIỀN NAM] PHƯƠNG NAM TELECOM TUYỂN DỤNG NHÂN VIÊN KỸ THUẬT - 2025",
      date: "Thứ Tư, 12/03/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-1361.png",
      href: "/su-kien-khao-sat/mien-nam-phuong-nam-telecom-tuyen-dung-nhan-vien-ky-thuat-2025-74",
    },
    {
      title: "TUYỂN DỤNG NHÂN SỰ CÔNG NGHỆ CHO CÁC DỰ ÁN TRỌNG ĐIỂM",
      date: "Thứ Tư, 01/07/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3265.png",
      href: "/su-kien-khao-sat/tuyen-dung-nhan-su-cong-nghe-cho-cac-du-an-trong-diem-100",
    },
    {
      title: "TUYỂN DỤNG KỸ THUẬT VIÊN TOÀN QUỐC 2026",
      date: "Thứ Ba, 10/02/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3175.png",
      href: "/su-kien-khao-sat/tuyen-dung-ky-thuat-vien-toan-quoc-2026-92",
    },
    {
      title: "TUYỂN DỤNG 150 KỸ THUẬT VIÊN TOÀN QUỐC",
      date: "Thứ Tư, 17/12/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-7743.png",
      href: "/su-kien-khao-sat/tuyen-dung-150-ky-thuat-vien-toan-quoc-86",
    },
  ],
  pagination: [
    { label: "1", href: "#page-1", active: true },
    { label: "2", href: "#page-2" },
    { label: "3", href: "#page-3" },
    { label: "..." },
    { label: "8", href: "#page-8" },
    { label: "9", href: "#page-9" },
    { label: "10", href: "#page-10" },
    { label: "..." },
    { label: "16", href: "#page-16" },
    { label: "17", href: "#page-17" },
    { label: "18", href: "#page-18" },
    { label: "", href: "#page-2", next: true },
  ],
};

const eventsIndexPageData: FptNewsIndexPageData = {
  hero: {
    title: "Sự kiện",
    subtitle: "Tham gia vào các sự kiện tuyển dụng của chúng tôi.",
  },
  featuredAriaLabel: "Sự kiện nổi bật",
  featured: [
    {
      title: "TUYỂN DỤNG 500 VỊ TRÍ KHU VỰC TOÀN QUỐC",
      type: "Sự kiện nổi bật",
      date: "Thứ Hai, 23/03/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-8857.png",
      href: "/su-kien-khao-sat/tuyen-dung-500-vi-tri-khu-vuc-toan-quoc-69",
    },
    {
      title: 'FPT TELECOM EMBEDDED BOOTCAMP 2026: TỪ "ZERO" ĐẾN TỰ TAY VIẾT HỆ ĐIỀU HÀNH RTOS',
      type: "Sự kiện nổi bật",
      date: "Thứ Tư, 21/01/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3243.png",
      href: "/su-kien-khao-sat/fpt-telecom-embedded-bootcamp-2026-tu-zero-den-tu-tay-viet-he-dieu-hanh-rtos-90",
    },
    {
      title: "[MIỀN NAM] PHƯƠNG NAM TELECOM TUYỂN DỤNG NHÂN VIÊN KỸ THUẬT - 2025",
      type: "Sự kiện nổi bật",
      date: "Thứ Tư, 12/03/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-1361.png",
      href: "/su-kien-khao-sat/mien-nam-phuong-nam-telecom-tuyen-dung-nhan-vien-ky-thuat-2025-74",
    },
  ],
  latestTitle: "Sự kiện mới nhất",
  latestSubtitle: "Đừng bỏ lỡ các sự kiện thịnh hành.",
  latest: [
    {
      title: "TUYỂN DỤNG NHÂN SỰ CÔNG NGHỆ CHO CÁC DỰ ÁN TRỌNG ĐIỂM",
      type: "News",
      date: "Thứ Tư, 01/07/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3265.png",
      href: "/su-kien-khao-sat/tuyen-dung-nhan-su-cong-nghe-cho-cac-du-an-trong-diem-100",
      excerpt:
        "Chúng tôi đang tìm kiếm những mảnh ghép chiến lược để tham gia vào đội ngũ vận hành và phát triển các dự án trọng điểm của GTEL ICT, chuyên phục vụ trực tiếp cho Khối Chính phủ, các Bộ ban ngành trong sứ mệnh Chuyển đổi số Quốc gia.",
    },
    {
      title: "TUYỂN DỤNG KỸ THUẬT VIÊN TOÀN QUỐC 2026",
      type: "News",
      date: "Thứ Ba, 10/02/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3175.png",
      href: "/su-kien-khao-sat/tuyen-dung-ky-thuat-vien-toan-quoc-2026-92",
      excerpt:
        "Cơ hội nóng nhất năm: FPT Telecom tuyển dụng Kỹ thuật viên trên toàn quốc. Chỉ mất 30 giây để chạm tay vào thu nhập 12 - 18 triệu cùng lộ trình đào tạo và phúc lợi đầy đủ.",
    },
    {
      title: "TUYỂN DỤNG 150 KỸ THUẬT VIÊN TOÀN QUỐC",
      type: "News",
      date: "Thứ Tư, 17/12/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-7743.png",
      href: "/su-kien-khao-sat/tuyen-dung-150-ky-thuat-vien-toan-quoc-86",
      excerpt:
        "150 suất làm việc chính thức tại FPT Telecom trên toàn quốc đang chờ bạn. Ứng tuyển để nhận cơ hội thu nhập 12 - 18 triệu, phỏng vấn một vòng và trả kết quả nhanh.",
    },
    {
      title: "FPT TELECOM TUYỂN DỤNG NHÂN VIÊN TELESALES",
      type: "News",
      date: "Thứ Sáu, 12/09/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-7524.png",
      href: "/su-kien-khao-sat/fpt-telecom-tuyen-dung-nhan-vien-telesales-83",
      excerpt:
        "FPT Telecom tuyển dụng Nhân viên Telesales tại khu vực Hà Nội với mức thu nhập từ 18 - 30 triệu mỗi tháng. Phỏng vấn trúng tuyển và đi làm ngay.",
    },
    {
      title: "ĐĂNG KÝ THÔNG TIN CAREER BOOMING",
      type: "News",
      date: "Thứ Tư, 20/08/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-25.png",
      href: "/su-kien-khao-sat/dang-ky-thong-tin-career-booming-82",
      excerpt:
        "Dù bạn mới bắt đầu ngành học hay đang ở năm cuối, FPT Telecom luôn có cơ hội để bạn khai phóng năng lực và xây dựng sự nghiệp với mentor, dự án thật và lộ trình rõ ràng.",
    },
    {
      title: "[FPT TELECOM MIỀN NAM] ĐĂNG KÝ THÔNG TIN SINH VIÊN",
      type: "News",
      date: "Thứ Hai, 10/03/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3730.png",
      href: "/su-kien-khao-sat/fpt-telecom-mien-nam-dang-ky-thong-tin-sinh-vien-73",
      excerpt: "Đăng ký thông tin ứng tuyển và nhận quà tại gian hàng của FPT Telecom.",
    },
    {
      title: "[FPT TELECOM MIỀN BẮC] ĐĂNG KÝ THÔNG TIN SINH VIÊN",
      type: "News",
      date: "Thứ Hai, 10/03/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-3730.png",
      href: "/su-kien-khao-sat/fpt-telecom-mien-bac-dang-ky-thong-tin-sinh-vien-72",
      excerpt: "Đăng ký thông tin vào form bên dưới và nhận quà tại gian hàng của FPT Telecom.",
    },
    {
      title: "[MIỀN BẮC] FPT TELECOM TUYỂN DỤNG NHÂN VIÊN KỸ THUẬT - 2025",
      type: "News",
      date: "Thứ Ba, 04/03/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-8778.png",
      href: "/su-kien-khao-sat/mien-bac-fpt-telecom-tuyen-dung-nhan-vien-ky-thuat-2025-71",
      excerpt:
        "FPT Telecom đang tuyển dụng Kỹ thuật viên Viễn thông tại tất cả các tỉnh thành với mức thu nhập từ 10 - 20 triệu mỗi tháng, không yêu cầu kinh nghiệm.",
    },
    {
      title: "[MIỀN BẮC] FPT TELECOM TUYỂN DỤNG NHÂN VIÊN KINH DOANH - 2026",
      type: "News",
      date: "Thứ Ba, 04/03/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-thumbnail-203.png",
      href: "/su-kien-khao-sat/mien-bac-fpt-telecom-tuyen-dung-nhan-vien-kinh-doanh-2026-70",
      excerpt:
        "Thu nhập 10 - 20 triệu đồng với nhiều chế độ thưởng, lộ trình đào tạo kỹ năng bán hàng và phúc lợi đầy đủ theo chính sách của FPT Telecom.",
    },
  ],
  pageClassName: "fpt-events-index-page",
  pageHeading: "Các chương trình và sự kiện tuyển dụng tiêu biểu",
  sidebarTitle: "Tin tức nổi bật",
  sidebar: [
    {
      title: "FPT được vinh danh Giải Vàng Stevie Award cho Nhà tuyển dụng xuất sắc 2025",
      date: "Thứ Ba, 19/08/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-8192025120000AM9402187thumbnail.png",
      href: "/tin-tuc/fpt-duoc-vinh-danh-giai-vang-stevie-award-cho-nha-tuyen-dung-xuat-sac-2025-316",
    },
    {
      title: "Bí mật nào khiến FPT Telecom trở thành “nhà tuyển dụng quốc dân” mà ai cũng muốn đầu quân?",
      date: "Chủ Nhật, 06/07/2025",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-762025120000AM17510816thumbnail.png",
      href: "/tin-tuc/bi-mat-nao-khien-fpt-telecom-tro-thanh-nha-tuyen-dung-quoc-dan-ma-ai-cung-muon-dau-quan-315",
    },
    {
      title: "FPT Telecom nhận bằng khen của Bộ Khoa học và Công nghệ cho đóng góp phát triển IPv6 tại Việt Nam",
      date: "Thứ Ba, 30/06/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-6302026120000AM181549406thumbnail.png",
      href: "/tin-tuc/fpt-telecom-nhan-bang-khen-cua-bo-khoa-hoc-va-cong-nghe-cho-dong-gop-phat-trien-ipv6-tai-viet-nam-331",
    },
    {
      title: "IT là gì? Toàn cảnh ngành IT và cơ hội nghề nghiệp 2026",
      date: "Thứ Hai, 29/06/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-6292026120000AM141137995thumbnail.png",
      href: "/tin-tuc/it-la-gi-toan-canh-nganh-it-va-co-hoi-nghe-nghiep-2026-330",
    },
    {
      title: "Sinh viên Công nghệ Tập sự FPT Telecom 2026 — thực chiến có lương, lộ trình rõ ngay từ năm 3",
      date: "Thứ Năm, 14/05/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-5142026120000AM18058299thumbnail.png",
      href: "/tin-tuc/sinh-vien-cong-nghe-tap-su-fpt-telecom-2026---thuc-chien-co-luong-lo-trinh-ro-ngay-tu-nam-3-329",
    },
    {
      title: "Thực tập FPT Telecom 2026 — chương trình internship quy mô lớn nhất năm chính thức mở đơn",
      date: "Thứ Năm, 14/05/2026",
      image: "/images/fptjobs/fptjobs-com-Media-Images-ArticleImages-5142026120000AM171425323thumbnail.png",
      href: "/tin-tuc/thuc-tap-fpt-telecom-2026---chuong-trinh-internship-quy-mo-lon-nhat-nam-chinh-thuc-mo-don-328",
    },
  ],
  pagination: [
    { label: "1", href: "#page-1", active: true },
    { label: "2", href: "#page-2" },
    { label: "3", href: "#page-3" },
    { label: "4", href: "#page-4" },
    { label: "5", href: "#page-5" },
    { label: "6", href: "#page-6" },
    { label: "", href: "#page-2", next: true },
  ],
};

const surveyProvinceOptions = [
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Tĩnh",
  "Hưng Yên",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "TP. Cần Thơ",
  "TP. Đà Nẵng",
  "TP. Hà Nội",
  "TP. Hải Phòng",
  "TP. Hồ Chí Minh",
  "TP. Huế",
  "Vĩnh Long",
  "Khác...",
];

const surveyEducationOptions = ["Đại học", "Cao đẳng", "Trung cấp", "Trung học Phổ thông", "Khác..."];

const surveyLegacyEducationOptions = ["Trên Đại học", "Đại học", "Cao đẳng", "Trung cấp", "THPT", "Khác"];

const northSurveyProvinceOptions = [
  "Hà Nội",
  "Bắc Giang",
  "Bắc Ninh",
  "Cao Bằng",
  "Điện Biên",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hải Phòng",
  "Hoà Bình",
  "Hưng Yên",
  "Lạng Sơn",
  "Lào Cai",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ninh",
  "Sơn La",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hoá",
  "Tuyên Quang",
  "Vĩnh Phúc",
  "Yên Bái",
];

const careerBoomingRegionOptions = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cần Thơ",
  "Cao Bằng",
  "Đắk Lắk",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Tĩnh",
  "Hải Phòng",
  "Huế",
  "Hưng Yên",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tuyên Quang",
  "Vĩnh Long",
];

const surveyTechnicianFields: FptSurveyFormField[] = [
  { type: "text", label: "Họ và tên", required: true },
  { type: "date", label: "Ngày tháng năm sinh", required: true },
  { type: "text", label: "Số điện thoại", required: true },
  { type: "text", label: "Email", required: true },
  { type: "select", label: "Tỉnh thành", options: surveyProvinceOptions, required: true },
  { type: "text", label: "Phường/ Xã bạn muốn làm việc", description: "Ví dụ: Phường Tây Hồ, Phường Tân Hưng,..", required: true },
  { type: "select", label: "Trình độ học vấn của bạn?", options: surveyEducationOptions, required: true },
  { type: "text", label: "Tên trường bạn theo học", required: true },
  { type: "text", label: "Chuyên ngành bạn theo học", required: true },
  {
    type: "text",
    label: "Liệt kê một số công việc bạn từng làm (nếu có)",
    description: "Ví dụ: 01/2024 - 06/2024: Nhân viên lắp đặt thiết bị điện...",
  },
];

const northRecruitmentBaseFields: FptSurveyFormField[] = [
  { type: "text", label: "Họ và tên", required: true },
  { type: "date", label: "Ngày tháng năm sinh", required: true },
  { type: "text", label: "Số điện thoại", required: true },
  { type: "text", label: "Email", required: true },
  {
    type: "select",
    label: "Tỉnh thành",
    description: "Tỉnh thành bạn mong muốn làm việc:",
    options: northSurveyProvinceOptions,
    required: true,
  },
  { type: "text", label: "Nơi bạn đang sinh sống", required: true },
  { type: "radio", label: "Trình độ học vấn của bạn", options: surveyLegacyEducationOptions, required: true },
  { type: "text", label: "Trường theo học", required: true },
];

const studentSurveyBaseFields: FptSurveyFormField[] = [
  { type: "text", label: "Họ và tên", required: true },
  { type: "date", label: "Ngày tháng năm sinh", required: true },
  { type: "text", label: "Số điện thoại", required: true },
  { type: "text", label: "Email", required: true },
  { type: "text", label: "Tỉnh thành", required: true },
];

const surveyEventDetails: FptSurveyEventDetail[] = [
  {
    slug: "fpt-telecom-tuyen-dung-nhan-vien-telesales-83",
    title: "FPT TELECOM TUYỂN DỤNG NHÂN VIÊN TELESALES",
    date: "Thứ Sáu, 12/09/2025",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-462566747_1269699270839318_3080870915856270854_n.jpg",
    description:
      "FPT Telecom đang tuyển dụng Nhân viên Telesales tại khu vực Hà Nội với mức thu nhập từ 18 - 30 triệu/tháng.",
    expired: true,
    contentHtml: `
      <p>FPT TELECOM đang tuyển dụng Nhân viên Telesales tại khu vực Hà Nội với <strong>mức thu nhập từ 18 - 30 triệu/ tháng</strong>:</p>
      <p>⭐️ PHỎNG VẤN TRÚNG TUYỂN - ĐI LÀM NGAY</p>
      <h2><span style="font-size:14px"><strong>MÔ TẢ CÔNG VIỆC:</strong></span></h2>
      <ul>
        <li>Gọi điện tư vấn, giới thiệu dịch vụ của FPT Telecom (Internet, Truyền hình, Camera) đến khách hàng <strong>từ nguồn data có sẵn.</strong></li>
        <li>Tư vấn khách hàng qua các kênh bán hàng (fanpage, web, app).</li>
        <li>Tư vấn, giải đáp thắc mắc, hỗ trợ khách hàng trong quá trình đăng ký sử dụng dịch vụ.</li>
        <li>Tạo và theo dõi đơn hàng theo từng trạng thái trên hệ thống.</li>
        <li>Phối hợp với các bộ phận liên quan đảm bảo trải nghiệm khách hàng.</li>
        <li>Báo cáo kết quả làm việc hàng ngày/tuần/tháng.</li>
      </ul>
      <h2><span style="font-size:14px"><strong>YÊU CẦU:</strong></span></h2>
      <ul>
        <li>Nam/Nữ, tuổi từ 20-30.</li>
        <li>Trình độ tương đương Cao đẳng trở lên.</li>
        <li>Có ít nhất 1 năm kinh nghiệm telesale/ sale online.</li>
        <li>Ưu tiên ứng viên có kinh nghiệm telesale/ sale online trong lĩnh vực giáo dục trực tuyến, tư vấn các sản phẩm về công nghệ, bán lẻ...</li>
        <li>Giọng nói rõ ràng, kỹ năng giao tiếp và xử lý tình huống tốt.</li>
        <li>Biết sử dụng các công cụ cơ bản: Excel, CRM, Email...</li>
      </ul>
      <h2><span style="font-size:14px"><strong>QUYỀN LỢI:</strong></span></h2>
      <ul>
        <li>Thu nhập hấp dẫn, thưởng lương tháng 13, nghỉ mát...</li>
        <li>Được hưởng đầy đủ các chế độ theo luật lao động hiện hành: BHYT, BHXH...</li>
        <li>Phúc lợi: Khám sức khỏe định kỳ hàng năm, gói bảo hiểm sức khỏe chuyên biệt FPT Care dành cho việc khám và chữa bệnh nội, ngoại trú.</li>
        <li>Môi trường làm việc thân thiện, chuyên nghiệp, năng động và trẻ trung.</li>
        <li>Văn hóa doanh nghiệp đặc sắc, sinh động bậc nhất với nhiều hoạt động hấp dẫn: Tân binh hội nhập, nghỉ mát, team building, thi Trạng, hội Làng, CLB thể thao/văn nghệ/ thiện nguyện...</li>
        <li>Được tham gia các chương trình đào tạo nghiệp vụ, phát triển kỹ năng của công ty.</li>
      </ul>
      <p>❌ <strong>Ghi chú: Công ty không thu bất kỳ chi phí nào của Ứng viên trong quá trình tuyển dụng, thực tập.</strong></p>
      <p>ỨNG TUYỂN NGAY BẰNG CÁCH ĐĂNG KÝ THÔNG TIN DƯỚI ĐÂY</p>
    `,
    formFields: [
      ...northRecruitmentBaseFields.map((field) =>
        field.label === "Tỉnh thành" ? { ...field, options: ["Hà Nội"] } : field,
      ),
      { type: "text", label: "Chuyên ngành", required: true },
      { type: "textarea", label: "Kinh nghiệm làm việc/Hoạt động ngoại khóa của bạn (nếu có)" },
      { type: "text", label: "Giới thiệu bạn bè đang tìm việc (Họ tên - số điện thoại)" },
    ],
  },
  {
    slug: "dang-ky-thong-tin-career-booming-82",
    title: "ĐĂNG KÝ THÔNG TIN CAREER BOOMING",
    date: "Thứ Tư, 20/08/2025",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-1920x503.png",
    description:
      "FPT Telecom luôn có cơ hội để bạn khai phóng năng lực và xây dựng sự nghiệp cùng các chương trình sinh viên tài năng.",
    contentHtml: `
      <p>Dù bạn mới log in ngành học hay đang cày rank năm cuối, FPT Telecom luôn có cơ hội để bạn khai phóng năng lực và xây dựng sự nghiệp:</p>
      <ul>
        <li>Các chương trình Sinh viên tài năng với combo quyền lợi khủng</li>
        <li>Được mentor kèm cặp 1:1 truyền nghề</li>
        <li>Làm thật - dự án thật, tăng chỉ số thực chiến</li>
        <li>Unlock cơ hội việc làm dù chưa tốt nghiệp</li>
      </ul>
      <p>👉Chọn Job. Chọn Team. Bắt đầu hành trình của bạn ngay hôm nay!</p>
    `,
    formFields: [
      { type: "text", label: "Họ và tên", required: true },
      { type: "date", label: "Ngày tháng năm sinh", required: true },
      { type: "text", label: "Số điện thoại", required: true },
      { type: "text", label: "Email", required: true },
      { type: "select", label: "Tỉnh thành", options: surveyProvinceOptions, required: true },
      { type: "text", label: "Tên trường", required: true },
      { type: "text", label: "Chuyên ngành đào tạo", required: true },
      { type: "text", label: "Thời gian tốt nghiệp (Tháng/Năm)", required: true },
      { type: "select", label: "Khu vực ứng tuyển", options: careerBoomingRegionOptions, required: true },
      {
        type: "checkbox",
        label: "Lĩnh vực ứng tuyển",
        options: ["Viễn thông", "Công nghệ thông tin", "Điện - Cơ điện - Tự động hóa", "Kinh doanh DVKH", "Back-office"],
      },
      { type: "upload", label: "Đính kèm CV" },
    ],
  },
  {
    slug: "fpt-telecom-mien-nam-dang-ky-thong-tin-sinh-vien-73",
    title: "[FPT TELECOM MIỀN NAM] ĐĂNG KÝ THÔNG TIN SINH VIÊN",
    date: "Thứ Hai, 10/03/2025",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-1920x503.png",
    description: "Đăng ký thông tin ứng tuyển và nhận quà tại gian hàng của FPT Telecom.",
    expired: true,
    contentHtml: `
      <p>Đăng ký thông tin ứng tuyển và nhận quà tại gian hàng của FPT Telecom nhé!</p>
    `,
    formFields: [
      ...studentSurveyBaseFields,
      { type: "text", label: "Bạn đang/ đã học trường nào?", required: true },
      { type: "text", label: "Chuyên ngành của bạn là gì?", required: true },
      { type: "text", label: "Vị trí công việc bạn quan tâm?", required: true },
      {
        type: "text",
        label: "Bạn còn có câu hỏi nào dành cho chúng tôi không? Nếu có, vui lòng ghi rõ (chúng tôi sẽ xem xét và phúc đáp qua email cho bạn)",
      },
      { type: "upload", label: "Đính kèm CV" },
    ],
  },
  {
    slug: "fpt-telecom-mien-bac-dang-ky-thong-tin-sinh-vien-72",
    title: "[FPT TELECOM MIỀN BẮC] ĐĂNG KÝ THÔNG TIN SINH VIÊN",
    date: "Thứ Hai, 10/03/2025",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-1920x503.png",
    description: "Đăng ký thông tin vào form bên dưới và nhận quà tại gian hàng của FPT Telecom.",
    expired: true,
    contentHtml: `
      <p>Đăng ký thông tin vào form bên dưới và nhận quà tại gian hàng của FPT Telecom nhé!</p>
    `,
    formFields: [
      ...studentSurveyBaseFields,
      { type: "text", label: "Bạn đang học trường nào?", required: true },
      { type: "text", label: "Bạn đang là sinh viên năm mấy?", required: true },
      { type: "text", label: "Điểm GPA của bạn?", required: true },
      { type: "text", label: "Chuyên ngành của bạn là gì?", required: true },
      { type: "text", label: "Vị trí công việc bạn quan tâm?", required: true },
      {
        type: "text",
        label: "Bạn còn có câu hỏi nào dành cho chúng tôi không? Nếu có, vui lòng ghi rõ (chúng tôi sẽ xem xét và phúc đáp qua email cho bạn)",
      },
      { type: "upload", label: "Đính kèm CV" },
    ],
  },
  {
    slug: "mien-bac-fpt-telecom-tuyen-dung-nhan-vien-ky-thuat-2025-71",
    title: "[MIỀN BẮC] FPT TELECOM TUYỂN DỤNG NHÂN VIÊN KỸ THUẬT - 2025",
    date: "Thứ Ba, 04/03/2025",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-462566747_1269699270839318_3080870915856270854_n.jpg",
    description:
      "FPT Telecom đang tuyển dụng Kỹ thuật viên Viễn thông tại tất cả các tỉnh thành với mức thu nhập từ 10 - 20 triệu/tháng.",
    expired: true,
    contentHtml: `
      <p>FPT TELECOM đang tuyển dụng Kỹ thuật viên Viễn thông tại tất cả các tỉnh thành với <strong>mức thu nhập từ 10 - 20 triệu/ tháng</strong>:</p>
      <p>⭐️ KHÔNG YÊU CẦU KINH NGHIỆM</p>
      <p>⭐️ PHỎNG VẤN TRÚNG TUYỂN - ĐI LÀM NGAY</p>
      <p><strong>MÔ TẢ:</strong><br />+ Triển khai và bảo trì đường truyền Internet, Truyền hình FPT Play, Camera... do FPT Telecom cung cấp.<br />+ Lắp đặt và thay thế/thu hồi thiết bị tại nhà khách hàng.<br />+ Hỗ trợ tư vấn các chính sách liên quan.</p>
      <p><strong>YÊU CẦU:</strong><br />+ Nam tuổi từ 20 - 35, tốt nghiệp trung cấp nghề trở lên với chuyên ngành khối kỹ thuật.<br />+ Có điện thoại smartphone và xe máy di chuyển.</p>
      <p><strong>QUYỀN LỢI:</strong><br />+ <strong>Thu nhập lên đến 17 triệu/tháng</strong> (lương, thưởng tháng 13, thưởng thi đua, Top nhân viên xuất sắc...).<br />+ Được đào tạo kỹ năng, chuyên môn bài bản, lộ trình phát triển thăng tiến rõ ràng.<br />+ Được <strong>đóng đầy đủ BHYT, BHXH, BHTN, Bảo hiểm sức khoẻ TINcare</strong> ngay khi ký hợp đồng chính thức.<br />+ Được đề xuất nơi làm việc mong muốn.</p>
      <p>❌ <strong>Ghi chú: Công ty không thu bất kỳ chi phí nào của Ứng viên trong quá trình tuyển dụng, thực tập.</strong></p>
      <p>ỨNG TUYỂN NGAY BẰNG CÁCH ĐĂNG KÝ THÔNG TIN DƯỚI ĐÂY</p>
    `,
    formFields: [
      ...northRecruitmentBaseFields,
      { type: "text", label: "Chuyên ngành", required: true },
      { type: "textarea", label: "Kinh nghiệm làm việc/Hoạt động ngoại khóa của bạn (nếu có)" },
      { type: "text", label: "Giới thiệu bạn bè đang tìm việc (Họ tên - số điện thoại)" },
    ],
  },
  {
    slug: "mien-bac-fpt-telecom-tuyen-dung-nhan-vien-kinh-doanh-2026-70",
    title: "[MIỀN BẮC] FPT TELECOM TUYỂN DỤNG NHÂN VIÊN KINH DOANH - 2026",
    date: "Thứ Ba, 04/03/2025",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-462566747_1269699270839318_3080870915856270854_n.jpg",
    description:
      "Tuyển dụng Nhân viên Kinh doanh miền Bắc với thu nhập 10 - 20 triệu VND, chế độ thưởng đa dạng và đào tạo kỹ năng bán hàng.",
    contentHtml: `
      <p><strong>THU NHẬP: 10,000,000 - 20,000,000 VND</strong><br /><strong>QUYỀN LỢI</strong><br />- Thu nhập lên tới <strong>20 triệu</strong></p>
      <p>- Đa dạng chế độ thưởng (quý, năm...)</p>
      <p>- Được đào tạo và phát triển kỹ năng bán hàng.</p>
      <p>- Được hưởng đầy đủ chế độ phúc lợi theo Luật lao động, chế độ nghỉ mát, du lịch hàng năm.</p>
      <p><strong>CHI TIẾT CÔNG VIỆC</strong></p>
      <p>- Tìm kiếm thông tin, tiếp cận khách hàng tiềm năng.</p>
      <p>- Tư vấn cho khách hàng về các dịch vụ Internet và dịch vụ Truyền Hình FPT</p>
      <p>- Đàm phán thương lượng, thực hiện các thủ tục ký kết hợp đồng với khách hàng.</p>
      <p>- Thấu cảm, tạo ra những tương tác, trải nghiệm cá nhân hóa tới người dùng/khách hàng trên các kênh (online/offline) ở mọi điểm chạm.</p>
      <p><strong>YÊU CẦU</strong></p>
      <p>- Tuổi từ 20-35, làm việc TOÀN THỜI GIAN.</p>
      <p>- Tốt nghiệp Trung cấp trở lên, chấp nhận sinh viên mới mới ra trường (Đã có xác nhận tốt nghiệp)</p>
      <p>- Các ứng viên có kinh nghiệm trong lĩnh vực hàng tiêu dùng, Viễn thông là một lợi thế.</p>
      <p>- Có tư duy lấy khách hàng làm trọng tâm.</p>
      <p>Ghi chú: FPT Telecom không thu bất kỳ chi phí nào của Ứng viên, Sinh viên trong quá trình tuyển dụng, thực tập</p>
    `,
    formFields: [
      ...northRecruitmentBaseFields,
      { type: "text", label: "Chuyên ngành", required: true },
      { type: "textarea", label: "Kinh nghiệm làm việc/Hoạt động ngoại khóa của bạn (nếu có)" },
      { type: "text", label: "Giới thiệu bạn bè mong muốn tìm việc làm (Họ tên, số điện thoại)" },
    ],
  },
  {
    slug: "tuyen-dung-500-vi-tri-khu-vuc-toan-quoc-69",
    title: "TUYỂN DỤNG 500 VỊ TRÍ KHU VỰC TOÀN QUỐC",
    date: "Thứ Hai, 23/03/2026",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-dai-ngang.png",
    description:
      "FPT Telecom đang tuyển dụng nhiều vị trí trên Toàn Quốc, phù hợp với các bạn muốn làm việc ổn định, gần nhà và có cơ hội phát triển lâu dài.",
    expired: true,
    contentHtml: `
      <p><strong>FPT Telecom đang tuyển dụng nhiều vị trí trên Toàn Quốc, phù hợp với các bạn muốn làm việc ổn định, gần nhà và có cơ hội phát triển lâu dài.</strong></p>
      <p><strong>KHÔNG YÊU CẦU KINH NGHIỆM - ĐƯỢC HƯỚNG DẪN ĐÀO TẠO NGHỀ TỪ ĐẦU</strong></p>
      <p><strong>📍 Các vị trí đang tuyển:</strong></p>
      <p><strong>🔸 Nhân viên Kinh doanh:</strong> Tìm kiếm, tư vấn và hỗ trợ khách hàng sử dụng dịch vụ Internet, Truyền hình, Camera..</p>
      <p><strong>🔹 Kỹ thuật viên:</strong> Triển khai, bảo trì và lắp đặt đường truyền & thiết bị: Internet, Truyền hình FPT Play, Camera...</p>
      <p><strong>🔸 Nhân viên Dịch vụ Khách hàng:</strong> Tiếp nhận và giải đáp thắc mắc, hỗ trợ khách hàng qua các kênh liên hệ.</p>
      <p><strong>🎁 Quyền lợi:</strong></p>
      <p><strong>✔️ Lương tháng 12 - 20 triệu đồng. Công việc ổn định, dài hạn</strong></p>
      <p><strong>✔️ Lương tháng 13 + thưởng theo hiệu quả công việc</strong></p>
      <p><strong>✔️ Tham gia đầy đủ BHXH, BHYT, khám sức khỏe định kỳ</strong></p>
      <p><strong>✔️ Môi trường trẻ, đồng nghiệp thân thiện, có du lịch/nghỉ mát hàng năm</strong></p>
      <p><strong>Hãy điền các thông tin và ứng tuyển dưới đây để FPT Telecom liên hệ lại với bạn nhé!</strong></p>
    `,
    formFields: [
      { type: "text", label: "Họ và tên", required: true },
      { type: "date", label: "Ngày tháng năm sinh", required: true },
      { type: "text", label: "Số điện thoại", required: true },
      { type: "text", label: "Email", required: true },
      {
        type: "select",
        label: "Vị trí bạn quan tâm?",
        description: "Chọn vị trí bạn mong muốn ứng tuyển",
        options: ["Kỹ thuật viên", "Nhân viên kinh doanh", "Dịch vụ Khách hàng"],
        required: true,
      },
      {
        type: "select",
        label: "Trình độ học vấn của bạn?",
        description: "Đính kèm CV để FPT Telecom hiểu hơn về bạn nhé (không bắt buộc)",
        options: ["Đại học", "Cao đẳng", "Trung cấp", "THPT", "Khác"],
        required: true,
      },
      {
        type: "checkbox",
        label: "Khu vực/Tỉnh thành bạn muốn làm việc?",
        options: [
          "Bắc Giang",
          "Bắc Ninh",
          "Cao Bằng",
          "Hà Giang",
          "Hòa Bình",
          "Lào Cai",
          "Lạng Sơn",
          "Phú Thọ",
          "Thái Nguyên",
          "Tuyên Quang",
          "Vĩnh Phúc",
          "Yên Bái",
          "Khác...",
        ],
        required: true,
      },
      { type: "text", label: "Bạn có điều gì cần được giải đáp/hỗ trợ thêm không?", required: true },
      { type: "upload", label: "Đính kèm CV" },
    ],
  },
  {
    slug: "fpt-telecom-embedded-bootcamp-2026-tu-zero-den-tu-tay-viet-he-dieu-hanh-rtos-90",
    title: 'FPT TELECOM EMBEDDED BOOTCAMP 2026: TỪ "ZERO" ĐẾN TỰ TAY VIẾT HỆ ĐIỀU HÀNH RTOS',
    date: "Thứ Tư, 21/01/2026",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-untitled-design-5.png",
    description:
      "FPT Telecom Embedded Bootcamp 2026 chính thức khởi động - chương trình đào tạo trọng điểm cho thế hệ kỹ sư nguồn Embedded.",
    expired: true,
    extraImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-untitled-design-5.png",
    contentHtml: `
      <p><span><strong>FPT Telecom Embedded Bootcamp 2026 chính thức khởi động - Chương trình đào tạo trọng điểm nhằm tìm kiếm và mài giũa thế hệ kỹ sư nguồn (Core Team) cho các sản phẩm Embedded triệu người dùng của Nhà Cáo.</strong></span></p>
      <p><strong>💎 VÌ SAO BẠN KHÔNG NÊN BỎ LỠ BOOTCAMP NÀY?</strong><br />Đây không phải lớp học lý thuyết. Đây là môi trường "thực chiến" giúp bạn:<br />✅ <strong>Master tư duy hệ thống:</strong> Đi từ Cấu trúc dữ liệu đến kiến trúc Event-Driven hiện đại.<br />✅ <strong>Đặc quyền công nghệ:</strong> Lần đầu tiên được tiếp cận và đào tạo chuyên sâu về AK-mOS - Học cách tự viết một hệ điều hành RTOS (Scheduler, Task Management...) từ con số 0.<br />✅ <strong>Mentor 1:1:</strong> Được "cầm tay chỉ việc" bởi các Senior/Principal Engineer trực tiếp phát triển sản phẩm công nghệ của FPT.<br />✅ <strong>Tấm vé vàng:</strong> Top 20 học viên xuất sắc nhất sẽ được TUYỂN THẲNG vào vị trí TTS Tài năng (có lương) hoặc Nhân viên chính thức.<br />✅ <strong>Chứng nhận độc quyền:</strong> Bảo chứng năng lực kỹ thuật từ FPT Telecom.</p>
      <p><strong>💎 LỘ TRÌNH "HARDCORE" 3 THÁNG (ONLINE & OFFLINE)</strong><br />Chúng tôi không dạy những thứ Google có sẵn. Chúng tôi dạy tư duy giải quyết vấn đề:<br />🔸 <strong>Module 1:</strong> Algorithm & Data Structure - Nền tảng bắt buộc của mọi kỹ sư giỏi.<br />🔸 <strong>Module 2:</strong> Event-Driven Programming - Phương pháp lập trình hướng sự kiện, chìa khóa cho các hệ thống Embedded lớn.<br />🔸 <strong>Module 3:</strong> Embedded Linux Basics - Làm chủ hệ điều hành phổ biến nhất thế giới nhúng.<br />🔸 <strong>Module 4:</strong> Build Your Own RTOS (AK-mOS) - Thử thách cao nhất: Tự tay code các thành phần cốt lõi của một hệ điều hành thời gian thực.</p>
      <p>⏳ <strong>Hạn cuối đăng ký: 06/02/2026 (Khai giảng ngay sau Tết Âm lịch).</strong></p>
      <p><em>Chương trình dành cho sinh viên khối CNTT, Điện - Điện tử, Tự động hóa và người đi làm có hứng thú với Embedded. Lưu ý số lượng tuyển sinh giới hạn, ưu tiên các hồ sơ đăng ký sớm và phù hợp.</em></p>
      <p><em>Lịch học dự kiến: 9h00 sáng Thứ 7 mỗi tuần (Buổi đầu: 07/03/2026)</em></p>
      <p><strong><em>FPT Telecom cam kết không thu bất kỳ chi phí nào trong suốt quá trình đăng ký và học tập.</em></strong></p>
    `,
    formFields: [
      { type: "text", label: "Họ và tên", required: true },
      { type: "date", label: "Ngày tháng năm sinh", required: true },
      { type: "text", label: "Số điện thoại", required: true },
      { type: "text", label: "Email", required: true },
      { type: "select", label: "Tỉnh thành", options: ["Hồ Chí Minh", "Hà Nội", "Khác..."], required: true },
      { type: "select", label: "Hiện tại bạn đang là:", options: ["Sinh viên", "Thực tập sinh", "Người đã đi làm", "Khác..."], required: true },
      { type: "text", label: "Trường học/Công ty hiện tại của bạn:", required: true },
      { type: "text", label: "Chuyên ngành hoặc lĩnh vực bạn đang theo đuổi" },
      {
        type: "select",
        label: "Mức độ kinh nghiệm của bạn với Embedded:",
        options: ["Chưa có, đang tìm hiểu nghiêm túc", "Đã học và làm project cá nhân", "Đã từng làm việc thực tế", "Đang làm Embedded chuyên nghiệp"],
        required: true,
      },
      { type: "textarea", label: "Vì sao bạn chọn tham gia FPT Telecom Embedded Bootcamp?", required: true },
      { type: "textarea", label: "Bạn kỳ vọng điều gì sau khi hoàn thành chương trình?", required: true },
      {
        type: "select",
        label: "Chương trình kéo dài 3-6 tháng và yêu cầu cam kết học tập nghiêm túc. Bạn có thể sắp xếp thời gian tham gia đầy đủ không?",
        options: ["Có thể sắp xếp", "Cân nhắc thêm"],
        required: true,
      },
      { type: "upload", label: "Đính kèm CV" },
    ],
  },
  {
    slug: "mien-nam-phuong-nam-telecom-tuyen-dung-nhan-vien-ky-thuat-2025-74",
    title: "[MIỀN NAM] PHƯƠNG NAM TELECOM TUYỂN DỤNG NHÂN VIÊN KỸ THUẬT - 2025",
    date: "Thứ Tư, 12/03/2025",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-462566747_1269699270839318_3080870915856270854_n.jpg",
    description:
      "Phương Nam Telecom - đối tác tuyển dụng chính thức của FPT Telecom đang tuyển dụng Kỹ thuật viên Viễn thông tại tất cả các tỉnh thành.",
    expired: true,
    extraImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-toan-quoc-1.png",
    contentHtml: `
      <p>Phương Nam Telecom - Đối tác tuyển dụng chính thức của FPT Telecom đang tuyển dụng Kỹ thuật viên Viễn thông tại tất cả các tỉnh thành với <strong>mức thu nhập từ 10 - 17 triệu/ tháng</strong>:</p>
      <p>⭐️ KHÔNG YÊU CẦU KINH NGHIỆM</p>
      <p>⭐️ PHỎNG VẤN TRÚNG TUYỂN - ĐI LÀM NGAY</p>
      <p><strong>MÔ TẢ:</strong><br />+ Triển khai và bảo trì đường truyền Internet, Truyền hình FPT Play, Camera... do FPT Telecom cung cấp.<br />+ Lắp đặt và thay thế/thu hồi thiết bị tại nhà khách hàng.<br />+ Hỗ trợ tư vấn các chính sách liên quan.</p>
      <p><strong>YÊU CẦU:</strong><br />+ Nam tuổi từ 20 - 35, tốt nghiệp trung cấp nghề trở lên với chuyên ngành khối kỹ thuật.<br />+ Có điện thoại smartphone và xe máy di chuyển.</p>
      <p><strong>QUYỀN LỢI:</strong><br />+ <strong>Thu nhập lên đến 17 triệu/tháng</strong> (lương, thưởng tháng 13, thưởng thi đua, Top nhân viên xuất sắc...).<br />+ Được đào tạo kỹ năng, chuyên môn bài bản, lộ trình phát triển thăng tiến rõ ràng.<br />+ Được <strong>đóng đầy đủ BHYT, BHXH, BHTN, Bảo hiểm sức khoẻ PNCcare</strong> ngay khi ký hợp đồng chính thức.<br />+ Được đề xuất nơi làm việc mong muốn.</p>
      <p>❌ <strong>Ghi chú: Công ty không thu bất kỳ chi phí nào của Ứng viên trong quá trình tuyển dụng, thực tập.</strong></p>
      <p>ỨNG TUYỂN NGAY BẰNG CÁCH ĐĂNG KÝ THÔNG TIN DƯỚI ĐÂY</p>
    `,
    formFields: [
      { type: "text", label: "Họ và tên", required: true },
      { type: "date", label: "Ngày tháng năm sinh", required: true },
      { type: "text", label: "Số điện thoại", required: true },
      { type: "text", label: "Email", required: true },
      { type: "select", label: "Vị trí bạn mong muốn ứng tuyển", options: ["Kỹ thuật viên", "Thực tập sinh kỹ thuật", "Đội trưởng kỹ thuật viên"], required: true },
      {
        type: "select",
        label: "Khu vực tỉnh làm việc mong muốn",
        options: [
          "An Giang",
          "Bình Định",
          "Bình Phước",
          "Cần Thơ",
          "Đà Nẵng",
          "Đồng Nai",
          "Gia Lai",
          "Hậu Giang",
          "Huế",
          "Kiên Giang",
          "Kon Tum",
          "Khánh Hòa",
          "Lâm Đồng",
          "Long An",
          "Hồ Chí Minh",
          "Quảng Nam",
          "Quảng Ngãi",
          "Tây Ninh",
          "Tiền Giang",
          "Vũng Tàu",
          "Sóc Trăng",
          "Khác...",
        ],
        required: true,
      },
      { type: "text", label: "Địa chỉ hiện tại của bạn:", required: true },
      { type: "radio", label: "Trình độ học vấn của bạn", options: ["Trên Đại học", "Đại học", "Cao đẳng", "Trung cấp", "THPT", "Khác"], required: true },
      { type: "text", label: "Trường theo học", required: true },
      { type: "text", label: "Chuyên ngành", required: true },
      {
        type: "textarea",
        label: "Liệt kê một số công việc bạn từng làm (Ví dụ: 01/2024 - 06/2024: Nhân viên kỹ thuật - Công ty ....) Nếu Có",
      },
    ],
  },
  {
    slug: "tuyen-dung-nhan-su-cong-nghe-cho-cac-du-an-trong-diem-100",
    title: "TUYỂN DỤNG NHÂN SỰ CÔNG NGHỆ CHO CÁC DỰ ÁN TRỌNG ĐIỂM",
    date: "Thứ Tư, 01/07/2026",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-banner-fb.png",
    description:
      "Chúng tôi đang tìm kiếm những mảnh ghép chiến lược để tham gia vào đội ngũ vận hành và phát triển các dự án trọng điểm của GTEL ICT.",
    tags: ["gtel"],
    contentHtml: `
      <p>Chúng tôi đang tìm kiếm những mảnh ghép chiến lược để tham gia vào đội ngũ vận hành và phát triển các dự án trọng điểm của GTEL ICT - chuyên phục vụ trực tiếp cho Khối Chính phủ, các Bộ ban ngành trong sứ mệnh Chuyển đổi số Quốc gia.</p>
      <p>Dù bạn là một Lead hay Senior công nghệ muốn ghi dấu bản thân bằng những bài toán hóc búa, những giải pháp tiên phong; hay là một tài năng trẻ Junior/Fresher khao khát một môi trường thực chiến để trưởng thành thần tốc - Dự án GTEL ICT chính là bệ phóng dành cho bạn!</p>
      <p><strong>CHÚNG TÔI ĐANG TÌM KIẾM CÁC VỊ TRÍ CỐT LÕI:</strong></p>
      <p><strong>1. Nhóm Quản trị Dự án:</strong></p>
      <p>🔹 Project Manager (PM)</p>
      <p><strong>2. Nhóm Hạ tầng & Dữ liệu lõi:</strong></p>
      <p>🔹 DevOps Lead</p>
      <p>🔹 DevOps (Fresher/Junior/Middle/Senior)</p>
      <p>🔹 Database Administrator (DBA)</p>
      <p><strong>3. Nhóm Phân tích Hệ thống & Dữ liệu:</strong></p>
      <p>🔹 BA Nghiệp vụ / BA Dữ liệu (Data BA) / BA Lead</p>
      <p><strong>4. Nhóm Phát triển Phần mềm:</strong></p>
      <p>🔹 Tech Lead / Dev Lead (Backend Java)</p>
      <p>🔹 Dev Backend (Java) / Dev Frontend</p>
      <p><strong>5. Nhóm Đảm bảo Chất lượng:</strong></p>
      <p>🔹 Test Lead / QA / Tester (Junior/Middle/Senior)</p>
      <p><strong>Thông tin chi tiết các vị trí: <a href="https://docs.google.com/spreadsheets/d/1zysse6Hx_QoG2GCTXNi_A95_20P-s0FI7MAnBowh2_I/edit?usp=sharing">LINK</a></strong></p>
      <p><strong>Khu vực tuyển dụng: Hà Nội</strong></p>
      <p><strong>BẠN SẼ NHẬN ĐƯỢC:</strong></p>
      <p>✅ Được trực tiếp tham gia vào các dự án công nghệ trọng điểm, quy mô lớn, phụng sự cho sứ mệnh Chuyển đổi số quốc gia.</p>
      <p>✅ Gói thu nhập hấp dẫn, cạnh tranh</p>
      <p>✅ Đầy đủ các chế độ bảo hiểm, công đoàn, nghỉ mát, phụ cấp trang phục, quà tặng các ngày Lễ Tết</p>
      <p>✅ Môi trường làm việc ổn định, chuyên nghiệp, nhiều cơ hội phát triển lâu dài</p>
      <p><strong>📌 ĐẶC BIỆT:</strong></p>
      <p>Dự án đang trong giai đoạn nước rút với cơ chế phỏng vấn Fast-track: Ứng tuyển & Phản hồi trong 5 ngày.</p>
      <p>Hãy điền thông tin ứng tuyển bên dưới ứng tuyển bạn nhé!</p>
    `,
    formFields: [
      { type: "text", label: "Họ và tên", required: true },
      { type: "date", label: "Ngày tháng năm sinh", required: true },
      { type: "text", label: "Số điện thoại", required: true },
      { type: "text", label: "Email", required: true },
      { type: "select", label: "Tỉnh thành", options: ["Hà Nội", "Khác..."], required: true },
      {
        type: "select",
        label: "Vị trí ứng tuyển",
        options: [
          "PM (Senior)",
          "BA (Senior)",
          "BA Dữ liệu (Middle)",
          "BA Nghiệp vụ (Middle/Senior)",
          "Tech Lead (Middle/Senior)",
          "Dev Lead (Backend Java)",
          "Dev Backend (Java) - (Junior/Middle/Senior)",
          "Dev Frontend (Junior/Senior)",
          "DevOps Lead (Senior)",
          "DevOps (Fresher/Junior/Middle/Senior)",
          "DBA (Senior)",
          "QA (Middle)",
          "Test Lead (Senior)",
          "Tester (Junior/Middle/Senior)",
        ],
        required: true,
      },
      { type: "text", label: "Bạn có điều gì cần được giải đáp/hỗ trợ thêm không?" },
      { type: "upload", label: "Đính kèm CV" },
    ],
  },
  {
    slug: "tuyen-dung-ky-thuat-vien-toan-quoc-2026-92",
    title: "TUYỂN DỤNG KỸ THUẬT VIÊN TOÀN QUỐC 2026",
    date: "Thứ Ba, 10/02/2026",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-cover-5-1.png",
    description:
      "FPT Telecom tuyển dụng Kỹ thuật viên trên toàn quốc với thu nhập 12 - 18 triệu và cơ hội làm việc dài hạn.",
    contentHtml: `
      <h3><strong>🔥 Cơ hội 'nóng' nhất năm 🔥 FPT Telecom tuyển dụng Kỹ thuật viên trên toàn quốc 🔥 Chỉ mất 30s để chạm tay vào thu nhập 12 - 18 TRIỆU!</strong></h3>
      <h3><strong>Bạn sẽ nhận được:</strong><br />✅ Lương cao 12 - 18 triệu. Lương tháng 13, Thưởng hiệu quả... 💰<br />✅ Full combo: Bảo hiểm xã hội, BHYT, Bảo hiểm sức khỏe TINPNC Care, Khám sức khỏe hàng năm, Uu đãi nội bộ tập đoàn FPT<br />✅ Đồng nghiệp trẻ trung, cùng làm cùng chơi: Nghỉ mát, Tất niên, Giải đá bóng, Giải Game Liên quân...<br />✅ Công việc dài hạn. Nhiều cơ hội thăng tiến Đội trưởng, Quản lý...</h3>
      <p><strong>MÔ TẢ CÔNG VIỆC:</strong><br />Triển khai, bảo trì và lắp đặt đường truyền & thiết bị: Internet, Truyền hình FPT Play, Camera... do FPT Telecom cung cấp.</p>
      <p><strong>YÊU CẦU:</strong><br />Nam giới, tuổi từ 20 - 35, trình độ trung cấp nghề trở lên với chuyên ngành khối kỹ thuật.</p>
      <p><strong>Đặc biệt:</strong><br />❌ KHÔNG CẦN KINH NGHIỆM ❌ KHÔNG MẤT PHÍ: Được kèm cặp trực tiếp bởi nhân viên cứng 🎓<br />❌ PHỎNG VẤN 1 VÒNG DUY NHẤT.</p>
      <p><strong>Ứng tuyển dễ dàng bằng cách điền các thông tin dưới đây bạn nhé</strong></p>
    `,
    formFields: surveyTechnicianFields,
  },
  {
    slug: "tuyen-dung-150-ky-thuat-vien-toan-quoc-86",
    title: "TUYỂN DỤNG 150 KỸ THUẬT VIÊN TOÀN QUỐC",
    date: "Thứ Tư, 17/12/2025",
    bannerImage: "/images/fptjobs/fptjobs-com-Media-Images-SurveyImages-cover-web-4.png",
    description:
      "150 suất làm việc chính thức tại FPT Telecom trên toàn quốc, thu nhập 12 - 18 triệu và phỏng vấn nhanh.",
    expired: true,
    contentHtml: `
      <h3><strong>🔥 Cơ hội 'nóng' nhất cuối năm 🔥 150 suất làm việc chính thức tại FPT Telecom trên toàn quốc đang chờ bạn 🔥 Chỉ mất 30s để chạm tay vào thu nhập 12 - 18 TRIỆU!</strong></h3>
      <p><strong>Bạn sẽ nhận được:</strong><br />✅ Lương cao 12 - 18 triệu. Lương tháng 13, Thưởng hiệu quả... 💰<br />✅ Full combo: Bảo hiểm xã hội, BHYT, Bảo hiểm sức khỏe TINPNC Care, Khám sức khỏe hàng năm, Uu đãi nội bộ tập đoàn FPT<br />✅ Đồng nghiệp trẻ trung, cùng làm cùng chơi: Nghỉ mát, Tất niên, Giải đá bóng, Giải Game Liên quân...<br />✅ Công việc dài hạn. Nhiều cơ hội thăng tiến Đội trưởng, Quản lý...</p>
      <p><strong>MÔ TẢ CÔNG VIỆC:</strong><br />Triển khai, bảo trì và lắp đặt đường truyền & thiết bị: Internet, Truyền hình FPT Play, Camera... do FPT Telecom cung cấp.</p>
      <p><strong>YÊU CẦU:</strong><br />Nam giới, tuổi từ 20 - 35, trình độ trung cấp nghề trở lên với chuyên ngành khối kỹ thuật.</p>
      <p><strong>Đặc biệt:</strong><br />❌ KHÔNG CẦN KINH NGHIỆM ❌ KHÔNG MẤT PHÍ: Được kèm cặp trực tiếp bởi nhân viên cứng 🎓<br />❌ PHỎNG VẤN 1 VÒNG DUY NHẤT. TRẢ KẾT QUẢ TRONG VÒNG 72 GIỜ</p>
      <p><strong>Ứng tuyển dễ dàng bằng cách điền các thông tin dưới đây bạn nhé</strong></p>
    `,
    formFields: [
      { type: "text", label: "Họ và tên của bạn", required: true },
      { type: "date", label: "Ngày sinh", required: true },
      { type: "text", label: "Nhập email của bạn", required: true },
      { type: "text", label: "Nhập số điện thoại của bạn", required: true },
      { type: "select", label: "Khu vực/Tỉnh thành bạn đang sống", options: surveyProvinceOptions },
      { type: "text", label: "Phường/ Xã bạn muốn làm việc", description: "Ví dụ: Phường Tây Hồ, Phường Tân Hưng,.." },
      { type: "select", label: "Trình độ học vấn của bạn?", options: surveyEducationOptions, required: true },
      { type: "text", label: "Tên trường bạn theo học", required: true },
      { type: "text", label: "Chuyên ngành bạn theo học", required: true },
      {
        type: "text",
        label: "Liệt kê một số công việc bạn từng làm (nếu có)",
        description: "Ví dụ: 01/2024 - 06/2024: Nhân viên lắp đặt thiết bị điện...",
      },
    ],
  },
];

const newsArticleDetailOverrides: Record<string, Partial<FptNewsDetailArticle>> = {
  ...fptNewsArticleContentOverrides,
  "it-la-gi-toan-canh-nganh-it-va-co-hoi-nghe-nghiep-2026-330": {
    description:
      'IT là gì, gồm những mảng nào, các vị trí phổ biến, mức lương và lộ trình thăng tiến. Khám phá cơ hội việc làm IT tại FPT Telecom.',
    tag: "cntt",
    contentBlocks: [
      {
        kind: "paragraph",
        text: "Bài viết này giải nghĩa IT một cách đầy đủ, điểm qua các mảng và vị trí phổ biến, mức lương, lộ trình phát triển, và những kỹ năng cần có nếu bạn muốn bước chân vào nghề. Nếu bạn đang tìm hướng đi hoặc tìm một công việc IT phù hợp, đây là điểm khởi đầu đáng đọc.",
      },
      {
        kind: "toc",
        items: [
          { label: "IT là gì? Giải nghĩa đúng và đủ", href: "#it-la-gi" },
          { label: "Ngành IT gồm những mảng nào", href: "#nganh-it" },
          { label: "Các vị trí phổ biến trong ngành IT và công việc cụ thể", href: "#vi-tri-pho-bien" },
          { label: "Mức lương và lộ trình thăng tiến của dân IT", href: "#muc-luong" },
          { label: "Học gì, cần kỹ năng gì để vào ngành IT", href: "#hoc-gi" },
          { label: "Cơ hội việc làm IT tại FPT Telecom", href: "#co-hoi" },
        ],
      },
      { kind: "heading", id: "it-la-gi", title: "IT là gì? Giải nghĩa đúng và đủ" },
      {
        kind: "image",
        alt: "Kỹ sư IT làm việc tại trung tâm dữ liệu FPT Telecom",
        src: "/images/fptjobs/fptjobs-com-Media-Files-images-ky-su-it-lam-viec-tai-trung-tam-du-lieu-fpt-telecom-1200x631.png",
      },
      {
        kind: "paragraph",
        text: "IT là viết tắt của Information Technology, tức công nghệ thông tin. Hiểu đơn giản, đây là lĩnh vực sử dụng máy tính, mạng, phần mềm và hệ thống lưu trữ để tạo ra, xử lý, truyền tải và bảo vệ dữ liệu, thông tin.",
      },
      {
        kind: "paragraph",
        text: "Phạm vi của IT không bó hẹp ở việc viết code hay cài phần mềm. Nó bao gồm tất cả những gì giúp một tổ chức vận hành trơn tru về mặt công nghệ: từ chiếc máy chủ chạy ngầm trong phòng kỹ thuật, đường truyền mạng kết nối các văn phòng, cho tới ứng dụng bạn dùng để đặt hàng hay chuyển khoản.",
      },
      {
        kind: "paragraph",
        text: "Nói cách khác, ở đâu có dữ liệu cần được tạo ra và quản lý, ở đó có vai trò của IT. Đây cũng là lý do ngành này hiện diện trong hầu hết mọi doanh nghiệp, không riêng các công ty công nghệ.",
      },
      { kind: "heading", id: "nganh-it", title: "Ngành IT gồm những mảng nào?" },
      {
        kind: "paragraph",
        text: "Ngành IT khá rộng và thường được chia thành một số mảng lớn. Nắm được các mảng này sẽ giúp bạn định vị bản thân phù hợp với sở thích và thế mạnh.",
      },
      {
        kind: "image",
        alt: "Các mảng chính trong ngành IT công nghệ thông tin",
        src: "/images/fptjobs/fptjobs-com-Media-Files-images-cac-mang-chinh-trong-nganh-it-cong-nghe-thong-tin.png",
      },
      {
        kind: "list",
        ordered: true,
        items: [
          "Phát triển phần mềm: Đây là mảng quen thuộc nhất, gồm việc thiết kế, viết và bảo trì các ứng dụng, website, phần mềm. Người làm mảng này thường được gọi chung là lập trình viên.",
          'Hạ tầng và mạng: Mảng này lo phần "xương sống" kỹ thuật: máy chủ, hệ thống mạng, đường truyền, trung tâm dữ liệu. Với một doanh nghiệp viễn thông, đây là mảng cực kỳ quan trọng vì nó quyết định chất lượng dịch vụ tới khách hàng.',
          "Dữ liệu: Tập trung vào thu thập, lưu trữ, phân tích dữ liệu để rút ra thông tin hữu ích cho việc ra quyết định. Mảng này tăng trưởng mạnh trong vài năm gần đây.",
          "An ninh mạng: Bảo vệ hệ thống và dữ liệu khỏi tấn công, rò rỉ. Khi mọi thứ chuyển lên môi trường số, nhu cầu nhân lực mảng này ngày càng lớn.",
          "Hỗ trợ kỹ thuật và vận hành: Đảm bảo hệ thống chạy ổn định hằng ngày, xử lý sự cố, hỗ trợ người dùng nội bộ. Đây thường là cửa ngõ vào nghề cho nhiều bạn mới.",
        ],
      },
      { kind: "heading", id: "vi-tri-pho-bien", title: "Các vị trí phổ biến trong ngành IT và công việc cụ thể" },
      {
        kind: "paragraph",
        text: "Trong mỗi mảng kể trên lại có nhiều vị trí với công việc khác nhau. Dưới đây là một số vị trí phổ biến để bạn hình dung nghề IT làm gì trong thực tế.",
      },
      {
        kind: "paragraph",
        text: "Lập trình viên (Developer): viết và bảo trì mã nguồn cho ứng dụng, website. Tùy hướng đi mà chia thành lập trình giao diện, lập trình hệ thống phía sau, hoặc làm cả hai.",
      },
      {
        kind: "paragraph",
        text: "Kỹ sư hệ thống, kỹ sư mạng: thiết kế, lắp đặt và vận hành hệ thống máy chủ, mạng. Vị trí này đòi hỏi hiểu sâu về hạ tầng và xử lý sự cố nhanh.",
      },
      {
        kind: "paragraph",
        text: "Chuyên viên phân tích dữ liệu: làm sạch, phân tích dữ liệu và trình bày kết quả để bộ phận kinh doanh, vận hành dựa vào đó ra quyết định.",
      },
      {
        kind: "paragraph",
        text: "Chuyên viên an ninh mạng: rà soát lỗ hổng, giám sát hệ thống, phản ứng khi có sự cố bảo mật.",
      },
      {
        kind: "paragraph",
        text: "Nhân viên hỗ trợ kỹ thuật (IT Support, IT Helpdesk): xử lý sự cố phần cứng, phần mềm, mạng cho người dùng. Đây là vị trí dễ tiếp cận với người mới vào nghề.",
      },
      {
        kind: "paragraph",
        text: "Mỗi vị trí có yêu cầu riêng, nhưng điểm chung là đều cần tư duy logic và khả năng tự học liên tục, vì công nghệ thay đổi rất nhanh.",
      },
      { kind: "heading", id: "muc-luong", title: "Mức lương và lộ trình thăng tiến của dân IT" },
      {
        kind: "richParagraph",
        parts: [
          {
            text: "Mức lương ngành IT thuộc nhóm cao so với mặt bằng chung, nhưng dao động khá rộng tùy vị trí, kinh nghiệm và năng lực thực tế. Theo dữ liệu thị trường năm 2026, thu nhập trung bình toàn ngành phổ biến ở mức khoảng 15 đến 45 triệu đồng một tháng, trong đó người mới ra trường thường khởi điểm từ 8 đến 15 triệu, còn cấp senior trên 5 năm kinh nghiệm có thể đạt 35 đến 60 triệu. ",
          },
          { text: "JobsGO", href: "https://jobsgo.vn/blog/luong-it/" },
        ],
      },
      {
        kind: "paragraph",
        text: "Để bạn dễ hình dung theo từng vị trí, dưới đây là khoảng thu nhập tham khảo từ các báo cáo thị trường gần nhất:",
      },
      {
        kind: "list",
        items: [
          "Nhân viên hỗ trợ kỹ thuật (IT Helpdesk, IT Support): mặt bằng phổ biến quanh 12 đến 13 triệu đồng một tháng, khoảng phổ biến từ 10 đến 18 triệu; người trên 3 năm kinh nghiệm có thể đạt khoảng 16 triệu.",
          "Kỹ sư mạng (Network Engineer): trung bình khoảng 18,5 triệu đồng một tháng, dải lương phổ biến từ 15 đến 22 triệu, tăng theo số năm kinh nghiệm.",
          "Kỹ sư phần mềm (Software Engineer): từ khoảng 7 đến 11 triệu cho người mới, 20 đến 32,5 triệu với người có từ 3 năm kinh nghiệm, và chạm mốc 30 đến 50 triệu ở cấp trưởng nhóm, quản lý. Mảng phần mềm nhúng (embedded, firmware) thường cao hơn mặt bằng chung do tính chuyên sâu.",
          "Kỹ sư điện toán đám mây (Cloud Engineer): thuộc nhóm dẫn đầu thị trường, khoảng 40 đến 70 triệu đồng một tháng tùy cấp bậc, do nhu cầu cao và nguồn nhân lực khan hiếm.",
        ],
      },
      {
        kind: "paragraph",
        text: "Cần lưu ý các con số trên là mặt bằng thị trường chung, không phải mức lương cụ thể tại bất kỳ doanh nghiệp nào, và sẽ thay đổi theo năng lực, quy mô công ty và khu vực làm việc.",
      },
      {
        kind: "paragraph",
        text: "Về lộ trình, một hướng đi phổ biến là phát triển theo chuyên môn: từ nhân viên lên chuyên viên, rồi chuyên gia hoặc kiến trúc sư hệ thống. Hướng còn lại là phát triển theo quản lý: lên trưởng nhóm, trưởng phòng, rồi quản lý cấp cao hơn. Điểm đáng nói là thu nhập trong ngành phụ thuộc nhiều vào giá trị thực tế bạn tạo ra, hơn là chỉ tính theo số năm đi làm.",
      },
      { kind: "heading", id: "hoc-gi", title: "Học gì, cần kỹ năng gì để vào ngành IT?" },
      {
        kind: "paragraph",
        text: "Phần lớn người làm IT có trình độ từ trung cấp trở lên thuộc các ngành như công nghệ thông tin, khoa học máy tính, kỹ thuật phần mềm, hệ thống thông tin, an toàn thông tin. Tuy nhiên, ngành này coi trọng năng lực thực tế, nên không ít người trái ngành vẫn chuyển sang IT thành công nhờ tự học và khóa đào tạo nghề.",
      },
      {
        kind: "paragraph",
        text: "Về kỹ năng, bạn cần một nền tảng tư duy logic tốt và khả năng giải quyết vấn đề. Tùy vị trí mà yêu cầu kỹ năng chuyên môn khác nhau, chẳng hạn ngôn ngữ lập trình với lập trình viên, hay kiến thức mạng với kỹ sư hạ tầng.",
      },
      {
        kind: "paragraph",
        text: "Bên cạnh chuyên môn, ba yếu tố thường quyết định bạn đi xa hay không là khả năng tự học, kỹ năng làm việc nhóm và tiếng Anh đủ để đọc tài liệu. Công nghệ đổi mới liên tục, nên người chịu cập nhật luôn có lợi thế.",
      },
      { kind: "heading", id: "co-hoi", title: "Cơ hội việc làm IT tại FPT Telecom" },
      {
        kind: "paragraph",
        text: "Là một doanh nghiệp viễn thông và công nghệ, FPT Telecom có nhu cầu nhân lực IT ở nhiều mảng, đặc biệt là hạ tầng mạng, hệ thống, phần mềm và điện toán đám mây. Đây là môi trường phù hợp nếu bạn muốn làm việc với hệ thống quy mô lớn và dữ liệu thực tế.",
      },
      { kind: "paragraph", text: "Một số vị trí IT thường được tuyển tại FPT Telecom gồm:" },
      {
        kind: "list",
        items: [
          "IT Network: vận hành, giám sát và tối ưu hệ thống mạng, hạ tầng kết nối phục vụ dịch vụ viễn thông.",
          "Nhân viên IT Helpdesk: tiếp nhận và xử lý sự cố kỹ thuật, hỗ trợ người dùng nội bộ và khách hàng.",
          "Software Engineer (Camera Firmware): phát triển và tối ưu phần mềm nhúng, firmware cho thiết bị camera.",
          "Cloud Solution Engineer: thiết kế, triển khai và vận hành các giải pháp trên nền tảng điện toán đám mây.",
        ],
      },
      {
        kind: "richParagraph",
        parts: [
          {
            text: "Làm IT ",
          },
          { text: "Tại đây", href: "/tuyen-dung?nhom=it" },
          {
            text: ", bạn được tiếp xúc với hệ thống vận hành phục vụ lượng lớn khách hàng, cùng cơ hội học hỏi từ đội ngũ kỹ thuật giàu kinh nghiệm. Dù bạn là người mới ra trường muốn tìm vị trí khởi đầu, hay người đã có kinh nghiệm muốn tìm môi trường để phát triển sâu hơn, FPT Telecom đều có những vị trí đáng cân nhắc.",
          },
        ],
      },
    ],
  },
};

function getFptNewsArticleSlug(article: Pick<FptNewsFeature, "href">) {
  return article.href.replace(/^\/tin-tuc\//, "");
}

const newsArticleDetails: FptNewsDetailArticle[] = [
  ...newsIndexPageData.featured.map((article) => ({
    ...article,
    excerpt: article.title,
  })),
  ...newsIndexPageData.latest,
].map((article) => {
  const slug = getFptNewsArticleSlug(article);
  const override = newsArticleDetailOverrides[slug];
  const merged = {
    ...article,
    author: "Cáo tuyển dụng",
    description: article.excerpt,
    slug,
    tag: "tuyển dụng",
    ...override,
  };

  return {
    ...merged,
    description: merged.description || article.excerpt,
    excerpt: merged.excerpt || article.excerpt,
    tag: merged.tag || "tuyển dụng",
  };
});

export function getFptNewsArticleSlugs() {
  return newsArticleDetails.map((article) => article.slug);
}

export function getFptNewsArticleBySlug(slug: string) {
  return newsArticleDetails.find((article) => article.slug === slug);
}

export function getFptSurveyEventSlugs() {
  return surveyEventDetails.map((event) => event.slug);
}

export function getFptSurveyEventBySlug(slug: string) {
  return surveyEventDetails.find((event) => event.slug === slug);
}

const careerBoomingIndustryCards = [
  ["VIỄN THÔNG - ĐIỆN", "CƠ ĐIỆN - TỰ ĐỘNG HÓA"],
  ["CÔNG NGHỆ", "THÔNG TIN"],
  ["KINH DOANH", "DỊCH VỤ KHÁCH HÀNG"],
  ["VĂN PHÒNG"],
];

const careerBoomingReasons = [
  {
    icon: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-career-booming-section-4-item-icon-first.png",
    title: "CÔNG NGHỆ",
    accent: "TIÊN PHONG",
    description:
      "Với hạ tầng mạnh mẽ - công nghệ hàng đầu - hệ sinh thái số hiện đại, FPT Telecom hứa hẹn là bệ phóng cho thế hệ nhân tài trẻ.",
  },
  {
    icon: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-career-booming-section-4-item-icon-second.png",
    title: "QUYỀN LỢI",
    accent: "VƯỢT TRỘI",
    description:
      "Bạn được đầu tư từ kỹ năng đến tương lai thông qua các chương trình đào tạo chuyên sâu, lộ trình thăng tiến rõ ràng cùng chế độ đãi ngộ toàn diện.",
  },
  {
    icon: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-career-booming-section-4-item-icon-third.png",
    title: "LÀM HẾT SỨC",
    accent: "CHƠI HẾT MÌNH",
    description:
      "Hòa mình vào môi trường năng động, sáng tạo, nơi mỗi ngày là một hành trình gắn kết với các hoạt động lễ hội, sự kiện độc đáo và tinh thần đồng đội bùng nổ.",
  },
];

const careerBoomingRegions = [
  "Hà Nội",
  "Hồ Chí Minh",
  "An Giang",
  "Bắc Ninh",
  "Cao Bằng",
  "Cà Mau",
  "Cần Thơ",
  "Đà Nẵng",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Tĩnh",
  "Hải Phòng",
  "Hưng Yên",
  "Huế",
  "Khánh Hoà",
  "Lai Châu",
  "Lạng Sơn",
  "Lào Cai",
  "Lâm Đồng",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tuyên Quang",
  "Vĩnh Long",
];

const careerBoomingFields = [
  "Viễn thông",
  "Công nghệ thông tin",
  "Điện - Cơ điện - Tự động hóa",
  "Kinh doanh DVKH",
  "Back-office (Nhân sự, Marketing, kế toán...)",
];

const careerBoomingEvents = [
  {
    title: "FPT Tour",
    image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-career-booming-FTEL-20Career-20Booming.JPG",
  },
  {
    title: "Talkshow",
    image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-career-booming-Talkshow.jpg",
  },
  {
    title: "Career Fair",
    image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-career-booming-Career-20Fair.jpg",
  },
  {
    title: "Sinh Viên Tài Năng",
    image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-career-booming-SVTN.jpg",
  },
  {
    title: "Sinh Viên Công Nghệ Tập Sự",
    image: "/images/fptjobs/fptjobs-com-public-imgs-version2-page-career-booming-SVCNTS.jpg",
  },
];

const nextgenBenefits = [
  "Mentor & Dẫn dắt trực tiếp bởi Chủ tịch và Ban lãnh đạo cấp cao nhất Công ty.",
  "Giải thưởng chung cuộc trị giá 100 triệu đồng. Gói thu nhập năm đầu tiên lên tới 120 triệu đồng.",
  "Bứt phá giới hạn cùng chuỗi huấn luyện FCAMP và thử thách thực chiến ULTRAMARATHON.",
  "Lộ trình trở thành nhân viên chính thức. Được bồi dưỡng & phát triển thành thế hệ Quản lý, Lãnh đạo kế cận.",
  "Mở rộng mạng lưới kết nối cùng lãnh đạo, chuyên gia đầu ngành & các tài năng trẻ khác.",
];

const nextgenCriteria = [
  "Sinh viên năm 3/năm cuối/vừa tốt nghiệp sẵn sàng làm việc tại khu vực Hà Nội/Hồ Chí Minh",
  "Điểm GPA trung bình từ 7.0/10 hoặc 3.0/4.0 trở lên",
  "Thành thạo ít nhất 1 ngoại ngữ: Anh, Trung, Hàn, Nhật ...",
  "Ưu tiên khối ngành Kinh tế, yêu thích kinh doanh, công nghệ",
  "Các bạn trẻ có tinh thần lãnh đạo, tố chất của người đứng đầu",
];

const nextgenTimeline = [
  {
    title: "Tuyển sinh và chọn lọc",
    items: [
      { date: "Đến hết 20/04:", text: "Tiếp nhận đăng ký" },
      { date: "Trước 30/04:", text: "Thử thách Elevator Pitching" },
      { date: "Đầu tháng 05:", text: "Chuỗi huấn luyện chuyên biệt FCAMP" },
    ],
  },
  {
    title: "Ultramarathon & Chung kết:",
    items: [
      { date: "Tháng 06 - Tháng 08:", text: "Ultramarathon - Tham gia dự án thực tế" },
      { date: "Đầu tháng 09:", text: "Chung kết & Vinh danh" },
    ],
  },
  {
    title: "Khai phóng sự nghiệp",
    items: [
      { date: "Từ tháng 09/2024 trở đi:", text: "Đảm nhận vị trí tại các dự án trọng điểm" },
      { date: "", text: "Bồi dưỡng & phát triển với lộ trình chuyên biệt tại CLB Tài năng trẻ" },
      {
        date: "",
        text: "Được dẫn dắt bởi Chủ tịch & Ban Lãnh đạo cấp cao trở thành thế hệ Quản lý, Lãnh đạo kế cận",
      },
    ],
  },
];

const nextgenMentorImages = [
  "/images/fptjobs/fptjobs-com-public-img-landing-page-img-slideshow-hva.png",
  "/images/fptjobs/fptjobs-com-public-img-landing-page-img-slideshow-nhl.png",
  "/images/fptjobs/fptjobs-com-public-img-landing-page-img-slideshow-ntq.png",
  "/images/fptjobs/fptjobs-com-public-img-landing-page-img-slideshow-vtmh.png",
  "/images/fptjobs/fptjobs-com-public-img-landing-page-img-slideshow-cht.png",
  "/images/fptjobs/fptjobs-com-public-img-landing-page-img-slideshow-ntb.png",
  "/images/fptjobs/fptjobs-com-public-img-landing-page-img-slideshow-thh.png",
  "/images/fptjobs/fptjobs-com-public-img-landing-page-img-slideshow-thd.png",
  "/images/fptjobs/fptjobs-com-public-img-landing-page-img-slideshow-ptt.png",
];

const nextgenAwards = [
  {
    title: "GIẢI THƯỞNG SAO KHUÊ 2023",
    image: "/images/fptjobs/fptjobs-com-public-img-landing-page-img-giai-20thuong-20sao-20khue.png",
  },
  {
    title: "TOP 10 DOANH NGHIỆP CÔNG NGHỆ SỐ XUẤT SẮC VIỆT NAM 2023",
    image: "/images/fptjobs/fptjobs-com-public-img-landing-page-img-top10.png",
  },
  {
    title: "NHÀ TUYỂN DỤNG ĐƯỢC YÊU THÍCH NHẤT NGÀNH VIỄN THÔNG 2023",
    image: "/images/fptjobs/fptjobs-com-public-img-landing-page-img-winner2023.png",
  },
  {
    title: "GIẢI THƯỞNG GREAT PLACE TO WORK: NƠI LÀM VIỆC XUẤT SẮC 2023 - 2024",
    image: "/images/fptjobs/fptjobs-com-public-img-landing-page-img-great-20place-20to-20work.png",
  },
];

const nextgenContacts = [
  { label: "Website: https://fptjobs.com/", icon: "/images/fptjobs/fptjobs-com-public-img-landing-page-img-icon-web.png" },
  { label: "Fanpage: https://www.facebook.com/share/1DBQeUXYXQ/?mibextid=wwXIfr", icon: "/images/fptjobs/fptjobs-com-public-img-landing-page-img-icon-fb.png" },
  { label: "Tiktok: Nhà Cáo", icon: "/images/fptjobs/fptjobs-com-public-img-landing-page-img-icon-20tiktok.png" },
  { label: "Email: phuongtm3@fpt.com / nhanctt3@fpt.com", icon: "/images/fptjobs/fptjobs-com-public-img-landing-page-img-icon-20gmail.png" },
];

const svcntsSectors = [
  {
    title: "VIỄN THÔNG",
    icon: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-icon-vien-thong.png",
  },
  {
    title: "ĐIỆN & CƠ ĐIỆN TỰ ĐỘNG HÓA",
    icon: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-icon-dien-tu-dong-hoa.png",
  },
  {
    title: "CÔNG NGHỆ THÔNG TIN",
    icon: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-icon-cntt.png",
  },
  {
    title: "AN TOÀN THÔNG TIN",
    icon: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-icon-attt.png",
  },
  {
    title: "DỮ LIỆU & AI",
    icon: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-icon-du-lieu-ai.png",
  },
  {
    title: "THIẾT KẾ VI MẠCH & PHẦN CỨNG",
    icon: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-icon-thiet-ke-vi-mach.png",
  },
];

const svcntsBenefits = [
  {
    title: "THU NHẬP ĐỘT PHÁ",
    description: "Bỏ túi lên đến 150 triệu VNĐ khi vẫn là sinh viên",
    icon: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-icon-thu-nhap.png",
  },
  {
    title: "THỰC CHIẾN R&D",
    description: "Phát triển trong môi trường R&D thực tế, tool bản quyền, hạ tầng tiên tiến",
    icon: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-icon-thuc-chien.png",
  },
  {
    title: "ĐẶC QUYỀN MENTORSHIP 1:1",
    description: "Bảo trợ chuyên môn, đối thoại trực tiếp và kèm cặp từ chuyên gia hàng đầu",
    icon: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-icon-mentorship.png",
  },
  {
    title: "BỨT TỐC SỰ NGHIỆP",
    description: "Khóa đào tạo công nghệ chuyên sâu, tài trợ 100% chi phí",
    icon: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-icon-but-toc.png",
  },
  {
    title: "LỘ TRÌNH FAST-TRACK",
    description: "Trở thành nhân viên chính thức & phát triển thành đội ngũ cán bộ nguồn",
    icon: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-icon-lo-trinh.png",
  },
];

const svcntsTargets = [
  "Sinh viên năm 3 hoặc năm cuối đang theo học các ngành Công nghệ Thông tin, Điện tử Viễn thông",
  "Có khả năng làm việc tại Hà Nội hoặc TP. Hồ Chí Minh",
  "GPA từ 7.0/10 hoặc 2.8/4.0 trở lên",
  "Ưu tiên ứng viên có/đang học các chứng chỉ chuyên môn phù hợp với lĩnh vực",
  "Tham gia các hoạt động xã hội, cộng đồng là một lợi thế",
];

const svcntsExperts = [
  {
    name: "Huỳnh Quang Sang",
    role: "Trưởng phòng Nghiên cứu & Phát triển",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-expert-huynh-quang-sang.png",
  },
  {
    name: "Nguyễn Trọng Thân",
    role: "Phó Giám đốc Trung tâm AI Chip",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-expert-nguyen-trong-than.png",
  },
  {
    name: "Nguyễn Anh Đức",
    role: "Giám đốc Ban FPT Life",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-expert-nguyen-anh-duc.png",
  },
  {
    name: "Trần Thanh Hải",
    role: "Giám đốc Công nghệ",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-expert-tran-thanh-hai.png",
  },
  {
    name: "Lê Trung",
    role: "Giám đốc TT Phát triển & Quản lý Hạ tầng",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-expert-le-trung.png",
  },
  {
    name: "Nguyễn Thành Đạt",
    role: "Phó Giám đốc Trung tâm Điều hành mạng",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-expert-nguyen-thanh-dat.png",
  },
  {
    name: "Nguyễn Thành Công",
    role: "Trưởng phòng Công nghệ và Dữ liệu",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-expert-nguyen-thanh-cong.png",
  },
];

const svcntsAlumni = [
  {
    name: "Phạm Văn Quyền",
    role: "Trưởng nhóm Giải pháp Công nghệ Phía Nam",
    year: "Sinh viên công nghệ tập sự 2018",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-alumni-pham-van-quyen.png",
    quote:
      "Đến với FPT Telecom khi còn là sinh viên năm 4, mình từng nghĩ chỉ là trải nghiệm để tốt nghiệp. Nhưng chỉ sau 4 tháng, với lộ trình rõ ràng và mentor đồng hành, mình đã có cơ hội tham gia dự án lớn nơi trước đó chỉ dành cho người nhiều kinh nghiệm.",
  },
  {
    name: "Đỗ Công Danh",
    role: "Phó phòng Quản trị Hạ tầng Dịch vụ",
    year: "Sinh viên công nghệ tập sự 2017",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-alumni-do-cong-danh.png",
    quote:
      "Là một trong những sinh viên đầu tiên tham gia, mình xem đây là bước ngoặt quan trọng. Không chỉ tiếp cận công nghệ mới, mình còn trưởng thành về tư duy, teamwork và sự chủ động.",
  },
  {
    name: "Phạm Hoàng Khánh",
    role: "Trưởng nhóm Công nghệ và Dữ Liệu",
    year: "Sinh viên công nghệ tập sự 2018",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-alumni-pham-hoang-khanh.png",
    quote:
      "Nhiều năm nhìn lại, mình vẫn xem chương trình là bước ngoặt đầu tiên đưa một sinh viên bỡ ngỡ ra biển lớn. Những trải nghiệm thực chiến giúp mình trưởng thành nhanh và kiên định với mục tiêu.",
  },
  {
    name: "Trương Tấn Sang",
    role: "Trưởng nhóm Giải pháp Công nghệ Phía Nam",
    year: "Sinh viên công nghệ tập sự 2017",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-alumni-truong-tan-sang.png",
    quote:
      "Chương trình đã cho mình cơ hội tham gia phát triển Automation Workflow và dashboard giám sát, giúp mình thay đổi cách nhìn về dữ liệu và vận hành.",
  },
  {
    name: "Nguyễn Ngọc Phú",
    role: "Lập trình viên Full-stack",
    year: "Sinh viên công nghệ tập sự 2024",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-alumni-nguyen-ngoc-phu.png",
    quote:
      "Mình cảm thấy rất may mắn khi được tham gia. Không chỉ được học hỏi, mình còn trực tiếp làm việc với các hệ thống như VOC, OmniAgent, OmniSR.",
  },
  {
    name: "Lê Thị Hồng Ngọt",
    role: "Lập trình viên Full-stack",
    year: "Sinh viên công nghệ tập sự 2024",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-alumni-le-thi-hong-ngot.png",
    quote:
      "Chương trình đã cho mình cơ hội tiếp cận môi trường làm việc thực tế và tham gia trực tiếp vào các dự án lớn như IVOICE, FPMS, IDC.",
  },
  {
    name: "Phan Thị Hương Bình",
    role: "Kỹ sư Kiểm soát Chất lượng",
    year: "Sinh viên công nghệ tập sự 2024",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-alumni-phan-thi-huong-binh.png",
    quote:
      "Mình có cơ hội tham gia kiểm thử các hệ thống như HRIS, Billing Hub, ECOM, FPT.vn và Customer 360.",
  },
  {
    name: "Nguyễn Văn Quang Hưng",
    role: "Kỹ sư Phân tích Dữ liệu",
    year: "Sinh viên công nghệ tập sự 2024",
    image: "/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-alumni-nguyen-van-quang-hung.png",
    quote:
      "Mình nhận ra chương trình không chỉ giúp tiếp cận công việc thực tế mà còn thay đổi cách mình nhìn về dữ liệu.",
  },
];

const svcntsProcess = [
  { title: "ĐĂNG KÝ", description: "Ứng tuyển qua form chính thức, chọn 01 vị trí duy nhất" },
  { title: "SÀNG LỌC CV", description: "Hội đồng tuyển chọn đánh giá hồ sơ và lựa chọn các CV phù hợp" },
  { title: "BÀI TEST NĂNG LỰC", description: "Tham gia 2 bài kiểm tra đánh giá tư duy và kiến thức công nghệ" },
  { title: "PHỎNG VẤN", description: "Phỏng vấn với Hội đồng chuyên môn theo từng nhóm ngành" },
  { title: "ONBOARDING", description: "Orientation Week, Welcome Day và đào tạo hội nhập định hướng" },
];

const svcntsPositions = [
  "[HN] Thực tập sinh CNTT vô tuyến",
  "[HCM] Network Engineer TTS",
  "[HN & HCM] Phân tích & đánh giá hệ thống Network",
  "[HN & HCM] Vận hành Hệ Thống Mạng",
  "[HN] VoIP Engineer",
  "[HCM] Wireless Network R&D Intern",
  "[HCM] Broadband Network Engineering Intern",
  "[HN & HCM] Backend Intern (Java, Python, NodeJS, C++,...)",
  "[HCM] Fullstack Intern",
  "[HN & HCM] Business Analyst",
  "[HN & HCM] AI Engineer Intern (Algorithm & Agent)",
  "[HCM] Full-stack AI Integration Intern (System & App)",
  "[HCM] DBA (Database Administrator)",
  "[HN & HCM] Data Analyst",
  "[HN] Data Engineering",
  "[HN & HCM] Data Scientist",
  "[HN & HCM] TTS Dữ liệu và Tự động hóa Mạng",
  "[HCM] Kỹ sư bảo mật ứng dụng",
  "[HN] Nhân viên vận hành dịch vụ bảo mật",
  "[HCM] Electrical Infrastructure Intern (Vị trí Điện)",
  "[HCM] HVAC Infrastructure Engineer (Vị trí Nhiệt)",
  "[HN] TTS công nghệ Tự động hoá",
  "[HN] Automation & AI Intern (Infrastructure focus)",
  "[HN & HCM] IC Design Intern (RTL & Logic Design)",
  "[HN & HCM] IC Verification Intern",
  "[HN & HCM] Physical Design Intern",
  "[HN & HCM] Embedded Software Intern",
  "[HN & HCM] Hardware Design Intern (PCB & System Board)",
];

const internshipBenefitCopy = [
  {
    title: "Mentor đồng hành 1-1",
    description:
      "Được dẫn dắt, kèm cặp bởi chuyên gia giàu kinh nghiệm giúp định hình và tối ưu lộ trình phát triển sự nghiệp.",
    image: "/images/fptjobs/fptjobs-com-public-img-Internship2026-Mentor-dong-hanh-1-1.png",
  },
  {
    title: "Thực chiến dự án thật",
    description:
      "Trực tiếp dấn thân vào những bài toán thực tế, chuyển hóa kiến thức thành kỹ năng nghề nghiệp thực thụ.",
    image: "/images/fptjobs/fptjobs-com-public-img-Internship2026-Thuc-chien-du-an-that.png",
  },
  {
    title: "Môi trường hiện đại",
    description:
      "Văn hóa FPT đặc sắc và công nghệ tiên phong, nơi khuyến khích sự sáng tạo và bật phá mọi giới hạn.",
    image: "/images/fptjobs/fptjobs-com-public-img-Internship2026-Moi-truong-hien-dai.png",
  },
  {
    title: "Bảo chứng thương hiệu lớn",
    description:
      "Nhận xác nhận thực tập từ FPT Telecom - doanh nghiệp viễn thông, công nghệ hàng đầu Việt Nam.",
    image: "/images/fptjobs/fptjobs-com-public-img-Internship2026-Bao-chung-thuong-hieu-lon.png",
  },
];

const internshipPositions = [
  {
    title: "CÔNG NGHỆ THÔNG TIN - KHOA HỌC MÁY TÍNH",
    description: "Backend Developer - Frontend Developer - Vận hành - Quản lý dự án",
  },
  {
    title: "ĐIỆN TỬ - VIỄN THÔNG ĐIỆN / CƠ ĐIỆN",
    description: "Khảo sát / Thiết kế / Kế hoạch hạ tầng Kỹ thuật Vận Hành - Điện Tử - Kỹ sư quang",
  },
  {
    title: "KINH TẾ - QUẢN TRỊ KINH DOANH",
    description: "Hỗ trợ kinh doanh - Ecommerce - Hành chính - Nhân sự",
  },
  {
    title: "TRUYỀN THÔNG - MARKETING THIẾT KẾ",
    description: "Marketing - Truyền thông nội bộ - Content Creator - Thiết kế - Partnership",
  },
];

const internshipJourney = [
  {
    number: "1",
    title: "ĐĂNG KÝ THAM GIA",
    date: "Từ nay - 20/05/2026",
    description:
      "Ưu tiên hồ sơ nộp sớm. Job sẽ đóng ngay khi tìm được người phù hợp nên bạn hãy apply ngay hôm nay để giữ chắc lợi thế nhé!",
    className: "is-blue",
  },
  {
    number: "2",
    title: "TUYỂN CHỌN & PHỎNG VẤN",
    date: "Thời gian: 11/05 - 31/05/2026",
    description:
      "Hồ sơ phù hợp sau khi sàng lọc sẽ vào vòng phỏng vấn trực tiếp. Đây là cơ hội để bạn khẳng định bản sắc và chứng minh tiềm năng bản thân.",
    className: "is-orange",
  },
  {
    number: "3",
    title: "CHÍNH THỨC GIA NHẬP",
    date: "",
    description:
      "Chương trình hội nhập chuyên sâu về văn hóa và hệ sinh thái FPT Telecom giúp bạn sẵn sàng trước khi bước vào thực tế công việc dưới sự dẫn dắt của mentor.",
    className: "is-green",
  },
];

const internshipRoleOptions = [
  "Backend Developer",
  "Frontend Developer",
  "Vận hành",
  "Quản lý dự án",
  "Khảo sát / Thiết kế / Kế hoạch hạ tầng",
  "Kỹ thuật vận hành",
  "Ecommerce",
  "Hành chính - Nhân sự",
  "Marketing",
  "Content Creator",
  "Thiết kế",
  "Partnership",
];

const internshipContacts = [
  { title: "Văn phòng giao dịch", subtitle: "FPT Telecom", icon: assets.contactOffice },
  { title: "Tuyển dụng FPT Telecom", subtitle: "Facebook", icon: assets.contactFb },
  { title: "Nhà Cáo", subtitle: "TikTok", icon: assets.contactTiktok },
  { title: "FPT Telecom", subtitle: "LinkedIn", icon: assets.contactLinkedin },
  { title: "0904 678 040\n0986 656 620", subtitle: "Phone", icon: assets.contactPhone },
  { title: "phuongtm3@fpt.com / nhanctt3@fpt.com", subtitle: "Email", icon: assets.contactMail },
];

export function FptPageFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("fpt-page fpt-has-fixed-header", className)} id="top">
      <FptHeader />
      <main>{children}</main>
      <ContactSection />
      <Footer />
      <FloatingActions />
    </div>
  );
}

function AboutOverviewSection({ intro }: { intro: FptAboutIntro }) {
  return (
    <>
      <section className="fpt-about-banner">
        <div className="fpt-container">
          <h2>
            Về <span>chúng tôi</span>
          </h2>
          <h3>{intro.heading}</h3>
          <p>{intro.description}</p>
        </div>
      </section>

      <section className="fpt-section fpt-about-overview" id="ve-chung-toi">
        <FptAboutSlideshow images={intro.images} />

        <div className="fpt-about-overview-copy">
          {intro.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </>
  );
}

function AboutProductsSection({ products }: { products: FptAboutProduct[] }) {
  return (
    <section className="fpt-section fpt-about-products">
      <h2>Sản phẩm và Dịch vụ</h2>
      <div className="fpt-about-product-grid">
        {products.map((product) => (
          <article className={cn("fpt-about-product-card", `tone-${product.tone}`)} key={`${product.title}-${product.subtitle}`}>
            <h3>
              {product.title}
              <span>{product.subtitle}</span>
            </h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutAwardsSection({ awards }: { awards: FptAboutAward[] }) {
  return (
    <section className="fpt-about-awards-section" id="giai-thuong">
      <div className="fpt-section">
        <h2>Các giải thưởng của FPT Telecom</h2>
        <div className="fpt-about-awards-track">
          {awards.map((award, index) => (
            <article className={cn("fpt-about-award-card", index === 0 && "is-active")} key={award.title}>
              <Image src={award.image} alt={award.title} fill sizes={index === 0 ? "42vw" : "12vw"} />
              <div>
                <p>{award.title}</p>
                <span>{award.type}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutFaqSection({ faqs }: { faqs: FptAboutFaq[] }) {
  return (
    <section className="fpt-section fpt-about-faq-section" id="cau-hoi-thuong-gap">
      <h2>Câu hỏi thường gặp</h2>
      <div className="fpt-about-faq-layout">
        <div className="fpt-about-faq-art">
          <Image src="/images/fptjobs/fptjobs-com-public-imgs-version2-fox-11.png" alt="" width={380} height={391} />
        </div>
        <div className="fpt-about-accordion">
          {faqs.map((faq, index) => (
            <details className="fpt-about-accordion-item" key={faq.question} open={index === 0}>
              <summary>
                <span>✔</span>
                <strong>{faq.question}</strong>
              </summary>
              <div>
                {faq.answer.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfficeTourSection({ tours }: { tours: FptOfficeTour[] }) {
  return (
    <section className="fpt-section fpt-office-tour-section" id="tham-quan-van-phong">
      <div className="fpt-office-tour-head">
        <h2>Tham quan văn phòng FPT Telecom</h2>
        <p>⭐️ FPT Tour 360 ⭐️</p>
      </div>

      <div className="fpt-office-tour-frame">
        <button className="fpt-office-tour-nav is-prev" aria-label="Văn phòng trước" type="button">
          <ArrowRight aria-hidden="true" size={18} />
        </button>
        <button className="fpt-office-tour-nav is-next" aria-label="Văn phòng tiếp theo" type="button">
          <ArrowRight aria-hidden="true" size={18} />
        </button>

        <div className="fpt-office-tour-grid">
          {tours.map((tour) => (
            <article className="fpt-office-tour-card" key={tour.title}>
              <a className="fpt-office-tour-overlay" href={tour.href} target="_blank" rel="noreferrer" aria-label={`Mở tour 360 ${tour.title}`} />
              <figure className="fpt-office-tour-image">
                <Image src={tour.image} alt={tour.title} fill sizes="(max-width: 768px) 92vw, 30vw" />
              </figure>
              <div className="fpt-office-tour-copy">
                <h3>{tour.title}</h3>
                <p>{tour.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="fpt-office-tour-action">
        <a href="https://tour.fptjobs.com/" target="_blank" rel="noreferrer">
          FPT Telecom 360 Tour
          <ArrowRight aria-hidden="true" size={15} />
        </a>
      </div>
    </section>
  );
}

function LifeSectionHeading({
  accent,
  description,
  subtitle,
  title,
}: {
  accent: string;
  description: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="fpt-life-heading">
      <h1>
        {title} <span>{accent}</span>
      </h1>
      <h2>{subtitle}</h2>
      <p>{description}</p>
    </div>
  );
}

function LifeCardGrid({ cards, mode }: { cards: FptLifeCard[]; mode: "activity" | "career" }) {
  return (
    <div className={cn("fpt-life-card-grid", `mode-${mode}`)}>
      {cards.map((card) => (
        <article className="fpt-life-card" key={card.title}>
          <figure>
            <Image src={card.image} alt={card.title} fill sizes="(max-width: 760px) 92vw, 30vw" />
          </figure>
          <div>
            <h3>{card.title}</h3>
            {card.description ? <p>{card.description}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function FptLifeAtFtelContentPage({ data }: { data: FptLifePageData }) {
  return (
    <FptPageFrame className="fpt-life-page">
      <section className="fpt-life-hero" id="hoat-dong">
        <div className="fpt-container">
          <LifeSectionHeading {...data.hero} />
        </div>
      </section>

      <section className="fpt-section fpt-life-mosaic-section" aria-label="Khoảnh khắc tại FPT Telecom">
        <div className="fpt-life-mosaic">
          {data.images.map((item, index) => (
            <figure className={cn("fpt-life-mosaic-item", item.className)} key={`${item.image}-${index}`}>
              <Image src={item.image} alt={`Life at FTEL ${index + 1}`} fill sizes="(max-width: 760px) 92vw, 31vw" />
            </figure>
          ))}
        </div>
      </section>

      <section className="fpt-life-heading-section" id="van-hoa">
        <div className="fpt-container">
          <LifeSectionHeading
            accent={data.culture.accent}
            description={data.culture.description}
            subtitle={data.culture.subtitle}
            title={data.culture.title}
          />
        </div>
      </section>

      <section className="fpt-life-culture-band">
        <div className="fpt-section fpt-life-culture-grid">
          {data.culture.values.map((item, index) => (
            <article
              aria-label={`${item.value}: ${item.description}`}
              className={cn("fpt-life-culture-card", `culture-${index + 1}`, `tone-${item.tone}`)}
              data-description={item.description}
              key={item.value}
            >
              <h2>{item.value}</h2>
            </article>
          ))}
        </div>
      </section>

      <section className="fpt-life-heading-section" id="tinh-than-phong-phu-title">
        <div className="fpt-container">
          <LifeSectionHeading
            accent={data.spirit.accent}
            description={data.spirit.description}
            subtitle={data.spirit.subtitle}
            title={data.spirit.title}
          />
        </div>
      </section>

      <section className="fpt-life-card-band" id="tinh-than-phong-phu">
        <div className="fpt-section">
          <LifeCardGrid cards={data.spirit.cards} mode="activity" />
        </div>
      </section>

      <section className="fpt-life-heading-section is-spaced" id="phat-trien-su-nghiep">
        <div className="fpt-container">
          <LifeSectionHeading
            accent={data.career.accent}
            description={data.career.description}
            subtitle={data.career.subtitle}
            title={data.career.title}
          />
        </div>
      </section>

      <section className="fpt-life-card-band">
        <div className="fpt-section">
          <LifeCardGrid cards={data.career.cards} mode="career" />
        </div>
      </section>

      <section className="fpt-life-heading-section is-benefit" id="phuc-loi">
        <div className="fpt-container">
          <LifeSectionHeading
            accent={data.benefits.accent}
            description={data.benefits.description}
            subtitle={data.benefits.subtitle}
            title={data.benefits.title}
          />
        </div>
      </section>

      <section className="fpt-section fpt-life-benefits">
        {data.benefits.items.map((benefit) => (
          <article className="fpt-life-benefit-card" key={benefit.title}>
            <h3>{benefit.title}</h3>
            <span>{benefit.icon}</span>
            <p>{benefit.subtitle}</p>
            <ul>
              {benefit.bullets.map((bullet) => (
                <li key={bullet}>
                  <CheckCircle2 aria-hidden="true" size={17} />
                  {bullet}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <RecruitmentNotice />
    </FptPageFrame>
  );
}

function FptContentPage({ data }: { data: FptContentPageData }) {
  return (
    <FptPageFrame className="fpt-content-page">
      {data.hideHero ? null : (
        <section className="fpt-subpage-hero">
          <div className="fpt-container fpt-subpage-hero-inner">
            <div>
              <span>{data.eyebrow}</span>
              <h1>{data.title}</h1>
              <p>{data.subtitle}</p>
              <Link className="fpt-login" href="/tuyen-dung">
                Khám phá cơ hội
              </Link>
            </div>
            <div className="fpt-subpage-hero-media">
              <Image src={data.heroImage} alt={data.title} fill priority sizes="(max-width: 768px) 92vw, 46vw" />
            </div>
          </div>
        </section>
      )}

      {data.aboutIntro ? (
        <AboutOverviewSection intro={data.aboutIntro} />
      ) : (
        <>
          <section className="fpt-section fpt-subpage-intro">
            <div>
              <p className="fpt-kicker">{data.eyebrow}</p>
              <h2>{data.introTitle}</h2>
            </div>
            <div>
              {data.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="fpt-subpage-stats">
            {data.stats.map((item) => (
              <article key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </section>
        </>
      )}

      {data.products ? (
        <AboutProductsSection products={data.products} />
      ) : (
        <section className="fpt-section fpt-subpage-features" id="van-hoa">
          {data.features.map((item, index) => (
            <article key={item.title}>
              {item.image ? (
                <div className="fpt-feature-image">
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 92vw, 28vw" />
                </div>
              ) : (
                <div className="fpt-feature-icon">
                  {[<WifiIcon key="wifi" />, <Sparkles key="sparkles" />, <HeartHandshake key="heart" />, <Trophy key="trophy" />][index % 4]}
                </div>
              )}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </section>
      )}

      {data.awards ? <AboutAwardsSection awards={data.awards} /> : null}

      {data.officeTour ? (
        <OfficeTourSection tours={data.officeTour} />
      ) : (
        <section className="fpt-section fpt-gallery-section" id="tham-quan-van-phong">
          <div className="fpt-detail-heading-row">
            <h2>Khoảnh khắc nổi bật</h2>
            <Link href="/life-at-ftel">Life at FTEL</Link>
          </div>
          <div className="fpt-gallery-grid">
            {data.gallery.map((item) => (
              <article key={item.title}>
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 92vw, 30vw" />
                <span>{item.title}</span>
              </article>
            ))}
          </div>
        </section>
      )}

      {data.showBranchContacts ? <AboutContactSection /> : null}

      {data.faqs ? <AboutFaqSection faqs={data.faqs} /> : null}

      <RecruitmentNotice />
    </FptPageFrame>
  );
}

function WifiIcon() {
  return <Rocket aria-hidden="true" size={24} />;
}

function FptNewsIndexPage({
  baseHref,
  currentPage,
  data,
  storageKey,
}: {
  baseHref: string;
  currentPage: number;
  data: FptNewsIndexPageData;
  storageKey: string;
}) {
  return (
    <FptPageFrame className={cn("fpt-news-index-page", data.pageClassName)}>
      <h1 className="sr-only">{data.pageHeading ?? "Tin tức và các hoạt động nổi bật của FPT Telecom"}</h1>

      <section className="fpt-news-index-hero">
        <div className="fpt-section">
          <h2>{data.hero.title}</h2>
          <p>{data.hero.subtitle}</p>
        </div>
      </section>

      <section className="fpt-section fpt-news-index-featured" aria-label={data.featuredAriaLabel ?? "Tin tức nổi bật"}>
        {data.featured.map((item) => (
          <Link className="fpt-news-index-feature-card" href={item.href} key={item.href} title={item.title}>
            <Image src={item.image} alt={item.title} fill sizes="(max-width: 760px) 92vw, 29vw" />
            <div className="fpt-news-index-feature-cover">
              <h3>{item.title}</h3>
              <div>
                <Image src="/images/fptjobs/fptjobs-com-public-imgs-version2-fox-avt.png" alt="" width={36} height={36} />
                <span>{item.type}</span>
                <span>{item.date}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <FptNewsIndexLatestClient
        baseHref={baseHref}
        currentPage={currentPage}
        featuredHrefs={data.featured.map((item) => item.href)}
        initialArticles={data.latest}
        latestSubtitle={data.latestSubtitle ?? "Đừng bỏ lỡ các tin tức thịnh hành."}
        latestTitle={data.latestTitle ?? "Tin tức mới nhất"}
        sidebar={data.sidebar}
        sidebarTitle={data.sidebarTitle ?? "Sự kiện nổi bật"}
        storageKey={storageKey}
      />
    </FptPageFrame>
  );
}

function getDefaultNewsArticleContent(article: FptNewsDetailArticle): FptNewsArticleContentBlock[] {
  return [
    {
      kind: "paragraph",
      text: article.excerpt,
    },
    {
      kind: "image",
      alt: article.title,
      src: article.image,
    },
    {
      kind: "heading",
      title: "Thông tin nổi bật",
    },
    {
      kind: "paragraph",
      text: "FPT Telecom liên tục cập nhật các câu chuyện nghề nghiệp, hoạt động tuyển dụng và cơ hội phát triển dành cho ứng viên trên toàn quốc.",
    },
    {
      kind: "paragraph",
      text: "Bạn có thể theo dõi thêm các vị trí đang mở tại FPT Jobs để chọn môi trường phù hợp với định hướng của mình.",
    },
  ];
}

function escapeFptContentHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderFptNewsArticleContentBlockToHtml(block: FptNewsArticleContentBlock) {
  if (block.kind === "heading") {
    const idAttribute = block.id ? ` id="${escapeFptContentHtml(block.id)}"` : "";

    return `<h2${idAttribute}>${escapeFptContentHtml(block.title)}</h2>`;
  }

  if (block.kind === "image") {
    return `<figure><img src="${escapeFptContentHtml(block.src)}" alt="${escapeFptContentHtml(block.alt)}" /></figure>`;
  }

  if (block.kind === "list") {
    const tag = block.ordered ? "ol" : "ul";
    const items = block.items.map((item) => `<li>${escapeFptContentHtml(item)}</li>`).join("\n");

    return `<${tag}>\n${items}\n</${tag}>`;
  }

  if (block.kind === "richParagraph") {
    const content = block.parts
      .map((part) =>
        part.href
          ? `<a href="${escapeFptContentHtml(part.href)}">${escapeFptContentHtml(part.text)}</a>`
          : escapeFptContentHtml(part.text),
      )
      .join("");

    return `<p>${content}</p>`;
  }

  if (block.kind === "toc") {
    const items = block.items
      .map((item) => `<li><a href="${escapeFptContentHtml(item.href)}">${escapeFptContentHtml(item.label)}</a></li>`)
      .join("\n");

    return `<div class="fpt-news-detail-toc">\n<h3>MỤC LỤC:</h3>\n<ul>\n${items}\n</ul>\n</div>`;
  }

  return `<p>${escapeFptContentHtml(block.text)}</p>`;
}

export function getFptNewsArticleAdminContentHtml(slug: string) {
  const article = getFptNewsArticleBySlug(slug);

  if (!article) return "";
  if (article.contentHtml?.trim()) return article.contentHtml.trim();

  return (article.contentBlocks ?? getDefaultNewsArticleContent(article))
    .map((block) => renderFptNewsArticleContentBlockToHtml(block))
    .join("\n");
}

function FptNewsArticleContent({ block }: { block: FptNewsArticleContentBlock }) {
  if (block.kind === "heading") {
    return (
      <h2 id={block.id}>
        <strong>{block.title}</strong>
      </h2>
    );
  }

  if (block.kind === "image") {
    return (
      <figure className="fpt-news-detail-figure">
        <Image src={block.src} alt={block.alt} width={1200} height={631} sizes="(max-width: 760px) 92vw, 1100px" />
      </figure>
    );
  }

  if (block.kind === "list") {
    const ListTag = block.ordered ? "ol" : "ul";

    return (
      <ListTag>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    );
  }

  if (block.kind === "richParagraph") {
    return (
      <p>
        {block.parts.map((part, index) =>
          part.href ? (
            <Link href={part.href} key={`${part.text}-${index}`}>
              {part.text}
            </Link>
          ) : (
            <span key={`${part.text}-${index}`}>{part.text}</span>
          ),
        )}
      </p>
    );
  }

  if (block.kind === "toc") {
    return (
      <div className="fpt-news-detail-toc">
        <h3>Nội dung chính</h3>
        <ul>
          {block.items.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <p>{block.text}</p>;
}

export function FptNewsArticlePage({ article }: { article: FptNewsDetailArticle }) {
  const contentBlocks = article.contentBlocks ?? getDefaultNewsArticleContent(article);
  const sourceHref = `https://fptjobs.com/tin-tuc/${article.slug}`;

  return (
    <FptPageFrame className="fpt-news-detail-page">
      <h1 className="sr-only">{article.title}</h1>

      <section className="fpt-news-detail-hero-art" aria-hidden="true">
        <Image src={assets.detailBanner} alt="" fill priority sizes="100vw" />
      </section>

      <section className="fpt-news-detail-header">
        <div className="fpt-section">
          <div className="fpt-news-detail-title-card">
            <Link className="fpt-news-detail-tag" href="/tin-tuc">
              {article.type}
            </Link>
            <h2>{article.title}</h2>
            <div className="fpt-news-detail-meta">
              <span>
                <Image src="/images/fptjobs/fptjobs-com-public-imgs-version2-fox-avt.png" alt="" width={28} height={28} />
                {article.author}
              </span>
              <span>
                <Clock3 aria-hidden="true" size={14} />
                {article.date}
              </span>
            </div>
          </div>
        </div>
      </section>

      <article className="fpt-news-detail-body">
        <strong className="fpt-news-detail-lead">{article.excerpt}</strong>
        <div className="fpt-news-detail-content">
          {article.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
          ) : (
            contentBlocks.map((block, index) => (
              <FptNewsArticleContent block={block} key={`${block.kind}-${index}`} />
            ))
          )}
        </div>

        <div className="fpt-news-detail-actions">
          <Link className="fpt-news-detail-chip" href="/tin-tuc">
            {article.tag}
          </Link>
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
      </article>
    </FptPageFrame>
  );
}

export function FptSurveyEventDetailPage({ event }: { event: FptSurveyEventDetail }) {
  const sourceHref = `https://fptjobs.com/su-kien-khao-sat/${event.slug}`;

  return (
    <FptPageFrame className="fpt-survey-detail-page fpt-news-detail-page">
      <h1 className="sr-only">{event.title}</h1>

      <section className="fpt-news-detail-hero-art fpt-survey-detail-banner" aria-hidden="true">
        <Image src={event.bannerImage} alt="" fill priority sizes="100vw" />
      </section>

      <section className="fpt-news-detail-header fpt-survey-detail-header">
        <div className="fpt-section">
          <div className="fpt-news-detail-title-card fpt-survey-detail-title-card">
            <Link className="fpt-news-detail-tag" href="/su-kien">
              Events
            </Link>
            <h2>{event.title}</h2>
            <div className="fpt-news-detail-meta">
              <span>
                <Image src="/images/fptjobs/fptjobs-com-public-imgs-version2-fox-avt.png" alt="" width={28} height={28} />
                Cáo tuyển dụng
              </span>
              <span>
                <Clock3 aria-hidden="true" size={14} />
                {event.date}
              </span>
            </div>
          </div>
        </div>
      </section>

      <article className="fpt-news-detail-body fpt-survey-detail-body">
        <div className="fpt-news-detail-content fpt-survey-detail-content" dangerouslySetInnerHTML={{ __html: event.contentHtml }} />
        {event.expired ? <p className="fpt-survey-expired">Sự kiện đã hết hạn đăng ký</p> : null}
        {event.extraImage ? (
          <figure className="fpt-survey-extra-image">
            <Image src={event.extraImage} alt={event.title} width={1200} height={631} sizes="(max-width: 760px) 92vw, 1100px" />
          </figure>
        ) : null}
        <FptSurveyEventForm event={event} />

        <div className="fpt-news-detail-actions fpt-survey-detail-actions">
          <div className="fpt-survey-tags">
            {(event.tags?.length ? event.tags : ["Events"]).map((tag) => (
              <Link className="fpt-news-detail-chip" href="/su-kien" key={tag}>
                {tag}
              </Link>
            ))}
          </div>
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
      </article>
    </FptPageFrame>
  );
}

function CareerBoomingTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="fpt-cb-title-plate">
      <Image src="/images/fptjobs/fptjobs-com-public-imgs-version2-page-career-booming-img-title.png" alt="" width={633} height={106} />
      <h2>{children}</h2>
    </div>
  );
}

function FptCareerBoomingLandingPage() {
  return (
    <FptPageFrame className="fpt-career-booming-page">
      <h1 className="sr-only">FTEL Career Booming - Bứt phá sự nghiệp cùng FPT</h1>

      <section className="fpt-cb-hero" aria-label="FTEL Career Booming">
        <Image
          src="/images/fptjobs/fptjobs-com-public-imgs-version2-page-career-booming-banner2.png"
          alt="FTEL Career Booming"
          width={1440}
          height={527}
          priority
          sizes="100vw"
        />
      </section>

      <section className="fpt-cb-level-up">
        <div>
          <h2>
            LEVEL UP SỰ NGHIỆP
            <br />
            JOB XỊN, BOSS CHILL, VÀO TEAM LÀ AUTO LÊN CẤP
          </h2>
          <div className="fpt-cb-level-copy">
            <p>
              Dù bạn mới log in ngành học hay đang cày rank năm cuối, FPT Telecom luôn có cơ hội để bạn khai phóng năng lực và xây dựng
              sự nghiệp:
            </p>
            <ul>
              <li>Các chương trình Sinh viên tài năng với combo quyền lợi khủng</li>
              <li>Được mentor kèm cặp 1:1 truyền nghề</li>
              <li>Làm thật - dự án thật, tăng chỉ số thực chiến</li>
              <li>Unlock cơ hội việc làm dù chưa tốt nghiệp</li>
            </ul>
            <p>👉Chọn Job. Chọn Team. Bắt đầu hành trình của bạn ngay hôm nay!</p>
          </div>
        </div>
      </section>

      <section className="fpt-cb-opportunity">
        <div className="fpt-container">
          <h2 className="fpt-cb-gradient-title">CƠ HỘI NGHỀ NGHIỆP</h2>
          <div className="fpt-cb-industry-grid">
            {careerBoomingIndustryCards.map((lines) => (
              <button className="fpt-cb-industry-card" key={lines.join("-")} type="button">
                {lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="fpt-cb-why" id="lua-chon-fpt-telecom">
        <CareerBoomingTitle>LỰA CHỌN FPT TELECOM</CareerBoomingTitle>
        <div className="fpt-container fpt-cb-reason-grid">
          {careerBoomingReasons.map((reason) => (
            <article className="fpt-cb-reason-card" key={reason.title}>
              <Image src={reason.icon} alt="" width={130} height={130} />
              <h3>
                {reason.title}
                <span>{reason.accent}</span>
              </h3>
              <p>{reason.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="fpt-cb-form-section" id="career-booming-form">
        <CareerBoomingTitle>FORM ĐĂNG KÝ</CareerBoomingTitle>
        <FptCareerBoomingApplicationForm fields={careerBoomingFields} regions={careerBoomingRegions} />
      </section>

      <section className="fpt-cb-events">
        <div className="fpt-container">
          <h2 className="fpt-cb-gradient-title">SỰ KIỆN THƯỜNG NIÊN</h2>
          <div className="fpt-cb-event-row">
            {careerBoomingEvents.map((event) => (
              <article className="fpt-cb-event-card" key={event.title}>
                <figure>
                  <Image src={event.image} alt={event.title} fill sizes="(max-width: 760px) 82vw, 29vw" />
                </figure>
                <h3>{event.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    </FptPageFrame>
  );
}

function FptNextgenLandingPage() {
  return (
    <div className="fpt-page fpt-nextgen-page" id="top">
      <FptHeader />
      <main className="fpt-nextgen-main">
        <h1 className="sr-only">Nextgen Leaders - Tìm Kiếm Lãnh Đạo Trẻ Tại FPT</h1>

        <section className="fpt-ng-hero" id="hero">
          <div className="fpt-ng-hero-inner">
            <div className="fpt-ng-hero-copy">
              <p>CHƯƠNG TRÌNH SINH VIÊN TÀI NĂNG</p>
              <strong>FPT Telecom</strong>
              <div className="fpt-ng-mobile-title" aria-hidden="true">
                NEXTGEN
                <br />
                LEADERS
              </div>
              <Image
                alt="Nextgen Leaders"
                className="fpt-ng-titlemark"
                height={663}
                priority
                sizes="(max-width: 760px) 86vw, 46vw"
                src="/images/fptjobs/fptjobs-com-public-img-landing-page-img-nextgen.png"
                width={1787}
              />
              <span>EMPOWER LEADERS - KICKSTART CAREERS</span>
            </div>
            <Image
              alt="Sinh viên FPT Telecom trong chương trình Nextgen Leaders"
              className="fpt-ng-hero-people"
              height={826}
              priority
              sizes="(max-width: 760px) 86vw, 46vw"
              src="/images/fptjobs/fptjobs-com-public-img-landing-page-img-img-baner.png"
              width={843}
            />
          </div>
        </section>

        <section className="fpt-ng-intro" id="present-1">
          <div className="fpt-ng-intro-inner">
            <Image
              alt="Nextgen Leaders"
              height={112}
              src="/images/fptjobs/fptjobs-com-public-img-landing-page-img-section2-nextgen.png"
              width={386}
            />
            <div>
              <p>
                Chương trình tìm kiếm, đào tạo tài năng lớn nhất & duy nhất trong năm, với giá trị giải thưởng lên đến
                300 triệu đồng, thông qua các thử thách cùng lộ trình đào tạo bài bản, chuyên biệt cho Gen Z sẽ giúp bạn
                bứt phá giới hạn, khẳng định bản thân và khai phóng sự nghiệp để trở thành thế hệ NextGen tiếp theo
                trong hàng ngũ Quản lý, Lãnh đạo tại FPT Telecom.
              </p>
              <strong>EMPOWER LEADERS - KICKSTART CAREERS</strong>
            </div>
          </div>
        </section>

        <section className="fpt-ng-benefits" id="present-2">
          <div className="fpt-ng-benefits-inner">
            <Image
              alt="Sinh viên tham gia Nextgen Leaders"
              height={555}
              sizes="(max-width: 760px) 86vw, 45vw"
              src="/images/fptjobs/fptjobs-com-public-img-landing-page-img-img-bg-section3.png"
              width={665}
            />
            <div className="fpt-ng-benefits-copy">
              <p>THAM GIA CHƯƠNG TRÌNH</p>
              <h2>BẠN SẼ ĐƯỢC</h2>
              <ul>
                {nextgenBenefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="fpt-ng-candidates" id="present-3">
          <Image
            alt="Ứng viên Nextgen Leaders"
            className="fpt-ng-candidate-img"
            height={586}
            src="/images/fptjobs/fptjobs-com-public-img-landing-page-img-Frame-20139.png"
            width={406}
          />
          <div className="fpt-ng-candidate-copy">
            <h2>ĐỪNG BỎ LỠ</h2>
            <p>NẾU BẠN LÀ</p>
            <ul>
              {nextgenCriteria.map((criterion) => (
                <li key={criterion}>{criterion}</li>
              ))}
            </ul>
          </div>
          <Image
            alt="Sinh viên FPT Telecom"
            className="fpt-ng-candidate-img"
            height={586}
            src="/images/fptjobs/fptjobs-com-public-img-landing-page-img-present-203-20right.png"
            width={406}
          />
        </section>

        <section className="fpt-ng-kickstart" id="Kickstart" aria-label="Kickstart Careers">
          <span>KICK</span>START CAREERS
        </section>

        <section className="fpt-ng-timeline" id="timeline">
          <div className="fpt-ng-timeline-inner">
            <div className="fpt-ng-timeline-copy">
              <Image
                alt="Nextgen Leaders timeline"
                height={122}
                src="/images/fptjobs/fptjobs-com-public-img-landing-page-img-logo-timeline.png"
                width={533}
              />
              <h2>TIMELINE</h2>
              <div className="fpt-ng-timeline-list">
                {nextgenTimeline.map((group) => (
                  <div key={group.title}>
                    <h3>{group.title}</h3>
                    {group.items.map((item) => (
                      <p key={`${group.title}-${item.date}-${item.text}`}>
                        {item.date ? <strong>{item.date}</strong> : null} {item.text}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <Image
              alt="Đại diện sinh viên Nextgen Leaders"
              className="fpt-ng-timeline-person"
              height={670}
              sizes="(max-width: 980px) 70vw, 42vw"
              src="/images/fptjobs/fptjobs-com-public-img-landing-page-img-img-timeline.png"
              width={580}
            />
          </div>
        </section>

        <section className="fpt-ng-mentors" id="mentor">
          <h2>
            MENTOR <span>&quot;CHẤT&quot;</span>
          </h2>
          <div className="fpt-ng-mentor-track" aria-label="Danh sách mentor Nextgen Leaders">
            {nextgenMentorImages.map((mentorImage, index) => (
              <Image
                alt={`Mentor Nextgen Leaders ${index + 1}`}
                height={256}
                key={mentorImage}
                src={mentorImage}
                width={329}
              />
            ))}
          </div>
          <div className="fpt-ng-mentor-dots" aria-hidden="true">
            <span className="is-active" />
            <span />
            <span />
            <span />
            <span />
          </div>
        </section>

        <section className="fpt-ng-register" id="register">
          <h2>
            <span>&gt;</span> Cùng FPT Telecom
            <br />
            Khai Phóng Sự Nghiệp Của Bạn
          </h2>
        </section>

        <section className="fpt-ng-awards" id="giaithuong">
          <div className="fpt-ng-award-grid">
            {nextgenAwards.map((award) => (
              <article className="fpt-ng-award-card" key={award.title}>
                <Image alt={award.title} height={320} src={award.image} width={320} />
                <h3>{award.title}</h3>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="fpt-ng-footer">
        <div className="fpt-ng-footer-inner">
          <Link aria-label="FPT Telecom Nextgen Leaders" href="/Nextgen-Leaders">
            <Image
              alt="FPT Telecom Nextgen Leaders"
              height={37}
              src="/images/fptjobs/fptjobs-com-public-img-landing-page-img-logo-logo-white.png"
              width={111}
            />
          </Link>
          <div className="fpt-ng-footer-contact">
            {nextgenContacts.map((contact) => (
              <span key={contact.label}>
                <Image alt="" height={16} src={contact.icon} width={16} />
                {contact.label}
              </span>
            ))}
          </div>
        </div>
      </footer>
      <FloatingActions />
    </div>
  );
}

function SvcntsSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="fpt-svc-title">
      <h2>{children}</h2>
      <span />
    </div>
  );
}

function FptSvcntsLandingPage() {
  return (
    <div className="fpt-svc-page" id="top">
      <header className="fpt-svc-header">
        <Link aria-label="FPT Telecom" href="/SVCNTS2026">
          <Image
            alt="FPT Telecom"
            height={223}
            priority
            src="/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-logo-fpt-telecom-trang.png"
            width={676}
          />
        </Link>
        <nav aria-label="SVCNTS 2026">
          <Link href="#section-vi-tri">VỊ TRÍ</Link>
          <Link href="#section-benefits">QUYỀN LỢI</Link>
          <Link href="#section-target">ĐỐI TƯỢNG</Link>
          <Link href="#section-process">QUY TRÌNH</Link>
          <Link className="fpt-svc-nav-cta" href="#section-form">
            ỨNG TUYỂN NGAY
          </Link>
        </nav>
        <Link className="fpt-svc-menu" href="#section-form" aria-label="Ứng tuyển ngay">
          <Menu size={18} />
        </Link>
      </header>

      <main className="fpt-svc-main">
        <h1 className="sr-only">SVCNTS 2026 - Chương trình Sinh viên Công nghệ Tập sự FPT Telecom</h1>

        <section className="fpt-svc-hero">
          <div className="fpt-svc-hero-inner">
            <Image
              alt="Sinh viên Công nghệ Tập sự 2026 - Master Deep Tech, Lead The Next"
              className="fpt-svc-hero-text"
              height={805}
              priority
              sizes="(max-width: 760px) 88vw, 46vw"
              src="/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-hero-text.png"
              width={931}
            />
            <Image
              alt="Sinh viên Công nghệ Tập sự FPT Telecom"
              className="fpt-svc-hero-human"
              height={1080}
              priority
              sizes="(max-width: 760px) 88vw, 48vw"
              src="/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-hero-human.png"
              width={1178}
            />
          </div>
        </section>

        <section className="fpt-svc-positions" id="section-vi-tri">
          <SvcntsSectionTitle>NHÓM NGÀNH & VỊ TRÍ</SvcntsSectionTitle>
          <div className="fpt-svc-sector-grid">
            {svcntsSectors.map((sector) => (
              <article className="fpt-svc-sector-card" key={sector.title}>
                <Image alt="" height={130} src={sector.icon} width={130} />
                <h3>{sector.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="fpt-svc-benefits" id="section-benefits">
          <SvcntsSectionTitle>QUYỀN LỢI VƯỢT TRỘI CHO TÀI NĂNG TRẺ</SvcntsSectionTitle>
          <div className="fpt-svc-benefit-grid">
            {svcntsBenefits.map((benefit) => (
              <article className="fpt-svc-benefit-card" key={benefit.title}>
                <Image alt="" height={296} src={benefit.icon} width={296} />
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="fpt-svc-target" id="section-target">
          <div className="fpt-svc-target-copy">
            <SvcntsSectionTitle>ĐỐI TƯỢNG TUYỂN CHỌN</SvcntsSectionTitle>
            <ul>
              {svcntsTargets.map((target) => (
                <li key={target}>{target}</li>
              ))}
            </ul>
          </div>
          <Image
            alt="Đối tượng tuyển chọn SVCNTS"
            height={756}
            sizes="(max-width: 760px) 82vw, 34vw"
            src="/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-doi-tuong-prop.png"
            width={824}
          />
        </section>

        <section className="fpt-svc-experts" id="section-experts">
          <SvcntsSectionTitle>GẶP GỠ CÁC CHUYÊN GIA CỦA FPT TELECOM</SvcntsSectionTitle>
          <div className="fpt-svc-slider-shell">
            <span className="fpt-svc-slider-arrow">❯</span>
            <div className="fpt-svc-expert-track">
              {svcntsExperts.map((expert) => (
                <article className="fpt-svc-expert-card" key={expert.name}>
                  <Image alt={expert.name} height={308} src={expert.image} width={211} />
                  <div>
                    <h3>{expert.name}</h3>
                    <p>{expert.role}</p>
                  </div>
                </article>
              ))}
            </div>
            <span className="fpt-svc-slider-arrow is-right">❮</span>
          </div>
        </section>

        <section className="fpt-svc-alumni" id="section-alumni">
          <SvcntsSectionTitle>LẮNG NGHE CHIA SẺ CỦA CÁC CỰU SINH VIÊN CÔNG NGHỆ TẬP SỰ</SvcntsSectionTitle>
          <div className="fpt-svc-slider-shell">
            <span className="fpt-svc-slider-arrow">❯</span>
            <div className="fpt-svc-alumni-track">
              {svcntsAlumni.map((alumnus) => (
                <article className="fpt-svc-alumni-card" key={alumnus.name}>
                  <Image alt={alumnus.name} height={308} src={alumnus.image} width={211} />
                  <h3>{alumnus.name}</h3>
                  <p className="fpt-svc-alumni-role">{alumnus.role}</p>
                  <p className="fpt-svc-alumni-year">{alumnus.year}</p>
                  <blockquote>{alumnus.quote}</blockquote>
                </article>
              ))}
            </div>
            <span className="fpt-svc-slider-arrow is-right">❮</span>
          </div>
        </section>

        <section className="fpt-svc-process" id="section-process">
          <SvcntsSectionTitle>QUY TRÌNH TUYỂN CHỌN</SvcntsSectionTitle>
          <div className="fpt-svc-process-map">
            {svcntsProcess.map((step, index) => (
              <article className={cn("fpt-svc-process-step", index % 2 ? "is-right" : "is-left")} key={step.title}>
                <span>{index % 2 ? "«" : "»"}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="fpt-svc-form-section" id="section-form">
          <FptSvcntsApplicationForm positions={svcntsPositions} />
        </section>
      </main>

      <footer className="fpt-svc-footer">
        <div className="fpt-svc-footer-inner">
          <Image
            alt="FPT Telecom"
            height={223}
            src="/images/fptjobs/fptjobs-com-public-img-SVCNTS2026-img-logo-fpt-telecom.png"
            width={676}
          />
          <div className="fpt-svc-socials" aria-label="Liên kết SVCNTS">
            <span>Fanpage</span>
            <span>LinkedIn</span>
            <span>TikTok</span>
            <span>FPT Jobs</span>
          </div>
          <p>Copyright © 2026. Official Website Tuyển dụng của Công ty Cổ phần Viễn thông FPT (FPT Telecom).</p>
          <p>phuongtm3@fpt.com / nhanctt3@fpt.com</p>
        </div>
      </footer>
    </div>
  );
}

function FptInternshipLandingPage() {
  return (
    <div className="fpt-internship-page" id="section-banner">
      <main className="fpt-int-main">
        <section className="fpt-int-hero">
          <Link className="fpt-int-logo" aria-label="FPT Telecom Internship 2026" href="/Internship">
            <Image
              alt="FPT Telecom Internship 2026"
              height={553}
              priority
              src="/images/fptjobs/fptjobs-com-public-img-Internship2026-Logo-FPT-Internship-2026.png"
              width={1080}
            />
          </Link>
          <Image
            alt="FPT Telecom Internship 2026"
            className="fpt-int-hero-mobile-art"
            height={1350}
            priority
            sizes="(max-width: 760px) 100vw, 0px"
            src="/images/fptjobs/fptjobs-com-public-img-Internship2026-Internship-banner-mobi.png"
            width={1080}
          />
          <h1 className="sr-only">FPT Telecom Internship 2026</h1>
          <div className="fpt-int-hero-overlays">
            <Image
              alt="Cơ hội thực tập đa ngành tại doanh nghiệp viễn thông và công nghệ hàng đầu Việt Nam"
              className="fpt-int-hero-chance"
              height={141}
              priority
              src="/images/fptjobs/fptjobs-com-public-img-Internship2026-Internship-banner-co-hoi.png"
              width={853}
            />
            <Image
              alt="Mentor đồng hành 1-1, đào tạo toàn diện, xác nhận thực tập"
              className="fpt-int-hero-buttons"
              height={189}
              priority
              src="/images/fptjobs/fptjobs-com-public-img-Internship2026-Internship-banner-3-button.png"
              width={1588}
            />
          </div>
        </section>

        <nav className="fpt-int-nav" aria-label="Internship 2026">
          <Link href="#section-banner">Trang chủ</Link>
          <Link href="#section-benefit">Quyền lợi</Link>
          <Link href="#section-job-positions">Vị trí tuyển dụng</Link>
          <Link href="#section-reason">Quy trình</Link>
          <Link className="fpt-int-nav-cta" href="#section-form-submit">
            Ứng tuyển ngay
          </Link>
        </nav>

        <section className="fpt-int-benefit" id="section-benefit">
          <div className="fpt-int-benefit-media">
            <Image
              alt="Quyền lợi khi tham gia FPT Telecom Internship"
              height={2528}
              sizes="(max-width: 760px) 92vw, 48vw"
              src="/images/fptjobs/fptjobs-com-public-img-Internship2026-Internship-benefit.png"
              width={1696}
            />
          </div>
          <div className="fpt-int-benefit-copy">
            <h2>
              <span>QUYỀN LỢI</span>
              KHI THAM GIA CHƯƠNG TRÌNH
            </h2>
            <ul>
              {internshipBenefitCopy.map((benefit) => (
                <li key={benefit.title}>
                  <strong>{benefit.title}:</strong> {benefit.description}
                </li>
              ))}
            </ul>
            <div className="fpt-int-benefit-icons">
              {internshipBenefitCopy.map((benefit) => (
                <article key={benefit.title}>
                  <Image alt="" height={1350} src={benefit.image} width={1080} />
                  <h3>{benefit.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="fpt-int-positions" id="section-job-positions">
          <h2>VỊ TRÍ TUYỂN DỤNG</h2>
          <div className="fpt-int-position-grid">
            {internshipPositions.map((position) => (
              <article key={position.title}>
                <h3>{position.title}</h3>
                <p>{position.description}</p>
              </article>
            ))}
          </div>
          <Link href="#section-form-submit">TÌM HIỂU CHI TIẾT</Link>
        </section>

        <section className="fpt-int-reason" id="section-reason">
          <h2>HÀNH TRÌNH KHÔNG THỂ BỎ LỠ</h2>
          <div className="fpt-int-reason-grid">
            {internshipJourney.map((step) => (
              <article className={cn("fpt-int-reason-card", step.className)} key={step.title}>
                <div>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                </div>
                {step.date ? <strong>{step.date}</strong> : null}
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="fpt-int-form-section" id="section-form-submit">
          <div className="fpt-int-form-image">
            <Image
              alt="FPT Telecom Internship 2026"
              height={1696}
              sizes="(max-width: 760px) 92vw, 50vw"
              src="/images/fptjobs/fptjobs-com-public-img-Internship2026-Internship-form-submit.png"
              width={1696}
            />
          </div>
          <FptInternshipApplicationForm roles={internshipRoleOptions} />
        </section>
      </main>

      <section className="fpt-int-contact">
        <h2>Kết nối với chúng tôi</h2>
        <div className="fpt-int-contact-box">
          <div className="fpt-int-contact-grid">
            {internshipContacts.map((contact) => (
              <article key={contact.title}>
                <Image alt="" height={48} src={contact.icon} width={48} />
                <div>
                  <h3>{contact.title}</h3>
                  <p>{contact.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
          <Image
            alt=""
            className="fpt-int-contact-fox"
            height={220}
            src="/images/fptjobs/fptjobs-com-public-imgs-version2-fox-3.png"
            width={220}
          />
        </div>
        <p className="fpt-int-copyright">
          Copyright ©2015. Official Website Tuyển dụng của Công ty Cổ phần Viễn thông FPT (FPT Telecom).
        </p>
      </section>
    </div>
  );
}

export function FptAboutPage() {
  return <FptContentPage data={aboutPageData} />;
}

export function FptLifeAtFtelPage() {
  return <FptLifeAtFtelContentPage data={lifePageData} />;
}

export function FptNewsPage({ currentPage = 1 }: { currentPage?: number }) {
  return <FptNewsIndexPage baseHref="/tin-tuc" currentPage={currentPage} data={newsIndexPageData} storageKey="fptjobs.admin.news" />;
}

export function FptEventsPage({ currentPage = 1 }: { currentPage?: number }) {
  return <FptNewsIndexPage baseHref="/su-kien" currentPage={currentPage} data={eventsIndexPageData} storageKey="fptjobs.admin.events" />;
}

export function FptCareerBoomingPage() {
  return <FptCareerBoomingLandingPage />;
}

export function FptNextgenLeadersPage() {
  return <FptNextgenLandingPage />;
}

export function FptSvcntsPage() {
  return <FptSvcntsLandingPage />;
}

export function FptInternshipPage() {
  return <FptInternshipLandingPage />;
}

type JobDetailCopy = {
  unit: string;
  quantity: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  tags: string[];
  workplace: string;
  branchName: string;
  branchIntro: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  landline: string;
};

function getJobDetailCopy(job: Job): JobDetailCopy {
  const title = job.title.toLowerCase();
  const isSales = title.includes("kinh doanh") || title.includes("account manager");
  const isCustomer = title.includes("dịch vụ khách hàng");
  const isTech = title.includes("kỹ thuật") || title.includes("bảo trì") || title.includes("hạ tầng");
  const isIt = title.includes("cntt") || title.includes("kiểm thử") || title.includes("qc");
  const isFinance = title.includes("tài chính");
  const isHr = title.includes("nhân sự");
  const isProject = title.includes("dự án");

  const commonBenefits = [
    `Thu nhập: ${job.salary}.`,
    "Khen thưởng: Lương tháng 13, thưởng nghỉ mát, thưởng thi đua, thưởng top nhân viên xuất sắc của năm.",
    "Chế độ bảo hiểm theo luật lao động hiện hành: BHYT, BHXH, BHTN.",
    "Cơ hội được đào tạo, phát triển và thăng tiến rõ ràng.",
    "Môi trường làm việc thân thiện, chuyên nghiệp, năng động và trẻ trung.",
    "Văn hóa doanh nghiệp đặc sắc với nhiều hoạt động hội nhập, nghỉ mát, team building, thể thao và thiện nguyện.",
  ];

  if (isSales) {
    return {
      unit: "Trung tâm Kinh doanh",
      quantity: "3",
      responsibilities: [
        "Tìm kiếm, tư vấn và phát triển khách hàng sử dụng dịch vụ Internet, Truyền hình, Camera và giải pháp viễn thông của FPT Telecom.",
        "Chăm sóc khách hàng trong khu vực phụ trách, duy trì mối quan hệ và mở rộng tệp khách hàng mới.",
        "Theo dõi tiến độ triển khai dịch vụ, phối hợp với bộ phận kỹ thuật để đảm bảo trải nghiệm khách hàng.",
        "Thực hiện chỉ tiêu kinh doanh theo tháng/quý và báo cáo kết quả cho quản lý trực tiếp.",
      ],
      requirements: [
        "Tốt nghiệp Trung cấp trở lên, yêu thích kinh doanh và tư vấn khách hàng.",
        "Giao tiếp tốt, chủ động, có tinh thần học hỏi và chịu được áp lực doanh số.",
        "Ưu tiên ứng viên có kinh nghiệm bán hàng, telesales, thị trường hoặc dịch vụ viễn thông.",
        "Có phương tiện di chuyển cá nhân và sẵn sàng làm việc theo địa bàn được phân công.",
      ],
      benefits: commonBenefits,
      tags: ["kinh doanh", "tư vấn khách hàng", "viễn thông"],
      workplace: job.location === "Hồ Chí Minh" ? "FPT Tân Thuận, KCX Tân Thuận, Quận 7, TP. Hồ Chí Minh" : "FPT Tower, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
      branchName: job.location === "Hồ Chí Minh" ? "FPT Telecom Hồ Chí Minh" : "FPT Telecom Hà Nội",
      branchIntro: [
        "FPT Telecom là một trong những nhà cung cấp dịch vụ viễn thông và Internet hàng đầu Việt Nam, luôn mở rộng đội ngũ kinh doanh tại các khu vực trọng điểm.",
        "Ứng viên được đào tạo sản phẩm, kỹ năng tư vấn và phương pháp chăm sóc khách hàng để phát triển sự nghiệp bền vững.",
      ],
      contactName: "Trung tâm Thu hút Nguồn nhân lực",
      contactEmail: "phuongtm3@fpt.com / nhanctt3@fpt.com",
      contactPhone: "0904 678 040 / 0986 656 620",
      landline: "0904 678 040 / 0986 656 620",
    };
  }

  if (isCustomer) {
    return {
      unit: "Trung tâm Dịch vụ khách hàng",
      quantity: "2",
      responsibilities: [
        "Tiếp nhận và xử lý yêu cầu của khách hàng qua các kênh trực tiếp, điện thoại và hệ thống nội bộ.",
        "Theo dõi tiến trình hỗ trợ, phối hợp các bộ phận liên quan để giải quyết sự cố hoặc nhu cầu phát sinh.",
        "Tư vấn thông tin dịch vụ, chương trình chăm sóc khách hàng và hướng dẫn khách hàng sử dụng sản phẩm.",
        "Ghi nhận phản hồi, cập nhật dữ liệu và đảm bảo chất lượng trải nghiệm khách hàng theo tiêu chuẩn FPT Telecom.",
      ],
      requirements: [
        "Tốt nghiệp Cao đẳng trở lên, có kỹ năng giao tiếp và xử lý tình huống tốt.",
        "Giọng nói rõ ràng, thái độ tích cực, kiên nhẫn và có tinh thần phục vụ khách hàng.",
        "Sử dụng tốt tin học văn phòng, có khả năng làm việc theo ca khi cần.",
        "Ưu tiên ứng viên từng làm chăm sóc khách hàng, giao dịch viên hoặc dịch vụ viễn thông.",
      ],
      benefits: commonBenefits,
      tags: ["chăm sóc khách hàng", "dịch vụ khách hàng", "giao dịch viên"],
      workplace: "FPT Tân Thuận, KCX Tân Thuận, Quận 7, TP. Hồ Chí Minh",
      branchName: "FPT Telecom Hồ Chí Minh",
      branchIntro: [
        "Khối Dịch vụ khách hàng là điểm chạm quan trọng trong hành trình trải nghiệm của hàng triệu khách hàng FPT Telecom.",
        "Đội ngũ luôn được đào tạo về nghiệp vụ, kỹ năng giao tiếp và tinh thần thấu cảm để mang đến dịch vụ nhanh chóng, thân thiện.",
      ],
      contactName: "Trung tâm Thu hút Nguồn nhân lực",
      contactEmail: "phuongtm3@fpt.com / nhanctt3@fpt.com",
      contactPhone: "0904 678 040 / 0986 656 620",
      landline: "0904 678 040 / 0986 656 620",
    };
  }

  if (isIt) {
    return {
      unit: title.includes("kiểm thử") ? "Trung tâm Phát triển phần mềm" : "Trung tâm Công nghệ thông tin",
      quantity: "1",
      responsibilities: [
        "Vận hành, giám sát và tối ưu hệ thống công nghệ phục vụ hoạt động kinh doanh và dịch vụ của FPT Telecom.",
        "Phối hợp với các nhóm sản phẩm, kỹ thuật và vận hành để phân tích yêu cầu, xử lý sự cố và cải tiến quy trình.",
        title.includes("kiểm thử")
          ? "Thiết kế testcase, thực hiện kiểm thử chức năng, ghi nhận lỗi và theo dõi vòng đời xử lý lỗi."
          : "Theo dõi hiệu năng hệ thống, triển khai thay đổi cấu hình và đảm bảo tính ổn định của dịch vụ.",
        "Lập tài liệu, báo cáo tiến độ và thực hiện các công việc khác theo phân công của quản lý trực tiếp.",
      ],
      requirements: [
        "Tốt nghiệp Cao đẳng/Đại học chuyên ngành Công nghệ thông tin, Hệ thống thông tin hoặc lĩnh vực liên quan.",
        "Có tư duy logic, khả năng phân tích vấn đề và tinh thần phối hợp tốt với nhiều nhóm chuyên môn.",
        "Ưu tiên ứng viên có kinh nghiệm vận hành hệ thống, kiểm thử phần mềm, quản trị hạ tầng hoặc làm việc trong môi trường Agile.",
        "Chủ động học hỏi công nghệ mới và có trách nhiệm cao với chất lượng sản phẩm/dịch vụ.",
      ],
      benefits: commonBenefits,
      tags: title.includes("kiểm thử") ? ["QC", "kiểm thử phần mềm", "quality assurance"] : ["CNTT", "vận hành hệ thống", "IT operation"],
      workplace: job.location === "Hồ Chí Minh" ? "FPT Tân Thuận, KCX Tân Thuận, Quận 7, TP. Hồ Chí Minh" : "FPT Tower, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
      branchName: job.location === "Hồ Chí Minh" ? "FPT Telecom Hồ Chí Minh" : "FPT Telecom Hà Nội",
      branchIntro: [
        "Khối công nghệ của FPT Telecom xây dựng và vận hành các nền tảng phục vụ hàng triệu khách hàng trên toàn quốc.",
        "Môi trường làm việc đề cao năng lực chuyên môn, tinh thần chủ động và cơ hội phát triển cùng các hệ thống quy mô lớn.",
      ],
      contactName: "Trung tâm Thu hút Nguồn nhân lực",
      contactEmail: "phuongtm3@fpt.com / nhanctt3@fpt.com",
      contactPhone: "0904 678 040 / 0986 656 620",
      landline: "0904 678 040 / 0986 656 620",
    };
  }

  if (isFinance || isHr || isProject) {
    return {
      unit: isFinance ? "Ban Tài chính" : isHr ? "Ban Nhân sự" : "Ban Quản lý Dự án",
      quantity: "1",
      responsibilities: [
        "Thực hiện các nghiệp vụ chuyên môn theo kế hoạch của đơn vị và mục tiêu vận hành của FPT Telecom.",
        "Phối hợp với các phòng ban liên quan để thu thập dữ liệu, phân tích vấn đề và đề xuất phương án xử lý.",
        isFinance
          ? "Xây dựng báo cáo tài chính, phân tích chỉ số và hỗ trợ lập kế hoạch ngân sách."
          : isHr
            ? "Tham gia tuyển dụng, onboarding, quản lý hồ sơ nhân sự và các hoạt động gắn kết nội bộ."
            : "Theo dõi tiến độ dự án, quản trị rủi ro và đảm bảo các mốc triển khai đúng kế hoạch.",
        "Cập nhật báo cáo định kỳ và thực hiện các công việc khác theo phân công của quản lý trực tiếp.",
      ],
      requirements: [
        "Tốt nghiệp Đại học chuyên ngành phù hợp với vị trí ứng tuyển.",
        "Có kỹ năng phân tích, tổng hợp thông tin và sử dụng tốt tin học văn phòng.",
        "Cẩn thận, trách nhiệm, chủ động trong công việc và giao tiếp phối hợp tốt.",
        "Ưu tiên ứng viên có kinh nghiệm trong môi trường doanh nghiệp quy mô lớn.",
      ],
      benefits: commonBenefits,
      tags: isFinance ? ["tài chính", "financial analyst", "phân tích"] : isHr ? ["nhân sự", "tuyển dụng", "HR"] : ["quản lý dự án", "viễn thông", "project"],
      workplace: job.location === "Long An" ? "FPT Telecom Long An" : "FPT Tower, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
      branchName: job.location === "Long An" ? "FPT Telecom Long An" : "FPT Telecom Hà Nội",
      branchIntro: [
        "Các khối hỗ trợ vận hành đóng vai trò quan trọng trong việc đảm bảo FPT Telecom phát triển ổn định, hiệu quả và bền vững.",
        "Ứng viên có cơ hội làm việc cùng nhiều đơn vị chuyên môn, tiếp cận bài toán thực tế và phát triển năng lực quản trị.",
      ],
      contactName: "Trung tâm Thu hút Nguồn nhân lực",
      contactEmail: "phuongtm3@fpt.com / nhanctt3@fpt.com",
      contactPhone: "0904 678 040 / 0986 656 620",
      landline: "0904 678 040 / 0986 656 620",
    };
  }

  return {
    unit: isTech ? `Chi nhánh ${job.location}` : "FPT Telecom",
    quantity: "1",
    responsibilities: [
      "Vận hành và khai thác hệ thống viễn thông mạng Internet.",
      "Kiểm tra và khắc phục sự cố hệ thống.",
      "Thiết kế hệ thống viễn thông, triển khai và giám sát thi công hạ tầng viễn thông.",
      "Thấu cảm, tạo ra những tương tác, trải nghiệm cá nhân hóa tới người dùng/khách hàng trên các kênh online/offline.",
      "Các công việc khác theo sự phân công của Quản lý trực tiếp.",
    ],
    requirements: [
      "Tốt nghiệp Cao đẳng trở lên chuyên ngành Điện tử Viễn thông, Điện lực, Công nghệ thông tin, Điện tử - Điện lạnh hoặc các chuyên ngành liên quan về điện.",
      "Nam, có sức khỏe tốt, tuổi từ 21 - 35.",
      "Có kiến thức về hạ tầng viễn thông.",
      "Ưu tiên ứng viên có kinh nghiệm ở các công ty viễn thông từ 1 - 2 năm.",
      "Chăm chỉ, có tinh thần trách nhiệm, làm việc được với công việc áp lực cao.",
      "Nhanh nhẹn, cầu thị với công việc, tinh thần làm việc nhóm tốt.",
      "Có tư duy Khách hàng là trọng tâm.",
    ],
    benefits: [...commonBenefits, "Chế độ bảo hiểm sức khỏe và tai nạn lao động theo chính sách riêng của đơn vị."],
    tags: ["bảo trì hạ tầng", "Kỹ thuật hạ tầng", "viễn thông"],
    workplace:
      job.location === "Tiền Giang"
        ? "405 Tổ 6, Khu 3, xã Cái Bè, tỉnh Đồng Tháp; 91 Võ Thanh Tâm, phường Cai Lậy, tỉnh Đồng Tháp"
        : job.location === "Hồ Chí Minh"
          ? "FPT Tân Thuận, KCX Tân Thuận, Quận 7, TP. Hồ Chí Minh"
          : "FPT Tower, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
    branchName: job.location === "Tiền Giang" ? "Chi nhánh Tiền Giang" : `FPT Telecom ${job.location}`,
    branchIntro: [
      "FPT Telecom là một trong những nhà cung cấp dịch vụ viễn thông lớn tại Việt Nam, hiện diện tại nhiều tỉnh thành với quy mô nhân sự lớn.",
      "Tại mỗi chi nhánh, cá nhân được khuyến khích phát huy sở trường, học hỏi liên tục và đóng góp vào chất lượng dịch vụ khách hàng.",
      "Mỗi đóng góp của bạn với tổ chức sẽ luôn được ghi nhận và đền đáp lại một cách xứng đáng.",
    ],
    contactName: job.location === "Tiền Giang" ? "Trần Thị Kiều Như" : "Trung tâm Thu hút Nguồn nhân lực",
    contactEmail: job.location === "Tiền Giang" ? "nhuttk@fpt.com" : "phuongtm3@fpt.com / nhanctt3@fpt.com",
    contactPhone: job.location === "Tiền Giang" ? "0378906330" : "0904 678 040 / 0986 656 620",
    landline: "0904 678 040 / 0986 656 620",
  };
}

function getJobDetailItems(value: string[] | undefined, fallback: string[]) {
  const items = value?.map((item) => item.trim()).filter(Boolean) ?? [];

  return items.length ? items : fallback;
}

export function getEffectiveJobDetailCopy(job: Job) {
  const fallback = getJobDetailCopy(job);

  return {
    ...fallback,
    benefits: getJobDetailItems(job.benefits, fallback.benefits),
    branchIntro: getJobDetailItems(job.branchIntro, fallback.branchIntro),
    branchName: job.branchName?.trim() || fallback.branchName,
    contactEmail: job.contactEmail?.trim() || fallback.contactEmail,
    contactName: job.contactName?.trim() || fallback.contactName,
    contactPhone: job.contactPhone?.trim() || fallback.contactPhone,
    landline: job.landline?.trim() || fallback.landline,
    quantity: job.quantity?.trim() || fallback.quantity,
    requirements: getJobDetailItems(job.requirements, fallback.requirements),
    responsibilities: getJobDetailItems(job.responsibilities, fallback.responsibilities),
    tags: getJobDetailItems(job.tags, fallback.tags),
    unit: job.unit?.trim() || fallback.unit,
    workplace: job.workplace?.trim() || fallback.workplace,
  };
}

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="fpt-detail-list">
      {items.map((item) => (
        <li key={item}>
          <CheckCircle2 aria-hidden="true" size={17} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DetailBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="fpt-job-copy-block">
      <h3>{title}</h3>
      <DetailList items={items} />
    </section>
  );
}

function JobInfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="fpt-job-info-item">
      {icon}
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

function JobDetailHero({ job }: { job: Job }) {
  return (
    <section className="fpt-job-detail-hero">
      <div className="fpt-container">
        <div className="fpt-job-detail-banner">
          <Image src={assets.detailBanner} alt="" fill priority sizes="min(1326px, 92vw)" />
          <div>
            <p className="fpt-job-breadcrumb">
              <Link href="/">FPT Jobs</Link>
              <span>/</span>
              <Link href="/tuyen-dung">Việc làm HOT</Link>
            </p>
            <h1>{job.title}</h1>
          </div>
        </div>
        <div className="fpt-job-titlebar">
          <div>
            <h2>{job.title.toUpperCase()}</h2>
            <p>
              <BriefcaseBusiness aria-hidden="true" size={15} />
              {getJobEmploymentLabel(job)}
              <MapPin aria-hidden="true" size={15} />
              {job.location}
            </p>
          </div>
          <FptJobQuickApplyButton jobTitle={job.title} jobSlug={getJobSlug(job)} location={job.location} />
        </div>
      </div>
    </section>
  );
}

function JobDetailContent({ job }: { job: Job }) {
  const copy = getEffectiveJobDetailCopy(job);
  const relatedJobs = recruitmentJobs.filter((item) => item.title !== job.title).slice(0, 5);

  return (
    <section className="fpt-job-detail-section">
      <div className="fpt-job-detail-layout">
        <article className="fpt-job-detail-card">
          <h2>Thông tin công việc</h2>
          <div className="fpt-job-info-grid">
            <JobInfoItem icon={<Building2 aria-hidden="true" size={20} />} label="Đơn vị" value={copy.unit} />
            <JobInfoItem icon={<Users aria-hidden="true" size={20} />} label="Số lượng tuyển" value={copy.quantity} />
            <JobInfoItem icon={<BriefcaseBusiness aria-hidden="true" size={20} />} label="Mức lương" value={job.salary} />
            <JobInfoItem icon={<Clock3 aria-hidden="true" size={20} />} label="Loại hình" value={getJobEmploymentLabel(job)} />
            <JobInfoItem icon={<MapPin aria-hidden="true" size={20} />} label="Địa điểm" value={job.location} />
            <JobInfoItem icon={<Clock3 aria-hidden="true" size={20} />} label="Hạn nộp CV" value={job.deadline} />
          </div>

          <DetailBlock title="CHI TIẾT CÔNG VIỆC" items={copy.responsibilities} />
          <DetailBlock title="YÊU CẦU CÔNG VIỆC" items={copy.requirements} />
          <DetailBlock title="QUYỀN LỢI" items={copy.benefits} />

          <section className="fpt-job-copy-block">
            <h3>THÔNG TIN THAM KHẢO</h3>
            <p>
              Ghi chú: FPT Telecom không thu bất kỳ chi phí nào của Ứng viên, Sinh viên trong quá trình tuyển dụng,
              thực tập.
            </p>
            <div className="fpt-reference-links">
              <Link href="/">Tìm hiểu về FPT Telecom tại đây</Link>
              <Link href="/#quy-trinh-tuyen-dung">Quy trình tuyển dụng tại FPT Telecom tại đây</Link>
            </div>
          </section>

          <section className="fpt-job-copy-block fpt-job-contact-detail">
            <h3>Thông tin liên hệ:</h3>
            <div className="fpt-job-info-grid">
              <JobInfoItem icon={<Users aria-hidden="true" size={20} />} label="Người phụ trách" value={copy.contactName} />
              <JobInfoItem icon={<Mail aria-hidden="true" size={20} />} label="Email" value={copy.contactEmail} />
              <JobInfoItem icon={<Phone aria-hidden="true" size={20} />} label="SĐT di động" value={copy.contactPhone} />
              <JobInfoItem icon={<Phone aria-hidden="true" size={20} />} label="SĐT cố định" value={copy.landline} />
            </div>
          </section>
        </article>

        <aside className="fpt-job-detail-sidebar">
          <div className="fpt-job-summary">
            <span>Ứng tuyển ngay</span>
            <h3>{job.title}</h3>
            <p>{job.location} · {job.deadline}</p>
            <FptJobQuickApplyButton jobTitle={job.title} jobSlug={getJobSlug(job)} location={job.location} variant="summary" />
          </div>

          <div className="fpt-job-side-card">
            <h3>Job Tags</h3>
            <div className="fpt-job-tags">
              {copy.tags.map((tag) => (
                <Link href={`/tuyen-dung?tukhoa=${encodeURIComponent(tag)}`} key={tag}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <div className="fpt-job-side-card">
            <h3>Chia sẻ</h3>
            <div className="fpt-share-row">
              <Share2 aria-hidden="true" size={18} />
              <span>Facebook</span>
              <span>LinkedIn</span>
            </div>
          </div>

          <div className="fpt-job-side-card">
            <h3>Nơi làm việc</h3>
            <p>{copy.workplace}</p>
          </div>

          <div className="fpt-job-side-card">
            <h3>{copy.branchName}</h3>
            {copy.branchIntro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="fpt-job-side-card">
            <h3>Công việc liên quan</h3>
            <div className="fpt-related-jobs">
              {relatedJobs.map((item) => (
                <Link href={toLocalHref(item.href)} key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.location}</span>
                  <small>{item.salary}</small>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function DetailHotJobs({ currentJob }: { currentJob: Job }) {
  const visibleJobs = recruitmentJobs.filter((job) => job.title !== currentJob.title).slice(0, 8);

  return (
    <section className="fpt-section fpt-detail-hot-jobs">
      <div className="fpt-detail-heading-row">
        <h2>Việc làm Hot</h2>
        <Link href="/tuyen-dung">Xem thêm</Link>
      </div>
      <div className="fpt-job-grid">
        {visibleJobs.map((job) => (
          <Link className="fpt-job-card" href={toLocalHref(job.href)} key={job.title}>
            {job.hot ? (
              <span className="fpt-hot" aria-label="hot job">
                <Zap aria-hidden="true" size={15} />
              </span>
            ) : null}
            <h3>{job.title}</h3>
            <div className="fpt-job-meta">
              <span>
                <BriefcaseBusiness aria-hidden="true" size={12} />
                Toàn thời gian
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
    </section>
  );
}

export function FptJobsJobDetailPage({ job }: { job: Job }) {
  return (
    <div className="fpt-page fpt-job-detail-page" id="top">
      <FptHeader />
      <main>
        <JobDetailHero job={job} />
        <JobDetailContent job={job} />
        <DetailHotJobs currentJob={job} />
        <RecruitmentNotice />
        <ContactSection />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}

export function FptJobsCareersPage() {
  return (
    <div className="fpt-page fpt-careers-page" id="top">
      <FptHeader />
      <main>
        <Suspense fallback={null}>
          <FptRecruitmentClient
            jobs={recruitmentJobs}
            careerCategories={careerCategoryOptions}
            regions={regionOptions}
            popularTags={popularTags}
            assets={{
              hiringFox: assets.hiringFox,
              listIcon: assets.listIcon,
              gridIcon: assets.gridIcon,
            }}
          />
        </Suspense>
        <RecruitmentNotice />
        <ContactSection />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}

export function FptJobsHome() {
  return (
    <div className="fpt-page" id="top">
      <FptHeader />
      <main>
        <Hero />
        <JobsSection />
        <BenefitsSection />
        <AboutSection />
        <MetricsSection />
        <ProcessSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
