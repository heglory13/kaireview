import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const databasePath = path.join(dataDir, "iaa.sqlite");
const snapshotPath = path.join(rootDir, "src/lib/iaa-db.snapshot.ts");
const siteAuthorAvatar = "/images/kai-favicon.svg";

function readGeneratedArray(relativePath, exportName) {
  const source = readFileSync(path.join(rootDir, relativePath), "utf8");
  const marker = `export const ${exportName} = `;
  const start = source.indexOf(marker);

  if (start === -1) {
    throw new Error(`Cannot find ${exportName} in ${relativePath}`);
  }

  const afterMarker = source.slice(start + marker.length);
  const end = afterMarker.indexOf(" satisfies ");

  if (end === -1) {
    throw new Error(`Cannot find end of ${exportName} in ${relativePath}`);
  }

  return JSON.parse(afterMarker.slice(0, end));
}

function slugFromHref(href) {
  return href.replace(/\?.*$/, "").replace(/^\/+|\/+$/g, "");
}

function normalizeSearchText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function firstImageFromHtml(value = "") {
  return value.match(/<img[^>]+src="([^"]+)"/)?.[1];
}

function textExcerpt(value) {
  const clean = stripHtml(value);

  if (clean.length <= 150) {
    return clean;
  }

  return `${clean.slice(0, 147).trim()}...`;
}

function createSearchEntries(articles, archives) {
  const entries = new Map();

  for (const archive of archives) {
    for (const post of archive.posts) {
      const existing = entries.get(post.href);
      const text = `${post.title} ${post.excerpt ?? ""} ${archive.label}`;

      entries.set(post.href, {
        post: existing?.post ?? post,
        text: `${existing?.text ?? ""} ${text}`,
      });
    }
  }

  for (const article of articles) {
    const existing = entries.get(article.href);
    const body = stripHtml(article.contentHtml ?? "");
    const text = `${article.title} ${article.description} ${article.category.label} ${body}`;

    entries.set(article.href, {
      post:
        existing?.post ??
        {
          title: article.title,
          href: article.href,
          image:
            firstImageFromHtml(article.contentHtml) ??
            article.relatedPosts?.[0]?.image ??
            "/images/iaa/iaa-logo-1-1-968x800.png",
          alt: article.title,
          excerpt: article.description || textExcerpt(article.contentHtml ?? ""),
        },
      text: `${existing?.text ?? ""} ${text}`,
    });
  }

  return [...entries.values()];
}

function buildStaticPolicyArticles() {
  return [
    {
      slug: "dieu-khoan-dich-vu",
      title: "Điều Khoản Sử Dụng Dịch Vụ",
      description:
        "Điều khoản sử dụng dịch vụ áp dụng cho người dùng khi truy cập và sử dụng hệ thống kaireview.",
      href: "/dieu-khoan-dich-vu/",
      category: {
        label: "Chính sách",
        href: "/",
      },
      publishedLabel: "Tháng 08 01, 2026",
      publishedDateTime: "2026-08-01T00:00:00+07:00",
      updatedLabel: "Tháng 08 01, 2026",
      updatedDateTime: "2026-08-01T00:00:00+07:00",
      author: {
        name: "kaireview",
        href: "/author/tiengdung00/",
        avatar: siteAuthorAvatar,
      },
      contentHtml: `<div id="ftwp-postcontent">
<p>Khi truy cập vào các trang web hoặc ứng dụng kaireview (&ldquo;Kaireview&rdquo;), người dùng đồng ý các điều khoản sau:</p>
<h2>1. Chính sách bảo mật</h2>
<p>Chính sách bảo mật này giải thích cách chúng tôi sử dụng và bảo mật dữ liệu cá nhân với các dịch vụ được cung cấp trên kaireview. Dữ liệu cá nhân là thông tin dưới dạng ký hiệu, chữ viết, chữ số, hình ảnh, âm thanh hoặc tương tự trên môi trường điện tử gắn liền với một con người cụ thể hoặc giúp xác định một con người cụ thể.</p>
<h3>1.1. Thu thập dữ liệu</h3>
<p>Dữ liệu cá nhân được thu thập là những thông tin bạn đã công khai hoặc chủ động cung cấp cho chúng tôi.</p>
<p>Việc thu thập dữ liệu đảm bảo tuân thủ quy định của pháp luật hiện hành.</p>
<h3>1.2. Sử dụng dữ liệu</h3>
<p>Chúng tôi có thể sử dụng dữ liệu được phép thu thập với mục đích tối ưu hóa trải nghiệm người dùng, phân phối quảng cáo hiển thị và hỗ trợ cung cấp thông tin liên quan đến nội dung, dịch vụ trên hệ thống.</p>
<h3>1.3. Bảo mật dữ liệu</h3>
<p>Mọi thông tin cá nhân được thu thập sẽ được bảo mật bằng các biện pháp cần thiết và sẽ không được cung cấp cho bất kỳ bên thứ ba nào, ngoại trừ các trường hợp theo quy định của pháp luật.</p>
<h3>1.4. Cập nhật/sửa chữa và xóa dữ liệu</h3>
<p>Bạn có quyền cập nhật, sửa chữa và xóa dữ liệu cá nhân của bạn theo quy định áp dụng.</p>
<p>Vui lòng xem chi tiết Chính sách bảo mật của chúng tôi tại đây.</p>
<h2>2. Bản quyền và thương hiệu</h2>
<p>Mọi hành vi sao chép, phân phối, xuất bản... bất kỳ nội dung, hình ảnh nào thuộc kaireview vì mục đích thương mại dưới mọi hình thức cần phải thông báo trước với chúng tôi.</p>
<h2>3. Miễn trừ trách nhiệm</h2>
<p>Các trang web, ứng dụng của kaireview có thể liên kết tới nhiều website khác. Chúng tôi không chịu trách nhiệm về nội dung thông tin cũng như mọi vấn đề xảy ra liên quan đến việc sử dụng các địa chỉ liên kết này.</p>
<p>Người dùng có thể thấy tài liệu quảng cáo của bên thứ ba trên kaireview. Mỗi nhà quảng cáo tự chịu trách nhiệm về nội dung tài liệu quảng cáo của mình. Chúng tôi không chịu trách nhiệm về nội dung của tài liệu quảng cáo, bao gồm nhưng không giới hạn ở bất kỳ lỗi, thiếu sót nào.</p>
<h2>4. Nội dung người dùng cung cấp</h2>
<p>Khi bạn gửi bài viết, bình luận hoặc bất kỳ nội dung nào cho chúng tôi đồng nghĩa bạn cho phép chúng tôi sử dụng chúng vô điều kiện, miễn phí bản quyền, có thể chuyển nhượng hoàn toàn, vĩnh viễn trên toàn thế giới để sử dụng, xuất bản và/hoặc truyền tải; đồng thời cho phép các bên thứ ba sử dụng, xuất bản và/hoặc truyền tải nội dung của bạn ở bất kỳ định dạng nào và trên bất kỳ nền tảng nào, hiện đã biết hoặc sau này được phát minh.</p>
<p>Chúng tôi hoặc các bên thứ ba được ủy quyền có thể chỉnh sửa hoặc từ chối xuất bản nội dung của bạn theo quyết định riêng của chúng tôi hoặc của họ. Chúng tôi có thể xóa nội dung của bạn bất kỳ lúc nào. Chúng tôi không chịu trách nhiệm pháp lý đối với bất kỳ nội dung nào do người dùng gửi và được chúng tôi hoặc bên thứ ba được ủy quyền xuất bản.</p>
<h2>5. Ứng dụng</h2>
<p>Nội dung &ldquo;Điều khoản sử dụng&rdquo; này sẽ được áp dụng với mọi ứng dụng của kaireview.</p>
<h2>6. Thay đổi các điều khoản và điều kiện sử dụng này</h2>
<p>kaireview có quyền sửa đổi, bổ sung, thay thế và/hoặc cắt bỏ một phần các quy định này, đồng thời có quyền thay đổi và/hoặc chấm dứt các nội dung, tính năng của một phần hay toàn bộ các trang web và ứng dụng mà không có nghĩa vụ phải báo trước cho người sử dụng.</p>
<p>Vui lòng theo dõi thường xuyên vì mọi sửa đổi sẽ có hiệu lực sau khi được đăng tải trên các trang web và ứng dụng của chúng tôi.</p>
<p>Việc tiếp tục truy cập các trang web và ứng dụng kaireview cho thấy bạn tiếp tục chấp nhận các điều khoản này.</p>
</div>`,
    },
    {
      slug: "chinh-sach-bao-mat",
      title: "Chính Sách Bảo Mật",
      description:
        "Chính sách bảo mật mô tả cách hệ thống kaireview thu thập, sử dụng và bảo vệ dữ liệu người dùng.",
      href: "/chinh-sach-bao-mat/",
      category: {
        label: "Chính sách",
        href: "/",
      },
      publishedLabel: "Tháng 08 01, 2026",
      publishedDateTime: "2026-08-01T00:00:00+07:00",
      updatedLabel: "Tháng 08 01, 2026",
      updatedDateTime: "2026-08-01T00:00:00+07:00",
      author: {
        name: "kaireview",
        href: "/author/tiengdung00/",
        avatar: siteAuthorAvatar,
      },
      contentHtml: `<div id="ftwp-postcontent">
<p><strong>Chào mừng bạn đến với kaireview - Nơi bảo vệ quyền riêng tư là ưu tiên hàng đầu của chúng tôi!</strong></p>
<p>Tại kaireview, chúng tôi không chỉ đơn thuần là một nền tảng trực tuyến mà còn là người bạn đồng hành đáng tin cậy trong hành trình bảo vệ thông tin cá nhân của bạn. Chính sách quyền riêng tư này sẽ giúp bạn hiểu rõ hơn về cách chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ dữ liệu của bạn. Khi bạn chọn kaireview, bạn đồng ý với những điều trong Chính sách quyền riêng tư này.</p>
<h2>1. Giới thiệu</h2>
<h3>1.1 Mục đích thu thập thông tin cá nhân</h3>
<p>Chúng tôi thu thập thông tin cá nhân của bạn với mục tiêu rõ ràng: hỗ trợ bạn một cách hiệu quả nhất qua những thông tin trên kaireview.</p>
<h3>1.2 Phạm vi thu thập thông tin</h3>
<p>Chính sách này áp dụng cho tất cả người dùng khi truy cập vào kaireview. Mọi thông tin bạn cung cấp sẽ được bảo vệ một cách tối ưu.</p>
<h3>1.3 Sự đồng ý và chấp thuận</h3>
<p>Bằng việc sử dụng dịch vụ của kaireview, bạn đồng ý với các điều khoản trong Chính sách quyền riêng tư này và chấp thuận việc thu thập, xử lý và chia sẻ thông tin của bạn.</p>
<h2>2. Thông tin cá nhân</h2>
<p>Chúng tôi có thể thu thập những thông tin như tên và thông tin liên lạc khi bạn liên hệ với chúng tôi.</p>
<h3>2.1 Thông tin phi cá nhân</h3>
<p>Chúng tôi cũng thu thập thông tin phi cá nhân như loại thiết bị, trình duyệt và dữ liệu sử dụng để không ngừng cải thiện dịch vụ của mình.</p>
<h3>2.2 Cookie và Công nghệ theo dõi</h3>
<p>Để mang đến bạn trải nghiệm tốt nhất trên kaireview, chúng tôi sử dụng cookie và các công nghệ tương tự. Bạn có thể dễ dàng điều chỉnh tùy chọn cookie của mình qua cài đặt trình duyệt.</p>
<h2>3. Thời gian lưu trữ thông tin</h2>
<p>Chúng tôi sẽ lưu trữ dữ liệu cá nhân của bạn cho đến khi bạn yêu cầu hủy bỏ hoặc tự thực hiện việc hủy bỏ. Mọi thông tin cá nhân sẽ được bảo mật trên máy chủ của kaireview.</p>
<h2>4. Những người hoặc tổ chức có thể được tiếp cận với thông tin</h2>
<h3>4.1 Sử dụng thông tin để cung cấp dịch vụ</h3>
<p>Chúng tôi sử dụng thông tin của bạn để nâng cao và cải thiện dịch vụ, tạo ra những tính năng tự động hóa và hỗ trợ người dùng tốt nhất.</p>
<h3>4.2 Tự động hóa hỗ trợ người dùng</h3>
<p>Với sự trợ giúp của công nghệ AI, chúng tôi tự động hóa quy trình hỗ trợ người dùng, giúp chúng tôi cải thiện phản hồi và mang lại trải nghiệm tốt hơn cho bạn.</p>
<h3>4.3 Cá nhân hóa và sự tham gia của người dùng</h3>
<p>Chúng tôi sẽ sử dụng dữ liệu của bạn để cá nhân hóa trải nghiệm và tương tác với bạn thông qua email, thông báo hoặc tin nhắn trong ứng dụng khi cần thiết.</p>
<h3>4.4 Cung cấp cho nhà cung cấp dịch vụ bên thứ ba</h3>
<p>Chúng tôi có thể chia sẻ dữ liệu của bạn với các nhà cung cấp dịch vụ bên thứ ba để họ hỗ trợ chúng tôi trong việc cung cấp và cải thiện dịch vụ.</p>
<h3>4.5 Yêu cầu pháp lý</h3>
<p>Nếu pháp luật yêu cầu, chúng tôi có thể tiết lộ thông tin cá nhân của bạn để tuân thủ các quy trình pháp lý.</p>
<h3>4.6 Dữ liệu tổng hợp hoặc ẩn danh</h3>
<p>Chúng tôi có thể chia sẻ dữ liệu tổng hợp hoặc ẩn danh cho mục đích phân tích và nghiên cứu.</p>
<h2>5. Quyền riêng tư của bạn</h2>
<h3>5.1 Truy cập và cập nhật thông tin của bạn</h3>
<p>Bạn có quyền truy cập và chỉnh sửa thông tin cá nhân của mình bất cứ lúc nào.</p>
<h3>5.2 Sở thích giao tiếp</h3>
<p>Quý vị có thể điều chỉnh tùy chọn liên lạc của mình qua cài đặt tài khoản hoặc từ chối các hình thức liên hệ không cần thiết.</p>
<h3>5.3 Cookie và Theo dõi</h3>
<p>Bạn hoàn toàn có thể quản lý cookie và tùy chọn theo dõi thông qua cài đặt trình duyệt của mình.</p>
<h3>5.4 Không theo dõi tín hiệu</h3>
<p>Chúng tôi hiện chưa phản hồi tín hiệu &ldquo;Không theo dõi&rdquo;.</p>
<h2>6. Bảo mật dữ liệu</h2>
<p>Chúng tôi cam kết sử dụng các biện pháp bảo mật tiêu chuẩn công nghiệp để bảo vệ thông tin của bạn. Trong trường hợp có vi phạm dữ liệu, chúng tôi sẽ thông báo cho bạn theo luật hiện hành.</p>
<h2>7. Liên kết và dịch vụ của bên thứ ba</h2>
<h3>7.1 Trang web bên ngoài</h3>
<p>kaireview có thể chứa liên kết đến các trang web bên ngoài. Chúng tôi không chịu trách nhiệm về chính sách bảo mật hay nội dung của các trang web đó.</p>
<h3>7.2 Tích hợp với Dịch vụ của bên thứ ba</h3>
<p>Khi bạn sử dụng dịch vụ bên thứ ba, vui lòng đảm bảo rằng bạn đã đọc và đồng ý với chính sách bảo mật của họ.</p>
<h2>8. Quyền riêng tư của trẻ em</h2>
<p>kaireview không dành cho trẻ em dưới 13 tuổi và chúng tôi không cố ý thu thập thông tin từ trẻ em. Nếu bạn phát hiện thông tin bị thu thập mà không có sự đồng ý của cha mẹ, vui lòng thông báo cho chúng tôi.</p>
<h2>9. Người dùng quốc tế</h2>
<p>Khi sử dụng kaireview, bạn đồng ý cho phép chuyển dữ liệu của mình đến các khu vực khác nếu cần thiết theo Chính sách quyền riêng tư này.</p>
<p>Hãy yên tâm khi đồng hành cùng chúng tôi tại kaireview - nơi quyền riêng tư của bạn được đặt lên hàng đầu!</p>
</div>`,
    },
    {
      slug: "chinh-sach-cookies",
      title: "Chính Sách Cookies",
      description:
        "Chính sách Cookies giải thích cách hệ thống kaireview sử dụng cookie và công nghệ tương tự để cải thiện trải nghiệm người dùng.",
      href: "/chinh-sach-cookies/",
      category: {
        label: "Chính sách",
        href: "/",
      },
      publishedLabel: "Tháng 08 01, 2026",
      publishedDateTime: "2026-08-01T00:00:00+07:00",
      updatedLabel: "Tháng 08 01, 2026",
      updatedDateTime: "2026-08-01T00:00:00+07:00",
      author: {
        name: "kaireview",
        href: "/author/tiengdung00/",
        avatar: siteAuthorAvatar,
      },
      contentHtml: `<div id="ftwp-postcontent">
<p>Khi bạn truy cập các trang web hoặc sử dụng các ứng dụng của <a href="/">kaireview</a>, chúng tôi có thể tự động thu thập dữ liệu cá nhân từ bạn bằng cách sử dụng cookie hoặc các công nghệ tương tự.</p>
<p>1. Cookies là một tệp nhỏ có thể được đặt trên thiết bị của bạn cho phép chúng tôi nhận ra và ghi nhớ bạn.</p>
<p>2. Chúng tôi thu thập và sử dụng các dữ liệu Cookies để cải thiện trải nghiệm của bạn trên trang web và ứng dụng của chúng tôi, bao gồm:</p>
<ul>
<li>Giữ cho bạn đăng nhập</li>
<li>Hiểu cách bạn hoạt động và sử dụng trên trang web/ứng dụng của chúng tôi</li>
<li>Hiển thị cho bạn các nội dung có liên quan đến bạn</li>
<li>Hiển thị cho bạn các sản phẩm và dịch vụ của kaireview phù hợp với bạn</li>
<li>Làm việc với các đối tác để cung cấp quảng cáo phù hợp cho bạn.</li>
</ul>
<p>3. Những thông tin mà chúng tôi thu thập:</p>
<ul>
<li>Thông tin địa chỉ IP, trình duyệt, thiết bị sử dụng, thời lượng truy cập</li>
<li>Thông tin về thời lượng đọc nội dung</li>
<li>Những tương tác trên bài viết như bình luận, icon cảm xúc, đề xuất cải tiến nội dung...</li>
<li>Thông tin chia sẻ bài viết</li>
<li>Từ khóa tìm kiếm.</li>
</ul>
<p>4. Cookies mặc định sẽ được lưu theo phiên truy cập. Bạn có quyền quản lý Cookies để chặn, xóa hoặc vô hiệu hóa các công nghệ này trong trình duyệt hoặc trong phần cài đặt thiết bị của bạn.</p>
</div>`,
    },
  ];
}

mkdirSync(dataDir, { recursive: true });

const articles = readGeneratedArray("src/lib/iaa-article-pages.generated.ts", "generatedArticleDetails").map((article) => ({
  ...article,
  author: {
    ...article.author,
    name: article.author.name === "Trần Dũng" ? "kaireview" : article.author.name,
    avatar: siteAuthorAvatar,
  },
}));
const staticPolicyArticles = buildStaticPolicyArticles();

for (const staticArticle of staticPolicyArticles) {
  const existingIndex = articles.findIndex((article) => article.slug === staticArticle.slug);

  if (existingIndex === -1) {
    articles.push(staticArticle);
    continue;
  }

  articles[existingIndex] = staticArticle;
}

const archives = readGeneratedArray("src/lib/iaa-category-pages.generated.ts", "generatedCategoryArchives");
const searchEntries = createSearchEntries(articles, archives);
const defaultHomepageHrefs = new Set([
  "/ot-chia-voi-quang-tri-thu-gia-vi-lam-nao-long-nguoi-di-xa/",
  "/thu-mua-laptop-cu-gia-cao-tphcm/",
  "/shop-ban-macbook-cu-uy-tin-tphcm/",
  "/thu-mua-macbook-cu-gia-cao-tphcm/",
  "/loi-reset-counter-tren-iphone/",
  "/top-3-cua-hang-sua-iphone-uy-tin-tai-binh-tan/",
  "/top-10-cua-hang-sua-iphone-uy-tin-gia-re-tai-tp-hcm/",
  "/top-10-dia-chi-sua-ipad-uy-tin-gia-re-tai-tphcm/",
  "/kiem-tra-macbook-khi-mua-cu/",
  "/cach-kiem-tra-macbook-bypass/",
  "/danh-sach-cac-trung-tam-bao-hanh-apple-tai-tphcm/",
  "/iphone-bi-do-man-hinh-cam-ung-nguyen-nhan-va-cach-khac-phuc/",
  "/nguyen-nhan-va-cach-sua-iphone-bi-mat-tieng-loa-ngoai/",
  "/cach-xu-ly-iphone-bi-dinh-nuoc-vao-man-hinh/",
]);
const defaultContactIntroHtml = `<h2>Liên hệ kaireview</h2>
<ul>
  <li><strong>Website:</strong> kaireview</li>
  <li><strong>Nội dung:</strong> Review, tổng hợp và gợi ý sản phẩm, dịch vụ.</li>
  <li><strong>Email:</strong> hello@kaireview.vn</li>
</ul>
<p><strong>Liên hệ với chúng tôi:</strong> Bạn có thắc mắc hay cần hỗ trợ? Đừng ngần ngại, hãy gửi thông tin cho chúng tôi. Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn!</p>`;
const database = new DatabaseSync(databasePath);

database.exec(`
  PRAGMA journal_mode = DELETE;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS articles (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    href TEXT NOT NULL UNIQUE,
    category_label TEXT NOT NULL,
    category_href TEXT NOT NULL,
    home_featured INTEGER NOT NULL DEFAULT 0,
    published_label TEXT NOT NULL,
    published_datetime TEXT NOT NULL,
    updated_label TEXT NOT NULL,
    updated_datetime TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_href TEXT NOT NULL,
    author_avatar TEXT NOT NULL,
    tag_label TEXT,
    tag_href TEXT,
    previous_title TEXT,
    previous_href TEXT,
    figures_json TEXT,
    content_html TEXT,
    related_posts_json TEXT,
    raw_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS category_archives (
    slug TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    href TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    pagination_json TEXT NOT NULL,
    raw_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS category_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_slug TEXT NOT NULL,
    post_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    href TEXT NOT NULL,
    image TEXT NOT NULL,
    alt TEXT NOT NULL,
    excerpt TEXT,
    date_day TEXT,
    date_month TEXT,
    sort_order INTEGER NOT NULL,
    raw_json TEXT NOT NULL,
    FOREIGN KEY (category_slug) REFERENCES category_archives(slug) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS search_index (
    href TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    alt TEXT NOT NULL,
    excerpt TEXT,
    normalized_text TEXT NOT NULL,
    raw_post_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_category_posts_category_slug_sort_order
    ON category_posts(category_slug, sort_order);
  CREATE INDEX IF NOT EXISTS idx_category_posts_post_slug
    ON category_posts(post_slug);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_category_posts_unique
    ON category_posts(category_slug, post_slug);
  CREATE INDEX IF NOT EXISTS idx_search_index_normalized_text
    ON search_index(normalized_text);
`);

const articleColumns = new Set(
  database.prepare("PRAGMA table_info(articles)").all().map((row) => row.name),
);

if (!articleColumns.has("home_featured")) {
  database.exec("ALTER TABLE articles ADD COLUMN home_featured INTEGER NOT NULL DEFAULT 0");
}

database.exec(`
  CREATE INDEX IF NOT EXISTS idx_articles_home_featured_published
    ON articles(home_featured, published_datetime);
`);

const insertArticle = database.prepare(`
  INSERT OR IGNORE INTO articles (
    slug,
    title,
    description,
    href,
    category_label,
    category_href,
    home_featured,
    published_label,
    published_datetime,
    updated_label,
    updated_datetime,
    author_name,
    author_href,
    author_avatar,
    tag_label,
    tag_href,
    previous_title,
    previous_href,
    figures_json,
    content_html,
    related_posts_json,
    raw_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const upsertArticle = database.prepare(`
  INSERT INTO articles (
    slug,
    title,
    description,
    href,
    category_label,
    category_href,
    home_featured,
    published_label,
    published_datetime,
    updated_label,
    updated_datetime,
    author_name,
    author_href,
    author_avatar,
    tag_label,
    tag_href,
    previous_title,
    previous_href,
    figures_json,
    content_html,
    related_posts_json,
    raw_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    href = excluded.href,
    category_label = excluded.category_label,
    category_href = excluded.category_href,
    home_featured = excluded.home_featured,
    published_label = excluded.published_label,
    published_datetime = excluded.published_datetime,
    updated_label = excluded.updated_label,
    updated_datetime = excluded.updated_datetime,
    author_name = excluded.author_name,
    author_href = excluded.author_href,
    author_avatar = excluded.author_avatar,
    tag_label = excluded.tag_label,
    tag_href = excluded.tag_href,
    previous_title = excluded.previous_title,
    previous_href = excluded.previous_href,
    figures_json = excluded.figures_json,
    content_html = excluded.content_html,
    related_posts_json = excluded.related_posts_json,
    raw_json = excluded.raw_json
`);

const insertArchive = database.prepare(`
  INSERT OR IGNORE INTO category_archives (
    slug,
    label,
    href,
    title,
    pagination_json,
    raw_json
  ) VALUES (?, ?, ?, ?, ?, ?)
`);

const insertPost = database.prepare(`
  INSERT OR IGNORE INTO category_posts (
    category_slug,
    post_slug,
    title,
    href,
    image,
    alt,
    excerpt,
    date_day,
    date_month,
    sort_order,
    raw_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertSearchEntry = database.prepare(`
  INSERT OR IGNORE INTO search_index (
    href,
    slug,
    title,
    image,
    alt,
    excerpt,
    normalized_text,
    raw_post_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertAdminSetting = database.prepare(`
  INSERT OR IGNORE INTO admin_settings (key, value, updated_at)
  VALUES (?, ?, ?)
`);

database.exec("BEGIN");

try {
  const now = new Date().toISOString();

  insertAdminSetting.run("site_name", "kaireview", now);
  insertAdminSetting.run("site_email", "hello@kaireview.vn", now);
  insertAdminSetting.run("contact_intro_html", defaultContactIntroHtml, now);

  for (const article of articles) {
    insertArticle.run(
      article.slug,
      article.title,
      article.description,
      article.href,
      article.category.label,
      article.category.href,
      defaultHomepageHrefs.has(article.href) ? 1 : 0,
      article.publishedLabel,
      article.publishedDateTime,
      article.updatedLabel,
      article.updatedDateTime,
      article.author.name,
      article.author.href,
      article.author.avatar,
      article.tag?.label ?? null,
      article.tag?.href ?? null,
      article.previousPost?.title ?? null,
      article.previousPost?.href ?? null,
      article.figures ? JSON.stringify(article.figures) : null,
      article.contentHtml ?? null,
      article.relatedPosts ? JSON.stringify(article.relatedPosts) : null,
      JSON.stringify(article),
    );
  }

  for (const article of staticPolicyArticles) {
    upsertArticle.run(
      article.slug,
      article.title,
      article.description,
      article.href,
      article.category.label,
      article.category.href,
      defaultHomepageHrefs.has(article.href) ? 1 : 0,
      article.publishedLabel,
      article.publishedDateTime,
      article.updatedLabel,
      article.updatedDateTime,
      article.author.name,
      article.author.href,
      article.author.avatar,
      article.tag?.label ?? null,
      article.tag?.href ?? null,
      article.previousPost?.title ?? null,
      article.previousPost?.href ?? null,
      article.figures ? JSON.stringify(article.figures) : null,
      article.contentHtml ?? null,
      article.relatedPosts ? JSON.stringify(article.relatedPosts) : null,
      JSON.stringify(article),
    );
  }

  for (const archive of archives) {
    insertArchive.run(
      archive.slug,
      archive.label,
      archive.href,
      archive.title,
      JSON.stringify(archive.pagination),
      JSON.stringify(archive),
    );

    archive.posts.forEach((post, index) => {
      insertPost.run(
        archive.slug,
        slugFromHref(post.href),
        post.title,
        post.href,
        post.image,
        post.alt,
        post.excerpt ?? null,
        post.date?.day ?? null,
        post.date?.month ?? null,
        index,
        JSON.stringify(post),
      );
    });
  }

  for (const entry of searchEntries) {
    insertSearchEntry.run(
      entry.post.href,
      slugFromHref(entry.post.href),
      entry.post.title,
      entry.post.image,
      entry.post.alt,
      entry.post.excerpt ?? null,
      normalizeSearchText(entry.text),
      JSON.stringify(entry.post),
    );
  }

  database.exec("COMMIT");
} catch (error) {
  database.exec("ROLLBACK");
  throw error;
} finally {
  database.close();
}

writeFileSync(
  snapshotPath,
  `import type { IaaArticle, IaaCategoryArchiveData, IaaPost } from "@/types/iaa";

export const sqliteArticleDetails = ${JSON.stringify(articles, null, 2)} satisfies IaaArticle[];

export const sqliteCategoryArchives = ${JSON.stringify(archives, null, 2)} satisfies IaaCategoryArchiveData[];

export const sqliteSearchEntries = ${JSON.stringify(
    searchEntries.map((entry) => ({
      post: entry.post,
      normalizedText: normalizeSearchText(entry.text),
    })),
    null,
    2,
  )} satisfies { post: IaaPost; normalizedText: string }[];
`,
);

console.log(
  `Seeded ${articles.length} articles and ${archives.length} category archives into ${databasePath}`,
);
console.log(`Wrote SQLite snapshot for Next dev to ${snapshotPath}`);
