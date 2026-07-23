import type { IaaArticle, IaaPost, IaaRelatedPost, NavItem } from "@/types/iaa";

export const navItems: NavItem[] = [
  {
    label: "Nhà & Nội Thất",
    href: "/chuyen-muc/nha-noi-that/",
    children: [
      { label: "Thiết kế", href: "/chuyen-muc/thiet-ke/" },
      { label: "Trang trí", href: "/chuyen-muc/trang-tri/" },
      { label: "Vật liệu", href: "/chuyen-muc/vat-lieu/" },
      {
        label: "Review sản phẩm",
        href: "/chuyen-muc/review-san-pham/",
      },
    ],
  },
  {
    label: "Đời Sống",
    href: "/chuyen-muc/doi-song/",
    children: [
      { label: "Mẹo hay", href: "/chuyen-muc/meo-hay/" },
      { label: "Gia đình", href: "/chuyen-muc/gia-dinh/" },
      {
        label: "Không gian sống",
        href: "/chuyen-muc/khong-gian-song/",
      },
      { label: "Tiêu dùng", href: "/chuyen-muc/tieu-dung/" },
    ],
  },
  {
    label: "Giáo Dục",
    href: "/chuyen-muc/giao-duc/",
    children: [
      { label: "Kỹ năng", href: "/chuyen-muc/ky-nang/" },
      { label: "Học tập", href: "/chuyen-muc/hoc-tap/" },
      {
        label: "Công nghệ giáo dục",
        href: "/chuyen-muc/cong-nghe-giao-duc/",
      },
    ],
  },
  {
    label: "Sức Khỏe",
    href: "/chuyen-muc/suc-khoe/",
    children: [
      {
        label: "Dinh dưỡng",
        href: "/chuyen-muc/dinh-duong/",
      },
      { label: "Làm đẹp", href: "/chuyen-muc/lam-dep/" },
      {
        label: "Chăm sóc sức khỏe",
        href: "/chuyen-muc/cham-soc-suc-khoe/",
      },
    ],
  },
  {
    label: "Công Nghệ",
    href: "/chuyen-muc/cong-nghe/",
    children: [
      { label: "AI", href: "/chuyen-muc/ai/" },
      {
        label: "Điện thoại",
        href: "/chuyen-muc/dien-thoai/",
      },
      { label: "Laptop", href: "/chuyen-muc/laptop/" },
      { label: "Phần mềm", href: "/chuyen-muc/phan-mem/" },
    ],
  },
  {
    label: "Tài Chính",
    href: "/chuyen-muc/tai-chinh/",
    children: [
      { label: "Mua sắm", href: "/chuyen-muc/mua-sam/" },
      {
        label: "Tiết kiệm",
        href: "/chuyen-muc/tiet-kiem/",
      },
      {
        label: "Kinh doanh",
        href: "/chuyen-muc/kinh-doanh/",
      },
    ],
  },
  {
    label: "Xe Cộ",
    href: "/chuyen-muc/xe-co/",
    children: [
      { label: "Ô tô", href: "/chuyen-muc/o-to/" },
      { label: "Xe máy", href: "/chuyen-muc/xe-may/" },
      { label: "Phụ kiện", href: "/chuyen-muc/phu-kien/" },
    ],
  },
  {
    label: "Du Lịch",
    href: "/chuyen-muc/du-lich/",
    children: [
      { label: "Địa điểm", href: "/chuyen-muc/dia-diem/" },
      { label: "Resort", href: "/chuyen-muc/resort/" },
      { label: "Khách sạn", href: "/chuyen-muc/khach-san/" },
      {
        label: "Kinh nghiệm",
        href: "/chuyen-muc/kinh-nghiem/",
      },
    ],
  },
  {
    label: "Ẩm Thực",
    href: "/chuyen-muc/am-thuc/",
    children: [
      {
        label: "Review quán ăn",
        href: "/chuyen-muc/review-quan-an/",
      },
      { label: "Công thức", href: "/chuyen-muc/cong-thuc/" },
      { label: "Đặc sản", href: "/chuyen-muc/dac-san/" },
    ],
  },
  {
    label: "Review",
    href: "/chuyen-muc/review/",
    children: [
      {
        label: "Thương hiệu",
        href: "/chuyen-muc/thuong-hieu/",
      },
      { label: "Sản phẩm", href: "/chuyen-muc/san-pham/" },
      { label: "Dịch vụ", href: "/chuyen-muc/dich-vu/" },
      { label: "So sánh", href: "/chuyen-muc/so-sanh/" },
    ],
  },
  { label: "Liên Hệ", href: "/lien-he/" },
];

export const articleNavItems: NavItem[] = [
  { label: "Công Nghệ", href: "/chuyen-muc/cong-nghe/" },
  { label: "Xây Dựng", href: "/chuyen-muc/xay-dung/" },
  { label: "Sức Khoẻ", href: "/chuyen-muc/suc-khoe/" },
  { label: "Ẩm Thực", href: "/chuyen-muc/am-thuc/" },
  { label: "English", href: "/chuyen-muc/english/" },
  { label: "Liên Hệ", href: "/lien-he/" },
];

const chiliArticlePath = "/ot-chia-voi-quang-tri-thu-gia-vi-lam-nao-long-nguoi-di-xa/";

export const heroLeadPost: IaaPost = {
  title: "Ớt Chìa Vôi Quảng Trị – Thứ gia vị làm nao lòng người đi xa",
  href: chiliArticlePath,
  image: "/images/iaa/ot-chia-voi-quan-tri.jpg",
  alt: "",
  excerpt:
    "(DLQT) – Ớt đối với người dân miền Trung nói chung và người Quảng Trị nói riêng là một gia vị hết sức quen thuộc, xuất hiện hằng ngày...",
};

export const heroMiniPosts: IaaPost[] = [
  {
    title: "Top 9 cửa hàng thu mua Laptop cũ giá cao, uy tín tại TPHCM",
    href: "/thu-mua-laptop-cu-gia-cao-tphcm/",
    image: "/images/iaa/2ndland-600x400.jpg",
    alt: "2ndland",
  },
  {
    title: "Top 8 cửa hàng bán Macbook cũ uy tín, giá rẻ tại TPHCM",
    href: "/shop-ban-macbook-cu-uy-tin-tphcm/",
    image: "/images/iaa/shop-ban-macbook-cu-uy-tin-4-600x400.jpg",
    alt: "FPT Shop",
  },
  {
    title: "Top 10 cửa hàng thu mua Macbook cũ giá cao tại TPHCM",
    href: "/thu-mua-macbook-cu-gia-cao-tphcm/",
    image: "/images/iaa/thu-mua-macbook-cu-gia-cao-1-600x400.jpg",
    alt: "thu mua Macbook cũ giá cao",
  },
];

export const heroSidePost: IaaPost = {
  title: "Hướng dẫn xử lý lỗi Reset Counter trên iPhone cực đơn giản",
  href: "/loi-reset-counter-tren-iphone/",
  image: "/images/iaa/loi-reset-counter-tren-iphone-1-600x400.jpg",
  alt: "lỗi Reset Counter trên iPhone",
};

export const reviewPosts: IaaPost[] = [
  {
    title: "Top 3 cửa hàng sửa điện thoại iPhone uy tín tại Bình Tân",
    href: "/top-3-cua-hang-sua-iphone-uy-tin-tai-binh-tan/",
    image: "/images/iaa/Trung-Tam-Huy-Dung-Mobile-711x400.jpg",
    alt: "",
    excerpt:
      "Điện thoại iPhone của bạn bị hư hỏng và bạn không biết cửa hàng sửa...",
  },
  {
    title: "Top 9 cửa hàng thu mua Laptop cũ giá cao, uy tín tại TPHCM",
    href: "/thu-mua-laptop-cu-gia-cao-tphcm/",
    image: "/images/iaa/huy-dung-mobile-e1697060493856-665x400.jpeg",
    alt: "",
    excerpt: "Bạn đang cần tìm địa chỉ mua lại Laptop cũ, đâu là cửa hàng thu...",
  },
  {
    title: "Top 10 trung tâm sửa iPhone uy tín giá rẻ tại TP.HCM",
    href: "/top-10-cua-hang-sua-iphone-uy-tin-gia-re-tai-tp-hcm/",
    image: "/images/iaa/dien-thoai-vui-600x400.jpg",
    alt: "",
    excerpt: "iPhone của bạn bị lỗi không sử dụng được và bạn không biết cửa hàng...",
  },
  {
    title: "Top 10 địa chỉ cửa hàng sửa iPad Uy tín giá rẻ tại TPHCM",
    href: "/top-10-dia-chi-sua-ipad-uy-tin-gia-re-tai-tphcm/",
    image: "/images/iaa/sua-ipad--601x400.jpeg",
    alt: "",
    excerpt: "iPad của bạn bị lỗi và bạn không biết cửa hàng sửa chữa iPad ở...",
  },
];

export const technologyPosts: IaaPost[] = [
  {
    title: "12 bước kiểm tra Macbook khi mua cũ để tránh rủi ro",
    href: "/kiem-tra-macbook-khi-mua-cu/",
    image: "/images/iaa/kiem-tra-macbook-khi-mua-cu-1-600x400.jpg",
    alt: "kiểm tra Macbook khi mua cũ",
    date: { day: "30", month: "Th5" },
    excerpt:
      "Kiểm tra MacBook khi mua cũ không dừng lại ở việc soi những vết trầy...",
  },
  {
    title: "Cách kiểm tra Macbook Bypass (iCloud ẩn) khi mua Macbook Cũ",
    href: "/cach-kiem-tra-macbook-bypass/",
    image: "/images/iaa/cach-kiem-tra-macbook-bypass-1-600x400.jpg",
    alt: "cách kiểm tra Macbook Bypass",
    date: { day: "28", month: "Th5" },
    excerpt:
      "Nắm rõ cách kiểm tra MacBook Bypass khi tìm mua MacBook cũ sẽ đảm bảo...",
  },
  {
    title: "Các trung tâm bảo hành Apple chính hãng uỷ quyền tại TPHCM",
    href: "/danh-sach-cac-trung-tam-bao-hanh-apple-tai-tphcm/",
    image: "/images/iaa/apple-care-store-603x400.webp",
    alt: "",
    date: { day: "13", month: "Th4" },
    excerpt:
      "Nếu bạn đang sử dụng các sản phẩm của Apple như iPhone, iPad, MacBook và...",
  },
  {
    title: "iPhone Bị Đơ Màn Hình Cảm Ứng: Nguyên Nhân và Cách Khắc Phục",
    href: "/iphone-bi-do-man-hinh-cam-ung-nguyen-nhan-va-cach-khac-phuc/",
    image: "/images/iaa/iphone-do-cam-ung-600x400.jpg",
    alt: "",
    date: { day: "06", month: "Th4" },
    excerpt:
      "iPhone bị đơ màn hình cảm ứng là lỗi xảy ra khiến cho iPhone của...",
  },
  {
    title: "Nguyên nhân và cách sửa iPhone bị mất tiếng loa ngoài",
    href: "/nguyen-nhan-va-cach-sua-iphone-bi-mat-tieng-loa-ngoai/",
    image: "/images/iaa/iPhone-bi-mat-tieng-600x400.jpg",
    alt: "",
    date: { day: "11", month: "Th2" },
    excerpt:
      "Khi bạn đang tận hưởng một bản nhạc yêu thích hoặc đang tham gia cuộc...",
  },
  {
    title: "Cách Xử Lý iPhone Bị Dính Nước Vào Màn Hình",
    href: "/cach-xu-ly-iphone-bi-dinh-nuoc-vao-man-hinh/",
    image: "/images/iaa/nuoc-do-len-man-hinh-iphone-600x400.jpg",
    alt: "",
    date: { day: "11", month: "Th2" },
    excerpt:
      "Khi một chiếc iPhone không may bị dính nước vào màn hình, nó có thể...",
  },
];

export const categoryTechnologyPosts: IaaPost[] = [
  {
    title: "Top 3 cửa hàng sửa điện thoại iPhone uy tín tại Bình Tân",
    href: "/top-3-cua-hang-sua-iphone-uy-tin-tai-binh-tan/",
    image: "/images/iaa/Trung-Tam-Huy-Dung-Mobile-711x400.jpg",
    alt: "",
    date: { day: "15", month: "Th3" },
    excerpt: "Điện thoại iPhone của bạn bị hư hỏng và bạn không biết cửa hàng sửa...",
  },
  {
    title: "Xử lý dứt điểm iPhone báo cuộc gọi bị hủy liên tục",
    href: "/iphone-bao-cuoc-goi-bi-huy/",
    image: "/images/iaa/iphone-bao-cuoc-goi-bi-huy-1-600x400.jpg",
    alt: "iPhone báo cuộc gọi bị hủy",
    date: { day: "23", month: "Th1" },
    excerpt: "Tại sao iPhone báo cuộc gọi bị hủy liên tục dù cột sóng vẫn đang...",
  },
  {
    title: "iPhone bị nứt mặt kính có ảnh hưởng đến cảm ứng không?",
    href: "/iphone-bi-nut-mat-kinh/",
    image: "/images/iaa/iphone-bi-nut-mat-kinh-1-600x400.jpg",
    alt: "iPhone bị nứt mặt kính",
    date: { day: "22", month: "Th1" },
    excerpt: "Bạn đang lo lắng khi iPhone bị nứt mặt kính sau một cú va đập...",
  },
  {
    title: "iPhone không nghe được loa trong: Nguyên nhân và cách xử lý",
    href: "/iphone-khong-nghe-duoc-loa-trong/",
    image: "/images/iaa/iphone-khong-nghe-duoc-loa-trong-1-600x400.jpg",
    alt: "iPhone không nghe được loa trong",
    date: { day: "13", month: "Th1" },
    excerpt: "Tại sao chiếc iPhone không nghe được loa trong dù bạn đã tăng tối đa...",
  },
  {
    title: "Hướng dẫn xử lý lỗi Reset Counter trên iPhone cực đơn giản",
    href: "/loi-reset-counter-tren-iphone/",
    image: "/images/iaa/loi-reset-counter-tren-iphone-1-600x400.jpg",
    alt: "lỗi Reset Counter trên iPhone",
    date: { day: "12", month: "Th1" },
    excerpt: "Đang trận game căng thẳng hay cuộc họp quan trọng mà máy bỗng tắt lịm...",
  },
  {
    title: "Lỗi iPhone 7 mất vi trình modem gây mất sóng xử lý thế nào?",
    href: "/iphone-7-mat-vi-trinh-modem/",
    image: "/images/iaa/iphone-7-mat-vi-trinh-modem-1-600x400.jpg",
    alt: "iPhone 7 mất vi trình modem",
    date: { day: "11", month: "Th1" },
    excerpt: "iPhone 7 mất vi trình modem khiến điện thoại của bạn bỗng chốc trở thành...",
  },
  {
    title: "Lỗi iPhone bị sọc tai thỏ có cần thay màn hình không?",
    href: "/iphone-bi-soc-tai-tho/",
    image: "/images/iaa/iphone-bi-soc-tai-tho-1-600x400.jpg",
    alt: "iPhone bị sọc tai thỏ",
    date: { day: "11", month: "Th1" },
    excerpt: "Hiện tượng iPhone bị sọc tai thỏ là một trong những sự cố hiển thị...",
  },
  {
    title: "Nguyên nhân iPhone khởi động lại liên tục và cách khắc phục",
    href: "/iphone-khoi-dong-lai-lien-tuc/",
    image: "/images/iaa/iphone-khoi-dong-lai-lien-tuc-1-600x400.jpg",
    alt: "iPhone khởi động lại liên tục",
    date: { day: "07", month: "Th1" },
    excerpt: "iPhone khởi động lại liên tục là lỗi khiến nhiều người dùng lo lắng vì...",
  },
  {
    title: "Sửa iPhone bị đen màn hình mà vẫn có tiếng như thế nào?",
    href: "/iphone-bi-den-man-hinh-ma-van-co-tieng/",
    image: "/images/iaa/iphone-bi-den-man-hinh-ma-van-co-tieng-1-600x400.jpg",
    alt: "iPhone bị đen màn hình mà vẫn có tiếng",
    date: { day: "07", month: "Th1" },
    excerpt: "Bạn đang gặp tình trạng iPhone bị đen màn hình mà vẫn có tiếng du...",
  },
  {
    title: "Sửa lỗi camera iPhone bị mờ không lấy nét được cực nhanh",
    href: "/camera-iphone-bi-mo-khong-lay-net-duoc/",
    image: "/images/iaa/camera-iphone-bi-mo-khong-lay-net-duoc-1-600x400.jpg",
    alt: "Camera iPhone bị mờ không lấy nét được",
    date: { day: "03", month: "Th1" },
    excerpt: "Camera iPhone bị mờ không lấy nét được là lỗi khiến nhiều người dùng tụt...",
  },
];

export const chiliArticle: IaaArticle = {
  slug: "ot-chia-voi-quang-tri-thu-gia-vi-lam-nao-long-nguoi-di-xa",
  title: "Ớt Chìa Vôi Quảng Trị – Thứ gia vị làm nao lòng người đi xa",
  description:
    "(DLQT) - Ớt đối với người dân miền Trung nói chung và người Quảng Trị nói riêng là một gia vị hết sức quen thuộc, xuất hiện hằng ngày trong từng bữa cơm của",
  href: "/ot-chia-voi-quang-tri-thu-gia-vi-lam-nao-long-nguoi-di-xa/",
  category: {
    label: "Ẩm Thực",
    href: "/chuyen-muc/am-thuc/",
  },
  publishedLabel: "Tháng 4 22, 2026",
  publishedDateTime: "2026-04-22T23:57:14+07:00",
  updatedLabel: "Tháng 5 15, 2026",
  updatedDateTime: "2026-05-15T09:28:46+07:00",
  author: {
    name: "kaireview",
    href: "/author/tiengdung00/",
    avatar: "/images/kai-favicon.svg",
  },
  tag: {
    label: "Sate",
    href: "/tag/sate/",
  },
  previousPost: {
    title: "Top 3 cửa hàng sửa điện thoại iPhone uy tín tại Bình Tân",
    href: "/top-3-cua-hang-sua-iphone-uy-tin-tai-binh-tan/",
  },
  figures: {
    redChili: {
      src: "/images/iaa/Ot-chia-voi.jpg",
      alt: "Ớt chìa vôi",
      width: 500,
      height: 597,
      maxWidth: 500,
      caption: "Hình ảnh ớt chìa vôi (đặc sản Quảng Trị)",
    },
    harvest: {
      src: "/images/iaa/san-xuat-ot-quan-tri.jpg",
      alt: "Nông dân thu hoạch ớt",
      width: 500,
      height: 375,
      maxWidth: 500,
    },
    workers: {
      src: "/images/iaa/ot-chia-voi-quan-tri.jpg",
      alt: "Nông dân làm ớt",
      width: 512,
      height: 318,
      maxWidth: 512,
    },
    greenChili: {
      src: "/images/iaa/Ot-Chia-Voi-Chua-Chin-1.jpg",
      alt: "Hình ảnh ớt chìa vôi chưa chín",
      width: 500,
      height: 375,
      maxWidth: 500,
      caption: "Hình ảnh ớt chìa vôi chưa chín",
    },
    chiliSatay: {
      src: "/images/iaa/bao-quan-sa-te.jpg",
      alt: "Sate ớt chìa vôi quảng trị",
      width: 512,
      height: 341,
      maxWidth: 512,
      caption: "Sa tế ở Fovi – Một sản phẩm Sate từ ớt chìa vôi Quảng Trị",
    },
  },
};

export const articleDetailsBySlug: Record<string, IaaArticle> = {
  [chiliArticle.slug]: chiliArticle,
};

export const foodRelatedPosts: IaaRelatedPost[] = [
  {
    title: "Ớt Chìa Vôi Quảng Trị – Thứ gia vị làm nao lòng người đi xa",
    href: chiliArticlePath,
    image: "/images/iaa/ot-chia-voi-quan-tri.jpg",
    alt: "ớt chìa vôi",
    age: "2 tháng trước",
  },
  {
    title: "Hướng dẫn cách làm sa tế ớt thơm ngon tại nhà",
    href: "/huong-dan-lam-sa-te-ot-thom-ngon-tai-nha/",
    image: "/images/iaa/nau-sa-te-600x400.jpg",
    alt: "",
    age: "8 tháng trước",
  },
  {
    title: "Tinh Bột Có Mấy Loại? Loại Nào Tốt Và Loại Nào Nên Hạn Chế?",
    href: "/tinh-bot-loai-nao-tot/",
    image: "/images/iaa/bot-my-1-710x400.jpg",
    alt: "",
    age: "8 tháng trước",
  },
  {
    title: "Top 5 thương hiệu Sa Tế ớt siêu cay nổi tiếng tại hiện nay",
    href: "/top-thuong-hieu-sate-ot-sieu-cay-noi-tieng-hien-nay/",
    image: "/images/iaa/Sa-Te-Ot-Mae-Pranom-Thai-Lan-588x400.jpg",
    alt: "",
    age: "9 tháng trước",
  },
  {
    title: "Top 8 Thương hiệu Sate ớt Ngon Nhất Hiện Nay",
    href: "/sate-ngon-nhat-hien-nay/",
    image: "/images/iaa/sate-ngon-nhat-hien-nay-avt-600x400.jpg",
    alt: "",
    age: "10 tháng trước",
  },
];
